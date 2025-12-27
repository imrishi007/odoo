"""
GearGuard CMMS - Database Seed Generator
Generates 5000+ realistic records for demo/testing

Requirements:
    pip install faker psycopg2-binary python-dotenv
"""

import random
from datetime import datetime, timedelta
from faker import Faker
import psycopg2
from psycopg2.extras import execute_batch
import uuid

fake = Faker()

# Database connection
DB_CONFIG = {
    'dbname': 'gearguard_cmms',
    'user': 'postgres',  # Change this
    'password': '2005',  # Change this
    'host': 'localhost',
    'port': 5432
}

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def generate_users(conn, count=100):
    """Generate users across different roles"""
    print(f"Generating {count} users...")
    cursor = conn.cursor()
    
    # Get role IDs
    cursor.execute("SELECT id, name FROM roles")
    roles = {name: id for id, name in cursor.fetchall()}
    
    departments = ['IT', 'Production', 'Facilities', 'Admin', 'Sales', 'Engineering', 'HR', 'Finance']
    
    users = []
    for i in range(count):
        role_name = random.choice(['Administrator', 'Team_Leader', 'Technician', 'Employee', 'Viewer'])
        users.append((
            str(uuid.uuid4()),
            fake.unique.email(),
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LkBRm.Rq4Kuu',  # hashed "password123"
            fake.name(),
            fake.phone_number()[:20],
            None,  # avatar_url
            roles[role_name],
            random.choice(departments),
            True,
            fake.date_time_between(start_date='-30d', end_date='now'),
            datetime.now(),
            datetime.now()
        ))
    
    execute_batch(cursor, """
        INSERT INTO users (id, email, password_hash, full_name, phone, avatar_url, 
                          role_id, department, is_active, last_login, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, users)
    
    conn.commit()
    cursor.close()
    print(f"✓ Created {count} users")
    return users

def generate_teams(conn, users, count=15):
    """Generate maintenance teams"""
    print(f"Generating {count} teams...")
    cursor = conn.cursor()
    
    team_names = [
        'Internal Maintenance', 'IT Support', 'Facilities Management', 
        'Electrical Team', 'HVAC Specialists', 'Production Maintenance',
        'Metrology', 'Mechanical Team', 'Plumbing', 'Carpentry',
        'Safety & Compliance', 'Equipment Calibration', 'Building Services',
        'Emergency Response', 'Preventive Maintenance'
    ]
    
    specializations = [
        'Electrical', 'Mechanical', 'HVAC', 'IT Infrastructure', 
        'General Maintenance', 'Specialized Equipment', 'Safety Systems'
    ]
    
    teams = []
    for name in team_names[:count]:
        lead_user = random.choice(users)
        teams.append((
            name,
            f"Responsible for {name.lower()} across the facility",
            lead_user[0],  # user_id
            random.choice(specializations),
            True,
            datetime.now(),
            datetime.now()
        ))
    
    team_ids = []
    for team in teams:
        cursor.execute("""
            INSERT INTO teams (name, description, team_lead_id, specialization, is_active, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, team)
        team_ids.append(cursor.fetchone()[0])
    
    conn.commit()
    
    # Assign team members
    print("Assigning team members...")
    members = []
    for team_id in team_ids:
        member_count = random.randint(3, 8)
        team_users = random.sample(users, member_count)
        for user in team_users:
            members.append((
                team_id,
                user[0],  # user_id
                fake.date_time_between(start_date='-365d', end_date='now'),
                True
            ))
    
    execute_batch(cursor, """
        INSERT INTO team_members (team_id, user_id, joined_at, is_active)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (team_id, user_id) DO NOTHING
    """, members)
    
    conn.commit()
    cursor.close()
    print(f"✓ Created {count} teams with {len(members)} memberships")
    return team_ids

def generate_equipment_categories(conn, team_ids, count=25):
    """Generate equipment categories"""
    print(f"Generating {count} equipment categories...")
    cursor = conn.cursor()
    
    categories = [
        ('Computers', 'Desktop and laptop computers', None),
        ('Laptops', 'Portable computers', 1),
        ('Desktops', 'Stationary computers', 1),
        ('Servers', 'Server infrastructure', 1),
        ('Monitors', 'Display devices', None),
        ('Printers', 'Printing devices', None),
        ('Laser Printers', 'High-speed laser printers', 6),
        ('Inkjet Printers', 'Color inkjet printers', 6),
        ('Scanners', 'Document scanning devices', None),
        ('Machinery', 'Industrial machinery', None),
        ('CNC Machines', 'Computer Numerical Control machines', 10),
        ('Drill Presses', 'Drilling equipment', 10),
        ('Lathes', 'Turning machines', 10),
        ('Milling Machines', 'Milling equipment', 10),
        ('HVAC', 'Heating, Ventilation, and Air Conditioning', None),
        ('Air Conditioners', 'Cooling systems', 15),
        ('Heaters', 'Heating systems', 15),
        ('Ventilation Units', 'Air circulation systems', 15),
        ('Office Equipment', 'General office equipment', None),
        ('Furniture', 'Office furniture and fixtures', None),
        ('Lighting', 'Lighting fixtures and systems', None),
        ('Security Systems', 'Access control and surveillance', None),
        ('Fire Safety', 'Fire suppression and detection', None),
        ('Power Systems', 'UPS and power distribution', None),
        ('Network Equipment', 'Routers, switches, and network gear', None)
    ]
    
    colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
    
    # Insert categories and map parent references correctly
    category_ids = []
    id_map = {}  # Maps the original parent index to actual database ID
    
    for idx, (name, desc, parent_idx) in enumerate(categories[:count]):
        # Convert parent index to actual database ID
        parent_id = id_map.get(parent_idx) if parent_idx else None
        
        cursor.execute("""
            INSERT INTO equipment_categories (name, description, parent_id, responsible_team_id, 
                                             color_code, icon, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (name, desc, parent_id, random.choice(team_ids), random.choice(colors), None, datetime.now()))
        
        new_id = cursor.fetchone()[0]
        category_ids.append(new_id)
        id_map[idx + 1] = new_id  # Store mapping (1-indexed to match parent references)
    
    conn.commit()
    cursor.close()
    print(f"✓ Created {count} equipment categories")
    return category_ids

def generate_equipment(conn, category_ids, team_ids, users, count=2000):
    """Generate equipment records"""
    print(f"Generating {count} equipment items...")
    cursor = conn.cursor()
    
    manufacturers = ['HP', 'Dell', 'Lenovo', 'Samsung', 'Brother', 'Canon', 'Epson', 
                    'Cisco', 'Haas', 'Fanuc', 'Carrier', 'Trane', 'Honeywell']
    
    locations = ['Building A', 'Building B', 'Warehouse', 'Production Floor', 
                'Office Level 1', 'Office Level 2', 'Server Room', 'Lab']
    
    statuses = ['operational', 'operational', 'operational', 'operational', 'maintenance', 'down']
    
    equipment = []
    for i in range(count):
        category_id = random.choice(category_ids)
        user = random.choice(users)
        team_id = random.choice(team_ids)
        technician = random.choice(users)
        
        purchase_date = fake.date_between(start_date='-10y', end_date='today')
        warranty_months = random.choice([12, 24, 36, 60])
        warranty_expiry = purchase_date + timedelta(days=warranty_months * 30)
        
        health = random.choices([100, 90, 80, 70, 60, 50, 40, 30, 20], 
                               weights=[30, 20, 15, 10, 10, 5, 5, 3, 2])[0]
        
        equipment.append((
            f"{fake.word().capitalize()} {random.choice(['Pro', 'Plus', 'Elite', 'Max', 'Ultra', ''])} {random.randint(100, 9999)}",
            f"{random.choice(['MT', 'SN', 'EQ'])}/{random.randint(100, 999)}/{random.randint(10000000, 99999999)}",
            category_id,
            user[0],  # assigned_to_user_id
            user[7],  # department
            random.choice(locations),
            random.choice(manufacturers),
            f"Model-{random.randint(1000, 9999)}",
            purchase_date,
            round(random.uniform(500, 50000), 2),
            warranty_expiry if warranty_expiry > datetime.now().date() else None,
            team_id,
            technician[0],
            health,
            random.choice(statuses),
            f"QR-{uuid.uuid4().hex[:12].upper()}",
            fake.sentence() if random.random() > 0.7 else None,
            health < 50,
            None,
            datetime.now(),
            datetime.now()
        ))
    
    execute_batch(cursor, """
        INSERT INTO equipment (name, serial_number, category_id, assigned_to_user_id, 
                              assigned_to_department, location, manufacturer, model, 
                              purchase_date, purchase_cost, warranty_expiry, maintenance_team_id,
                              default_technician_id, health_status, status, qr_code, notes,
                              is_critical, deleted_at, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, equipment, page_size=500)
    
    conn.commit()
    cursor.close()
    print(f"✓ Created {count} equipment items")

def generate_maintenance_requests(conn, users, count=3000):
    """Generate maintenance requests"""
    print(f"Generating {count} maintenance requests...")
    cursor = conn.cursor()
    
    # Get equipment IDs
    cursor.execute("SELECT id, category_id, maintenance_team_id, default_technician_id FROM equipment WHERE deleted_at IS NULL LIMIT 2000")
    equipment_list = cursor.fetchall()
    
    if not equipment_list:
        print("⚠ No equipment found, skipping maintenance requests")
        return
    
    subjects = [
        "Equipment malfunction", "Routine maintenance", "Performance degradation",
        "Strange noise detected", "Overheating issue", "Calibration required",
        "Software update needed", "Parts replacement", "Annual inspection",
        "Preventive checkup", "Oil leak detected", "Belt replacement",
        "Filter change required", "Safety inspection", "Cleaning required"
    ]
    
    stages = ['new', 'in_progress', 'repaired', 'repaired', 'repaired']
    
    requests = []
    for i in range(count):
        equipment = random.choice(equipment_list)
        creator = random.choice(users)
        
        maintenance_type = random.choice(['corrective', 'preventive'])
        priority = random.randint(0, 3)
        stage = random.choice(stages)
        
        requested_date = fake.date_time_between(start_date='-180d', end_date='now')
        scheduled_date = requested_date + timedelta(days=random.randint(1, 14)) if random.random() > 0.3 else None
        
        started_at = None
        completed_at = None
        actual_duration = None
        
        if stage in ['in_progress', 'repaired']:
            started_at = scheduled_date or requested_date + timedelta(days=random.randint(0, 3))
        
        if stage == 'repaired':
            actual_duration = round(random.uniform(0.5, 8), 2)
            completed_at = started_at + timedelta(hours=actual_duration)
        
        requests.append((
            f"REQ-{datetime.now().year}-{str(i+1).zfill(5)}",
            random.choice(subjects),
            fake.sentence() if random.random() > 0.5 else None,
            equipment[0],  # equipment_id
            equipment[1],  # category_id (will be auto-filled by trigger)
            maintenance_type,
            priority,
            stage,
            equipment[2],  # team_id (will be auto-filled)
            equipment[3],  # technician_id (will be auto-filled)
            creator[0],  # created_by
            requested_date,
            scheduled_date,
            started_at,
            completed_at,
            round(random.uniform(1, 8), 2) if random.random() > 0.5 else None,
            actual_duration,
            round(random.uniform(100, 5000), 2) if random.random() > 0.5 else None,
            round(random.uniform(100, 5000), 2) if stage == 'repaired' else None,
            fake.paragraph() if random.random() > 0.6 else None,
            fake.paragraph() if stage == 'repaired' else None,
            'My Company (San Francisco)',
            None,
            datetime.now(),
            datetime.now()
        ))
    
    execute_batch(cursor, """
        INSERT INTO maintenance_requests (request_number, subject, description, equipment_id,
                                         category_id, maintenance_type, priority, stage,
                                         assigned_team_id, assigned_technician_id, created_by_user_id,
                                         requested_date, scheduled_date, started_at, completed_at,
                                         estimated_duration_hours, actual_duration_hours,
                                         cost_estimate, actual_cost, notes, resolution_notes,
                                         company, deleted_at, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, requests, page_size=500)
    
    conn.commit()
    cursor.close()
    print(f"✓ Created {count} maintenance requests")

def generate_scheduled_maintenance(conn, team_ids, users, count=200):
    """Generate scheduled preventive maintenance"""
    print(f"Generating {count} scheduled maintenance records...")
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM equipment WHERE deleted_at IS NULL AND status = 'operational' LIMIT 200")
    equipment_ids = [row[0] for row in cursor.fetchall()]
    
    if not equipment_ids:
        print("⚠ No operational equipment found")
        return
    
    frequencies = ['weekly', 'monthly', 'quarterly', 'yearly']
    
    schedules = []
    for equipment_id in equipment_ids[:count]:
        frequency = random.choice(frequencies)
        start_date = fake.date_between(start_date='-365d', end_date='today')
        
        # Calculate next scheduled based on frequency
        if frequency == 'weekly':
            next_scheduled = start_date + timedelta(weeks=random.randint(1, 4))
        elif frequency == 'monthly':
            next_scheduled = start_date + timedelta(days=30)
        elif frequency == 'quarterly':
            next_scheduled = start_date + timedelta(days=90)
        else:  # yearly
            next_scheduled = start_date + timedelta(days=365)
        
        schedules.append((
            equipment_id,
            f"Scheduled {frequency} maintenance",
            fake.sentence(),
            frequency,
            1,
            start_date,
            None,
            start_date if random.random() > 0.5 else None,
            next_scheduled,
            random.choice(team_ids),
            round(random.uniform(1, 4), 2),
            True,
            random.choice(users)[0],
            datetime.now(),
            datetime.now()
        ))
    
    execute_batch(cursor, """
        INSERT INTO scheduled_maintenance (equipment_id, title, description, frequency,
                                          frequency_value, start_date, end_date, last_performed,
                                          next_scheduled, assigned_team_id, estimated_duration_hours,
                                          is_active, created_by, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, schedules)
    
    conn.commit()
    cursor.close()
    print(f"✓ Created {count} scheduled maintenance records")

def main():
    print("=" * 60)
    print("GearGuard CMMS - Database Seed Generator")
    print("=" * 60)
    print()
    
    try:
        conn = get_connection()
        print("✓ Connected to database\n")
        
        # Generate data
        users = generate_users(conn, count=100)
        team_ids = generate_teams(conn, users, count=15)
        category_ids = generate_equipment_categories(conn, team_ids, count=25)
        generate_equipment(conn, category_ids, team_ids, users, count=2000)
        generate_maintenance_requests(conn, users, count=3000)
        generate_scheduled_maintenance(conn, team_ids, users, count=200)
        
        # Summary
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM equipment")
        equipment_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM maintenance_requests")
        request_count = cursor.fetchone()[0]
        
        print("\n" + "=" * 60)
        print("DATABASE SEEDING COMPLETE!")
        print("=" * 60)
        print(f"Total Users: {user_count}")
        print(f"Total Equipment: {equipment_count}")
        print(f"Total Maintenance Requests: {request_count}")
        print(f"Total Records: ~{user_count + equipment_count + request_count + 300}")
        print("=" * 60)
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
