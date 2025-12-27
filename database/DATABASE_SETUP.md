# Database Setup Guide for GearGuard CMMS (Windows with pgAdmin)

## Your Role: Database Architect

You will create and populate the PostgreSQL database, then export it for your FastAPI developer teammate.

## Prerequisites

1. **PostgreSQL 15 or higher** with pgAdmin (likely already installed)
2. **Python packages for seeding:**

```powershell
pip install faker psycopg2-binary python-dotenv
```

## Step 1: Create the Database (Using pgAdmin)

### Method A: Using pgAdmin GUI (Recommended for Windows)

1. **Open pgAdmin** from Start Menu
2. **Connect to your server:**
   - Expand "Servers" → "PostgreSQL 15" (or your version)
   - Enter your master password if prompted

3. **Create Database:**
   - Right-click "Databases" → "Create" → "Database..."
   - **Database name:** `gearguard_cmms`
   - **Owner:** postgres (or your username)
   - Click "Save"

4. **Create User (Optional, for security):**
   - Right-click "Login/Group Roles" → "Create" → "Login/Group Role..."
   - **General tab → Name:** `gearguard_user`
   - **Definition tab → Password:** `your_secure_password`
   - **Privileges tab:** Check "Can login?"
   - Click "Save"

5. **Grant Database Privileges:**
   - Right-click on `gearguard_cmms` database → "Properties"
   - Go to "Security" tab → Click "+"
   - **Grantee:** gearguard_user
   - **Privileges:** Check all (SELECT, INSERT, UPDATE, DELETE, etc.)
   - Click "Save"

### Method B: Using psql Command Line

```powershell
# Open PowerShell and navigate to PostgreSQL bin directory
cd "C:\Program Files\PostgreSQL\15\bin"

# Connect to PostgreSQL
.\psql -U postgres
```

Inside PostgreSQL shell:

```sql
-- Create database
CREATE DATABASE gearguard_cmms;

-- Create user (optional)
CREATE USER gearguard_user WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gearguard_cmms TO gearguard_user;

-- Connect to the database
\c gearguard_cmms

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO gearguard_user;

-- Exit
\q
```

## Step 2: Run the Schema Migration (Using pgAdmin)

1. **Open Query Tool:**
   - In pgAdmin, expand Servers → PostgreSQL → Databases
   - Click on `gearguard_cmms` database
   - Click "Query Tool" icon (or Tools → Query Tool)

2. **Load Schema File:**
   - Click "Open File" icon (folder icon in toolbar)
   - Navigate to: `C:\Users\rishi\OneDrive\Desktop\gearguard-cmms\gearguard-cmms\database\schema.sql`
   - Select and open the file

3. **Execute Schema:**
   - Click "Execute/Refresh" button (▶ play icon) or press F5
   - You should see "Query returned successfully" in the output

4. **Verify Tables:**
   - In the left panel, right-click on `gearguard_cmms` → "Refresh"
   - Expand `gearguard_cmms` → "Schemas" → "public" → "Tables"
   - You should see 13 tables:
     - roles
     - users
     - teams
     - team_members
     - equipment_categories
     - equipment
     - maintenance_requests
     - request_history
     - work_order_instructions
     - parts_used
     - attachments
     - scheduled_maintenance
     - analytics_cache

### Alternative: Using Command Line

```powershell
# Navigate to PostgreSQL bin directory
cd "C:\Program Files\PostgreSQL\15\bin"

# Run the schema file
.\psql -U postgres -d gearguard_cmms -f "C:\Users\rishi\OneDrive\Desktop\gearguard-cmms\gearguard-cmms\database\schema.sql"
```


## Step 3: Configure Seed Script

Edit `database\seed_data.py` and update database credentials:

```python
DB_CONFIG = {
    'dbname': 'gearguard_cmms',
    'user': 'postgres',  # YOUR USERNAME
    'password': 'your_password',  # YOUR PASSWORD (the one you use to login to pgAdmin)
    'host': 'localhost',
    'port': 5432
}
```

## Step 4: Generate Seed Data

Run the Python script to generate 5000+ records:

```powershell
# Navigate to your project directory
cd C:\Users\rishi\OneDrive\Desktop\gearguard-cmms\gearguard-cmms

# Run the seed script
python database\seed_data.py
```

**This will create:**
- 100 users (admins, managers, technicians, employees)
- 15 teams with member assignments
- 25 equipment categories
- 2000 equipment items
- 3000 maintenance requests (across all stages)
- 200 scheduled maintenance records
- **Total: ~5,300+ records**

**Expected Output:**
```
============================================================
GearGuard CMMS - Database Seed Generator
============================================================

✓ Connected to database

Generating 100 users...
✓ Created 100 users
Generating 15 teams...
Assigning team members...
✓ Created 15 teams with 75 memberships
...
============================================================
DATABASE SEEDING COMPLETE!
============================================================
Total Users: 100
Total Equipment: 2000
Total Maintenance Requests: 3000
Total Records: ~5300
============================================================
```


