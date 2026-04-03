-- Sample data for Sales Command Module

-- Insert sample products
INSERT INTO products (name, sku, category, unit_price, cost) VALUES
('Product A', 'SKU-001', 'Electronics', 100.00, 40.00),
('Product B', 'SKU-002', 'Software', 200.00, 50.00),
('Product C', 'SKU-003', 'Services', 150.00, 60.00),
('Product D', 'SKU-004', 'Hardware', 250.00, 100.00),
('Product E', 'SKU-005', 'Consulting', 300.00, 80.00),
('Product F', 'SKU-006', 'Support', 75.00, 20.00),
('Product G', 'SKU-007', 'Licensing', 500.00, 100.00),
('Product H', 'SKU-008', 'Training', 180.00, 50.00),
('Product I', 'SKU-009', 'Implementation', 400.00, 150.00),
('Product J', 'SKU-010', 'Maintenance', 120.00, 30.00)
ON CONFLICT DO NOTHING;

-- Insert sample customers
INSERT INTO customers (name, company, email, segment, region, acquisition_date) VALUES
('John Smith', 'Acme Corp', 'john@acme.com', 'enterprise', 'North', '2022-01-15'),
('Jane Doe', 'TechStart Inc', 'jane@techstart.com', 'mid_market', 'South', '2022-06-20'),
('Mike Johnson', 'Growth Solutions', 'mike@growthsol.com', 'smb', 'East', '2023-02-10'),
('Sarah Williams', 'Digital First Ltd', 'sarah@digitalfirst.com', 'enterprise', 'West', '2022-03-05'),
('Robert Brown', 'Innovation Labs', 'robert@innov.com', 'mid_market', 'North', '2023-01-12'),
('Emily Davis', 'Cloud Systems', 'emily@cloudsys.com', 'smb', 'South', '2023-03-22'),
('David Miller', 'Future Tech', 'david@futuretech.com', 'mid_market', 'East', '2022-11-08'),
('Lisa Anderson', 'Smart Business', 'lisa@smartbiz.com', 'enterprise', 'West', '2021-08-30'),
('James Taylor', 'Next Gen Corp', 'james@nextgen.com', 'smb', 'North', '2023-04-15'),
('Jennifer White', 'Progress Inc', 'jennifer@progress.com', 'mid_market', 'South', '2022-09-20'),
('Charles Lee', 'Vector Solutions', 'charles@vector.com', 'enterprise', 'East', '2023-02-01'),
('Mary Martinez', 'Bridge Systems', 'mary@bridge.com', 'smb', 'West', '2023-05-10'),
('Thomas Garcia', 'Nexus Group', 'thomas@nexus.com', 'mid_market', 'North', '2022-07-12'),
('Patricia Rodriguez', 'Quantum Tech', 'patricia@quantum.com', 'enterprise', 'South', '2023-01-25'),
('Christopher Jackson', 'Spectrum Solutions', 'chris@spectrum.com', 'smb', 'East', '2023-03-30')
ON CONFLICT DO NOTHING;

-- Insert sample sales records
INSERT INTO sales_records (date, product_id, customer_id, quantity, unit_price, total_revenue, cost_of_goods, channel, sales_rep, region) VALUES
('2023-01-01', (SELECT id FROM products WHERE sku='SKU-001'), (SELECT id FROM customers WHERE name='John Smith'), 5, 100.00, 500.00, 200.00, 'direct', 'Sales Team A', 'North'),
('2023-01-02', (SELECT id FROM products WHERE sku='SKU-002'), (SELECT id FROM customers WHERE name='Jane Doe'), 2, 200.00, 400.00, 100.00, 'online', 'Sales Team B', 'South'),
('2023-01-03', (SELECT id FROM products WHERE sku='SKU-003'), (SELECT id FROM customers WHERE name='Mike Johnson'), 3, 150.00, 450.00, 180.00, 'partner', 'Sales Team A', 'East'),
('2023-01-04', (SELECT id FROM products WHERE sku='SKU-004'), (SELECT id FROM customers WHERE name='Sarah Williams'), 1, 250.00, 250.00, 100.00, 'direct', 'Sales Team C', 'West'),
('2023-01-05', (SELECT id FROM products WHERE sku='SKU-005'), (SELECT id FROM customers WHERE name='Robert Brown'), 2, 300.00, 600.00, 160.00, 'online', 'Sales Team B', 'North'),
('2023-02-01', (SELECT id FROM products WHERE sku='SKU-001'), (SELECT id FROM customers WHERE name='Emily Davis'), 4, 100.00, 400.00, 160.00, 'direct', 'Sales Team A', 'South'),
('2023-02-02', (SELECT id FROM products WHERE sku='SKU-006'), (SELECT id FROM customers WHERE name='David Miller'), 10, 75.00, 750.00, 200.00, 'online', 'Sales Team D', 'East'),
('2023-02-03', (SELECT id FROM products WHERE sku='SKU-007'), (SELECT id FROM customers WHERE name='Lisa Anderson'), 1, 500.00, 500.00, 100.00, 'partner', 'Sales Team C', 'West'),
('2023-02-04', (SELECT id FROM products WHERE sku='SKU-008'), (SELECT id FROM customers WHERE name='James Taylor'), 3, 180.00, 540.00, 150.00, 'direct', 'Sales Team B', 'North'),
('2023-02-05', (SELECT id FROM products WHERE sku='SKU-009'), (SELECT id FROM customers WHERE name='Jennifer White'), 1, 400.00, 400.00, 150.00, 'online', 'Sales Team A', 'South'),
('2023-03-01', (SELECT id FROM products WHERE sku='SKU-010'), (SELECT id FROM customers WHERE name='Charles Lee'), 6, 120.00, 720.00, 180.00, 'direct', 'Sales Team D', 'East'),
('2023-03-02', (SELECT id FROM products WHERE sku='SKU-002'), (SELECT id FROM customers WHERE name='Mary Martinez'), 1, 200.00, 200.00, 50.00, 'online', 'Sales Team B', 'West'),
('2023-03-03', (SELECT id FROM products WHERE sku='SKU-003'), (SELECT id FROM customers WHERE name='Thomas Garcia'), 4, 150.00, 600.00, 240.00, 'partner', 'Sales Team C', 'North'),
('2023-03-04', (SELECT id FROM products WHERE sku='SKU-004'), (SELECT id FROM customers WHERE name='Patricia Rodriguez'), 2, 250.00, 500.00, 200.00, 'direct', 'Sales Team A', 'South'),
('2023-03-05', (SELECT id FROM products WHERE sku='SKU-005'), (SELECT id FROM customers WHERE name='Christopher Jackson'), 3, 300.00, 900.00, 240.00, 'online', 'Sales Team D', 'East');
