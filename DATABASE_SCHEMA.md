# GearGuard CMMS - Database Schema Design

## Executive Summary

This document outlines a comprehensive, production-ready database schema for the GearGuard Computerized Maintenance Management System. The design prioritizes **data integrity, scalability, audit trails, and business intelligence** — critical factors for enterprise adoption and hackathon evaluation.

---

## Core Design Principles

1. **Normalized Structure** - Minimize redundancy while maintaining query performance
2. **Audit Trail** - Track all changes for compliance and analytics
3. **Soft Deletes** - Preserve historical data integrity
4. **Extensibility** - Support future features without major migrations
5. **Performance** - Indexed foreign keys and optimized for common queries

---

## Schema Overview (10 Core Tables)

```
Users → Teams → Equipment Categories → Equipment → Maintenance Requests
  ↓       ↓                               ↓              ↓
Roles   Team Members                   Work Orders   Request History
                                          ↓              ↓
                                    Parts Used     Attachments
```

---

## 1. Users & Authentication

### Table: `users`

**Purpose**: Central user management for authentication and role assignment

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt/Argon2 hash |
| `full_name` | VARCHAR(255) | NOT NULL | Display name |
| `phone` | VARCHAR(20) | NULLABLE | Contact number |
| `avatar_url` | TEXT | NULLABLE | Profile picture URL |
| `role_id` | INTEGER | FK → roles.id | User role |
| `department` | VARCHAR(100) | NULLABLE | Department assignment |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account status |
| `last_login` | TIMESTAMP | NULLABLE | Last authentication |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last modification |

**Indexes**:
- `idx_users_email` ON `email`
- `idx_users_role` ON `role_id`
- `idx_users_department` ON `department`

---

### Table: `roles`

**Purpose**: Role-based access control (RBAC)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Role identifier |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | Role name (e.g., "Admin", "Technician") |
| `description` | TEXT | NULLABLE | Role description |
| `permissions` | JSONB | NOT NULL | Permission flags (e.g., `{"can_edit": true}`) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Role creation |

**Default Roles**:
- Administrator (full access)
- Manager (create/assign requests, view reports)
- Technician (work on assigned requests, update status)
- Employee (create requests, view own equipment)
- Viewer (read-only access)

---

## 2. Teams & Assignments

### Table: `teams`

**Purpose**: Maintenance teams for specialized work

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Team identifier |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Team name (e.g., "IT Support") |
| `description` | TEXT | NULLABLE | Team responsibilities |
| `team_lead_id` | UUID | FK → users.id | Team leader |
| `specialization` | VARCHAR(100) | NULLABLE | Area of expertise |
| `is_active` | BOOLEAN | DEFAULT TRUE | Team status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Team creation |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last modification |

**Indexes**:
- `idx_teams_lead` ON `team_lead_id`
- `idx_teams_active` ON `is_active`

---

### Table: `team_members`

**Purpose**: Many-to-many relationship between users and teams

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Membership identifier |
| `team_id` | INTEGER | FK → teams.id | Team reference |
| `user_id` | UUID | FK → users.id | User reference |
| `joined_at` | TIMESTAMP | DEFAULT NOW() | Assignment date |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active membership |

**Composite Unique**: `(team_id, user_id)`

**Indexes**:
- `idx_team_members_team` ON `team_id`
- `idx_team_members_user` ON `user_id`

---

## 3. Equipment Management

### Table: `equipment_categories`

**Purpose**: Hierarchical equipment classification

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Category identifier |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Category name |
| `description` | TEXT | NULLABLE | Category description |
| `parent_id` | INTEGER | FK → equipment_categories.id | Parent category (for hierarchy) |
| `responsible_team_id` | INTEGER | FK → teams.id | Default maintenance team |
| `color_code` | VARCHAR(7) | DEFAULT '#3B82F6' | UI display color |
| `icon` | VARCHAR(50) | NULLABLE | Icon identifier |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes**:
- `idx_categories_parent` ON `parent_id`
- `idx_categories_team` ON `responsible_team_id`

**Example Categories**:
- Computers → Laptops, Desktops, Servers
- Machinery → CNC, Drill Press, Lathe
- HVAC → Air Conditioners, Heaters
- Office Equipment → Printers, Scanners

---

### Table: `equipment`

