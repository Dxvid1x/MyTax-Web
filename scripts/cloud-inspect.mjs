import postgres from "postgres";
const configuredValue = (value) => !!value && value !== "[SENSITIVE]";
const available = {
  url: configuredValue(process.env.SUPABASE_URL),
  publicKey: configuredValue(process.env.SUPABASE_ANON_KEY),
  database: configuredValue(
    process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ),
};
console.log(JSON.stringify({ available }));
if (available.url && available.publicKey) {
  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/settings`,
      {
        headers: { apikey: process.env.SUPABASE_ANON_KEY },
        signal: AbortSignal.timeout(12000),
      },
    );
    const config = await response.json();
    console.log(
      JSON.stringify({
        authStatus: response.status,
        emailEnabled: config.external?.email,
        signupDisabled: config.disable_signup,
        emailAutoConfirm: config.mailer_autoconfirm,
      }),
    );
  } catch {
    console.log(JSON.stringify({ auth: "connection-failed" }));
  }
}
if (available.database) {
  const sql = postgres(
    process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
    { ssl: { rejectUnauthorized: true }, max: 1, connect_timeout: 12 },
  );
  try {
    const tables =
      await sql`select tablename, rowsecurity from pg_tables where schemaname = 'public'`;
    console.log(JSON.stringify({ tables }));
  } catch (error) {
    console.log(
      JSON.stringify({
        database: "connection-failed",
        code: error.code || "UNKNOWN",
      }),
    );
  } finally {
    await sql.end({ timeout: 2 });
  }
}
