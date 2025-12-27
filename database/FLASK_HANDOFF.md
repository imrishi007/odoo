# FastAPI Developer Handoff Guide - GearGuard CMMS

## Welcome, FastAPI Developer! 👋

Your teammate has created a **fully populated PostgreSQL database** with **5,400+ records**. This guide shows you how to retrieve the database, restore it, and start building the FastAPI backend.

---

## 📦 What You're Getting

### Database Export File
- **File**: `gearguard_cmms.backup` (shared via Google Drive/Dropbox)
- **Size**: ~5-10 MB
- **Format**: PostgreSQL Custom Format (binary)
- **Contains**: Complete schema + 5,400+ realistic records

### Database Contents
✅ **100 users** across 5 roles:
   - Administrator (full access)
   - Team_Leader (manage teams, assign work)
   - Technician (work on requests)
   - Employee (create requests)
   - Viewer (read-only)

✅ **15 teams** with 78 member assignments
✅ **25 equipment categories** (hierarchical structure)
✅ **2,000 equipment items** (various statuses and health metrics)
✅ **3,000 maintenance requests** (across all workflow stages)
✅ **200 scheduled maintenance** records

### Test Credentials
- **All user passwords**: `password123` (bcrypt hashed: `$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LkBRm.Rq4Kuu`)
- **Find admin users**: Query `users` table where `role_id = 1`
- **Database name**: `gearguard_cmms`

---

## 🔧 Step 1: Retrieve & Import the Database

### Download the Backup File
1. Get the shared link from your teammate
2. Download `gearguard_cmms.backup` to your computer

### Import Using pgAdmin (Windows/Mac/Linux)
1. **Install PostgreSQL + pgAdmin** (if not already installed)
2. Open **pgAdmin 4**
3. **Create Database:**
   - Right-click "Databases" → "Create" → "Database..."
   - Name: `gearguard_cmms`
   - Click "Save"
4. **Restore Data:**
   - Right-click `gearguard_cmms` → "Restore..."
   - **Filename:** Browse and select `gearguard_cmms.backup`
   - **Format:** Custom or tar
   - Click "Restore"
   - Wait for completion ✅

### Import Using Command Line

**Linux/Mac:**
```bash
# Create database
createdb gearguard_cmms

# Restore from backup
pg_restore -U postgres -d gearguard_cmms -v gearguard_cmms.backup
```

**Windows (PowerShell):**
```powershell
# Navigate to PostgreSQL bin
cd "C:\Program Files\PostgreSQL\18\bin"

# Create database
.\createdb -U postgres gearguard_cmms

# Restore from backup
.\pg_restore -U postgres -d gearguard_cmms -v "C:\path\to\gearguard_cmms.backup"
```

### Verify Import
```sql
-- Run in pgAdmin Query Tool or psql
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'maintenance_requests', COUNT(*) FROM maintenance_requests
UNION ALL
SELECT 'teams', COUNT(*) FROM teams;

-- Should show: users(100), equipment(2000), maintenance_requests(3000), teams(15)
```


---

## 🚀 Step 2: Set Up FastAPI Project

### Recommended Project Structure

```
fastapi-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app instance
│   ├── config.py            # Configuration & environment
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── team.py
│   │   ├── equipment.py
│   │   ├── maintenance.py
│   │   └── schedule.py
│   ├── schemas/             # Pydantic schemas (request/response)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── auth.py
│   │   ├── equipment.py
│   │   ├── maintenance.py
│   │   └── dashboard.py
│   ├── routers/             # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py          # POST /auth/login, /auth/register
│   │   ├── users.py         # GET /users, /users/{id}
│   │   ├── equipment.py     # CRUD /equipment
│   │   ├── maintenance.py   # CRUD /maintenance-requests
│   │   ├── teams.py         # GET /teams, /teams/{id}/members
│   │   ├── dashboard.py     # GET /dashboard/stats
│   │   └── calendar.py      # GET /calendar/events
│   ├── dependencies.py      # Auth dependencies (get_current_user)
│   └── utils/
│       ├── __init__.py
│       ├── auth.py          # Password hashing, JWT tokens
│       └── helpers.py       # Helper functions
├── alembic/                 # Database migrations (optional)
├── tests/                   # Unit/integration tests
├── .env                     # Environment variables
├── requirements.txt
└── README.md
```

### Install Dependencies