**Purpose**: Core asset registry

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Equipment identifier |
| `name` | VARCHAR(255) | NOT NULL | Equipment name |
| `serial_number` | VARCHAR(100) | UNIQUE, NOT NULL | Manufacturer serial |
| `category_id` | INTEGER | FK → equipment_categories.id | Equipment category |
| `assigned_to_user_id` | UUID | FK → users.id | Current user assignment |
| `assigned_to_department` | VARCHAR(100) | NULLABLE | Department assignment |
| `location` | VARCHAR(255) | NULLABLE | Physical location |
| `manufacturer` | VARCHAR(100) | NULLABLE | Manufacturer name |
| `model` | VARCHAR(100) | NULLABLE | Model number |
| `purchase_date` | DATE | NULLABLE | Purchase date |
| `purchase_cost` | DECIMAL(10,2) | NULLABLE | Original cost |
| `warranty_expiry` | DATE | NULLABLE | Warranty end date |
| `maintenance_team_id` | INTEGER | FK → teams.id | Responsible team |
| `default_technician_id` | UUID | FK → users.id | Default technician |
| `health_status` | INTEGER | CHECK (0-100) | Health percentage |
| `status` | VARCHAR(20) | NOT NULL | operational, maintenance, down, scrapped |
| `qr_code` | VARCHAR(255) | UNIQUE | QR code identifier |
| `notes` | TEXT | NULLABLE | Additional notes |
| `is_critical` | BOOLEAN | DEFAULT FALSE | Critical asset flag |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last modification |

**Indexes**:
- `idx_equipment_serial` ON `serial_number`
- `idx_equipment_category` ON `category_id`
- `idx_equipment_user` ON `assigned_to_user_id`
- `idx_equipment_team` ON `maintenance_team_id`
- `idx_equipment_status` ON `status`
- `idx_equipment_health` ON `health_status`
- `idx_equipment_qr` ON `qr_code`

**Status Values**:
- `operational`: Functioning normally
- `maintenance`: Under preventive maintenance
- `down`: Not operational (needs repair)
- `scrapped`: End of life

---

## 4. Maintenance Requests & Work Orders

### Table: `maintenance_requests`

**Purpose**: Request lifecycle management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Request identifier |
| `request_number` | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable ID (e.g., "REQ-2025-001") |
| `subject` | VARCHAR(255) | NOT NULL | Brief description |
| `description` | TEXT | NULLABLE | Detailed problem description |
| `equipment_id` | INTEGER | FK → equipment.id | Affected equipment |
| `category_id` | INTEGER | FK → equipment_categories.id | Auto-filled from equipment |
| `maintenance_type` | VARCHAR(20) | NOT NULL | corrective, preventive |
| `priority` | INTEGER | CHECK (0-3) | 0=Low, 1=Medium, 2=High, 3=Critical |
| `stage` | VARCHAR(20) | NOT NULL | new, in_progress, repaired, scrap |
| `assigned_team_id` | INTEGER | FK → teams.id | Assigned team |
| `assigned_technician_id` | UUID | FK → users.id | Assigned technician |
| `created_by_user_id` | UUID | FK → users.id | Request creator |
| `requested_date` | TIMESTAMP | NOT NULL | When request was created |
| `scheduled_date` | TIMESTAMP | NULLABLE | Planned maintenance date |
| `started_at` | TIMESTAMP | NULLABLE | Work start time |
| `completed_at` | TIMESTAMP | NULLABLE | Work completion time |
| `estimated_duration_hours` | DECIMAL(5,2) | NULLABLE | Estimated time |
| `actual_duration_hours` | DECIMAL(5,2) | NULLABLE | Actual time spent |
| `cost_estimate` | DECIMAL(10,2) | NULLABLE | Estimated cost |
| `actual_cost` | DECIMAL(10,2) | NULLABLE | Final cost |
| `notes` | TEXT | NULLABLE | Work notes |
| `resolution_notes` | TEXT | NULLABLE | How it was resolved |
| `is_overdue` | BOOLEAN | GENERATED | (scheduled_date < NOW() AND stage != 'repaired') |
| `company` | VARCHAR(255) | NOT NULL | Company/location |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last modification |

**Indexes**:
- `idx_requests_number` ON `request_number`
- `idx_requests_equipment` ON `equipment_id`
- `idx_requests_stage` ON `stage`
- `idx_requests_priority` ON `priority`
- `idx_requests_type` ON `maintenance_type`
- `idx_requests_team` ON `assigned_team_id`
- `idx_requests_technician` ON `assigned_technician_id`
- `idx_requests_scheduled` ON `scheduled_date`
- `idx_requests_created_by` ON `created_by_user_id`

