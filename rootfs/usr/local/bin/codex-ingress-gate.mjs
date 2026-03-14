#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";

const ingressPort = Number(process.env.CODEX_INGRESS_PORT || "7681");
const ttydPort = Number(process.env.CODEX_TTYD_PORT || "7682");
const indexHtml = process.env.CODEX_INDEX_HTML || "/usr/share/ttyd/index.html";

const dataAuthPath = process.env.CODEX_AUTH_FILE || "/data/auth.json";
const codexDir = process.env.CODEX_CONFIG_DIR || "/root/.codex";
const codexAuthPath = path.join(codexDir, "auth.json");

const allowedIps = new Set(
  (process.env.CODEX_ALLOWED_INGRESS_IPS || "172.30.32.2,127.0.0.1,::1")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean),
);

function normalizeIp(remoteAddress) {
  if (!remoteAddress) {
    return "";
  }
  if (remoteAddress.startsWith("::ffff:")) {
    return remoteAddress.slice(7);
  }
  return remoteAddress;
}

function isAllowed(remoteAddress) {
  return allowedIps.has(normalizeIp(remoteAddress));
}

function deny(socketOrResponse) {
  if ("writeHead" in socketOrResponse) {
    socketOrResponse.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    socketOrResponse.end("Forbidden");
    return;
  }

  socketOrResponse.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\nForbidden");
  socketOrResponse.destroy();
}

function ensureAuthSymlink() {
  fs.mkdirSync(codexDir, { recursive: true });
  try {
    const stat = fs.lstatSync(codexAuthPath);
    if (!stat.isSymbolicLink() && !stat.isFile()) {
      fs.rmSync(codexAuthPath, { force: true, recursive: true });
    } else {
      fs.rmSync(codexAuthPath, { force: true });
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
  fs.symlinkSync(dataAuthPath, codexAuthPath);
}

function writeAuthJson(raw) {
  JSON.parse(raw);
  fs.mkdirSync(path.dirname(dataAuthPath), { recursive: true });
  const tmpPath = `${dataAuthPath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmpPath, `${raw.replace(/\r\n?/g, "\n")}\n`, { mode: 0o600 });
  fs.renameSync(tmpPath, dataAuthPath);
  fs.chmodSync(dataAuthPath, 0o600);
  ensureAuthSymlink();
}

function removeAuthJson() {
  fs.rmSync(dataAuthPath, { force: true });
  fs.rmSync(codexAuthPath, { force: true });
}

function readBody(req, limitBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > limitBytes) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const ttyd = spawn(
  "ttyd",
  [
    "--writable",
    "--port",
    String(ttydPort),
    "--interface",
    "127.0.0.1",
    "-t",
    "disableReconnect=false",
    "-t",
    "rendererType=canvas",
    "--index",
    indexHtml,
    "/usr/local/bin/codex-entry",
  ],
  { stdio: "inherit" },
);

ttyd.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

process.on("SIGTERM", () => ttyd.kill("SIGTERM"));
process.on("SIGINT", () => ttyd.kill("SIGINT"));

const server = http.createServer(async (req, res) => {
  if (!isAllowed(req.socket.remoteAddress)) {
    deny(res);
    return;
  }

  if (req.url === "/__codex/auth") {
    try {
      if (req.method === "PUT" || req.method === "POST") {
        const raw = await readBody(req);
        writeAuthJson(raw.trim());
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method === "DELETE") {
        removeAuthJson();
        res.writeHead(204);
        res.end();
        return;
      }

      res.writeHead(405, { allow: "DELETE, POST, PUT" });
      res.end();
      return;
    } catch (err) {
      res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  const proxyReq = http.request(
    {
      host: "127.0.0.1",
      port: ttydPort,
      method: req.method,
      path: req.url,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${ttydPort}`,
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on("error", (err) => {
    res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    res.end(`Bad gateway: ${err.message}`);
  });

  req.pipe(proxyReq);
});

server.on("upgrade", (req, clientSocket, head) => {
  if (!isAllowed(req.socket.remoteAddress)) {
    deny(clientSocket);
    return;
  }

  const upstream = net.connect(ttydPort, "127.0.0.1", () => {
    upstream.write(`GET ${req.url} HTTP/${req.httpVersion}\r\n`);
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      const key = req.rawHeaders[i];
      const value =
        key.toLowerCase() === "host" ? `127.0.0.1:${ttydPort}` : req.rawHeaders[i + 1];
      upstream.write(`${key}: ${value}\r\n`);
    }
    upstream.write("\r\n");
    if (head.length > 0) {
      upstream.write(head);
    }
    upstream.pipe(clientSocket);
    clientSocket.pipe(upstream);
  });

  upstream.on("error", () => clientSocket.destroy());
  clientSocket.on("error", () => upstream.destroy());
});

server.listen(ingressPort, "0.0.0.0", () => {
  console.log(`Codex ingress gate listening on :${ingressPort}, proxying ttyd on 127.0.0.1:${ttydPort}`);
});
