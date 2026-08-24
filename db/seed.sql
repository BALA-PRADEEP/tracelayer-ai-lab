-- TraceLayer synthetic demo dataset
-- All names, companies, projects, and values are fictional.

insert into tenants (id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Stark Roofing', 'stark-roofing'),
  ('22222222-2222-2222-2222-222222222222', 'Summit Construction', 'summit-construction')
on conflict (slug) do nothing;

insert into customers (id, tenant_id, name, email) values
  ('31111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Cedar Grove Apartments', 'ops@cedargrove.example'),
  ('32222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Atlas Retail Group', 'facilities@atlas.example'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Northwind Offices', 'projects@northwind.example')
on conflict (id) do nothing;

insert into projects (id, tenant_id, customer_id, name, project_type, status, city, state, started_on, completed_on, estimated_total, actual_total) values
  ('41111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '31111111-1111-1111-1111-111111111111', 'Project Cedar', 'Roof Replacement', 'completed', 'Austin', 'TX', '2026-03-03', '2026-03-21', 38500, 44780),
  ('42222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '32222222-2222-2222-2222-222222222222', 'Project Atlas', 'Commercial Roofing', 'active', 'Dallas', 'TX', '2026-07-10', null, 62000, 59850),
  ('43333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '31111111-1111-1111-1111-111111111111', 'Project Falcon', 'Roof Repair', 'completed', 'San Antonio', 'TX', '2026-02-11', '2026-02-18', 18400, 17620),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Project Summit', 'Roof Replacement', 'active', 'Denver', 'CO', '2026-08-05', null, 51000, 19300)
on conflict (id) do nothing;

insert into materials (id, tenant_id, sku, name, category, uom) values
  ('51111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'SHINGLE-ARCH-01', 'Architectural Shingle', 'Shingles', 'SQ'),
  ('52222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'UNDERLAY-SYN-01', 'Synthetic Underlayment', 'Underlayment', 'RL'),
  ('53333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'DRIP-EDGE-02', 'Aluminum Drip Edge', 'Flashing', 'LF')
on conflict (tenant_id, sku) do nothing;

insert into estimates (id, tenant_id, project_id, material_budget, labor_budget, total_budget) values
  ('61111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111111', 21400, 13700, 38500),
  ('62222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '42222222-2222-2222-2222-222222222222', 35800, 20800, 62000),
  ('63333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '43333333-3333-3333-3333-333333333333', 9200, 7400, 18400)
on conflict (id) do nothing;

insert into project_materials (id, tenant_id, project_id, material_id, estimated_quantity, actual_quantity, estimated_unit_cost, actual_unit_cost) values
  ('71111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111111', '51111111-1111-1111-1111-111111111111', 36, 41, 430, 468),
  ('72222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111111', '52222222-2222-2222-2222-222222222222', 14, 16, 148, 162),
  ('73333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111111', '53333333-3333-3333-3333-333333333333', 520, 605, 2.85, 3.10),
  ('74444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '42222222-2222-2222-2222-222222222222', '51111111-1111-1111-1111-111111111111', 58, 59, 432, 451)
on conflict (project_id, material_id) do nothing;

insert into expenses (id, tenant_id, project_id, expense_type, vendor_name, description, amount, incurred_on) values
  ('81111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111111', 'materials', 'BuildSource Supply', 'Additional shingles after damaged decking increased waste factor', 3760, '2026-03-15'),
  ('82222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111111', 'materials', 'BuildSource Supply', 'Supplemental underlayment and flashing', 1480, '2026-03-16'),
  ('83333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '42222222-2222-2222-2222-222222222222', 'equipment', 'Metro Lift Rentals', 'Lift rental extension', 1200, '2026-08-02')
on conflict (id) do nothing;

insert into invoices (id, tenant_id, project_id, invoice_number, status, amount, due_on, paid_on) values
  ('91111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111111', 'INV-CEDAR-001', 'paid', 44780, '2026-04-05', '2026-04-01'),
  ('92222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '42222222-2222-2222-2222-222222222222', 'INV-ATLAS-002', 'open', 24500, '2026-08-30', null)
on conflict (tenant_id, invoice_number) do nothing;

insert into supplier_products (id, provider, external_sku, name, category, uom) values
  ('a1111111-1111-1111-1111-111111111111', 'BuildSource Demo', 'SHINGLE-ARCH-01', 'Architectural Shingle', 'Shingles', 'SQ'),
  ('a2222222-2222-2222-2222-222222222222', 'BuildSource Demo', 'UNDERLAY-SYN-01', 'Synthetic Underlayment', 'Underlayment', 'RL'),
  ('a3333333-3333-3333-3333-333333333333', 'BuildSource Demo', 'DRIP-EDGE-02', 'Aluminum Drip Edge', 'Flashing', 'LF')
on conflict (provider, external_sku) do nothing;

insert into supplier_prices (id, supplier_product_id, unit_price, available_quantity, effective_at) values
  ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 479.00, 128, '2026-08-24T06:00:00Z'),
  ('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 166.50, 74, '2026-08-24T06:00:00Z'),
  ('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 3.18, 4200, '2026-08-24T06:00:00Z')
on conflict (id) do nothing;