**Stage Workflow**:
1. `new` - Just created
2. `in_progress` - Technician working on it
3. `repaired` - Fixed and operational
4. `scrap` - Equipment deemed unrepairable

---

### Table: `request_history`

**Purpose**: Audit trail for all request changes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | History entry ID |
| `request_id` | INTEGER | FK → maintenance_requests.id | Request reference |
| `changed_by_user_id` | UUID | FK → users.id | Who made the change |
| `field_name` | VARCHAR(50) | NOT NULL | Field that changed |
| `old_value` | TEXT | NULLABLE | Previous value |
| `new_value` | TEXT | NULLABLE | New value |
| `change_type` | VARCHAR(20) | NOT NULL | created, updated, stage_changed, assigned |
| `timestamp` | TIMESTAMP | DEFAULT NOW() | When change occurred |

**Indexes**:
- `idx_history_request` ON `request_id`
- `idx_history_timestamp` ON `timestamp`

---

### Table: `work_order_instructions`

**Purpose**: Step-by-step maintenance instructions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Instruction ID |
| `request_id` | INTEGER | FK → maintenance_requests.id | Associated request |
| `step_number` | INTEGER | NOT NULL | Sequence order |
| `instruction` | TEXT | NOT NULL | Step description |
| `is_completed` | BOOLEAN | DEFAULT FALSE | Completion status |
| `completed_by` | UUID | FK → users.id | Who completed it |
| `completed_at` | TIMESTAMP | NULLABLE | Completion timestamp |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Composite Unique**: `(request_id, step_number)`

---

### Table: `parts_used`

**Purpose**: Track parts/materials consumed during maintenance

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Record ID |
| `request_id` | INTEGER | FK → maintenance_requests.id | Associated request |
| `part_name` | VARCHAR(255) | NOT NULL | Part description |
| `part_number` | VARCHAR(100) | NULLABLE | SKU/Part number |
| `quantity` | DECIMAL(10,2) | NOT NULL | Amount used |
| `unit` | VARCHAR(20) | DEFAULT 'unit' | Measurement unit |
| `unit_cost` | DECIMAL(10,2) | NULLABLE | Cost per unit |
| `total_cost` | DECIMAL(10,2) | NULLABLE | Total cost |
| `supplier` | VARCHAR(255) | NULLABLE | Supplier name |
| `added_by` | UUID | FK → users.id | Who added the record |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes**:
- `idx_parts_request` ON `request_id`
- `idx_parts_number` ON `part_number`

---

## 5. Supporting Features

### Table: `attachments`

**Purpose**: File attachments for equipment and requests

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Attachment ID |
| `entity_type` | VARCHAR(50) | NOT NULL | equipment, request |
| `entity_id` | INTEGER | NOT NULL | Foreign key to entity |
| `file_name` | VARCHAR(255) | NOT NULL | Original filename |
| `file_url` | TEXT | NOT NULL | Storage URL |
| `file_type` | VARCHAR(50) | NOT NULL | MIME type |
| `file_size` | BIGINT | NOT NULL | Size in bytes |
| `uploaded_by` | UUID | FK → users.id | Uploader |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Upload timestamp |

**Indexes**:
- `idx_attachments_entity` ON `(entity_type, entity_id)`
- `idx_attachments_uploader` ON `uploaded_by`

---

### Table: `scheduled_maintenance`

**Purpose**: Recurring preventive maintenance schedules

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Schedule ID |
| `equipment_id` | INTEGER | FK → equipment.id | Equipment reference |
| `title` | VARCHAR(255) | NOT NULL | Maintenance title |
| `description` | TEXT | NULLABLE | What to do |
| `frequency` | VARCHAR(20) | NOT NULL | daily, weekly, monthly, quarterly, yearly |
| `frequency_value` | INTEGER | DEFAULT 1 | Every N intervals |
| `start_date` | DATE | NOT NULL | When schedule begins |
| `end_date` | DATE | NULLABLE | When schedule ends |
| `last_performed` | DATE | NULLABLE | Last maintenance date |
| `next_scheduled` | DATE | NOT NULL | Next due date |
| `assigned_team_id` | INTEGER | FK → teams.id | Responsible team |
| `estimated_duration_hours` | DECIMAL(5,2) | NULLABLE | Expected duration |
| `is_active` | BOOLEAN | DEFAULT TRUE | Schedule status |
| `created_by` | UUID | FK → users.id | Creator |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last modification |

