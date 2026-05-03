#!/usr/bin/env python3
"""Submit blog post URLs to IndexNow.

Used in two places:

  1. Automatically by the GitHub Action at .github/workflows/indexnow.yml
     on every push that touches src/content/posts/.

  2. Manually from the command line, for ad-hoc pings without waiting
     for a GitHub Action run.

USAGE
-----

  # Detect added/modified posts in the latest commit and ping them.
  # This is the default and is what the GitHub Action runs.
  python3 .github/scripts/indexnow.py
  python3 .github/scripts/indexnow.py --changed

  # Ping every URL in the production sitemap. Useful for backfills.
  python3 .github/scripts/indexnow.py --all

  # Ping one or more specific URLs.
  python3 .github/scripts/indexnow.py https://moeed.app/posts/foo/
  python3 .github/scripts/indexnow.py \\
      https://moeed.app/posts/foo/ \\
      https://moeed.app/posts/bar/

  # Show what would be sent without actually submitting.
  python3 .github/scripts/indexnow.py --all --dry-run

ENVIRONMENT
-----------

INDEXNOW_KEY  IndexNow API key. Defaults to the value baked into this
              script if unset. Override only when rotating the key.

The IndexNow key is not a secret; it has to be hosted publicly at
https://moeed.app/<key>.txt for IndexNow to verify ownership. So it is
safe to commit and to print in build logs.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

# --- Site config (edit these if the domain or key changes) -----------------

DEFAULT_KEY = 'e98a31a13be44f5b8e06313f361e7820'
HOST = 'moeed.app'
SITE = f'https://{HOST}'

# --- Derived ---------------------------------------------------------------

KEY = os.environ.get('INDEXNOW_KEY', DEFAULT_KEY)
KEY_LOCATION = f'{SITE}/{KEY}.txt'
POSTS_DIR = 'src/content/posts/'
USER_AGENT = 'IndexNow-Pinger/1.0 (+moeed.app)'


# --- URL collection --------------------------------------------------------

def changed_post_urls() -> list[str]:
    """URLs of posts added or modified in the latest commit."""
    try:
        result = subprocess.run(
            ['git', 'diff', '--name-only', '--diff-filter=AM', 'HEAD~1', 'HEAD'],
            capture_output=True, text=True, check=True,
        )
    except subprocess.CalledProcessError:
        # Shallow clone or root commit, nothing to diff.
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


def all_urls_from_sitemap() -> list[str]:
    """Every URL listed in the production sitemap-0.xml."""
    req = urllib.request.Request(
        f'{SITE}/sitemap-0.xml',
        headers={'User-Agent': USER_AGENT},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        tree = ET.parse(resp)
    ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    return [loc.text for loc in tree.iter(f'{ns}loc') if loc.text]


# --- Submission ------------------------------------------------------------

def submit(urls: list[str], dry_run: bool = False) -> int:
    if not urls:
        print('No URLs to submit. Skipping.')
        return 0

    payload = {
        'host': HOST,
        'key': KEY,
        'keyLocation': KEY_LOCATION,
        'urlList': urls,
    }
    print(f'Submitting {len(urls)} URLs to IndexNow:')
    for u in urls:
        print(f'  - {u}')

    if dry_run:
        print('\n--dry-run: not actually submitting.')
        return 0

    req = urllib.request.Request(
        'https://api.indexnow.org/indexnow',
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json', 'User-Agent': USER_AGENT},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f'\nIndexNow accepted: HTTP {resp.status}')
            return 0
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors='replace')
        print(f'\nIndexNow rejected: HTTP {e.code}')
        print(body)
        return 1


# --- CLI -------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Submit URLs to IndexNow for moeed.app.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        '--changed', action='store_true',
        help='Submit posts added or modified in the latest commit (default).',
    )
    group.add_argument(
        '--all', action='store_true',
        help='Submit every URL listed in the production sitemap.',
    )
    parser.add_argument(
        'urls', nargs='*',
        help='Specific URLs to submit. Overrides --changed and --all.',
    )
    parser.add_argument(
        '--dry-run', action='store_true',
        help='Print what would be submitted without sending the request.',
    )
    return parser.parse_args()


def resolve_urls(args: argparse.Namespace) -> list[str]:
    # Honour the same env-var contract the GitHub Action used in earlier
    # versions, so existing workflows keep working.
    event = os.environ.get('EVENT_NAME')
    dispatch_mode = os.environ.get('DISPATCH_MODE')

    if args.urls:
        return args.urls

    if args.all or (event == 'workflow_dispatch' and dispatch_mode == 'all'):
        return all_urls_from_sitemap()

    # Default: changed mode.
    urls = changed_post_urls()
    if urls:
        # When posts change, also re-ping the listing pages.
        urls.extend([f'{SITE}/', f'{SITE}/archive/'])
    return urls


def main() -> int:
    args = parse_args()
    urls = resolve_urls(args)
    return submit(urls, dry_run=args.dry_run)


if __name__ == '__main__':
    sys.exit(main())
