import psycopg2
import bcrypt
import uuid

# Create the correct password hash using bcrypt
password = "password123"
salt = bcrypt.gensalt()
hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

print(f"Generated hash: {hashed_password}")

# Connect to database
conn = psycopg2.connect(
    dbname="gearguard_cmms",
    user="postgres",
    password="2005",
    host="localhost"
)
cur = conn.cursor()

# Delete old admin
cur.execute("DELETE FROM users WHERE email = 'admin@company.com'")
print(f"Deleted old admin user")

# Insert new admin with correct hash
user_id = str(uuid.uuid4())
cur.execute("""
    INSERT INTO users (id, email, full_name, password_hash, is_active, created_at, updated_at, role_id)
    SELECT %s, %s, %s, %s, true, NOW(), NOW(), 
           (SELECT id FROM roles WHERE name = 'Administrator' LIMIT 1)
""", (user_id, "admin@company.com", "Admin User", hashed_password))

conn.commit()
print(f"Created new admin user with ID: {user_id}")
print(f"Email: admin@company.com")
print(f"Password: password123")
print(f"Hash: {hashed_password}")

# Verify it works
cur.execute("SELECT password_hash FROM users WHERE email = 'admin@company.com'")
stored_hash = cur.fetchone()[0]
print(f"\nStored hash from DB: {stored_hash}")

# Test verification
result = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
print(f"Verification test: {result}")

cur.close()
conn.close()
