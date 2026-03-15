#!/bin/sh
# Convenience alias so additional panes can relaunch Codex quickly
alias codex='NPM_CONFIG_CACHE=/tmp/.npm XDG_CACHE_HOME=/tmp/.cache PIP_CACHE_DIR=/tmp/.cache/pip PYTHONPYCACHEPREFIX=/tmp/.cache/pycache YARN_CACHE_FOLDER=/tmp/.cache/yarn COREPACK_HOME=/tmp/.cache/corepack PNPM_HOME=/tmp/.local/share/pnpm PNPM_STORE_DIR=/tmp/.local/share/pnpm/store NPM_CONFIG_PREFIX=/tmp/.npm-global TMPDIR=/tmp /usr/local/bin/codex'