## Step 5: Verify Data (Using pgAdmin)

### Method A: Using pgAdmin GUI

1. **Refresh Database:**
   - Right-click on `gearguard_cmms` → "Refresh"

2. **View Table Data:**
   - Expand `gearguard_cmms` → "Schemas" → "public" → "Tables"
   - Right-click on any table (e.g., `equipment`) → "View/Edit Data" → "All Rows"
   - Browse the data in the grid view

3. **Run Verification Queries:**
   - Open Query Tool on `gearguard_cmms`
   - Copy and paste this query:

```sql
-- Count records
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'maintenance_requests', COUNT(*) FROM maintenance_requests
UNION ALL
SELECT 'teams', COUNT(*) FROM teams
UNION ALL
SELECT 'equipment_categories', COUNT(*) FROM equipment_categories;
```

   - Click Execute (▶) to run

4. **View Sample Data:**

```sql
-- View sample equipment
SELECT name, serial_number, health_status, status 
FROM equipment 
LIMIT 10;

-- View recent maintenance requests
SELECT request_number, subject, stage, maintenance_type, priority
FROM maintenance_requests 
ORDER BY created_at DESC 
LIMIT 10;
```

### Method B: Using Command Line

```powershell
# Navigate to PostgreSQL bin
cd "C:\Program Files\PostgreSQL\15\bin"

# Connect to database
.\psql -U postgres -d gearguard_cmms
```

Then run the SQL queries above, and type `\q` to exit.

## Step 6: Export the Database for FastAPI

### Method A: Using pgAdmin GUI (Easiest)

1. **Backup Database:**
   - Right-click on `gearguard_cmms` database
   - Select "Backup..."
   
2. **Configure Backup:**
   - **Filename:** Click "..." and choose location:
     - Suggested: `C:\Users\rishi\Desktop\gearguard_cmms_dump.backup`
   - **Format:** Custom (this is binary, faster to restore)
   - **Encoding:** UTF8
   - **Role name:** postgres
   
3. **Backup Options:**
   - Go to "Data Options" tab
   - Check: "Blobs", "Data", "Owner"
   - Click "Backup"
   
4. **Wait for Completion:**
   - You'll see a progress dialog
   - When done, click "Done"
   - Your backup file is ready!

### Method B: Using pg_dump Command Line

```powershell
# Navigate to PostgreSQL bin directory
cd "C:\Program Files\PostgreSQL\15\bin"

# Export entire database (binary format - recommended)
.\pg_dump -U postgres -d gearguard_cmms -F c -f "C:\Users\rishi\Desktop\gearguard_cmms_dump.backup"

# OR export as SQL (text format - more readable but larger)
.\pg_dump -U postgres -d gearguard_cmms -f "C:\Users\rishi\Desktop\gearguard_cmms_dump.sql"
```

### Compress for Sharing (Optional)

Right-click on the backup file → "Send to" → "Compressed (zipped) folder"

Or use PowerShell:

```powershell
# Compress the backup file
Compress-Archive -Path "C:\Users\rishi\Desktop\gearguard_cmms_dump.backup" -DestinationPath "C:\Users\rishi\Desktop\gearguard_database.zip"
```

**File sizes:**
- `.backup` format: ~5-10 MB (binary, faster restore)
- `.sql` format: ~10-20 MB (text, human-readable)
- `.zip`: ~2-5 MB (compressed)

## Step 7: Share with Your FastAPI Teammate

## Step 7: Share with Your FastAPI Teammate

Send your FastAPI developer the following files:

1. **The database dump file**: 
   - `gearguard_cmms_dump.backup` (or `.zip` if compressed)
   - Send via email, Google Drive, Dropbox, or USB drive

2. **Database schema documentation**: 
   - `database\schema.sql` (for reference)
   - `DATABASE_SCHEMA.md` (if available)

3. **Instructions for restoration**:
   - Send them `FASTAPI_HANDOFF.md` (if exists) or provide these instructions:

### For Your Friend to Restore the Database:

**Using pgAdmin:**
1. Create empty database `gearguard_cmms`
2. Right-click database → "Restore..."
3. Select the `.backup` file
4. Click "Restore"

**Using psql:**
```bash
# Windows
cd "C:\Program Files\PostgreSQL\15\bin"
.\pg_restore -U postgres -d gearguard_cmms -v "path\to\gearguard_cmms_dump.backup"

# Linux/Mac
pg_restore -U postgres -d gearguard_cmms -v gearguard_cmms_dump.backup
```

4. **Database credentials** (share securely):
   - Database name: `gearguard_cmms`
   - Default user password: `password123` (hashed in database)
   - Admin test email: Check seed script output or query users table

