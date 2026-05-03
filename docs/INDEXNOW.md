# IndexNow guide

IndexNow is a small protocol that tells participating search engines (Bing, Yandex, Seznam, Naver) about new or updated pages on your site within minutes, instead of waiting for them to crawl your sitemap. Google has not joined IndexNow as of May 2026, so this is mainly a Bing speed-up.

This blog has IndexNow set up in three places. You will rarely need to touch any of them, but here is what each one does and how to use them when needed.

## What is already in place

| Piece | Location | Purpose |
|---|---|---|
| API key file | `public/e98a31a13be44f5b8e06313f361e7820.txt` | Hosted at the site root. IndexNow fetches it to verify ownership before accepting submissions. |
| Python script | `.github/scripts/indexnow.py` | The actual ping logic. Runnable from CLI and from the GitHub Action. |
| GitHub Action | `.github/workflows/indexnow.yml` | Auto-pings IndexNow whenever a post changes on `main`. |

## How automatic pinging works

You write a new article, commit it, and push to `main`. From there, no action is required from you.

The GitHub Action triggers when a file under `src/content/posts/` is added or modified. It waits two and a half minutes for Cloudflare Pages to publish the new build, then runs the Python script in `--changed` mode. The script looks at the last commit, finds the changed posts, derives their public URLs, and submits them to IndexNow along with the home page and the archive.

You can confirm a run by visiting `https://github.com/moeedrajpoot1/blogs-website/actions`.

## Manually triggering from GitHub

Sometimes you want to ping IndexNow without committing anything. Examples:

- You moved a domain and want to re-ping every URL.
- The automatic run failed and you want to retry.
- You changed a tag page or about page and want IndexNow to refetch.

To trigger by hand:

1. Open `https://github.com/moeedrajpoot1/blogs-website/actions/workflows/indexnow.yml`.
2. Click the **Run workflow** dropdown on the right.
3. Choose a mode:
   - `changed` will run the same git diff logic the automatic trigger uses. Almost always pings nothing if you have not committed anything new.
   - `all` will fetch every URL from the live sitemap and submit the whole list. Useful for backfills.
4. Click the green **Run workflow** button.
5. Wait about ten seconds, refresh, and click the new run to see logs.

## Manually pinging from the command line

The Python script is also a regular CLI tool. Useful when you want immediate feedback without leaving your terminal.

### See what it would do without sending anything

```bash
python3 .github/scripts/indexnow.py --all --dry-run
```

This prints the list of URLs that would be submitted, then exits without making the API call. Good for sanity checks.

### Ping every URL on the site

```bash
python3 .github/scripts/indexnow.py --all
```

Pulls every URL from the live sitemap (the home, the archive, all posts, all tag pages) and submits them in a single batch.

### Ping one or more specific URLs

```bash
python3 .github/scripts/indexnow.py https://moeed.app/posts/foo/
```

Or several at once:

```bash
python3 .github/scripts/indexnow.py \
    https://moeed.app/posts/foo/ \
    https://moeed.app/posts/bar/ \
    https://moeed.app/about/
```

### Ping only what changed in the last commit

```bash
python3 .github/scripts/indexnow.py --changed
```

This is the same logic the GitHub Action uses, so running it locally is a good way to test the workflow without a real push.

### See the help text

```bash
python3 .github/scripts/indexnow.py --help
```

## What a successful submission looks like

Both the GitHub Action log and the local CLI print the same kind of output:

```
Submitting 3 URLs to IndexNow:
  - https://moeed.app/posts/best-mcp-servers-2026/
  - https://moeed.app/
  - https://moeed.app/archive/

IndexNow accepted: HTTP 200
```

A blank screen and HTTP 200 is the normal "yes, accepted" response from IndexNow. There is no human-readable success message because the API was designed for machines.

## Troubleshooting

### "IndexNow rejected: HTTP 422 — Invalid URL"

You submitted a URL that does not start with `https://moeed.app/`. IndexNow only accepts URLs from the same host the key file lives on. Check the URL string for typos.

### "IndexNow rejected: HTTP 403 — Invalid key"

The key in the script does not match the file at `https://moeed.app/<key>.txt`. Either the key file was deleted, or the script's `DEFAULT_KEY` was edited without updating the file. See "Rotating the key" below.

### "No URLs to submit. Skipping."

In `--changed` mode, this means no posts were added or modified in the last commit. Expected behaviour when you push something other than a post (for example a config tweak).

### "HTTP Error 403: Forbidden" while fetching the sitemap

Cloudflare blocks requests with no `User-Agent`. The script already sends a custom User-Agent so this should not happen. If it does, it means Cloudflare is doing something stricter than usual. Wait a few minutes and retry.

### Automatic action did not run

Two common reasons:

1. The push did not change any file under `src/content/posts/`. The workflow's `paths:` filter skips runs when no post files changed.
2. The workflow file itself has a YAML error. Check the **Actions** tab for a "skipped" or "failed" run.

## Rotating the key

The IndexNow key is not a secret, but you may still want to rotate it (for example if you accidentally committed multiple keys, or you want a clean reset). The process is short.

1. Generate a new 32-character hex string. A simple way:

   ```bash
   python3 -c "import secrets; print(secrets.token_hex(16))"
   ```

2. Rename the existing key file. For example, the new key is `abc123...`:

   ```bash
   git mv public/e98a31a13be44f5b8e06313f361e7820.txt public/abc123def456...txt
   ```

3. Open the renamed file and replace its contents with the new key (one line, no trailing newline).

4. Update `DEFAULT_KEY` in `.github/scripts/indexnow.py` to the new key.

5. Commit and push. Cloudflare publishes the new key file. The next run picks it up automatically.

## Why Google is not in this list

Google does not support IndexNow. For Google, you submit URLs through Google Search Console (Sitemaps + URL Inspection > Request Indexing). That is a separate workflow and is documented in `docs/SEO_CHECKLIST.md`.

## Related files

- `.github/workflows/indexnow.yml` — the GitHub Action workflow definition.
- `.github/scripts/indexnow.py` — the script that does the work.
- `public/e98a31a13be44f5b8e06313f361e7820.txt` — the IndexNow ownership proof file.
- `docs/SEO_CHECKLIST.md` — the broader SEO checklist this fits into.