**Indexes**:
- `idx_scheduled_equipment` ON `equipment_id`
- `idx_scheduled_next` ON `next_scheduled`
- `idx_scheduled_active` ON `is_active`

---

### Table: `analytics_cache`

**Purpose**: Pre-computed metrics for dashboard performance

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Cache ID |
| `metric_name` | VARCHAR(100) | NOT NULL | Metric identifier |
| `metric_value` | JSONB | NOT NULL | Computed value |
| `computed_at` | TIMESTAMP | DEFAULT NOW() | Calculation timestamp |
| `expires_at` | TIMESTAMP | NOT NULL | Cache expiry |

**Example Metrics**:
- `critical_equipment_count`
- `technician_utilization`
- `open_requests_summary`
- `avg_response_time`
- `completion_rate`

**Indexes**:
- `idx_analytics_name` ON `metric_name`
- `idx_analytics_expires` ON `expires_at`

---

## Key Business Logic & Constraints

### Auto-fill Logic
When a maintenance request is created and `equipment_id` is set:
```sql
UPDATE maintenance_requests 
SET category_id = (SELECT category_id FROM equipment WHERE id = NEW.equipment_id),
    assigned_team_id = (SELECT maintenance_team_id FROM equipment WHERE id = NEW.equipment_id),
    assigned_technician_id = (SELECT default_technician_id FROM equipment WHERE id = NEW.equipment_id)
WHERE id = NEW.id;
```

### Smart Button Counts
Equipment form displays count of open requests:
```sql
SELECT COUNT(*) 
FROM maintenance_requests 
WHERE equipment_id = ? 
  AND stage NOT IN ('repaired', 'scrap')
  AND deleted_at IS NULL;
```

### Overdue Detection
Requests are overdue if:
```sql
scheduled_date < NOW() 
AND stage NOT IN ('repaired', 'scrap')
AND deleted_at IS NULL
```

### Health Score Calculation
Equipment health can be computed from:
- Age (newer = higher score)
- Number of repairs in last 6 months (fewer = higher)
- Downtime percentage (less = higher)
- Preventive maintenance adherence (more = higher)

---

## Database Relationships Diagram (ERD Summary)

```
users (1) ←→ (N) team_members (N) ←→ (1) teams
  ↓                                      ↓
  (1)                                    (1)
  ↓                                      ↓
equipment (N) ←→ (1) equipment_categories
  ↓                           ↓
  (1)                         (1)
  ↓                           ↓
maintenance_requests (1) → (N) request_history
  ↓                           ↓
  (1)                         (1)
  ↓                           ↓
work_order_instructions    parts_used
  ↓                           ↓
  (1)                         (1)
  ↓                           ↓
attachments              scheduled_maintenance
```

---

## API Endpoint Recommendations

### Equipment
- `GET /api/equipment` - List all equipment (with filters)
- `GET /api/equipment/:id` - Get single equipment
- `POST /api/equipment` - Create equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Soft delete equipment
- `GET /api/equipment/:id/requests` - Get all requests for equipment

### Maintenance Requests
- `GET /api/requests` - List requests (with filters: stage, team, technician)
- `GET /api/requests/:id` - Get single request
- `POST /api/requests` - Create request (with auto-fill logic)
- `PUT /api/requests/:id` - Update request
- `PATCH /api/requests/:id/stage` - Update stage (triggers history)
- `GET /api/requests/:id/history` - Get change history

### Calendar
- `GET /api/calendar` - Get scheduled maintenance for date range
- `POST /api/calendar/schedule` - Schedule new maintenance

### Dashboard
- `GET /api/dashboard/metrics` - Get all dashboard metrics
- `GET /api/dashboard/critical-equipment` - Get equipment with health < 30%
- `GET /api/dashboard/technician-load` - Calculate utilization

### Teams
- `GET /api/teams` - List all teams
- `POST /api/teams` - Create team
- `POST /api/teams/:id/members` - Add member to team

---

## Technology Stack Recommendations

### Backend Framework
**Option 1: Odoo** (Aligns with hackathon sponsor)
- Use Odoo ORM for models
- Leverage existing modules (base, hr, stock)
- Custom module: `gearguard_cmms`

