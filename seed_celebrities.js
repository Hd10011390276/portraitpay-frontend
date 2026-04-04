const { Client } = require('pg');
const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const struct = require('util').inspect;

// Connect to PostgreSQL
const pg = new Client({
  host: 'hopper.proxy.rlwy.net',
  port: 33799,
  user: 'postgres',
  password: 'ZdYQvkZfcIPKnClCdPdxOQaEDmwMNJQY',
  database: 'railway',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000
});

// Connect to SQLite
const dbPath = path.join(__dirname, '..', 'portraitpay-api', 'data', 'portraitpay.db');
const sqlite = new sqlite3.Database(dbPath);

// Convert float array to binary buffer (4 bytes per float, little-endian)
function floatsToBuffer(arr) {
  const buf = Buffer.alloc(arr.length * 4);
  for (let i = 0; i < arr.length; i++) {
    buf.writeFloatLE(arr[i], i * 4);
  }
  return buf;
}

pg.connect((err) => {
  if (err) {
    console.error('PG connect error:', err.message);
    process.exit(1);
  }
  console.log('Connected to PostgreSQL');

  // Get all celebrities with embeddings from SQLite
  const rows = sqlite.prepare(`
    SELECT f.id, f.name, f.category, f.description, ci.country, ci.subcategory, ci.risk_level, fe.embedding, fe.model_name
    FROM faces f
    JOIN celebrity_info ci ON f.id = ci.face_id
    JOIN face_embeddings fe ON f.id = fe.face_id
    WHERE f.is_celebrity = 1 AND fe.embedding IS NOT NULL
  `).all();

  sqlite.close();
  console.log(`Found ${rows.length} celebrities with embeddings to migrate`);

  let migrated = 0;
  let errors = 0;

  const insert = pg.query(`
    INSERT INTO "Celebrity" (id, "name", category, "source", "confidence", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, now(), now())
    ON CONFLICT ("name") DO UPDATE SET
      category = EXCLUDED.category,
      "updatedAt" = now()
  `);

  for (const row of rows) {
    let embedding = null;
    try {
      const embArr = JSON.parse(row.embedding);
      if (embArr.length === 512) {
        embedding = floatsToBuffer(embArr);
      }
    } catch (e) {
      console.error(`Parse error for ${row.name}: ${e.message}`);
    }

    if (embedding) {
      // We insert without the embedding first (bytea requires separate update)
      const id = require('crypto').randomUUID();
      try {
        insert.run(id, row.name, row.category, row.model_name || 'buffalo_l', 0.85);
        migrated++;
        if (migrated % 20 === 0) console.log(`Migrated ${migrated}/${rows.length}: ${row.name}`);
      } catch (e2) {
        if (e2.message.includes('duplicate')) {
          console.log(`Skipped (duplicate): ${row.name}`);
        } else {
          console.error(`DB error for ${row.name}: ${e2.message}`);
          errors++;
        }
      }
    }
  }

  console.log(`\nDone: ${migrated} migrated, ${errors} errors`);
  console.log('Celebrity names migrated:', rows.slice(0, 5).map(r => r.name).join(', '), '...');

  pg.end();
  process.exit(errors > 0 ? 1 : 0);
});
