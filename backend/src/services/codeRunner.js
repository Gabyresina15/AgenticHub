import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const FILE_NAMES = {
  python: "main.py",
  javascript: "main.js",
  typescript: "main.ts",
  go: "main.go",
  rust: "main.rs",
  java: "Main.java",
  c: "main.c",
  cpp: "main.cpp",
  ruby: "main.rb",
  php: "main.php",
  sql: "main.sql",
};

const MAX_CODE = 20000;
const MAX_TESTS = 8;

function normalize(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

export async function executeCode({ language, version = "*", code, tests = [], stdin = "" }) {
  if (!language) throw new Error("language es obligatorio");
  if (!code || code.length > MAX_CODE) throw new Error("code vacio o demasiado largo");
  if (tests.length > MAX_TESTS) throw new Error("demasiados tests");

  const cases = tests.length ? tests : [{ stdin, expected: null }];
  const results = [];
  for (const test of cases) {
    const run = await runOnce({ language, version, code, stdin: test.stdin || "" });
    const stdout = normalize(run.stdout);
    const expected = test.expected == null ? null : normalize(test.expected);
    results.push({
      passed: expected == null ? run.code === 0 : run.code === 0 && stdout === expected,
      stdout: run.stdout,
      stderr: run.stderr,
      exitCode: run.code,
      expected: test.expected ?? null,
    });
  }
  return { language, passed: results.every((item) => item.passed), results };
}

async function runOnce({ language, version, code, stdin }) {
  if (language === "pgvector" || language === "postgres") return runPostgres({ code, stdin });
  if (process.env.PISTON_URL) {
    try {
      return await runPiston({ language, version, code, stdin });
    } catch (error) {
      if (language !== "python" && language !== "javascript") throw error;
    }
  }
  if (language === "python" || language === "javascript") return runLocal({ language, code, stdin });
  throw new Error("Sin Piston solo corren python y javascript.");
}

function runLocal({ language, code, stdin }) {
  const commands = language === "python" ? ["py", "python", "python3"] : ["node"];
  const fileName = FILE_NAMES[language];
  return new Promise(async (resolve) => {
    const dir = await mkdtemp(path.join(tmpdir(), "agentichub-"));
    const file = path.join(dir, fileName);
    await writeFile(file, code, "utf8");
    const attempt = (index) => {
      const child = spawn(commands[index], [file], { cwd: dir, windowsHide: true });
      let stdout = "";
      let stderr = "";
      const timer = setTimeout(() => child.kill(), 3000);
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", (chunk) => { stderr += chunk; });
      child.on("error", async () => {
        clearTimeout(timer);
        if (index + 1 < commands.length) return attempt(index + 1);
        await rm(dir, { recursive: true, force: true });
        resolve({ stdout: "", stderr: "No encuentro el interprete local.", code: 1 });
      });
      child.on("close", async (code) => {
        clearTimeout(timer);
        await rm(dir, { recursive: true, force: true });
        resolve({ stdout, stderr, code: code ?? 1 });
      });
      child.stdin.end(stdin);
    };
    attempt(0);
  });
}

async function runPiston({ language, version, code, stdin }) {
  const base = process.env.PISTON_URL;
  if (!base) throw new Error("Falta PISTON_URL. Levanta Piston para compilar lenguajes.");
  const response = await fetch(`${base.replace(/\/$/, "")}/api/v2/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language,
      version,
      files: [{ name: FILE_NAMES[language] || "main.txt", content: code }],
      stdin,
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: 256000000,
      run_memory_limit: 256000000,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Piston rechazo la ejecucion");
  return data.run || { stdout: "", stderr: data.message || "", code: 1 };
}

async function runPostgres({ code }) {
  const url = process.env.PGVECTOR_URL;
  if (!url) throw new Error("Falta PGVECTOR_URL para retos de pgvector.");
  if (/\b(drop\s+database|pg_read_file|lo_import|copy\s+.+\s+from\s+program)\b/i.test(code)) {
    throw new Error("Esa sentencia no esta permitida en el sandbox.");
  }
  const pg = await import("pg");
  const client = new pg.default.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query("CREATE EXTENSION IF NOT EXISTS vector");
    const result = await client.query(code);
    const stdout = JSON.stringify(result.rows ?? []);
    await client.query("ROLLBACK");
    return { stdout, stderr: "", code: 0 };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    return { stdout: "", stderr: error.message, code: 1 };
  } finally {
    await client.end();
  }
}
