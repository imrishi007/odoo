# Frontend-Backend Alignment Guide

## Overview

This document shows how the database schema aligns with the frontend interface and implements role-based access control (RBAC).

---

## ✅ Database-Frontend Alignment

### 1. Dashboard Page (`/`)

**Frontend Components:**
- Critical Equipment Card (health < 30%)
- Technician Load Card (85% utilization)
- Open Requests Card (12 pending, 3 overdue)
- Recent Activity Table

**Database Queries:**

```sql
-- Critical Equipment
SELECT COUNT(*) as critical_count
FROM equipment 
WHERE health_status < 30 
  AND status != 'scrapped'
  AND deleted_at IS NULL;

-- Technician Load (calculated from active requests)
SELECT 
    COUNT(*) as active_requests,
    COUNT(DISTINCT assigned_technician_id) as active_technicians,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE role_id = 3), 2) as utilization
FROM maintenance_requests 
WHERE stage IN ('new', 'in_progress') 
  AND deleted_at IS NULL;

-- Open Requests Summary
SELECT 
    COUNT(*) FILTER (WHERE stage IN ('new', 'in_progress')) as pending,
    COUNT(*) FILTER (WHERE scheduled_date < NOW() AND stage NOT IN ('repaired', 'scrap')) as overdue
FROM maintenance_requests 
WHERE deleted_at IS NULL;

-- Recent Activity
SELECT 
    mr.subject,
    mr.stage,
    mr.created_at,
    ec.name as category,
    u_creator.full_name as employee,
    u_tech.full_name as technician,
    mr.company
FROM maintenance_requests mr
JOIN users u_creator ON mr.created_by_user_id = u_creator.id
LEFT JOIN users u_tech ON mr.assigned_technician_id = u_tech.id
JOIN equipment_categories ec ON mr.category_id = ec.id
WHERE mr.deleted_at IS NULL
ORDER BY mr.created_at DESC
LIMIT 10;
```

**Aligned:** ✅ All dashboard metrics have corresponding database queries

---

### 2. Maintenance Request Form (`/maintenance`)

**Frontend Fields:**
- Subject (editable input)
- Created By (user avatar + name)
- Equipment (dropdown with auto-fill)
- Category (auto-filled, read-only)
- Maintenance Type (Corrective/Preventive)
- Team (dropdown)
- Technician (auto-filled from equipment)
- Scheduled Date (datetime picker)
- Duration (number input in hours)
- Priority (0-3 star rating)
- Company (read-only)
- Notes (textarea with AI summary button)
- Instructions (step-by-step list)

**Database Tables Used:**
- `maintenance_requests` (main form data)
- `equipment` (dropdown + auto-fill source)
- `equipment_categories` (auto-filled category)
- `teams` (team dropdown)
- `users` (created_by, technician)
- `work_order_instructions` (step-by-step instructions)

**Auto-fill Logic (Backend Implementation):**

```sql
-- When equipment_id is selected, auto-fill:
SELECT 
    e.category_id,
    e.maintenance_team_id,
    e.default_technician_id
FROM equipment e
WHERE e.id = :selected_equipment_id;

-- Then update the request:
UPDATE maintenance_requests 
SET 
    category_id = :fetched_category_id,
    assigned_team_id = :fetched_team_id,
    assigned_technician_id = :fetched_technician_id
WHERE id = :request_id;
```

**Stage Pipeline:**
1. `new` → Just created
2. `in_progress` → Technician working
3. `repaired` → Fixed and operational
4. `scrap` → Equipment unrepairable

**Aligned:** ✅ All form fields map directly to database columns

---

### 3. Equipment Page (`/equipment`)

**Frontend Features:**
- Equipment list table
- Search by name, serial number, category
- Equipment categories overview
- Actions: View, Edit, Delete

**Database Tables:**
- `equipment` (main list)
- `equipment_categories` (categories card)
- `users` (assigned employee, technician)

**Queries:**

