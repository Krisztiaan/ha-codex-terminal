# HA Codex Terminal

Run OpenAI Codex inside Home Assistant through an ingress terminal backed by `ttyd` and `tmux`.

## Install

[![Add this repository to Home Assistant.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https://github.com/Krisztiaan/ha-codex-terminal)

[![Open this add-on in Home Assistant.](https://my.home-assistant.io/badges/supervisor_addon.svg)](https://my.home-assistant.io/redirect/supervisor_addon/?addon=70b71f14_ha-codex-terminal&repository_url=https://github.com/Krisztiaan/ha-codex-terminal)

If the badges do not open Home Assistant directly, add this custom repository manually in the Add-on Store:

`https://github.com/Krisztiaan/ha-codex-terminal`

## What It Does

- Opens a Home Assistant ingress terminal for Codex.
- Keeps a long-lived `tmux` session so work survives browser reconnects.
- Ships common CLI tooling for Home Assistant maintenance and debugging.
- Includes helper commands for Home Assistant Core API, Supervisor API, and read-only recorder access.
- Keeps common package-manager caches in `/tmp` and excludes volatile data from add-on backups.

## Docs

See [DOCS.md](./DOCS.md) for configuration, permissions, and operational notes.