Create `requirements.txt`:
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
pydantic==2.5.3
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
```

Install:
```bash
pip install -r requirements.txt
```

---

## 💾 Step 3: Database Connection

### Create `.env` file
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/gearguard_cmms
SECRET_KEY=your-secret-key-for-jwt-tokens-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### `app/database.py`
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### `app/config.py`
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 📋 Step 4: Your Tasks - What to Build

### 🔐 1. Authentication System
**Priority: HIGH**

#### Endpoints to Create:
```python
POST   /api/auth/login          # User login (email + password)
POST   /api/auth/register       # New user registration
POST   /api/auth/refresh        # Refresh JWT token
GET    /api/auth/me             # Get current user info
POST   /api/auth/logout         # Logout (optional, token blacklist)
```

#### Key Features:
- ✅ Verify password against bcrypt hash in database
- ✅ Generate JWT tokens with user ID and role
- ✅ Implement role-based access control (RBAC)
- ✅ Create `get_current_user` dependency for protected routes

**Sample Code:**
```python
# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.auth import LoginRequest, TokenResponse
from ..utils.auth import verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    # Query user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate token
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role_id})
    return {"access_token": access_token, "token_type": "bearer"}
```

---

### 📊 2. Dashboard API
**Priority: HIGH**

#### Endpoints:
```python
GET    /api/dashboard/stats          # Overall statistics
GET    /api/dashboard/recent         # Recent activities
GET    /api/dashboard/equipment      # Equipment health overview
GET    /api/dashboard/requests       # Request status breakdown
```

#### Data to Return:
```python
{
    "total_equipment": 2000,
    "active_requests": 450,
    "pending_requests": 180,
    "completed_today": 12,
    "critical_equipment": 15,
    "equipment_by_health": {
        "excellent": 800,
        "good": 700,
        "fair": 350,
        "poor": 100,
        "critical": 50
    },
    "requests_by_stage": {
        "draft": 50,
        "submitted": 100,
        "in_progress": 200,
        "completed": 2650
    }
}
```

---

### 🔧 3. Equipment Management API
**Priority: HIGH**

#### Endpoints:
```python
GET    /api/equipment                    # List all (with pagination, filters)
GET    /api/equipment/{id}               # Get single equipment
POST   /api/equipment                    # Create new equipment
PUT    /api/equipment/{id}               # Update equipment
DELETE /api/equipment/{id}               # Delete equipment
GET    /api/equipment/{id}/history       # Maintenance history
GET    /api/equipment/categories         # List categories
```

#### Query Parameters:
- `?page=1&limit=20` - Pagination
- `?status=active` - Filter by status
- `?health_status=critical` - Filter by health
- `?category_id=5` - Filter by category
- `?search=pump` - Search by name/serial

---

### 🛠️ 4. Maintenance Requests API
**Priority: HIGH**

#### Endpoints:
```python
GET    /api/requests                     # List all requests
GET    /api/requests/{id}                # Get request details
POST   /api/requests                     # Create new request
PUT    /api/requests/{id}                # Update request
DELETE /api/requests/{id}                # Delete request
PATCH  /api/requests/{id}/assign         # Assign to team
PATCH  /api/requests/{id}/status         # Update status/stage
GET    /api/requests/{id}/history        # Request history
POST   /api/requests/{id}/comments       # Add comment
```

#### Request Stages Workflow:
```
Draft → Submitted → Approved → In Progress → Completed → Closed
```

---

### 👥 5. Teams & Users API
**Priority: MEDIUM**

#### Endpoints:
```python
GET    /api/teams                        # List all teams
GET    /api/teams/{id}                   # Team details
GET    /api/teams/{id}/members           # Team members
POST   /api/teams                        # Create team (admin only)

GET    /api/users                        # List users
GET    /api/users/{id}                   # User profile
PUT    /api/users/{id}                   # Update user
GET    /api/users/{id}/requests          # User's requests
```

---

### 📅 6. Calendar & Scheduling API
**Priority: MEDIUM**

#### Endpoints:
```python
GET    /api/calendar/events              # All scheduled events
GET    /api/calendar/month/{year}/{month}  # Month view
POST   /api/scheduled-maintenance        # Create schedule
GET    /api/scheduled-maintenance/{id}   # Get schedule details
PUT    /api/scheduled-maintenance/{id}   # Update schedule
```

---

### 📈 7. Reporting & Analytics API
**Priority: LOW**

#### Endpoints:
```python
GET    /api/reports/equipment-downtime   # Downtime analysis
GET    /api/reports/technician-performance  # Performance metrics
GET    /api/reports/cost-analysis        # Maintenance costs
GET    /api/analytics/trends             # Historical trends
```

---

## 🔑 Step 5: Implement Role-Based Access Control

### Roles & Permissions

| Role | ID | Permissions |
|------|----|-----------|
| **Administrator** | 1 | Full access - manage everything |
| **Team_Leader** | 2 | Manage team, assign work, view analytics |
| **Technician** | 3 | Work on assigned requests, update status |
| **Employee** | 4 | Create requests for own equipment |
| **Viewer** | 5 | Read-only access |

### Implementation Example:
```python
# app/dependencies.py
from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from .config import settings

