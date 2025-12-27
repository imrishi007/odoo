# Database Files for GearGuard CMMS

This directory contains everything needed to create, populate, and share the PostgreSQL database.

## Files

- **`schema.sql`** - Complete database schema with all tables, indexes, triggers
- **`seed_data.py`** - Python script to generate 5000+ realistic records
- **`DATABASE_SETUP.md`** - Step-by-step guide for database architect
- **`FLASK_HANDOFF.md`** - Complete guide for Flask backend developer

## Quick Start

### For Database Architect (You):

1. Create database:
   ```bash
   createdb gearguard_cmms
   ```

2. Run schema:
   ```bash
   psql -d gearguard_cmms -f schema.sql
   ```

3. Update credentials in `seed_data.py`

4. Generate data:
   ```bash
   python seed_data.py
   ```

5. Export database:
   ```bash
   pg_dump -U postgres -d gearguard_cmms -F c -f gearguard_cmms_dump.backup
   tar -czf gearguard_database.tar.gz gearguard_cmms_dump.backup
   ```

6. Share `gearguard_database.tar.gz` and `FLASK_HANDOFF.md` with Flask developer

### For Flask Developer (Your Teammate):

1. Import database:
   ```bash
   pg_restore -d gearguard_cmms gearguard_cmms_dump.backup
   ```

2. Follow `FLASK_HANDOFF.md` for backend setup

## Database Stats

After seeding:
- 100 users
- 15 teams
- 25 equipment categories
- 2,000 equipment items
- 3,000 maintenance requests
- 200 scheduled tasks
- **Total: ~5,300+ records**

## Default Credentials

All users: password = `password123` (bcrypt hashed)

Find admin users:
```sql
SELECT email FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE r.name = 'Administrator';
```

## Architecture

```
┌─────────────┐
│   Users     │──┐
└─────────────┘  │
                 ├──▶ Teams ──▶ Equipment Categories
┌─────────────┐  │                      │
│  Equipment  │◀─┘                      │
└─────────────┘◀────────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Maintenance Requests │──▶ Request History
└──────────────────────┘
       │
       ├──▶ Work Order Instructions
       ├──▶ Parts Used
       └──▶ Attachments
```

## Key Features

- ✅ Auto-fill triggers for maintenance requests
- ✅ Audit trail for all request changes
- ✅ Soft delete support
- ✅ Timestamp auto-updates
- ✅ Role-based permissions (JSONB)
- ✅ QR code support for equipment
- ✅ Scheduled maintenance with frequency rules

## Support

Detailed guides:
- 📖 **DATABASE_SETUP.md** - For database architect
- 📖 **FLASK_HANDOFF.md** - For Flask developer
- 📊 **../DATABASE_SCHEMA.md** - Complete schema documentation
