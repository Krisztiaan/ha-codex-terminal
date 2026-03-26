# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Fix credential persistence by making `CODEX_HOME=/data/codex_home` the only canonical Codex state directory (no more `/data/auth.json` indirection or auth deletion on attach).
- Gate the custom ttyd toolbar/key handler to touch devices so desktop clipboard/hotkeys behave normally.
- Make tmux attaches land deterministically in the `main` window.
- Add a dedicated Home Assistant Python environment with `ha-python`, `ha-pip`, and `hass` helpers, pinned to `homeassistant==2026.3.1`.
- Pin bundled tool versions to current upstream releases as of 2026-03-15 (`@openai/codex 0.114.0`, Home Assistant CLI `4.46.0`, `bash-language-server 5.6.0`).
- Add helper CLIs for Home Assistant Core API, Supervisor API, and read-only recorder inspection.
- Improve repository presentation with README install badges, icon, logo, and changelog.
- Add GitHub Actions validation for YAML, shell scripts, and Home Assistant add-on test builds.
- Keep package-manager caches and other volatile artifacts out of add-on backups by default.

## 0.1.0

- Initial Home Assistant add-on release.
