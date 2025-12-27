# Flask Developer Handoff Guide

## Welcome, Flask Developer! 👋

Your teammate has created a **fully populated PostgreSQL database** with 5000+ records. This guide shows you how to import it and start building the Flask backend.

---

## What You're Getting

### Database Export File
- **File**: `gearguard_database.tar.gz` (or `gearguard_cmms_dump.backup`)
- **Size**: ~2-10 MB
- **Contains**: Complete schema + 5000+ sample records

### Database Contents
- 100 users (admins, managers, technicians, employees)
- 15 teams with member assignments
- 25 equipment categories
- 2,000 equipment items
- 3,000 maintenance requests
- 200 scheduled maintenance tasks

### Default Credentials
- **All users password**: `password123` (bcrypt hashed)
- **Admin users**: Check database after import (role_id = 1)

---

## Step 1: Import the Database

### Option A: Import from Backup File

```bash
# Extract the archive
tar -xzf gearguard_database.tar.gz

# Create database
createdb gearguard_cmms

# Restore from backup
pg_restore -U postgres -d gearguard_cmms -v gearguard_cmms_dump.backup

# Or if you have .sql file:
psql -U postgres -d gearguard_cmms -f gearguard_cmms_dump.sql
```

### Option B: Remote Connection

If your teammate gave you remote access:

```python
# In your Flask app config
SQLALCHEMY_DATABASE_URI = 'postgresql://gearguard_user:password@teammate_ip:5432/gearguard_cmms'
```

---

## Step 2: Set Up Flask Project

### Project Structure

```
flask-backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── models.py            # SQLAlchemy models
│   ├── config.py            # Configuration
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── equipment.py     # Equipment CRUD
│   │   ├── requests.py      # Maintenance requests
│   │   ├── dashboard.py     # Dashboard metrics
│   │   └── calendar.py      # Calendar/scheduling
│   └── utils/
│       ├── __init__.py
│       ├── decorators.py    # Auth decorators
│       └── helpers.py       # Helper functions
├── migrations/              # Alembic migrations (optional)
├── tests/                   # Unit tests
├── .env                     # Environment variables
├── requirements.txt
└── run.py                   # Application entry point
```

### Install Dependencies

Create `requirements.txt`:

```txt
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.5
Flask-CORS==4.0.0
Flask-JWT-Extended==4.6.0
Flask-Bcrypt==1.0.1
psycopg2-binary==2.9.9
python-dotenv==1.0.0
marshmallow==3.20.1
```

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
