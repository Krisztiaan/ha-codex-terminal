#!/bin/sh
# Export the Supervisor token into every login shell
TOKEN_FILE="/run/s6/container_environment/SUPERVISOR_TOKEN"
if [ -f "${TOKEN_FILE}" ]; then
    export SUPERVISOR_TOKEN="$(cat "${TOKEN_FILE}")"
fi
