import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  const connectionString = process.env.DATABASE_URL || "";
  const url = new URL(connectionString);

  const pool = new Pool({
    host: url.hostname,
    port: parseInt(url.port || "5432"),
    database: url.pathname.replace("/", ""),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    max: 1,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT version()");
    client.release();
    await pool.end();
    return NextResponse.json({
      ok: true,
      pg_version: result.rows[0].version,
      host: url.hostname,
      port: url.port,
      user: decodeURIComponent(url.username),
    });
  } catch (err) {
    await pool.end().catch(() => {});
    return NextResponse.json({
      ok: false,
      error: String(err),
      host: url.hostname,
      port: url.port,
      user: decodeURIComponent(url.username),
    }, { status: 500 });
  }
}