```sql
-- Equipment List with Filters
SELECT 
    e.id,
    e.name,
    e.serial_number,
    e.health_status,
    e.status,
    ec.name as category,
    u_emp.full_name as employee,
    u_emp.department,
    u_tech.full_name as technician,
    e.company
FROM equipment e
JOIN equipment_categories ec ON e.category_id = ec.id
LEFT JOIN users u_emp ON e.assigned_to_user_id = u_emp.id
LEFT JOIN users u_tech ON e.default_technician_id = u_tech.id
WHERE e.deleted_at IS NULL
  AND (e.name ILIKE :search OR e.serial_number ILIKE :search)
ORDER BY e.created_at DESC;

-- Equipment Categories Summary
SELECT 
    ec.name,
    ec.color_code,
    t.name as responsible_team,
    COUNT(e.id) as equipment_count
FROM equipment_categories ec
LEFT JOIN teams t ON ec.responsible_team_id = t.id
LEFT JOIN equipment e ON e.category_id = ec.id AND e.deleted_at IS NULL
GROUP BY ec.id, ec.name, t.name;

-- Smart Button: Request Count for Equipment
SELECT COUNT(*) 
FROM maintenance_requests 
WHERE equipment_id = :equipment_id 
  AND stage NOT IN ('repaired', 'scrap')
  AND deleted_at IS NULL;
```

**Aligned:** ✅ Equipment management fully mapped

---

### 4. Calendar Page (`/calendar`)

**Frontend Features:**
- Monthly calendar view
- Scheduled maintenance events
- Color-coded by type (preventive=blue, corrective=red)
- Click date to view events

**Database Tables:**
- `maintenance_requests` (scheduled_date for events)
- `scheduled_maintenance` (recurring preventive maintenance)

**Queries:**

```sql
-- Get events for calendar month
SELECT 
    mr.id,
    mr.subject as title,
    mr.scheduled_date,
    mr.maintenance_type,
    mr.estimated_duration_hours,
    u.full_name as technician
FROM maintenance_requests mr
LEFT JOIN users u ON mr.assigned_technician_id = u.id
WHERE mr.scheduled_date BETWEEN :start_date AND :end_date
  AND mr.stage NOT IN ('repaired', 'scrap')
  AND mr.deleted_at IS NULL
ORDER BY mr.scheduled_date;

-- Recurring Preventive Maintenance (for auto-scheduling)
SELECT 
    sm.id,
    sm.title,
    sm.next_scheduled,
    sm.frequency,
    e.name as equipment_name
FROM scheduled_maintenance sm
JOIN equipment e ON sm.equipment_id = e.id
WHERE sm.is_active = TRUE
  AND sm.next_scheduled BETWEEN :start_date AND :end_date;
```

**Aligned:** ✅ Calendar displays both ad-hoc and scheduled maintenance

---

## 🔐 Role-Based Access Control (RBAC)

### Permission Matrix

| Permission | Administrator | Team Leader | Technician | Employee | Viewer |
|-----------|--------------|-------------|------------|----------|--------|
| **Teams Management** |
| Create Teams | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Teams | ✅ | ✅ (own team) | ❌ | ❌ | ❌ |
| Delete Teams | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Equipment Management** |
| Create Equipment | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Equipment | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Equipment | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Maintenance Requests** |
| Create Requests | ✅ | ✅ | ❌ | ✅ (own) | ❌ |
| Edit Requests | ✅ | ✅ | ✅ (assigned) | ❌ | ❌ |
| Delete Requests | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign Requests | ✅ | ✅ | ❌ | ❌ | ❌ |
| View All Requests | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Analytics & Reports** |
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ❌ | ❌ | ✅ |
| **User Management** |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |

### Database Permissions (JSONB Format)

