-- Clear all data from tables
TRUNCATE users, teams, team_members, equipment_categories, equipment, 
         maintenance_requests, request_history, work_order_instructions, 
         parts_used, attachments, scheduled_maintenance, analytics_cache CASCADE;
