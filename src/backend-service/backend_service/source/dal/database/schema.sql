create extension if not exists "pgcrypto";

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  name text not null,
  project_type text not null,
  status text not null,
  city text,
  state text,
  started_on date,
  completed_on date,
  estimated_total numeric(12,2) not null default 0,
  actual_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  sku text not null,
  name text not null,
  category text,
  uom text not null,
  unique (tenant_id, sku)
);

create table if not exists project_materials (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  material_id uuid not null references materials(id) on delete cascade,
  estimated_quantity numeric(12,2) not null default 0,
  actual_quantity numeric(12,2) not null default 0,
  estimated_unit_cost numeric(12,2) not null default 0,
  actual_unit_cost numeric(12,2) not null default 0,
  unique (project_id, material_id)
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  expense_type text not null,
  vendor_name text,
  description text,
  amount numeric(12,2) not null,
  incurred_on date not null,
  created_at timestamptz not null default now()
);

create table if not exists estimates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  material_budget numeric(12,2) not null default 0,
  labor_budget numeric(12,2) not null default 0,
  total_budget numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  invoice_number text not null,
  status text not null,
  amount numeric(12,2) not null,
  due_on date,
  paid_on date,
  unique (tenant_id, invoice_number)
);

create table if not exists supplier_products (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_sku text not null,
  name text not null,
  category text,
  uom text not null,
  unique (provider, external_sku)
);

create table if not exists supplier_prices (
  id uuid primary key default gen_random_uuid(),
  supplier_product_id uuid not null references supplier_products(id) on delete cascade,
  unit_price numeric(12,2) not null,
  available_quantity numeric(12,2),
  effective_at timestamptz not null default now()
);

create index if not exists idx_projects_tenant on projects(tenant_id);
create index if not exists idx_expenses_project on expenses(project_id);
create index if not exists idx_project_materials_project on project_materials(project_id);
create index if not exists idx_invoices_project on invoices(project_id);
