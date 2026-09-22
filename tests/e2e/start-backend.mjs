import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";

const backendDir = process.env.BACKEND_DIR || path.resolve("../SVC01072023BE/SVC01072023BE");
const php = process.env.E2E_PHP_BIN || "php";
const runtime = mkdtempSync(path.join(tmpdir(), "sivi-e2e-"));
const frontendPort = process.env.E2E_FRONTEND_PORT || "5175";
const backendPort = process.env.E2E_BACKEND_PORT || "8001";
const frontend = "http://127.0.0.1:" + frontendPort;
const mysql = process.env.E2E_DB_CONNECTION === "mysql";
if (process.env.E2E_DB_CONNECTION && !["mysql", "sqlite"].includes(process.env.E2E_DB_CONNECTION)) {
  throw new Error("E2E only supports a dedicated SQLite or MySQL test database.");
}
const database = mysql ? process.env.E2E_DB_DATABASE : path.join(runtime, "database.sqlite");
const databasePort = process.env.E2E_DB_PORT || "3307";
if (mysql && (!/^sivi_e2e_[a-z0-9_]+$/.test(database || "") || databasePort === "3306")) {
  throw new Error("Refusing E2E migration: use a sivi_e2e_* database on an isolated MySQL port.");
}
if (!mysql) writeFileSync(database, "");
const env = {
  ...process.env,
  APP_ENV: "testing",
  APP_DEBUG: "false",
  APP_KEY: "base64:" + randomBytes(32).toString("base64"),
  APP_URL: "http://127.0.0.1:" + backendPort,
  APP_CONFIG_CACHE: path.join(runtime, "config.php"),
  APP_ROUTES_CACHE: path.join(runtime, "routes.php"),
  DB_URL: "",
  DB_CONNECTION: mysql ? "mysql" : "sqlite",
  DB_DATABASE: database,
  DB_HOST: "127.0.0.1",
  DB_PORT: databasePort,
  DB_USERNAME: mysql ? process.env.E2E_DB_USERNAME || "root" : "",
  DB_PASSWORD: mysql ? process.env.E2E_DB_PASSWORD || "" : "",
  SESSION_DRIVER: "database",
  SESSION_ENCRYPT: "true",
  SESSION_COOKIE: "sivi_e2e_session",
  SESSION_DOMAIN: "",
  SESSION_SECURE_COOKIE: "false",
  CACHE_STORE: "database",
  CACHE_PREFIX: "sivi_e2e_" + path.basename(runtime).replace(/[^A-Za-z0-9]/g, "_") + "_",
  QUEUE_CONNECTION: "database",
  MAIL_MAILER: "array",
  LOG_CHANNEL: "stderr",
  CORS_ALLOWED_ORIGINS: frontend,
  SANCTUM_STATEFUL_DOMAINS: "127.0.0.1:" + frontendPort,
  FRONTEND_URL: frontend,
  AI_CHAT_DRIVER: "ollama",
  AI_CHAT_BASE_URL: "http://127.0.0.1:11434",
  AI_CHAT_MODEL: process.env.E2E_AI_MODEL || "missing-e2e-model",
  AI_CHAT_TIMEOUT: "20",
  BCRYPT_ROUNDS: "4",
  SEED_ADMIN_ENABLED: "false",
  PHP_CLI_SERVER_WORKERS: "4",
};
const inspect = spawnSync(php, ["-r", [
  'require "vendor/autoload.php";',
  '$app = require "bootstrap/app.php";',
  '$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();',
  '$c = config("database.default"); $d = config("database.connections.".$c);',
  'echo json_encode(["environment"=>app()->environment(),"connection"=>$c,"database"=>$d["database"],"host"=>$d["host"]??null,"port"=>$d["port"]??null]);',
].join("")], { cwd: backendDir, env, encoding: "utf8" });
if (inspect.status !== 0) throw new Error("Laravel test boot failed: " + inspect.stderr);
const actual = JSON.parse(inspect.stdout);
if (actual.environment !== "testing" || actual.connection !== env.DB_CONNECTION ||
    actual.database !== database || (mysql && (actual.host !== "127.0.0.1" || String(actual.port) !== databasePort))) {
  throw new Error("Refusing migration: resolved Laravel configuration differs from the isolated test target.");
}
console.log("Verified Laravel E2E database:", JSON.stringify(actual));
for (const args of [["artisan", "migrate", "--force"], ["artisan", "db:seed", "--class=Tests\\E2ESeeder", "--force"]]) {
  const result = spawnSync(php, args, { cwd: backendDir, env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
const server = spawn(php, ["artisan", "serve", "--host=127.0.0.1", "--port=" + backendPort, "--no-reload"], {
  cwd: backendDir, env, stdio: "inherit",
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.kill(signal));
server.on("exit", (code) => process.exit(code || 0));
