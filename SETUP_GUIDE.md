# GearGuard CMMS - Complete Setup Guide

## Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL 15+
- Git

## Backend Setup (FastAPI)

### 1. Navigate to Backend Directory
```bash
cd gearguard-odoo-master/gearguard-backend
```

### 2. Create Virtual Environment (Optional but Recommended)
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gearguard_cmms

# JWT Configuration
SECRET_KEY=your-secret-key-change-this-in-production-09876543210
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000
```

**Important**: Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

### 5. Setup Database
The database should already be created with seed data. If not:
```bash
# Navigate to database directory
cd ../../database

# Run seed script
python seed_data.py
```

### 6. Start Backend Server
```bash
# From gearguard-backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# OR use the PowerShell script (Windows)
.\start_server.ps1
```

Backend will be available at: **http://localhost:8000**
API Documentation: **http://localhost:8000/docs**

## Frontend Setup (Next.js)

### 1. Navigate to Frontend Directory
```bash
cd gearguard-cmms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment (Optional)
Create a `.env.local` file if you need custom API URL:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 4. Start Development Server
```bash
npm run dev
```

Frontend will be available at: **http://localhost:3000**

## Test Credentials

### Admin User
- **Email**: admin@company.com
- **Password**: password123

### Other Test Users
All users in the database have the same password: **password123**

Example emails:
- manager1@company.com
- tech1@company.com
- tech2@company.com

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
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

## Database Schema

The database includes the following main tables:
- **users** - User accounts and authentication
- **roles** - User roles and permissions
- **teams** - Organization teams
- **team_members** - Team membership
- **equipment_categories** - Equipment classification
- **equipment** - Equipment/asset tracking
- **maintenance_requests** - Work orders
- **request_history** - Audit trail

See `DATABASE_SCHEMA.md` for complete schema details.

## Development Workflow

### Starting Both Servers

**Terminal 1 - Backend:**
```bash
cd gearguard-odoo-master/gearguard-backend
.\start_server.ps1
```

**Terminal 2 - Frontend:**
```bash
cd gearguard-cmms
npm run dev
```

### Making Changes

**Backend Changes:**
- Modify files in `gearguard-backend/app/`
- FastAPI will auto-reload on file changes
- Check console for errors

**Frontend Changes:**
- Modify files in `app/` or `components/`
- Next.js will auto-reload on file changes
- Check browser console for errors

## Troubleshooting

### Backend won't start
1. Check PostgreSQL is running
2. Verify database password in `.env`
3. Ensure all dependencies are installed: `pip install -r requirements.txt`
4. Check port 8000 is not in use

### Frontend won't start
1. Delete `node_modules` and `.next` folders
2. Run `npm install` again
3. Check port 3000 is not in use

### Login not working
1. Verify backend is running on port 8000
2. Check browser console for CORS errors
3. Verify test user exists in database
4. Try clearing localStorage: `localStorage.clear()`

### Data not loading
1. Check backend logs for errors
2. Verify API token is valid (check localStorage)
3. Check Network tab in browser DevTools
4. Ensure backend CORS is configured correctly

## Production Deployment

### Backend
1. Set production `SECRET_KEY` in `.env`
2. Update `DATABASE_URL` with production database
3. Set `CORS_ORIGINS` to your frontend domain
4. Use a production ASGI server like `gunicorn` with `uvicorn` worker
5. Enable HTTPS

### Frontend
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Or deploy to Vercel/Netlify
4. Update `NEXT_PUBLIC_API_URL` to production backend URL

## Tech Stack

### Backend
- **Framework**: FastAPI 0.109.0
- **ORM**: SQLAlchemy 2.0.25
- **Database**: PostgreSQL with psycopg2-binary
- **Authentication**: JWT (python-jose) + bcrypt (passlib)
- **Validation**: Pydantic

### Frontend
- **Framework**: Next.js 14.2
- **UI Library**: React 18.3
- **Styling**: Tailwind CSS
- **Components**: Radix UI
- **Icons**: Lucide React

## Support

For issues or questions:
1. Check the API documentation at http://localhost:8000/docs
2. Review console/terminal logs for error messages
3. Verify all services are running correctly
4. Check database connectivity

## License

[Add your license information here]