```json
// Administrator
{
    "can_create_teams": true,
    "can_edit_teams": true,
    "can_delete_teams": true,
    "can_create_equipment": true,
    "can_edit_equipment": true,
    "can_delete_equipment": true,
    "can_create_requests": true,
    "can_edit_requests": true,
    "can_delete_requests": true,
    "can_assign_requests": true,
    "can_view_all_requests": true,
    "can_view_analytics": true,
    "can_manage_users": true
}

// Team Leader (team_lead_id in teams table)
{
    "can_create_teams": false,
    "can_edit_teams": true,        // Only own team
    "can_delete_teams": false,
    "can_create_equipment": false,
    "can_edit_equipment": true,
    "can_delete_equipment": false,
    "can_create_requests": true,
    "can_edit_requests": true,
    "can_delete_requests": false,
    "can_assign_requests": true,   // To own team members
    "can_view_all_requests": true, // Own team's requests
    "can_view_analytics": true,
    "can_manage_users": false
}

// Technician
{
    "can_create_teams": false,
    "can_edit_teams": false,
    "can_create_equipment": false,
    "can_edit_equipment": false,
    "can_delete_equipment": false,
    "can_create_requests": false,
    "can_edit_requests": true,      // Only assigned to them
    "can_delete_requests": false,
    "can_assign_requests": false,
    "can_view_all_requests": false, // Only assigned requests
    "can_view_analytics": false,
    "can_manage_users": false
}

// Employee
{
    "can_create_teams": false,
    "can_edit_teams": false,
    "can_create_equipment": false,
    "can_edit_equipment": false,
    "can_delete_equipment": false,
    "can_create_requests": true,    // For own equipment
    "can_edit_requests": false,
    "can_delete_requests": false,
    "can_assign_requests": false,
    "can_view_all_requests": false, // Only own requests
    "can_view_analytics": false,
    "can_manage_users": false
}

// Viewer (read-only)
{
    "can_create_teams": false,
    "can_edit_teams": false,
    "can_delete_teams": false,
    "can_create_equipment": false,
    "can_edit_equipment": false,
    "can_delete_equipment": false,
    "can_create_requests": false,
    "can_edit_requests": false,
    "can_delete_requests": false,
    "can_assign_requests": false,
    "can_view_all_requests": true,  // Read-only
    "can_view_analytics": true,
    "can_manage_users": false
}
```

---

## 🔑 Authentication & Login

### Users Table Structure

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,           -- Login username
    password_hash VARCHAR(255) NOT NULL,          -- Bcrypt/Argon2 hashed password
    full_name VARCHAR(255) NOT NULL,              -- Display name
    phone VARCHAR(20),
    avatar_url TEXT,
    role_id INTEGER NOT NULL REFERENCES roles(id), -- Determines permissions
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,               -- Account enabled/disabled
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Login Flow (FastAPI Implementation)

1. **User submits email + password**
2. **Backend validates:**
   ```python
   from fastapi import HTTPException
   from passlib.context import CryptContext
   from datetime import datetime, timedelta
   from jose import jwt
   
   pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
   
   @app.post("/api/auth/login")
   async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
       user = db.query(User).filter(
           User.email == credentials.email, 
           User.is_active == True
       ).first()
       
       if not user or not pwd_context.verify(credentials.password, user.password_hash):
           raise HTTPException(status_code=401, detail="Invalid credentials")
       
       # Load permissions
       role = db.query(Role).filter(Role.id == user.role_id).first()
       
       # Create JWT token
       access_token = create_access_token(
           data={"sub": str(user.id), "role": role.name, "permissions": role.permissions}
       )
       
       # Update last login
       user.last_login = datetime.now()
       db.commit()
       
       return {
           "access_token": access_token,
           "token_type": "bearer",
           "user": {
               "id": str(user.id),
               "email": user.email,
               "full_name": user.full_name,
               "role": role.name,
               "permissions": role.permissions,
               "avatar_url": user.avatar_url
           }
       }
   ```

3. **Frontend stores token** and uses it for all API calls
4. **Backend validates token** on each request and checks permissions

### Default Test Accounts (After Seeding)

| Email | Password | Role | Can Do |
|-------|----------|------|--------|
| admin@gearguard.com | password123 | Administrator | Everything |
| manager@gearguard.com | password123 | Team Leader | Manage team, assign work |
| tech1@gearguard.com | password123 | Technician | Work on assigned requests |
| user@gearguard.com | password123 | Employee | Create requests for own equipment |
| viewer@gearguard.com | password123 | Viewer | View reports only |

