-- GearGuard CMMS Database Schema
-- PostgreSQL 15+
-- Run this file to create all tables

-- ==============================================
-- 1. USERS & AUTHENTICATION
-- ==============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_department ON users(department);

-- ==============================================
-- 2. TEAMS & ASSIGNMENTS
-- ==============================================

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    team_lead_id UUID REFERENCES users(id),
    specialization VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teams_lead ON teams(team_lead_id);
CREATE INDEX idx_teams_active ON teams(is_active);

CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- ==============================================
-- 3. EQUIPMENT MANAGEMENT
-- ==============================================

CREATE TABLE equipment_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES equipment_categories(id),
    responsible_team_id INTEGER REFERENCES teams(id),
    color_code VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON equipment_categories(parent_id);
CREATE INDEX idx_categories_team ON equipment_categories(responsible_team_id);

CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    category_id INTEGER NOT NULL REFERENCES equipment_categories(id),
    assigned_to_user_id UUID REFERENCES users(id),
    assigned_to_department VARCHAR(100),
    location VARCHAR(255),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    purchase_date DATE,
    purchase_cost DECIMAL(10,2),
    warranty_expiry DATE,
    maintenance_team_id INTEGER REFERENCES teams(id),
    default_technician_id UUID REFERENCES users(id),
    health_status INTEGER CHECK (health_status >= 0 AND health_status <= 100) DEFAULT 100,
    status VARCHAR(20) NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'down', 'scrapped')),
    qr_code VARCHAR(255) UNIQUE,
    notes TEXT,
    is_critical BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_equipment_serial ON equipment(serial_number);
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_user ON equipment(assigned_to_user_id);
CREATE INDEX idx_equipment_team ON equipment(maintenance_team_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_health ON equipment(health_status);
CREATE INDEX idx_equipment_qr ON equipment(qr_code);

-- ==============================================
-- 4. MAINTENANCE REQUESTS & WORK ORDERS
-- ==============================================

CREATE TABLE maintenance_requests (
    id SERIAL PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id),
    category_id INTEGER REFERENCES equipment_categories(id),
    maintenance_type VARCHAR(20) NOT NULL CHECK (maintenance_type IN ('corrective', 'preventive')),
    priority INTEGER CHECK (priority >= 0 AND priority <= 3) DEFAULT 1,
    stage VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'in_progress', 'repaired', 'scrap')),
    assigned_team_id INTEGER REFERENCES teams(id),
    assigned_technician_id UUID REFERENCES users(id),
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    requested_date TIMESTAMP NOT NULL DEFAULT NOW(),
    scheduled_date TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_duration_hours DECIMAL(5,2),
    actual_duration_hours DECIMAL(5,2),
    cost_estimate DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    notes TEXT,
    resolution_notes TEXT,
    company VARCHAR(255) NOT NULL DEFAULT 'My Company',
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_requests_number ON maintenance_requests(request_number);
CREATE INDEX idx_requests_equipment ON maintenance_requests(equipment_id);
CREATE INDEX idx_requests_stage ON maintenance_requests(stage);
CREATE INDEX idx_requests_priority ON maintenance_requests(priority);
CREATE INDEX idx_requests_type ON maintenance_requests(maintenance_type);
CREATE INDEX idx_requests_team ON maintenance_requests(assigned_team_id);
CREATE INDEX idx_requests_technician ON maintenance_requests(assigned_technician_id);
CREATE INDEX idx_requests_scheduled ON maintenance_requests(scheduled_date);
CREATE INDEX idx_requests_created_by ON maintenance_requests(created_by_user_id);

CREATE TABLE request_history (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    changed_by_user_id UUID NOT NULL REFERENCES users(id),
    field_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('created', 'updated', 'stage_changed', 'assigned')),
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_history_request ON request_history(request_id);
CREATE INDEX idx_history_timestamp ON request_history(timestamp);

CREATE TABLE work_order_instructions (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(request_id, step_number)
);

CREATE TABLE parts_used (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    part_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100),
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'unit',
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    supplier VARCHAR(255),
    added_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_parts_request ON parts_used(request_id);
CREATE INDEX idx_parts_number ON parts_used(part_number);

-- ==============================================
-- 5. SUPPORTING FEATURES
-- ==============================================

CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('equipment', 'request')),
    entity_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_attachments_uploader ON attachments(uploaded_by);

