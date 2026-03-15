# HA Codex Terminal

Launch a ttyd-powered web console inside Home Assistant that connects straight into a tmux session running the OpenAI Codex CLI installed in the image (see CODEX_VERSION). The container is stocked with common developer tools (e.g. `yq`, `ripgrep`, `fzf`, `git`, `python3`, `openssh-client`) so Codex can automate configuration and maintenance tasks across your Home Assistant deployment.

> **Warning:** This add-on requires full host access. Disable protection mode before starting it and only install it on instances you fully trust.

## Features

- Runs the Codex CLI baked into the image (currently `@openai/codex@0.114.0`); update the build args and rebuild the add-on to move forward.
- Persists Codex auth/config (`auth.json`, `config.toml`, `AGENTS.md`) in `/data`. `config.toml` and `AGENTS.md` can be managed through the add-on options UI; `auth.json` can also be uploaded safely from the Web UI.
- Ships useful command-line tooling (`yq`, `rg`, `fd`, `fzf`, `tmux`, `git`, `python3`, etc.) for automated workflows.
- Bundles the Home Assistant CLI (`ha`) so the agent can call supervisor/system commands directly.
- Bundles a dedicated Home Assistant Python environment (`ha-python`, `ha-pip`, `hass`) pinned to `homeassistant==2026.3.1`, which brings in the matching Home Assistant dependency stack (`aiohttp`, `httpx`, `SQLAlchemy`, `PyYAML`, `Jinja2`, `websockets`, etc.).
- Adds helper CLIs for Home Assistant/Supervisor APIs and read-only recorder inspection (`ha-api`, `supervisor-api`, `ha-sqlite-ro`, `ha-recorder-schema`).
- Seeds Codex with a tuned `config.toml` (on-request approvals, `danger-full-access` sandbox, web search enabled) tailored to this add-on.
- Keeps a dedicated tmux session running even when ingress is closed so Codex continues working between browser attaches. Shell history is stored at `/data/.codex_bash_history` (capped), and an alias (`codex`) is available for quickly launching new Codex instances in extra panes.
- Full access to Home Assistant configuration plus mapped share, SSL, and add-ons paths.
- Redirects common package-manager/tool caches (`npm`, `pip`, `yarn`, `pnpm`, Python bytecode, Corepack) into `/tmp` so add-on backups stay small by default.

## Configuration

The options page accepts three optional multiline fields:

| Option key    | Description                                                                 | Target file (persisted in `/data`) |
|---------------|-----------------------------------------------------------------------------|------------------------------------|
| `auth_json`   | Legacy one-time import of `~/.codex/auth.json`. Prefer the Web UI upload.  | `/data/auth.json`                  |
| `config_toml` | Codex preferences (`~/.codex/config.toml`).                                 | `/data/config.toml`                |
| `agents_md`   | Persistent memory/agent instructions (`~/.codex/AGENTS.md`).                | `/data/AGENTS.md`                  |

Two additional options control how much Codex runtime output is retained in `/data/codex_home` (to keep backups from growing indefinitely):

| Option key                     | Description                                      | Default |
|--------------------------------|--------------------------------------------------|---------|
| `codex_log_max_mb`             | Max size for `/data/codex_home/log/codex-tui.log` | `10`    |
| `codex_sessions_retention_days`| Delete session `.jsonl` files older than N days   | `90`    |

If `config_toml` is blank, the add-on seeds `/data/config.toml` with recommended defaults: `model = "gpt-5-codex"`, `approval_policy = "on-request"`, `sandbox_mode = "danger-full-access"`, and `[features] web_search_request = true`. Leave the field empty to keep receiving updates to this template, or paste your own TOML to override it.

If `agents_md` is blank, the add-on seeds `/data/AGENTS.md` with a concise environment brief covering available tools, mounts, and guardrails. Supply your own text in the option field to override it.

Changes are written on add-on start (and after saving options) with `chmod 600` permissions, then symlinked into `/root/.codex/` for the Codex CLI. Use the Web UI `Auth.json` action to upload or remove credentials without sending them through the terminal.

The add-on also excludes volatile runtime artifacts from add-on backups, including Codex logs/sessions, shell history, common cache folders, `node_modules`, virtualenvs, and Python bytecode under the add-on's own backed-up paths.

## Usage

1. Install the add-on from this repository.
2. If required, use the `Auth.json` toolbar action in the Web UI to upload credentials safely, or use the legacy `auth_json` option only for one-time import.
3. Disable protection mode (`Settings → Add-ons → HA Codex Terminal → Configuration`).
4. Start the add-on and open the Web UI (ingress).
5. The ingress terminal attaches to the long-running `codex` tmux session (living in `/homeassistant` by default).

- After Codex exits, the pane remains open in a login shell; reuse it or run `codex` to start a new Codex run.
- Mouse selection feeds tmux’s OSC 52 clipboard integration—enter copy mode (`Ctrl+b [`), drag to select, then release to put text on your system clipboard (Cmd+C works immediately on macOS browsers).
- Use standard tmux shortcuts (`Ctrl+b d` to detach, `Ctrl+b c` to create a window) if you want to keep additional shells running.
- On iOS Companion, use the toolbar soft keys (`Tab`, `Tmux`, `Copy`, `Paste`, `KB`, `Scroll`). Scroll mode is remembered per-browser via localStorage.

Useful helper commands:

- `ha-api /config` queries the Home Assistant Core API through the Supervisor proxy.
- `supervisor-api /addons` queries the Supervisor API directly.
- `ha-sqlite-ro 'select count(*) from states;'` opens the recorder DB read-only.
- `ha-recorder-schema` prints the recorder schema.
- `ha-python -c 'import homeassistant; print(homeassistant.__version__)'` runs against the bundled Home Assistant Python environment.
- `hass --script check_config -c /homeassistant` validates your Home Assistant configuration.

These helpers are optional conveniences. The raw `ha` CLI and direct client tools remain available.

Codex is preinstalled globally during image build, and each session launches the pinned CLI directly. The image currently pins `@openai/codex@0.114.0`, `bash-language-server@5.6.0`, `ttyd 1.7.7`, Home Assistant CLI `4.46.0`, and a dedicated Python venv with `homeassistant==2026.3.1`. Tool caches default to `/tmp` (`/tmp/.npm`, `/tmp/.cache`, `/tmp/.local`, `/tmp/.npm-global`), keeping snapshots lean.

## Security & Permissions

- `full_access: true` gives the container unrestricted filesystem and device access; `hassio_role: manager` still gives broad Supervisor control. Treat this add-on as fully trusted code.
- Prefer the Web UI `Auth.json` upload/remove flow over the legacy `auth_json` option so credentials are not stored in the Supervisor options database.
- If you need scratch installs, clones, or virtualenvs for one-off work, put them under `/tmp`; that content is intentionally not part of add-on backups.
- Network access to `registry.npmjs.org` and OpenAI endpoints is required for Codex to function.

## Troubleshooting

- If ingress shows an empty page, refresh after several seconds — the tmux session is still booting.
- Should npm fail (offline, rate limited), the tmux session falls back to a bash shell so you can inspect logs under `/data`.
- If you manually override the default cache locations away from `/tmp`, that data can end up in backups; the shipped defaults are chosen specifically to avoid that.
