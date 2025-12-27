"""
Create default admin user for GearGuard CMMS
Email: admin@company.com
Password: password123
"""

import psycopg2
import uuid
from datetime import datetime

# Database connection
DB_CONFIG = {
    'dbname': 'gearguard_cmms',
    'user': 'postgres',
    'password': '2005',
    'host': 'localhost',
    'port': 5432
}

def create_admin_user():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        # Get Administrator role ID
        cursor.execute("SELECT id FROM roles WHERE name = 'Administrator'")
        admin_role = cursor.fetchone()
        
        if not admin_role:
            print("❌ Administrator role not found. Please run schema.sql first.")
            return
        
        admin_role_id = admin_role[0]
        
        # Check if admin user already exists
        cursor.execute("SELECT id, email FROM users WHERE email = 'admin@company.com'")
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"✓ Admin user already exists: {existing_user[1]}")
            print(f"  User ID: {existing_user[0]}")
            print(f"  Email: admin@company.com")
            print(f"  Password: password123")
            return existing_user[0]
        
        # Create admin user
        user_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO users (
                id, email, password_hash, full_name, phone, 
                role_id, department, is_active, created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            RETURNING id
        """, (
            user_id,
            'admin@company.com',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LkBRm.Rq4Kuu',  # password123
            'System Administrator',
            '+1-555-0100',
            admin_role_id,
            'IT',
            True,
            datetime.now(),
            datetime.now()
        ))
        
        new_user_id = cursor.fetchone()[0]
        conn.commit()
        
        print("✓ Default admin user created successfully!")
        print(f"  User ID: {new_user_id}")
        print(f"  Email: admin@company.com")
        print(f"  Password: password123")
        print(f"  Role: Administrator")
        
        return new_user_id
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating admin user: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("Creating default admin user...")
    create_admin_user()
    print("\n✓ You can now login at http://localhost:3000/login")