CREATE TABLE scheduled_maintenance (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    frequency_value INTEGER DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE,
    last_performed DATE,
    next_scheduled DATE NOT NULL,
    assigned_team_id INTEGER REFERENCES teams(id),
    estimated_duration_hours DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scheduled_equipment ON scheduled_maintenance(equipment_id);
CREATE INDEX idx_scheduled_next ON scheduled_maintenance(next_scheduled);
CREATE INDEX idx_scheduled_active ON scheduled_maintenance(is_active);

CREATE TABLE analytics_cache (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value JSONB NOT NULL,
    computed_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_analytics_name ON analytics_cache(metric_name);
CREATE INDEX idx_analytics_expires ON analytics_cache(expires_at);

-- ==============================================
-- SEED DEFAULT ROLES
-- ==============================================

INSERT INTO roles (name, description, permissions) VALUES
('Administrator', 'Full system access - can manage everything', '{
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
}'),
('Team_Leader', 'Can manage own team and assign work', '{
    "can_create_teams": false,
    "can_edit_teams": true,
    "can_delete_teams": false,
    "can_create_equipment": false,
    "can_edit_equipment": true,
    "can_delete_equipment": false,
    "can_create_requests": true,
    "can_edit_requests": true,
    "can_delete_requests": false,
    "can_assign_requests": true,
    "can_view_all_requests": true,
    "can_view_analytics": true,
    "can_manage_users": false
}'),
('Technician', 'Can work on assigned requests', '{
    "can_create_teams": false,
    "can_edit_teams": false,
    "can_delete_teams": false,
    "can_create_equipment": false,
    "can_edit_equipment": false,
    "can_delete_equipment": false,
    "can_create_requests": false,
    "can_edit_requests": true,
    "can_delete_requests": false,
    "can_assign_requests": false,
    "can_view_all_requests": false,
    "can_view_analytics": false,
    "can_manage_users": false
}'),
('Employee', 'Can create requests for own equipment', '{
    "can_create_teams": false,
    "can_edit_teams": false,
    "can_delete_teams": false,
    "can_create_equipment": false,
    "can_edit_equipment": false,
    "can_delete_equipment": false,
    "can_create_requests": true,
    "can_edit_requests": false,
    "can_delete_requests": false,
    "can_assign_requests": false,
    "can_view_all_requests": false,
    "can_view_analytics": false,
    "can_manage_users": false
}'),
('Viewer', 'Read-only access to reports', '{
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
    "can_view_all_requests": true,
    "can_view_analytics": true,
    "can_manage_users": false
}');

-- ==============================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ==============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_maintenance_updated_at BEFORE UPDATE ON scheduled_maintenance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- AUTO-FILL TRIGGER FOR MAINTENANCE REQUESTS
-- ==============================================

CREATE OR REPLACE FUNCTION auto_fill_request_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.equipment_id IS NOT NULL THEN
        SELECT category_id, maintenance_team_id, default_technician_id
        INTO NEW.category_id, NEW.assigned_team_id, NEW.assigned_technician_id
        FROM equipment
        WHERE id = NEW.equipment_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_fill_maintenance_request BEFORE INSERT ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION auto_fill_request_fields();

-- ==============================================
-- AUDIT TRAIL TRIGGER
-- ==============================================

CREATE OR REPLACE FUNCTION log_request_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO request_history (request_id, changed_by_user_id, field_name, new_value, change_type)
        VALUES (NEW.id, NEW.created_by_user_id, 'created', 'Request created', 'created');
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.stage != NEW.stage THEN
            INSERT INTO request_history (request_id, changed_by_user_id, field_name, old_value, new_value, change_type)
            VALUES (NEW.id, NEW.created_by_user_id, 'stage', OLD.stage, NEW.stage, 'stage_changed');
        END IF;
        IF OLD.assigned_technician_id != NEW.assigned_technician_id THEN
            INSERT INTO request_history (request_id, changed_by_user_id, field_name, old_value, new_value, change_type)
            VALUES (NEW.id, NEW.created_by_user_id, 'assigned_technician_id', 
                    OLD.assigned_technician_id::TEXT, NEW.assigned_technician_id::TEXT, 'assigned');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_maintenance_request_changes AFTER INSERT OR UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION log_request_changes();