**Option 2: Python + FastAPI + PostgreSQL** ⭐ RECOMMENDED
- Modern async API with automatic OpenAPI docs
- Pydantic for validation
- Easy integration with Next.js frontend
- Fast development and excellent performance

**Option 3: Node.js + Express + PostgreSQL**
- Fast development
- TypeScript support
- Easy integration with Next.js frontend

### Database
- **PostgreSQL 15+** (JSONB support, excellent indexing, ACID compliance)
- **TimescaleDB extension** (optional, for time-series analytics)

### Caching
- **Redis** - Cache dashboard metrics, session storage

### File Storage
- **AWS S3 / MinIO** - Attachments, QR codes, user avatars

### Real-time
- **WebSockets / Socket.io** - Live notifications, collaborative editing

---

## Migration & Seeding Strategy

### Initial Setup
1. Create database and tables (use migrations)
2. Seed roles and permissions
3. Create default admin user
4. Seed sample teams
5. Seed equipment categories
6. (Optional) Import sample equipment data

### Sample Data for Demo
- 50-100 equipment items across categories
- 5 teams (IT, Facilities, Production, Metrology, Electrical)
- 10-15 users with varied roles
- 20-30 historical requests
- 5-10 open requests at various stages

---

## Performance Optimization

### Indexing Strategy
All foreign keys are indexed. Additional composite indexes for:
- `(equipment_id, stage)` on `maintenance_requests`
- `(team_id, is_active)` on `team_members`
- `(entity_type, entity_id)` on `attachments`

### Query Optimization
- Use database views for complex joins
- Implement pagination (limit/offset or cursor-based)
- Cache expensive computations in `analytics_cache`

### Partitioning (for scale)
If data grows large:
- Partition `request_history` by month
- Partition `attachments` by entity_type

---

## Security Considerations

1. **Row-Level Security (RLS)** - Users can only see their department's equipment
2. **Prepared Statements** - Prevent SQL injection
3. **Field Encryption** - Encrypt sensitive data (costs, purchase details)
4. **Audit Logs** - All mutations logged in `request_history`
5. **API Rate Limiting** - Prevent abuse
6. **Input Validation** - Validate all user inputs server-side

---

## Hackathon Evaluation Alignment

### Business Logic (30%)
✅ Complete workflow from request creation to completion
✅ Auto-fill reduces data entry errors
✅ Smart buttons provide instant insights
✅ Scrap logic maintains data integrity

### Data Modeling (25%)
✅ Normalized schema with minimal redundancy
✅ Supports complex queries and reporting
✅ Extensible for future features
✅ Audit trails for compliance

### User Experience (20%)
✅ Fast queries via proper indexing
✅ Real-time notifications
✅ Dashboard metrics cached for instant load
✅ Calendar integration for scheduling

### Innovation (15%)
✅ QR code scanning for equipment
✅ AI-powered note summarization (frontend ready)
✅ Predictive maintenance scoring
✅ Analytics cache for BI dashboards

### Code Quality (10%)
✅ Well-documented schema
✅ Consistent naming conventions
✅ Foreign key constraints
✅ Soft deletes preserve history

---

## Next Steps for Implementation

1. **Phase 1: Core Models** (Days 1-2)
   - Users, Roles, Teams
   - Equipment, Categories
   - Basic CRUD APIs

2. **Phase 2: Requests & Workflow** (Days 3-4)
   - Maintenance requests
   - Stage transitions
   - Auto-fill logic
   - Request history

3. **Phase 3: Advanced Features** (Days 5-6)
   - Calendar & scheduling
   - Attachments
   - Dashboard metrics
   - Parts tracking

4. **Phase 4: Polish & Demo** (Day 7)
   - Seed realistic data
   - Performance testing
   - Frontend-backend integration
   - Prepare demo script

---

## Conclusion

This schema design provides a **production-ready foundation** that exceeds typical hackathon requirements. It demonstrates:

- **Enterprise thinking** - Audit trails, soft deletes, role-based access
- **Scalability** - Proper indexing, caching strategy
- **Business value** - Tracks costs, downtime, technician efficiency
- **Odoo alignment** - Mirrors Odoo's modular architecture

The design supports all problem statement requirements while adding professional features that judges will appreciate. The schema is complex enough to demonstrate technical depth but organized enough to implement within a hackathon timeline.

**Estimated LOC for Backend**: 3,000-5,000 lines (models + API + business logic)

Good luck with your implementation!
