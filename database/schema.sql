-- AI Customs Platform Database Schema

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id SERIAL PRIMARY KEY,
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),
  origin_country CHAR(2) NOT NULL,
  destination_country CHAR(2) NOT NULL,
  shipper VARCHAR(255),
  consignee VARCHAR(255),
  goods_description TEXT,
  declared_value NUMERIC(15, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  weight_kg NUMERIC(10, 3),
  compliance_status VARCHAR(50) DEFAULT 'pending',
  customs_status VARCHAR(50) DEFAULT 'pending',
  estimated_arrival DATE,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  category VARCHAR(100),
  hs_code VARCHAR(20),
  description TEXT,
  country_origin CHAR(2),
  unit_value NUMERIC(15, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  weight_kg NUMERIC(10, 3),
  material VARCHAR(255),
  manufacturer VARCHAR(255),
  export_controlled BOOLEAN DEFAULT false,
  eccn VARCHAR(50),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Regulations
CREATE TABLE IF NOT EXISTS regulations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  category VARCHAR(100),
  country CHAR(2),
  regulation_number VARCHAR(100),
  effective_date DATE,
  expiry_date DATE,
  summary TEXT,
  full_text TEXT,
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trade Agreements
CREATE TABLE IF NOT EXISTS trade_agreements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  abbreviation VARCHAR(50),
  member_countries TEXT[], -- array of ISO country codes
  effective_date DATE,
  description TEXT,
  benefits TEXT,
  rules_of_origin TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs (audit_trail table)
CREATE TABLE IF NOT EXISTS audit_trail (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  status VARCHAR(50),
  risk_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- HS Classifications
CREATE TABLE IF NOT EXISTS hs_classifications (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  shipment_id INTEGER REFERENCES shipments(id) ON DELETE SET NULL,
  hs_code VARCHAR(20) NOT NULL,
  chapter VARCHAR(10),
  section VARCHAR(10),
  description TEXT,
  duty_rate_estimate VARCHAR(50),
  confidence INTEGER CHECK (confidence BETWEEN 0 AND 100),
  reasoning TEXT,
  alternative_codes JSONB,
  classified_by INTEGER REFERENCES users(id),
  ai_model VARCHAR(100) DEFAULT 'anthropic/claude-3-5-sonnet-20241022',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Compliance Screenings
CREATE TABLE IF NOT EXISTS compliance_screenings (
  id SERIAL PRIMARY KEY,
  entity_name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  country CHAR(2),
  screening_type VARCHAR(50), -- 'sanctions', 'denied_party', 'compliance'
  risk_level VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
  status VARCHAR(50) DEFAULT 'pending', -- 'pass', 'fail', 'pending', 'review'
  match_score INTEGER CHECK (match_score BETWEEN 0 AND 100),
  details JSONB,
  screened_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Duty Calculations
CREATE TABLE IF NOT EXISTS duty_calculations (
  id SERIAL PRIMARY KEY,
  shipment_id INTEGER REFERENCES shipments(id) ON DELETE SET NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  hs_code VARCHAR(20),
  origin_country CHAR(2),
  destination_country CHAR(2),
  declared_value NUMERIC(15, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  duty_rate NUMERIC(8, 4),
  duty_amount NUMERIC(15, 2),
  vat_rate NUMERIC(8, 4),
  vat_amount NUMERIC(15, 2),
  excise_tax NUMERIC(15, 2),
  processing_fee NUMERIC(15, 2),
  total_landed_cost NUMERIC(15, 2),
  applicable_agreements JSONB,
  calculation_breakdown JSONB,
  notes TEXT,
  calculated_by INTEGER REFERENCES users(id),
  ai_model VARCHAR(100) DEFAULT 'anthropic/claude-3-5-sonnet-20241022',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Generated Documents
CREATE TABLE IF NOT EXISTS generated_documents (
  id SERIAL PRIMARY KEY,
  shipment_id INTEGER REFERENCES shipments(id) ON DELETE SET NULL,
  document_type VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  reference_number VARCHAR(100),
  content JSONB,
  raw_text TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  generated_by INTEGER REFERENCES users(id),
  ai_model VARCHAR(100) DEFAULT 'anthropic/claude-3-5-sonnet-20241022',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shipments_origin ON shipments(origin_country);
CREATE INDEX IF NOT EXISTS idx_shipments_destination ON shipments(destination_country);
CREATE INDEX IF NOT EXISTS idx_shipments_compliance_status ON shipments(compliance_status);
CREATE INDEX IF NOT EXISTS idx_compliance_screenings_risk_level ON compliance_screenings(risk_level);
CREATE INDEX IF NOT EXISTS idx_compliance_screenings_status ON compliance_screenings(status);
CREATE INDEX IF NOT EXISTS idx_products_hs_code ON products(hs_code);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_hs_classifications_hs_code ON hs_classifications(hs_code);
