#!/command/with-contenv bashio
# shellcheck shell=bash

set -euo pipefail

SESSION="codex"
WORKDIR="/homeassistant"
if [ ! -d "${WORKDIR}" ]; then
    WORKDIR="/config"
fi

INDEX_HTML="/usr/share/ttyd/index.html"
# Allow an optional user-provided override from the add-on config dir.
if [ -f "/config/ttyd_index_custom.html" ]; then
    INDEX_HTML="/config/ttyd_index_custom.html"
elif [ -f "/homeassistant/ttyd_index_custom.html" ]; then
    # Back-compat for earlier revisions that pointed users at the HA config dir.
    INDEX_HTML="/homeassistant/ttyd_index_custom.html"
fi

TOKEN_FILE="/run/s6/container_environment/SUPERVISOR_TOKEN"
SUP_TOKEN=""
if [ -f "${TOKEN_FILE}" ]; then
    SUP_TOKEN="$(cat "${TOKEN_FILE}")"
fi

tmux start-server
if [ -n "${SUP_TOKEN}" ]; then
    tmux set-environment -g SUPERVISOR_TOKEN "${SUP_TOKEN}" 2>/dev/null || true
fi

if ! tmux has-session -t "${SESSION}" 2>/dev/null; then
    bashio::log.info "Bootstrapping Codex tmux session in ${WORKDIR}."
    if tmux new-session -d -s "${SESSION}" /usr/local/bin/start-codex-session "${WORKDIR}"; then
        tmux set-option -t "${SESSION}" remain-on-exit on
        bashio::log.info "Codex tmux session started."
    else
        bashio::log.warning "Unable to start Codex tmux session automatically; it will be created on first attach."
    fi
fi

# Enable mouse support for scrolling/selection when the session exists.
tmux set-option -t "${SESSION}" -g mouse on 2>/dev/null || tmux set-option -g mouse on 2>/dev/null || true

bashio::log.info "Starting gated ingress proxy for Codex."
export CODEX_INDEX_HTML="${INDEX_HTML}"
export CODEX_INGRESS_PORT="7681"
export CODEX_TTYD_PORT="7682"
exec node /usr/local/bin/codex-ingress-gate.mjs
