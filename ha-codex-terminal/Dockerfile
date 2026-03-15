ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG=C.UTF-8

ARG BUILD_ARCH
ARG TTYD_VERSION=1.7.7
ARG CLI_VERSION=4.46.0
ARG CODEX_VERSION=0.114.0
ARG BASH_LANGUAGE_SERVER_VERSION=5.6.0

RUN apk add --no-cache \
    bash \
    tmux \
    jq \
    yq \
    ripgrep \
    fd \
    fzf \
    curl \
    wget \
    tar \
    zip \
    unzip \
    make \
    git \
    rsync \
    sshpass \
    rclone \
    openssh-client \
    python3 \
    py3-pip \
    nodejs \
    npm \
    libwebsockets \
    libwebsockets-evlib_uv \
    libuv \
    json-c \
    zlib \
    openssl \
    ca-certificates \
    sqlite \
    sqlite-dev \
    mariadb-client \
    mysql-client \
    postgresql-client \
    mosquitto-clients \
    iputils \
    bind-tools \
    patch

# Install Codex CLI at build time (pinned via CODEX_VERSION) and keep caches ephemeral
ENV NPM_CONFIG_CACHE=/tmp/.npm \
    XDG_CACHE_HOME=/tmp/.cache

RUN npm install -g @openai/codex@${CODEX_VERSION} bash-language-server@${BASH_LANGUAGE_SERVER_VERSION} \
    && npm cache clean --force || true

RUN set -e \
    && case "$BUILD_ARCH" in \
        amd64) TTYD_ASSET="ttyd.x86_64" ;; \
        aarch64) TTYD_ASSET="ttyd.aarch64" ;; \
        *) echo "Unsupported architecture: $BUILD_ARCH" >&2; exit 1 ;; \
    esac \
    && curl -fsSL -o /usr/local/bin/ttyd "https://github.com/tsl0922/ttyd/releases/download/${TTYD_VERSION}/${TTYD_ASSET}" \
    && chmod +x /usr/local/bin/ttyd

RUN curl -fsSL -o /usr/bin/ha \
        "https://github.com/home-assistant/cli/releases/download/${CLI_VERSION}/ha_${BUILD_ARCH}" \
    && chmod +x /usr/bin/ha

COPY run.sh /run.sh
COPY rootfs/ /

RUN chmod +x \
    /run.sh \
    /usr/local/bin/ha-api \
    /usr/local/bin/ha-recorder-schema \
    /usr/local/bin/ha-sqlite-ro \
    /usr/local/bin/supervisor-api \
    /usr/local/bin/codex-entry \
    /usr/local/bin/codex-ingress-gate.mjs \
    /usr/local/bin/start-codex-session \
    /usr/local/bin/tmux-osc52 \
    /etc/profile.d/ha-cli-aliases.sh \
    /etc/profile.d/tool-cache-env.sh \
    /etc/s6-overlay/scripts/codex-init \
    /etc/s6-overlay/s6-rc.d/codex/run

CMD [ "/command/s6-svc", "-wD", "/run/service/codex" ]
