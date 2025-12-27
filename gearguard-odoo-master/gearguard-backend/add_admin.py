"""
Simple script to add admin user - using pre-hashed password
"""
import psycopg2
import uuid
from datetime import datetime

# Database connection
conn = psycopg2.connect(
    dbname='gearguard_cmms',
    user='postgres',
    password='2005',
    host='localhost',
    port=5432
)

cursor = conn.cursor()

# First, check if user already exists
cursor.execute("SELECT id, email FROM users WHERE email = 'admin@company.com'")
existing_user = cursor.fetchone()

if existing_user:
    print(f"✓ User already exists: {existing_user[1]} (ID: {existing_user[0]})")
else:
    # Get a role ID (preferably Administrator)
    cursor.execute("SELECT id FROM roles WHERE name = 'Administrator' LIMIT 1")
    role = cursor.fetchone()
    role_id = role[0] if role else 1
    
    # Use the same pre-hashed password from seed_data.py (password123)
    password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LkBRm.Rq4Kuu'
    
    # Create the user
    user_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO users (id, email, password_hash, full_name, phone, avatar_url, 
                          role_id, department, is_active, last_login, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        user_id,
        'admin@company.com',
        password_hash,
        'Admin User',
        '+1-555-0100',
        None,
        role_id,
        'Admin',
        True,
        None,
        datetime.now(),
        datetime.now()
    ))
    
    conn.commit()
    print(f"✓ Created admin user: admin@company.com")
    print(f"  Password: password123")
    print(f"  User ID: {user_id}")
    print(f"  Role ID: {role_id}")

# List all users
cursor.execute("SELECT email, full_name, is_active FROM users ORDER BY created_at DESC LIMIT 10")
users = cursor.fetchall()
print(f"\nLast 10 users in database:")
for email, name, active in users:
    print(f"  - {email} ({name}) - Active: {active}")

# Count total users
cursor.execute("SELECT COUNT(*) FROM users")
count = cursor.fetchone()[0]
print(f"\nTotal users in database: {count}")

cursor.close()
conn.close()