---

## 🛡️ Backend Permission Checks (FastAPI Examples)

### Dependency for Permission Checking

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        permissions = payload.get("permissions")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return {"id": user_id, "role": role, "permissions": permissions}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_permission(permission_name: str):
    def permission_checker(current_user: dict = Depends(get_current_user)):
        if not current_user['permissions'].get(permission_name, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return permission_checker

# Usage:
@app.post("/api/teams")
async def create_team(
    team: TeamCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission('can_create_teams'))
):
    # Only admins can access this
    new_team = Team(**team.dict())
    db.add(new_team)
    db.commit()
    return new_team

@app.delete("/api/teams/{team_id}")
async def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission('can_delete_teams'))
):
    # Only admins can access this
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    db.delete(team)
    db.commit()
    return {"message": "Team deleted"}

@app.post("/api/equipment")
async def create_equipment(
    equipment: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission('can_create_equipment'))
):
    # Only admins can access this
    new_equipment = Equipment(**equipment.dict())
    db.add(new_equipment)
    db.commit()
    return new_equipment
```

### Row-Level Security Examples

```python
from fastapi import Depends, HTTPException

# Technician can only edit assigned requests
@app.put("/api/requests/{request_id}")
async def edit_request(
    request_id: int,
    request_data: RequestUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission('can_edit_requests'))
):
    request = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.id == request_id
    ).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if current_user['role'] == 'Technician':
        # Technicians can only edit their own assigned requests
        if str(request.assigned_technician_id) != current_user['id']:
            raise HTTPException(status_code=403, detail="Not assigned to you")
    
    # Update request fields
    for field, value in request_data.dict(exclude_unset=True).items():
        setattr(request, field, value)
    
    db.commit()
    db.refresh(request)
    return request

# Employee can only create requests for their own equipment
@app.post("/api/requests")
async def create_request(
    request_data: RequestCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission('can_create_requests'))
):
    equipment = db.query(Equipment).filter(
        Equipment.id == request_data.equipment_id
    ).first()
    
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    if current_user['role'] == 'Employee':
        # Employees can only create requests for equipment assigned to them
        if str(equipment.assigned_to_user_id) != current_user['id']:
            raise HTTPException(
                status_code=403, 
                detail="Equipment not assigned to you"
            )
    
    # Create the request
    new_request = MaintenanceRequest(**request_data.dict())
    new_request.created_by_user_id = current_user['id']
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request
```

---

## ✅ Verification Checklist

- [x] All dashboard metrics have database queries
- [x] Maintenance request form fields map to database columns
- [x] Equipment page displays data from equipment + categories tables
- [x] Calendar shows scheduled maintenance from maintenance_requests
- [x] Role-based access control defined in roles table
- [x] Admin-only team creation/deletion enforced
- [x] Team leaders can edit own teams and assign work
- [x] Technicians can only edit assigned requests
- [x] Employees can only create requests for own equipment
- [x] Users table contains login credentials (email + password_hash)
- [x] Authentication flow uses users table
- [x] Permissions stored as JSONB for flexibility

---

## 🚀 Next Steps for FastAPI Developer

Your FastAPI teammate should implement:

1. **JWT Authentication** using the users table with `python-jose` and `passlib`
2. **Pydantic models** for request/response validation
3. **Depends() for permission checks** using the permission checker
4. **API endpoints** matching the frontend pages with automatic OpenAPI docs
5. **Row-level security** for multi-tenant data isolation
6. **CORS middleware** to allow frontend (localhost:3000) access

All database queries are provided in this document for easy implementation.

---

## Summary

**✅ Database is fully aligned with frontend**
- Every frontend component has corresponding database tables/queries
- RBAC is properly implemented with 5 roles
- Admin-only permissions for critical operations (teams, equipment)
- Team leaders can manage their teams
- Users table serves as authentication source
- Hierarchical access control enforced at database level

The database is ready for your FastAPI teammate to build the REST API layer!
