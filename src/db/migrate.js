require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'analyst',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hs_codes (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(500) NOT NULL,
  description TEXT,
  hs_code VARCHAR(20) NOT NULL,
  chapter VARCHAR(10),
  section VARCHAR(10),
  duty_rate DECIMAL(5,2),
  country_origin VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_screenings (
  id SERIAL PRIMARY KEY,
  entity_name VARCHAR(500) NOT NULL,
  entity_type VARCHAR(100),
  country VARCHAR(100),
  screening_type VARCHAR(100),
  risk_level VARCHAR(20),
  status VARCHAR(50),
  match_score DECIMAL(5,2),
  details TEXT,
  screened_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customs_documents (
  id SERIAL PRIMARY KEY,
  document_type VARCHAR(100) NOT NULL,
  reference_number VARCHAR(100),
  shipper VARCHAR(500),
  consignee VARCHAR(500),
  origin_country VARCHAR(100),
  destination_country VARCHAR(100),
  goods_description TEXT,
  declared_value DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS duty_calculations (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(500) NOT NULL,
  hs_code VARCHAR(20),
  origin_country VARCHAR(100),
  destination_country VARCHAR(100),
  declared_value DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'USD',
  duty_rate DECIMAL(5,2),
  duty_amount DECIMAL(15,2),
  tax_rate DECIMAL(5,2),
  tax_amount DECIMAL(15,2),
  total_fees DECIMAL(15,2),
  trade_agreement VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS country_regulations (
  id SERIAL PRIMARY KEY,
  country VARCHAR(100) NOT NULL,
  country_code VARCHAR(5),
  regulation_type VARCHAR(100),
  title VARCHAR(500),
  description TEXT,
  effective_date DATE,
  expiry_date DATE,
  status VARCHAR(50),
  authority VARCHAR(255),
  restricted_items TEXT,
  documentation_required TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipments (
  id SERIAL PRIMARY KEY,
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),
  origin_country VARCHAR(100),
  destination_country VARCHAR(100),
  shipper VARCHAR(500),
  consignee VARCHAR(500),
  goods_description TEXT,
  declared_value DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'USD',
  weight_kg DECIMAL(10,2),
  compliance_status VARCHAR(50),
  customs_status VARCHAR(50),
  estimated_arrival DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trade_agreements (
  id SERIAL PRIMARY KEY,
  agreement_name VARCHAR(500) NOT NULL,
  acronym VARCHAR(50),
  member_countries TEXT,
  effective_date DATE,
  expiry_date DATE,
  status VARCHAR(50),
  tariff_reduction VARCHAR(100),
  eligible_products TEXT,
  rules_of_origin TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sanctions_screenings (
  id SERIAL PRIMARY KEY,
  entity_name VARCHAR(500) NOT NULL,
  entity_type VARCHAR(100),
  country VARCHAR(100),
  sanctions_list VARCHAR(255),
  risk_score DECIMAL(5,2),
  status VARCHAR(50),
  match_details TEXT,
  sanctions_type VARCHAR(100),
  authority VARCHAR(255),
  screened_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(500) NOT NULL,
  sku VARCHAR(100),
  category VARCHAR(255),
  hs_code VARCHAR(20),
  description TEXT,
  country_origin VARCHAR(100),
  unit_value DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'USD',
  weight_kg DECIMAL(10,2),
  material VARCHAR(255),
  manufacturer VARCHAR(500),
  export_controlled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_trail (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id VARCHAR(50),
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  details TEXT,
  ip_address VARCHAR(50),
  status VARCHAR(50),
  risk_level VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
`;

async function migrate() {
  try {
    await pool.query(schema);
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

migrate();