def require_role(allowed_roles: list):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role_id not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Usage in routes:
@router.delete("/api/equipment/{id}")
def delete_equipment(
    id: int,
    current_user: User = Depends(require_role([1]))  # Admin only
):
    # Delete logic
    pass
```

---

## 🧪 Step 6: Testing

### Sample Test Data
The database has realistic test data you can use:

**Find test users:**
```sql
SELECT id, email, full_name, role_id 
FROM users 
WHERE role_id = 1 
LIMIT 5;
```

**Test login:**
- Use any email from users table
- Password: `password123`

**Equipment to test:**
```sql
SELECT id, name, serial_number, status 
FROM equipment 
LIMIT 10;
```

---

## 📚 Database Schema Reference

### Key Tables

#### `users`
- `id` (UUID, PK)
- `email` (VARCHAR, unique)
- `password_hash` (VARCHAR) - bcrypt
- `full_name`, `phone`, `avatar_url`
- `role_id` (FK → roles)
- `department`, `is_active`

#### `equipment`
- `id` (SERIAL, PK)
- `name`, `serial_number`, `model`, `manufacturer`
- `category_id` (FK → equipment_categories)
- `status` (active, inactive, maintenance, retired)
- `health_status` (excellent, good, fair, poor, critical)
- `assigned_to_user_id`, `responsible_team_id`
- `purchase_date`, `warranty_expiry`, `last_maintenance_date`

#### `maintenance_requests`
- `id` (SERIAL, PK)
- `request_number` (VARCHAR, unique) - e.g., "REQ-2024-001234"
- `equipment_id` (FK → equipment)
- `subject`, `description`
- `stage` (draft, submitted, approved, in_progress, completed, closed, cancelled)
- `maintenance_type` (corrective, preventive, predictive, breakdown)
- `priority` (low, medium, high, urgent)
- `created_by_user_id`, `assigned_team_id`
- `scheduled_date`, `completed_date`

Full schema: `database/schema.sql`

---

## 🎯 Step 7: API Documentation

FastAPI auto-generates interactive docs:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

Ensure all endpoints have:
- Clear descriptions
- Request/response models (Pydantic schemas)
- Example values

---

## ⚡ Quick Start Commands

```bash
# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Check API
curl http://localhost:8000/api/dashboard/stats
```

---

## 🤝 Communication with Frontend Team

### API Base URL
Provide your teammate with:
```
http://your-ip-address:8000/api
```

### CORS Configuration
```python
# app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Response Format (Recommended)
```python
# Success
{
    "success": true,
    "data": { ... },
    "message": "Operation successful"
}

# Error
{
    "success": false,
    "error": "Error message",
    "detail": "Detailed error description"
}
```

---

## 📝 Checklist

- [ ] Database imported successfully
- [ ] FastAPI project structure created
- [ ] Database connection working
- [ ] Authentication endpoints implemented
- [ ] JWT token generation working
- [ ] Role-based access control implemented
- [ ] Dashboard API endpoints created
- [ ] Equipment CRUD endpoints working
- [ ] Maintenance requests CRUD working
- [ ] Teams & users endpoints done
- [ ] Calendar/scheduling endpoints created
- [ ] API documentation complete
- [ ] CORS configured for frontend
- [ ] Tested all endpoints with Postman/curl
- [ ] Shared API base URL with frontend team

---

## 🆘 Need Help?

### Common Issues

**Can't connect to database:**
```python
# Check connection string format
DATABASE_URL=postgresql://username:password@localhost:5432/gearguard_cmms
```

**Password verification fails:**
```python
# Use passlib with bcrypt
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
```

**JWT tokens:**
```python
# Install: python-jose[cryptography]
from jose import jwt
from datetime import datetime, timedelta

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
```

---

## 🚀 You're All Set!

You have everything you need:
✅ Fully populated database with 5,400+ records
✅ Clear API requirements and structure
✅ Test data ready to use
✅ Database schema reference

**Build the APIs and ship this CMMS! Good luck with the hackathon! 🏆**

Install:

```bash
pip install -r requirements.txt
```

---

