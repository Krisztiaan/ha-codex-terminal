#!/bin/sh
# Keep common package-manager caches out of backed-up storage.
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-/tmp/.npm}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-/tmp/.cache}"
export PIP_CACHE_DIR="${PIP_CACHE_DIR:-/tmp/.cache/pip}"
export PYTHONPYCACHEPREFIX="${PYTHONPYCACHEPREFIX:-/tmp/.cache/pycache}"
export PYTHONUSERBASE="${PYTHONUSERBASE:-/tmp/.local}"
export PIPX_HOME="${PIPX_HOME:-/tmp/.local/pipx}"
export PIPX_BIN_DIR="${PIPX_BIN_DIR:-/tmp/.local/bin}"
export YARN_CACHE_FOLDER="${YARN_CACHE_FOLDER:-/tmp/.cache/yarn}"
export COREPACK_HOME="${COREPACK_HOME:-/tmp/.cache/corepack}"
export PNPM_HOME="${PNPM_HOME:-/tmp/.local/share/pnpm}"
export PNPM_STORE_DIR="${PNPM_STORE_DIR:-/tmp/.local/share/pnpm/store}"
export NPM_CONFIG_PREFIX="${NPM_CONFIG_PREFIX:-/tmp/.npm-global}"
export TMPDIR="${TMPDIR:-/tmp}"

case ":$PATH:" in
    *":$PIPX_BIN_DIR:"*) ;;
    *) export PATH="$PIPX_BIN_DIR:$PATH" ;;
esac

case ":$PATH:" in
    *":$NPM_CONFIG_PREFIX/bin:"*) ;;
    *) export PATH="$NPM_CONFIG_PREFIX/bin:$PATH" ;;
esac
