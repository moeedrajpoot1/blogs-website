#!/usr/bin/env python3
"""Submit blog post URLs to IndexNow so Bing, Yandex, and friends pick up
new and updated articles within minutes instead of waiting for a sitemap
re-crawl.

Two modes:

- changed: look at the most recent commit, find any added or modified
  files under src/content/posts/, derive their public URLs, and submit
  those plus the home and archive pages.

- all: fetch every URL from the production sitemap-0.xml and submit
  the whole list. Useful for backfilling or after a domain change.

Mode is controlled by the EVENT_NAME and DISPATCH_MODE env vars, set
by the GitHub Actions workflow.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

KEY = os.environ['INDEXNOW_KEY']
HOST = 'moeed.app'
SITE = f'https://{HOST}'
KEY_LOCATION = f'{SITE}/{KEY}.txt'

EVENT = os.environ.get('EVENT_NAME', 'push')
DISPATCH_MODE = os.environ.get('DISPATCH_MODE', 'changed')

POSTS_DIR = 'src/content/posts/'


def changed_post_urls() -> list[str]:
    """URLs of posts added or modified in the latest commit."""
    try:
        result = subprocess.run(
            ['git', 'diff', '--name-only', '--diff-filter=AM', 'HEAD~1', 'HEAD'],
            capture_output=True, text=True, check=True,
        )
    except subprocess.CalledProcessError:
        # First commit or a shallow clone with no parent; nothing to diff.
        return []

    files = [
        line.strip() for line in result.stdout.splitlines()
        if line.startswith(POSTS_DIR) and (line.endswith('.md') or line.endswith('.mdx'))
    ]
    urls = []
    for path in files:
        slug = os.path.basename(path).rsplit('.', 1)[0]
        urls.append(f'{SITE}/posts/{slug}/')
    return urls


def all_post_urls_from_sitemap() -> list[str]:
    """Every URL listed in the production sitemap-0.xml."""
    req = urllib.request.Request(
        f'{SITE}/sitemap-0.xml',
        headers={'User-Agent': 'IndexNow-Pinger/1.0 (+moeed.app)'},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        tree = ET.parse(resp)
    ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    return [loc.text for loc in tree.iter(f'{ns}loc') if loc.text]


def submit(urls: list[str]) -> None:
    payload = {
        'host': HOST,
        'key': KEY,
        'keyLocation': KEY_LOCATION,
        'urlList': urls,
    }
    print(f'Submitting {len(urls)} URLs to IndexNow:')
    for u in urls:
        print(f'  - {u}')

    req = urllib.request.Request(
        'https://api.indexnow.org/indexnow',
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f'\nIndexNow accepted: HTTP {resp.status}')
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors='replace')
        print(f'\nIndexNow rejected: HTTP {e.code}')
        print(body)
        sys.exit(1)


def main() -> int:
    if EVENT == 'workflow_dispatch' and DISPATCH_MODE == 'all':
        urls = all_post_urls_from_sitemap()
        if not urls:
            print('No URLs found in sitemap.')
            return 1
    else:
        urls = changed_post_urls()
        if not urls:
            print('No post changes detected in this commit. Skipping IndexNow.')
            return 0
        # When posts change, also re-ping the home and archive,
        # since their listings need to refresh too.
        urls.extend([f'{SITE}/', f'{SITE}/archive/'])

    submit(urls)
    return 0


if __name__ == '__main__':
    sys.exit(main())
