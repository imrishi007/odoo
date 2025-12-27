# GearGuard CMMS Backend

FastAPI backend for the GearGuard Computerized Maintenance Management System.

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL password:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gearguard_cmms
```

### 3. Database Setup

Make sure you have:
- PostgreSQL installed and running
- Database `gearguard_cmms` created with seeded data (5400+ records)

The application will automatically create/update tables on startup.

### 4. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive Docs (Swagger): http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user info

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-requests` - Get recent maintenance requests

### Equipment
- `GET /api/equipment` - List all equipment (with filters)
- `GET /api/equipment/{id}` - Get equipment by ID
- `POST /api/equipment` - Create new equipment
- `PUT /api/equipment/{id}` - Update equipment
- `DELETE /api/equipment/{id}` - Delete equipment

### Maintenance Requests
- `GET /api/requests` - List all requests (with filters)
- `GET /api/requests/{id}` - Get request by ID
- `POST /api/requests` - Create new request
- `PUT /api/requests/{id}` - Update request
- `PATCH /api/requests/{id}/stage` - Update request stage
- `DELETE /api/requests/{id}` - Delete request
- `GET /api/requests/{id}/history` - Get request history

## Testing the API

### 1. Login

Use any email from the database. All users have password: `password123`

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

You'll get a token:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### 2. Use the Token

Include the token in subsequent requests:
```bash
curl -X GET http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer eyJhbGc..."
```

### 3. Or Use Swagger UI

Go to http://localhost:8000/docs
- Click "Authorize" button
- Enter your token
- Test all endpoints interactively

## Database Models

- **Users** - System users with roles
- **Roles** - User roles and permissions
- **Teams** - Maintenance teams
- **Equipment** - Assets and equipment
- **Equipment Categories** - Equipment classifications
- **Maintenance Requests** - Work orders and requests
- **Request History** - Audit trail for requests

## Default Test Data

The database has ~5400 records:
- 100 users across 5 roles
- 15 teams
- 25 equipment categories
- 2000 equipment items
- 3000 maintenance requests
- 200 scheduled maintenance tasks

All user passwords: `password123`

Find admin users:
```sql
SELECT email, full_name FROM users WHERE role_id = 1 LIMIT 5;
```

## Development

### Project Structure
```
app/
├── api/              # API endpoints
│   ├── auth.py
│   ├── dashboard.py
│   ├── equipment.py
│   └── requests.py
├── core/             # Core utilities
│   └── security.py   # Auth & JWT
├── models/           # Database models
│   ├── user.py
│   ├── role.py
│   ├── team.py
│   ├── equipment.py
│   └── maintenance_request.py
├── db/               # Database config
│   ├── base.py
│   └── session.py
└── main.py          # FastAPI app
```

### Adding New Endpoints

1. Create route in `app/api/`
2. Import in `app/main.py`
3. Use `get_current_user` dependency for protected routes

Example:
```python
from app.core.security import get_current_user, get_db

@router.get("/my-endpoint")
def my_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Your code here
    return {"message": "Success"}
```

## Troubleshooting

### Can't connect to database
- Check PostgreSQL is running
- Verify database name and password in `.env`
- Ensure `gearguard_cmms` database exists

### Authentication fails
- Check user exists in database
- Password is `password123` for all seeded users
- Token might be expired (30 min default)

### Import errors
- Run `pip install -r requirements.txt`
- Make sure you're in the correct directory
