# Monthly Photography Theme Slack Bot

Lightweight script to post a deterministic, non-repeating photography theme to a Slack channel on the 1st of each month.

Usage
- Add your themes to `themes.txt` (one theme per line).
- Configure an Incoming Webhook in Slack and set `SLACK_WEBHOOK_URL` in the environment.
- Optionally set `THEME_SALT` to change the starting offset.
- Run `postTheme.js` on the 1st of each month; a GitHub Actions workflow is included.

Validation
- Before adding the webhook, validate your themes file locally:

```bash
npm run validate
```

This checks there are themes and no duplicates.

Examples

Dry-run locally:

```bash
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/XXX/YYY/ZZZ" node postTheme.js --dry-run
```

GitHub Actions
- The workflow `.github/workflows/post-theme.yml` runs on the 1st of every month (UTC). Add `SLACK_WEBHOOK_URL` (and optionally `THEME_SALT`) as repository secrets.

Node.js

- A Node implementation is available: `postTheme.js`. Run a dry-run locally:

```bash
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/XXX/YYY/ZZZ" node postTheme.js --dry-run
```

Scheduling locally
- Use cron (or launchd on macOS) to run `postTheme.js` at your preferred time on the 1st of every month.

How the selection works
- The script loads all themes from `themes.txt` and computes an index as `(offset + months_since_base) % N`, where `offset` is derived from `THEME_SALT`.
- This produces a simple cycle through all themes without repeats until all N themes have been used.
