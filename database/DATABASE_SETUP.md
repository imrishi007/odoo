# Database Setup Guide for GearGuard CMMS

## Your Role: Database Architect

You will create and populate the PostgreSQL database, then export it for your Flask developer teammate.

## Prerequisites

Install required software:

```bash
# PostgreSQL 15 or higher
sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian
# OR
brew install postgresql@15  # macOS

# Python packages for seeding
pip install faker psycopg2-binary python-dotenv
```

## Step 1: Create the Database

```bash
# Switch to postgres user (Linux)
sudo -u postgres psql

# Or just run psql (macOS with Homebrew)
psql postgres
```

Inside PostgreSQL shell:

```sql
-- Create database
CREATE DATABASE gearguard_cmms;

-- Create user (optional, for security)
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

## Step 2: Run the Schema Migration

Apply the schema to create all tables:

```bash
# From the project root
cd /home/Luffyy/Desktop/Projects/gearguard-cmms

# Run the schema file
psql -U postgres -d gearguard_cmms -f database/schema.sql

# Or if you created a custom user:
psql -U gearguard_user -d gearguard_cmms -f database/schema.sql
```

**Expected Output:**
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
CREATE INDEX
...
INSERT 0 5  (roles inserted)
CREATE FUNCTION
CREATE TRIGGER
...
```

Verify tables were created:

```bash
psql -U postgres -d gearguard_cmms -c "\dt"
```

You should see 10 tables:
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

## Step 3: Configure Seed Script

Edit `database/seed_data.py` and update database credentials:

```python
DB_CONFIG = {
    'dbname': 'gearguard_cmms',
    'user': 'postgres',  # YOUR USERNAME
    'password': 'your_password',  # YOUR PASSWORD
    'host': 'localhost',
    'port': 5432
}
```

## Step 4: Generate Seed Data

Run the Python script to generate 5000+ records:

```bash
cd /home/Luffyy/Desktop/Projects/gearguard-cmms
python database/seed_data.py
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

## Step 5: Verify Data

Check that data was inserted:

```bash
psql -U postgres -d gearguard_cmms
```

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

-- View sample equipment
SELECT name, serial_number, health_status, status 
FROM equipment 
LIMIT 10;

-- View recent maintenance requests
SELECT request_number, subject, stage, maintenance_type, priority
FROM maintenance_requests 
ORDER BY created_at DESC 
LIMIT 10;

\q
```

## Step 6: Export the Database

Create a complete database dump to share with your Flask teammate:

```bash
# Export entire database
pg_dump -U postgres -d gearguard_cmms -F c -f gearguard_cmms_dump.backup

# Or export as SQL (more readable but larger file)
pg_dump -U postgres -d gearguard_cmms -f gearguard_cmms_dump.sql

# Compress for sharing
tar -czf gearguard_database.tar.gz gearguard_cmms_dump.backup
```

**File sizes:**
- `.backup` format: ~5-10 MB (binary, faster restore)
- `.sql` format: ~10-20 MB (text, human-readable)
- `.tar.gz`: ~2-5 MB (compressed)

## Step 7: Share with Teammate

Send your FastAPI developer teammate:

1. **The database dump file**: `gearguard_database.tar.gz`
2. **The FastAPI handoff guide**: `database/FASTAPI_HANDOFF.md`
3. **Database credentials** (via secure channel):
   - Database name: `gearguard_cmms`
   - Default password for all users: `password123` (hashed)
   - Admin email: Check the database or seed script output

## Alternative: Remote Database Access

If your teammate wants direct access (same network/VPN):

1. **Edit PostgreSQL config** to allow remote connections:

```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Change:
```
listen_addresses = '*'  # Allow all connections
```

2. **Update pg_hba.conf**:

```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Add:
```
host    gearguard_cmms    gearguard_user    0.0.0.0/0    md5
```

3. **Restart PostgreSQL**:

```bash
sudo systemctl restart postgresql
```

4. **Give your teammate**:
   - Your IP address
   - Database name: `gearguard_cmms`
   - Username: `gearguard_user`
   - Password: (the one you set)

## Troubleshooting

### Permission Denied

```bash
sudo chown postgres:postgres database/schema.sql
```

### Connection Refused

Check PostgreSQL is running:
```bash
sudo systemctl status postgresql
# or
brew services list  # macOS
```

### Seed Script Fails

Check Python packages:
```bash
pip list | grep -E "faker|psycopg2"
```

### Out of Memory

Reduce counts in `seed_data.py`:
```python
generate_equipment(conn, category_ids, team_ids, users, count=500)  # Instead of 2000
generate_maintenance_requests(conn, users, count=1000)  # Instead of 3000
```

## Quick Reference

```bash
# Connect to database
psql -U postgres -d gearguard_cmms

# List tables
\dt

# Describe table
\d equipment

# Count all records
SELECT 
    schemaname, 
    tablename, 
    n_tup_ins - n_tup_del as row_count
FROM pg_stat_user_tables
ORDER BY row_count DESC;

# Exit
\q
```

## Next Steps

After exporting, proceed to `FASTAPI_HANDOFF.md` to prepare materials for your FastAPI teammate.
