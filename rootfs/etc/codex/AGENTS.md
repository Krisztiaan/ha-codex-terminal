# HA Codex Terminal Agent Brief

You are Codex running inside a Home Assistant Supervisor add-on (`ha-codex-terminal`). The container launches through `ttyd` and drops you into a tmux session as root.

## Environment

- Primary workspace: `/homeassistant` (Home Assistant configuration, automations, database). Add-on-specific config lives under `/config`. Persistent add-on data is at `/data`.
- Installed tools: `bash`, `tmux`, `git`, `node`, `npm`, `python3`, `pip`, `curl`, `wget`, `jq`, `yq`, `rg`, `fd`, `fzf`, `make`, `gcc`, `openssh-client`, `zip`, `unzip`, `sqlite3`, `mariadb-client`, `mysql-client`, `psql`, `mosquitto_pub/sub`, `ping`, `dig`, `rsync`, `sshpass`, `rclone`, `patch`, `bash-language-server`, global `codex` CLI (baked), plus standard BusyBox/Alpine utilities.
- Additional mounts: `/share`, `/ssl`, `/addons`, `/etc`, `/root`, and all other host resources due to full-access privileges.
- Supervisor & Home Assistant APIs available at `http://supervisor/…` using the `SUPERVISOR_TOKEN` environment variable.

## Conventions

- Treat `/homeassistant` as the canonical Home Assistant project root. Use `/config` for add-on-specific helper files unless directed otherwise.
- Use `rg` for fast text search, `yq`/`jq` for structured YAML/JSON edits, and `tmux` panes (`Ctrl+b %`, `Ctrl+b "`) if you need multiple views.
- Start new shells with `tmux new-window` rather than killing the Codex session.
- Record secrets only in existing secret stores; do not print auth tokens unless explicitly required.

## Guardrails

- **Do not** run long-lived development servers (`npm run dev`, `npm preview`, etc.). Ask the user to run them locally if needed.
- Minimize destructive actions. Always inspect before deleting or overwriting files that you did not create.
- When modifying YAML/JSON, validate syntax (`yamllint`, `yq eval`, or `python3 -m json.tool`) before leaving the session.
- Confirm with the user before restarting Home Assistant services or altering Supervisor settings.

## Tips

- `sqlite3 /homeassistant/home-assistant_v2.db` to inspect the recorder database.
- `mysql` / `psql` clients for external recorder backends.
- `mosquitto_sub -h <broker> -t '#'` to monitor MQTT traffic.
- `ping` / `dig` for fast network diagnostics.
- `rsync`, `rclone`, or `sshpass` when you need to shuttle files to other hosts quickly.
- `curl -H "Authorization: Bearer ${SUPERVISOR_TOKEN}" http://supervisor/core/api/...` for HA API calls.
- Prefer `/tmp` for caches/build artifacts; keep `/data` for small, intentional state you want to survive restarts and potentially be included in backups.
- The `codex` alias runs the baked Codex CLI; common package-manager caches and user-install prefixes go to `/tmp` so backups stay small; shell history persists (capped) at `/data/.codex_bash_history`.
- Do not create `node_modules`, virtualenvs, or other bulky scratch artifacts under `/data` or `/config`; use `/tmp` for ephemeral workspaces.
- Append to `/root/.codex/AGENTS.md` via the add-on options UI to share new findings or playbooks with future sessions.
