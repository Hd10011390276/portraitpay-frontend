const { Client } = require('pg');

const client = new Client({
  host: 'hopper.proxy.rlwy.net',
  port: 33799,
  user: 'postgres',
  password: 'ZdYQvkZfcIPKnClCdPdxOQaEDmwMNJQY',
  database: 'railway',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

client.connect((err) => {
  if (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
  console.log('Connected!');
  client.query('SELECT current_database(), current_user, version();', (err, res) => {
    if (err) console.error('Query error:', err.message);
    else console.log('Result:', JSON.stringify(res.rows, null, 2));
    client.end();
    process.exit(0);
  });
});
