-- Departments
INSERT INTO departments (id, name, description, color_code, active) VALUES
('00000000-0000-0000-0000-000000000001', 'General', 'General department tasks', '#64748B', TRUE),
('00000000-0000-0000-0000-000000000002', 'Marketing', 'Marketing department tasks', '#0EA5E9', TRUE),
('00000000-0000-0000-0000-000000000003', 'Finance', 'Finance department tasks', '#10B981', TRUE),
('00000000-0000-0000-0000-000000000004', 'Human Resources', 'HR department tasks', '#F59E0B', TRUE),
('00000000-0000-0000-0000-000000000005', 'IT', 'IT department tasks', '#8B5CF6', TRUE),
('00000000-0000-0000-0000-000000000006', 'Operations', 'Operations department tasks', '#EF4444', TRUE),
('00000000-0000-0000-0000-000000000007', 'Sales', 'Sales department tasks', '#06B6D4', TRUE),
('00000000-0000-0000-0000-000000000008', 'Customer Support', 'Customer support tasks', '#F97316', TRUE);

-- Users (from sample-users-data.csv)
INSERT INTO users (id, name, email, department_id, role, active) VALUES
('10000000-0000-0000-0000-000000000001', 'John Doe', 'john.doe@example.com', '00000000-0000-0000-0000-000000000001', 'admin', TRUE),
('10000000-0000-0000-0000-000000000002', 'Sarah Smith', 'sarah.smith@example.com', '00000000-0000-0000-0000-000000000002', 'manager', TRUE),
('10000000-0000-0000-0000-000000000003', 'Mike Jones', 'mike.jones@example.com', '00000000-0000-0000-0000-000000000003', 'member', TRUE),
('10000000-0000-0000-0000-000000000004', 'Lisa Brown', 'lisa.brown@example.com', '00000000-0000-0000-0000-000000000004', 'manager', TRUE),
('10000000-0000-0000-0000-000000000005', 'Tech Admin', 'tech.admin@example.com', '00000000-0000-0000-0000-000000000005', 'admin', TRUE),
('10000000-0000-0000-0000-000000000006', 'Jane Manager', 'jane.manager@example.com', '00000000-0000-0000-0000-000000000003', 'manager', TRUE),
('10000000-0000-0000-0000-000000000007', 'Support Lead', 'support.lead@example.com', '00000000-0000-0000-0000-000000000008', 'manager', TRUE);

-- Categories (from sample-categories-data.csv)
INSERT INTO categories (id, name, department_id, color_code, active) VALUES
('20000000-0000-0000-0000-000000000001', 'Marketing', '00000000-0000-0000-0000-000000000002', '#0EA5E9', TRUE),
('20000000-0000-0000-0000-000000000002', 'Sales', '00000000-0000-0000-0000-000000000007', '#06B6D4', TRUE),
('20000000-0000-0000-0000-000000000003', 'Operations', '00000000-0000-0000-0000-000000000006', '#EF4444', TRUE),
('20000000-0000-0000-0000-000000000004', 'Finance', '00000000-0000-0000-0000-000000000003', '#10B981', TRUE),
('20000000-0000-0000-0000-000000000005', 'Human Resources', '00000000-0000-0000-0000-000000000004', '#F59E0B', TRUE),
('20000000-0000-0000-0000-000000000006', 'IT', '00000000-0000-0000-0000-000000000005', '#8B5CF6', TRUE),
('20000000-0000-0000-0000-000000000007', 'Customer Support', '00000000-0000-0000-0000-000000000008', '#F97316', TRUE),
('20000000-0000-0000-0000-000000000008', 'General', '00000000-0000-0000-0000-000000000001', '#64748B', TRUE);

-- Sample tasks (from sample-tasks-data.csv)
INSERT INTO tasks (
  id, task_number, title, description, department_id, category_id, assigned_to, created_by,
  status, priority, due_date, completed_date, estimated_hours, actual_hours, tags, created_at, updated_at
) VALUES
('30000000-0000-0000-0000-000000000001', 'TASK-1234567890-001', 'Update Website Homepage', 'Refresh homepage content with new product offerings and testimonials', '00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'in_progress', 'high', '2024-01-31', NULL, NULL, NULL, ARRAY['website','marketing'], '2024-01-15T00:00:00Z', '2024-01-20T10:30:00Z'),
('30000000-0000-0000-0000-000000000002', 'TASK-1234567891-002', 'Q1 Financial Report', 'Compile and analyze Q1 financial data for board presentation', '00000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006', 'open', 'high', '2024-02-15', NULL, NULL, NULL, ARRAY['finance','reporting'], '2024-01-16T00:00:00Z', '2024-01-16T14:22:00Z'),
('30000000-0000-0000-0000-000000000003', 'TASK-1234567892-003', 'Employee Onboarding - New Hire', 'Set up workspace and accounts for new marketing coordinator', '00000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'completed', 'medium', '2024-01-18', '2024-01-17T16:45:00Z', 8.0, 8.0, ARRAY['onboarding','hr'], '2024-01-10T00:00:00Z', '2024-01-17T16:45:00Z');