5. **FastAPI Connection String:**
```python
DATABASE_URL = "postgresql://postgres:your_password@localhost:5432/gearguard_cmms"
```

## Alternative: Remote Database Access (Same Network/VPN)

If your friend wants to connect directly to your database:

### Enable Remote Connections

1. **Find PostgreSQL data directory:**
   - Usually: `C:\Program Files\PostgreSQL\15\data\`

2. **Edit postgresql.conf:**
   - Open `C:\Program Files\PostgreSQL\15\data\postgresql.conf` in Notepad (as Administrator)
   - Find line: `#listen_addresses = 'localhost'`
   - Change to: `listen_addresses = '*'`
   - Save file

3. **Edit pg_hba.conf:**
   - Open `C:\Program Files\PostgreSQL\15\data\pg_hba.conf` in Notepad (as Administrator)
   - Add this line at the end:
   ```
   host    gearguard_cmms    postgres    0.0.0.0/0    md5
   ```
   - Save file

4. **Restart PostgreSQL:**
   - Open Services (Win + R → type `services.msc`)
   - Find "postgresql-x64-15" service
   - Right-click → "Restart"

5. **Configure Windows Firewall:**
   ```powershell
   # Run PowerShell as Administrator
   New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow
   ```

6. **Find Your IP Address:**
   ```powershell
   ipconfig
   # Look for "IPv4 Address" under your active network adapter
   ```

7. **Give Your Friend:**
   - Your IP address (e.g., 192.168.1.100)
   - Database name: `gearguard_cmms`
   - Username: `postgres`
   - Password: (your postgres password)
   - Port: `5432`
   
   **Connection string for FastAPI:**
   ```python
   DATABASE_URL = "postgresql://postgres:password@YOUR_IP_ADDRESS:5432/gearguard_cmms"
   ```

⚠️ **Security Note:** Only use remote access on trusted networks. For production, use proper security measures.

## Troubleshooting

### "Permission Denied" Error

- Run pgAdmin or PowerShell as Administrator
- Check Windows file permissions on the backup file location

### "Connection Refused" Error

1. **Check PostgreSQL is running:**
   - Open Services (Win + R → `services.msc`)
   - Look for "postgresql-x64-15"
   - Status should be "Running"
   - If not, right-click → "Start"

2. **Or use pgAdmin:**
   - Try connecting to the server in pgAdmin
   - If it connects, PostgreSQL is running

### Seed Script Fails - "psycopg2 not found"

```powershell
pip install psycopg2-binary
# Or if that fails:
pip install psycopg2
```

### Seed Script Fails - "Connection refused"

Check your password in `seed_data.py` matches your pgAdmin password:
```python
DB_CONFIG = {
    'password': 'your_actual_postgres_password',  # Must match!
}
```

### Out of Memory During Seeding

Edit `database\seed_data.py` and reduce counts:
```python
generate_equipment(conn, category_ids, team_ids, users, count=500)  # Instead of 2000
generate_maintenance_requests(conn, users, count=1000)  # Instead of 3000
```

### Can't Find PostgreSQL bin Directory

Common locations:
- `C:\Program Files\PostgreSQL\15\bin`
- `C:\Program Files\PostgreSQL\14\bin`
- `C:\PostgreSQL\15\bin`

Or search in File Explorer for `psql.exe`

## Quick Reference - pgAdmin

**Common Operations:**

| Task | Steps |
|------|-------|
| View table data | Tables → Right-click table → "View/Edit Data" → "All Rows" |
| Run SQL query | Click database → Query Tool (🗲 icon) |
| Count rows | Query Tool → `SELECT COUNT(*) FROM table_name;` |
| Export table to CSV | Right-click table → "Import/Export" → Export |
| Backup database | Right-click database → "Backup..." |
| Restore database | Right-click database → "Restore..." |
| Refresh objects | Right-click → "Refresh" |

## Quick Reference - SQL Commands

```sql
-- Connect to database (in Query Tool, just select the database first)

-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count all records across tables
SELECT 
    schemaname, 
    relname as tablename,
    n_tup_ins - n_tup_del as row_count
FROM pg_stat_user_tables
ORDER BY row_count DESC;

-- View table structure
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'equipment';

-- Quick data preview
SELECT * FROM equipment LIMIT 5;
```

## Next Steps

1. ✅ Database created and populated
2. ✅ Data verified  
3. ✅ Database exported
4. 📤 Share backup file with your FastAPI friend
5. 🚀 Your friend can now build the FastAPI backend!

### For Your FastAPI Friend

Provide them with:
- The `.backup` file you created
- Database name: `gearguard_cmms`  
- Schema documentation: `DATABASE_SCHEMA.md`
- This information about test users:
  ```
  Default password for all users: password123
  Sample admin email: (check users table or seed script output)
  ```

They can restore and start building the API endpoints right away!
