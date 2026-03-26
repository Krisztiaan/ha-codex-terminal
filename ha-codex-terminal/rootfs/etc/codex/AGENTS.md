# HA Codex Terminal Agent Brief

You are Codex running inside a Home Assistant Supervisor add-on (`ha-codex-terminal`). The container launches through `ttyd` and drops you into a tmux session as root.

## Environment

- Primary workspace: `/homeassistant` (Home Assistant configuration, automations, database). Add-on-specific config lives under `/config`. Persistent add-on data is at `/data`.
- Codex state: `CODEX_HOME=/data/codex_home` (also available at `/root/.codex` via symlink). Credentials live in `CODEX_HOME/auth.json` and are refreshed in place by Codex.
- Installed tools: `bash`, `tmux`, `git`, `node`, `npm`, `python3`, `pip`, `curl`, `wget`, `jq`, `yq`, `rg`, `fd`, `fzf`, `make`, `openssh-client`, `zip`, `unzip`, `sqlite3`, `mariadb-client`, `mysql-client`, `psql`, `mosquitto_pub/sub`, `ping`, `dig`, `rsync`, `sshpass`, `rclone`, `patch`, `bash-language-server`, global `codex` CLI (baked), and a dedicated Home Assistant Python venv exposed as `ha-python`, `ha-pip`, and `hass`, plus standard BusyBox/Alpine utilities.
- Additional mounts: `/share`, `/ssl`, `/addons`, `/etc`, `/root`, and all other host resources due to full-access privileges.
- Supervisor & Home Assistant APIs available at `http://supervisor/…` using the `SUPERVISOR_TOKEN` environment variable.

## Conventions

- Treat `/homeassistant` as the canonical Home Assistant project root. Use `/config` for add-on-specific helper files unless directed otherwise.
- Use `rg` for fast text search, `yq`/`jq` for structured YAML/JSON edits, and `tmux` panes (`Ctrl+b %`, `Ctrl+b "`) if you need multiple views.
- Start new shells with `tmux new-window` rather than killing the Codex session.
- Record secrets only in existing secret stores; do not print auth tokens unless explicitly required.
- Use the bundled helper CLIs where possible: `ha-api`, `supervisor-api`, `ha-sqlite-ro`, and `ha-recorder-schema`.

## Guardrails

- **Do not** run long-lived development servers (`npm run dev`, `npm preview`, etc.). Ask the user to run them locally if needed.
- Minimize destructive actions. Always inspect before deleting or overwriting files that you did not create.
- When modifying YAML/JSON, validate syntax (`yamllint`, `yq eval`, or `python3 -m json.tool`) before leaving the session.
- Confirm with the user before restarting Home Assistant services or altering Supervisor settings.
- Prefer read-only DB inspection: use `ha-sqlite-ro` for recorder queries and only write to a database if the user explicitly asks for it.

## Tips

- `sqlite3 /homeassistant/home-assistant_v2.db` to inspect the recorder database.
- `ha-sqlite-ro 'select count(*) from states;'` for read-only recorder queries.
- `ha-recorder-schema` to inspect the recorder schema quickly.
- `ha-python -c 'import homeassistant; print(homeassistant.__version__)'` to inspect the bundled Home Assistant Python package.
- `hass --script check_config -c /homeassistant` or `hass-check-config` to validate Home Assistant config from the container.
- `ha-api /config` for Home Assistant Core API calls via the Supervisor proxy.
- `supervisor-api /addons` for Supervisor API calls.
- `mysql` / `psql` clients for external recorder backends.
- `mosquitto_sub -h <broker> -t '#'` to monitor MQTT traffic.
- `ping` / `dig` for fast network diagnostics.
- `rsync`, `rclone`, or `sshpass` when you need to shuttle files to other hosts quickly.
- `curl -H "Authorization: Bearer ${SUPERVISOR_TOKEN}" http://supervisor/core/api/...` for HA API calls.
- Prefer `/tmp` for caches/build artifacts; keep `/data` for small, intentional state you want to survive restarts and potentially be included in backups.
- Run `codex` to launch the Codex CLI (resolved via `PATH`). Common package-manager caches and user-install prefixes go to `/tmp` so backups stay small; shell history persists (capped) at `/data/.codex_bash_history`.
- Do not create `node_modules`, virtualenvs, or other bulky scratch artifacts under `/data` or `/config`; use `/tmp` for ephemeral workspaces.
- Use the add-on options UI (`agents_md`) to manage `CODEX_HOME/AGENTS.md` centrally, or edit `/data/codex_home/AGENTS.md` directly if you prefer in-terminal control.