## Step 3: Configure Flask App

### `.env` file

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/gearguard_cmms
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=jwt-secret-key-here
FLASK_ENV=development
FLASK_APP=run.py
```

### `app/config.py`

```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
```

---

## Step 4: Create SQLAlchemy Models

### `app/models.py` (starter template)

```python
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    avatar_url = db.Column(db.Text)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    department = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    role = db.relationship('Role', backref='users')
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role.name,
            'department': self.department,
            'is_active': self.is_active
        }

class Role(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    permissions = db.Column(db.JSON, nullable=False, default={})
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Equipment(db.Model):
    __tablename__ = 'equipment'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    serial_number = db.Column(db.String(100), unique=True, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('equipment_categories.id'))
    assigned_to_user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    assigned_to_department = db.Column(db.String(100))
    location = db.Column(db.String(255))
    manufacturer = db.Column(db.String(100))
    model = db.Column(db.String(100))
    health_status = db.Column(db.Integer, default=100)
    status = db.Column(db.String(20), nullable=False, default='operational')
    qr_code = db.Column(db.String(255), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = db.relationship('EquipmentCategory', backref='equipment')
    assigned_user = db.relationship('User', foreign_keys=[assigned_to_user_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'serial_number': self.serial_number,
            'category': self.category.name if self.category else None,
            'health_status': self.health_status,
            'status': self.status,
            'location': self.location
        }

class MaintenanceRequest(db.Model):
    __tablename__ = 'maintenance_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    request_number = db.Column(db.String(50), unique=True, nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'), nullable=False)
    maintenance_type = db.Column(db.String(20), nullable=False)
    priority = db.Column(db.Integer, default=1)
    stage = db.Column(db.String(20), nullable=False, default='new')
    scheduled_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    equipment = db.relationship('Equipment', backref='maintenance_requests')
    
    def to_dict(self):
        return {
            'id': self.id,
            'request_number': self.request_number,
            'subject': self.subject,
            'equipment': self.equipment.name,
            'maintenance_type': self.maintenance_type,
            'priority': self.priority,
            'stage': self.stage,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None
        }

# Add more models as needed (Team, EquipmentCategory, etc.)
```

---

## Step 5: Create Flask App Factory

### `app/__init__.py`

```python
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

from app.config import Config
from app.models import db

bcrypt = Bcrypt()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # Register blueprints
    from app.routes import auth, equipment, requests, dashboard
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(equipment.bp, url_prefix='/api/equipment')
    app.register_blueprint(requests.bp, url_prefix='/api/requests')
    app.register_blueprint(dashboard.bp, url_prefix='/api/dashboard')
    
    return app
```

---

## Step 6: Create API Endpoints

### Example: `app/routes/equipment.py`

```python
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.models import db, Equipment, MaintenanceRequest

bp = Blueprint('equipment', __name__)

@bp.route('/', methods=['GET'])
@jwt_required()
def get_equipment():
    """Get all equipment with optional filters"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    query = Equipment.query.filter_by(deleted_at=None)
    
    # Filters
    category_id = request.args.get('category_id')
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    # Pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'equipment': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_equipment_by_id(id):
    """Get single equipment item"""
    equipment = Equipment.query.filter_by(id=id, deleted_at=None).first_or_404()
    
    # Count open requests
    open_requests = MaintenanceRequest.query.filter(
        MaintenanceRequest.equipment_id == id,
        MaintenanceRequest.stage.notin_(['repaired', 'scrap']),
        MaintenanceRequest.deleted_at.is_(None)
    ).count()
    
    data = equipment.to_dict()
    data['open_requests_count'] = open_requests
    
    return jsonify(data)

@bp.route('/<int:id>/requests', methods=['GET'])
@jwt_required()
def get_equipment_requests(id):
    """Get all maintenance requests for an equipment (Smart Button)"""
    equipment = Equipment.query.get_or_404(id)
    
    requests = MaintenanceRequest.query.filter_by(
        equipment_id=id
    ).order_by(MaintenanceRequest.created_at.desc()).all()
    
    return jsonify({
        'equipment': equipment.to_dict(),
        'requests': [req.to_dict() for req in requests]
    })

# Add POST, PUT, DELETE endpoints...
```

### Example: `app/routes/dashboard.py`

```python
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models import db, Equipment, MaintenanceRequest
from sqlalchemy import func

bp = Blueprint('dashboard', __name__)

@bp.route('/metrics', methods=['GET'])
@jwt_required()
def get_dashboard_metrics():
    """Get dashboard summary metrics"""
    
    # Critical equipment (health < 30%)
    critical_equipment = Equipment.query.filter(
        Equipment.health_status < 30,
        Equipment.deleted_at.is_(None)
    ).count()
    
    # Open requests
    open_requests = MaintenanceRequest.query.filter(
        MaintenanceRequest.stage.notin_(['repaired', 'scrap']),
        MaintenanceRequest.deleted_at.is_(None)
    ).count()
    
    # Overdue requests
    from datetime import datetime
    overdue_requests = MaintenanceRequest.query.filter(
        MaintenanceRequest.scheduled_date < datetime.utcnow(),
        MaintenanceRequest.stage.notin_(['repaired', 'scrap']),
        MaintenanceRequest.deleted_at.is_(None)
    ).count()
    
    # Technician utilization (simplified)
    # In production, calculate based on actual workload
    technician_load = {
        'utilized': 85,
        'capacity': 100,
        'percentage': 85
    }
    
    return jsonify({
        'critical_equipment': {
            'count': critical_equipment,
            'threshold': 30
        },
        'open_requests': {
            'total': open_requests,
            'overdue': overdue_requests
        },
        'technician_load': technician_load
    })

@bp.route('/recent-activity', methods=['GET'])
@jwt_required()
def get_recent_activity():
    """Get recent maintenance requests"""
    limit = request.args.get('limit', 10, type=int)
    
    requests = MaintenanceRequest.query.order_by(
        MaintenanceRequest.created_at.desc()
    ).limit(limit).all()
    
    return jsonify([req.to_dict() for req in requests])
```

---

## Step 7: Run the Flask App

### `run.py`

```python
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### Start the server

```bash
python run.py
```

App will run at: `http://localhost:5000`

---

## Step 8: Test API Endpoints

### Using curl

```bash
# Login (you'll need to implement this first)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'

# Get equipment
curl http://localhost:5000/api/equipment

# Get dashboard metrics
curl http://localhost:5000/api/dashboard/metrics
```

### Using Postman/Insomnia

Import the endpoints and test with the populated data.

---

## API Endpoints to Implement

### Priority 1 (Core Features)
- `POST /api/auth/login` - User login
- `GET /api/dashboard/metrics` - Dashboard data
- `GET /api/equipment` - List equipment
- `GET /api/equipment/:id` - Equipment details
- `GET /api/equipment/:id/requests` - Smart button
- `GET /api/requests` - List maintenance requests
- `POST /api/requests` - Create request (with auto-fill)
- `PATCH /api/requests/:id/stage` - Update stage
- `GET /api/calendar` - Calendar events

### Priority 2 (Advanced)
- `POST /api/equipment` - Create equipment
- `PUT /api/requests/:id` - Update request
- `GET /api/requests/:id/history` - Audit trail
- `GET /api/teams` - List teams
- `POST /api/scheduled-maintenance` - Schedule preventive

---

## Database Schema Reference

All tables are already created. Key relationships:

- **Users** → assigned to Equipment
- **Equipment** → has many Maintenance Requests
- **Maintenance Requests** → tracks stage changes in Request History
- **Teams** → assigned to Equipment Categories and Requests

**Auto-fill trigger is active**: When you create a maintenance request with `equipment_id`, it automatically fills `category_id`, `assigned_team_id`, and `assigned_technician_id` from the equipment record.

---

## Frontend Integration

Your frontend teammate built a Next.js app expecting these endpoints. Configure CORS:

```python
# In app/__init__.py
CORS(app, origins=['http://localhost:3000'])
```

The frontend will make requests to `http://localhost:5000/api/*`

---

## Troubleshooting

### Can't connect to database

Check `.env` file and PostgreSQL service:
```bash
psql -U postgres -d gearguard_cmms -c "SELECT COUNT(*) FROM users;"
```

### Models not reflecting database

SQLAlchemy is reading existing tables. If you modify models, DON'T run migrations—the schema is already set.

### Authentication issues

All users have password `password123`. Find an admin user:
```sql
SELECT u.email, r.name 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE r.name = 'Administrator' 
LIMIT 1;
```

---

## Next Steps

1. Import the database
2. Set up Flask project structure
3. Create models matching existing schema
4. Implement authentication (JWT)
5. Build API endpoints (start with GET endpoints)
6. Test with Postman
7. Connect to Next.js frontend
8. Implement business logic (auto-fill, smart buttons, etc.)

---

## Contact Your Database Teammate

If you need:
- Database credentials
- More sample data
- Schema clarifications
- Dump file re-export

Good luck building the backend! 🚀
