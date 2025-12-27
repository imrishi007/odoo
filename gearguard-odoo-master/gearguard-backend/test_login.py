import bcrypt

# Test password verification with the stored hash
stored_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LkBRm.Rq4Kuu"
password = "password123"

# Try to verify
try:
    result = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
    print(f"Password verification successful: {result}")
except Exception as e:
    print(f"Error during verification: {e}")
    
# Test creating a new hash
try:
    salt = bcrypt.gensalt()
    new_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    print(f"New hash created successfully: {new_hash}")
    
    # Verify the new hash
    result2 = bcrypt.checkpw(password.encode('utf-8'), new_hash.encode('utf-8'))
    print(f"New hash verification: {result2}")
except Exception as e:
    print(f"Error creating/verifying new hash: {e}")
