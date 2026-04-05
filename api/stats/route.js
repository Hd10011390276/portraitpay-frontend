import psycopg2
c=psycopg2.connect(host='hopper.proxy.rlwy.net',port=33799,user='postgres',password='ZdYQvkZfcIPKnClCdPdxOQaEDmwMNJQY',dbname='railway',sslmode='require',connect_timeout=5)
cur=c.cursor()
cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        api_key VARCHAR(255) UNIQUE,
        email VARCHAR(255),
        verification_code VARCHAR(255),
        verified INTEGER DEFAULT 0,
        balance DECIMAL(10,2) DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")
# Also create face_embeddings table properly
cur.execute("""
    CREATE TABLE IF NOT EXISTS face_embeddings (
        id SERIAL PRIMARY KEY,
        celebrity_id INTEGER,
        face_id INTEGER,
        embedding BYTEA,
        model VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")
c.commit()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
print("Tables:", [r[0] for r in cur.fetchall()])
c.close()
print("Done!")
