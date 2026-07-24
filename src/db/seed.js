require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED !== 'true' || process.env.RESET_DATABASE !== '1' || process.env.SEED_DEMO_DATA !== '1') {
  throw new Error('Destructive demo seed requires ALLOW_DEMO_SEED=true, RESET_DATABASE=1, and SEED_DEMO_DATA=1 outside production');
}

async function seed() {
  try {
    const demoEmail = process.env.DEMO_EMAIL || '';
    const demoPassword = process.env.DEMO_PASSWORD || '';
    if (!demoEmail.includes('@')) throw new Error('DEMO_EMAIL must be a valid email address');
    if (demoPassword.length < 12) throw new Error('DEMO_PASSWORD must be at least 12 characters');
    await pool.query(`TRUNCATE TABLE
      generated_documents, duty_calculations, compliance_screenings, hs_classifications,
      audit_trail, trade_agreements, regulations, products, shipments, users
      RESTART IDENTITY CASCADE`);
    // Users
    const hash = await bcrypt.hash(demoPassword, 10);
    await pool.query(`INSERT INTO users (name, email, password_hash, role) VALUES
      ('Admin User', $2, $1, 'admin'),
      ('Sarah Chen', 'sarah@aicustoms.com', $1, 'analyst'),
      ('James Wilson', 'james@aicustoms.com', $1, 'manager')
    `, [hash, demoEmail]);

    // HS Codes (16 items)
    await pool.query(`INSERT INTO hs_codes (product_name, description, hs_code, chapter, section, duty_rate, country_origin, notes) VALUES
      ('Laptop Computer', 'Portable automatic data processing machine, weighing < 10kg', '8471.30', '84', 'XVI', 0.00, 'China', 'ITA zero duty applies'),
      ('Cotton T-Shirt', 'Men''s knitted cotton t-shirt, crew neck', '6109.10', '61', 'XI', 16.50, 'Bangladesh', 'Subject to textile quotas'),
      ('Lithium-Ion Battery', 'Rechargeable lithium-ion battery for vehicles, 50kWh', '8507.60', '85', 'XVI', 3.40, 'South Korea', 'EV battery - may qualify for IRA credits'),
      ('Organic Coffee Beans', 'Arabica coffee beans, roasted, not decaffeinated', '0901.21', '09', 'II', 0.00, 'Colombia', 'Free under GSP'),
      ('Steel Coil', 'Hot-rolled steel coil, carbon steel, width > 600mm', '7208.10', '72', 'XV', 25.00, 'Japan', 'Section 232 tariffs apply'),
      ('Pharmaceutical Tablets', 'Amoxicillin 500mg capsules, packaged for retail', '3004.10', '30', 'VI', 0.00, 'India', 'Duty free - pharmaceutical agreement'),
      ('LED Display Panel', '65-inch OLED display panel for television', '8529.90', '85', 'XVI', 3.90, 'South Korea', 'Flat panel display'),
      ('Olive Oil', 'Extra virgin olive oil, first cold pressing, 1L bottles', '1509.10', '15', 'III', 5.00, 'Italy', 'EU origin - standard MFN rate'),
      ('Automotive Parts', 'Brake pads for passenger vehicles, ceramic composite', '6813.81', '68', 'XIII', 2.50, 'Germany', 'USMCA may apply if installed in NA vehicles'),
      ('Silk Fabric', 'Woven silk fabric, containing >85% silk by weight', '5007.20', '50', 'XI', 6.90, 'China', 'Luxury textile classification'),
      ('Solar Panel', 'Photovoltaic module, monocrystalline silicon, 400W', '8541.40', '85', 'XVI', 14.75, 'Vietnam', 'Section 201 safeguard tariffs'),
      ('Fresh Avocados', 'Fresh Hass avocados, not prepared or preserved', '0804.40', '08', 'II', 11.20, 'Mexico', 'USMCA preferential rate: 0%'),
      ('Ceramic Tiles', 'Glazed ceramic floor tiles, 30x30cm', '6908.90', '69', 'XIII', 8.50, 'Spain', 'Standard construction material rate'),
      ('Wine - Red', 'Cabernet Sauvignon, bottled, 2021 vintage, 750ml', '2204.21', '22', 'IV', 6.30, 'France', 'TTB permit required for import'),
      ('Electric Motor', 'AC motor, three-phase, output > 75kW', '8501.53', '85', 'XVI', 2.40, 'Taiwan', 'Industrial equipment rate'),
      ('Rubber Tires', 'New pneumatic radial tires for passenger cars', '4011.10', '40', 'VII', 4.00, 'Thailand', 'DOT compliance required')
    `);

    // Compliance Screenings (16 items)
    await pool.query(`INSERT INTO compliance_screenings (entity_name, entity_type, country, screening_type, risk_level, status, match_score, details, screened_by) VALUES
      ('Huawei Technologies', 'Company', 'China', 'Entity List', 'critical', 'Flagged', 98.50, 'Match found on BIS Entity List. Export license required for EAR-controlled items.', 'Sarah Chen'),
      ('Samsung Electronics', 'Company', 'South Korea', 'Denied Party', 'low', 'Cleared', 2.10, 'No matches found on any restricted party lists.', 'James Wilson'),
      ('Rosoboronexport', 'Company', 'Russia', 'SDN List', 'critical', 'Flagged', 99.80, 'Exact match on OFAC SDN list. All transactions prohibited.', 'Admin User'),
      ('Toshiba Corp', 'Company', 'Japan', 'Entity List', 'low', 'Cleared', 5.30, 'No current restrictions. Historical listing removed 2019.', 'Sarah Chen'),
      ('ZTE Corporation', 'Company', 'China', 'Entity List', 'high', 'Under Review', 88.40, 'Previously listed on BIS Entity List. Enhanced screening recommended.', 'James Wilson'),
      ('Global Trade Solutions Ltd', 'Company', 'UAE', 'Denied Party', 'medium', 'Under Review', 45.60, 'Partial name match with denied party. Additional verification needed.', 'Sarah Chen'),
      ('Ahmed Al-Rashid', 'Individual', 'Iraq', 'SDN List', 'high', 'Flagged', 72.30, 'Potential match on OFAC SDN list. Name similarity detected.', 'Admin User'),
      ('Nordic Shipping AB', 'Company', 'Sweden', 'Denied Party', 'low', 'Cleared', 1.20, 'No matches. Verified legitimate shipping company.', 'James Wilson'),
      ('Tehran Industrial Group', 'Company', 'Iran', 'Comprehensive Sanctions', 'critical', 'Flagged', 95.00, 'Iran comprehensive sanctions apply. All transactions blocked.', 'Sarah Chen'),
      ('Mitsubishi Heavy Industries', 'Company', 'Japan', 'Entity List', 'low', 'Cleared', 8.70, 'No current restrictions found.', 'James Wilson'),
      ('COSCO Shipping', 'Company', 'China', 'SDN List', 'medium', 'Under Review', 55.20, 'Some subsidiaries have been listed. Verify specific entity.', 'Admin User'),
      ('Airbus Defence & Space', 'Company', 'France', 'Military End Use', 'medium', 'Cleared', 15.40, 'Defense contractor - standard due diligence completed.', 'Sarah Chen'),
      ('Petroleo Brasileiro SA', 'Company', 'Brazil', 'Anti-Corruption', 'medium', 'Under Review', 40.10, 'Historical corruption issues. Enhanced due diligence required.', 'James Wilson'),
      ('Kim Jong Trading', 'Company', 'North Korea', 'Comprehensive Sanctions', 'critical', 'Flagged', 99.90, 'DPRK comprehensive sanctions. All transactions prohibited.', 'Admin User'),
      ('Maersk Line', 'Company', 'Denmark', 'Denied Party', 'low', 'Cleared', 0.50, 'Major shipping carrier. No restrictions found.', 'Sarah Chen'),
      ('Kaspersky Lab', 'Company', 'Russia', 'Entity List', 'high', 'Flagged', 82.60, 'US government use restricted. Enhanced screening for tech exports.', 'James Wilson')
    `);

    // Customs Documents (16 items)
    await pool.query(`INSERT INTO customs_documents (document_type, reference_number, shipper, consignee, origin_country, destination_country, goods_description, declared_value, currency, status, notes) VALUES
      ('Commercial Invoice', 'INV-2024-001', 'Shenzhen Electronics Co.', 'TechImport LLC, New York', 'China', 'United States', 'Consumer electronics - laptops and tablets', 125000.00, 'USD', 'Approved', 'Standard commercial shipment'),
      ('Bill of Lading', 'BOL-2024-015', 'Hamburg Port Authority', 'AutoParts Inc, Detroit', 'Germany', 'United States', 'Automotive brake components', 89500.00, 'EUR', 'In Transit', 'FCL container shipment'),
      ('Certificate of Origin', 'CO-2024-088', 'Colombian Coffee Exports', 'Bean Masters, Seattle', 'Colombia', 'United States', 'Green and roasted coffee beans', 45000.00, 'USD', 'Approved', 'GSP Form A attached'),
      ('Customs Declaration', 'CD-2024-203', 'Tokyo Motors Ltd', 'Pacific Auto Group, LA', 'Japan', 'United States', 'Vehicle parts and accessories', 234000.00, 'USD', 'Pending Review', 'Multiple HS codes applicable'),
      ('Packing List', 'PL-2024-067', 'Milano Fashion SpA', 'Luxury Brands USA', 'Italy', 'United States', 'Leather handbags and accessories', 567000.00, 'EUR', 'Approved', 'High-value luxury goods'),
      ('Import License', 'IL-2024-012', 'Indian Pharma Ltd', 'MedSupply Corp, NJ', 'India', 'United States', 'Pharmaceutical products - antibiotics', 78000.00, 'USD', 'Approved', 'FDA approval confirmed'),
      ('Export Declaration', 'ED-2024-045', 'US Agri Exports', 'Dubai Food Trading', 'United States', 'UAE', 'Agricultural equipment and parts', 156000.00, 'USD', 'Filed', 'AES filing completed'),
      ('Dangerous Goods Declaration', 'DGD-2024-009', 'Korea Battery Tech', 'EV Motors Inc, Austin', 'South Korea', 'United States', 'Lithium-ion battery packs, Class 9', 890000.00, 'USD', 'Under Review', 'IATA DG regulations apply'),
      ('Phytosanitary Certificate', 'PC-2024-033', 'Chile Fresh Produce', 'FreshMart Distribution', 'Chile', 'United States', 'Fresh fruits - grapes and cherries', 23000.00, 'USD', 'Approved', 'USDA inspection cleared'),
      ('ATA Carnet', 'ATA-2024-007', 'Swiss Precision Instruments', 'Trade Show Events, Chicago', 'Switzerland', 'United States', 'Exhibition equipment and samples', 450000.00, 'CHF', 'Active', 'Temporary import for trade show'),
      ('Insurance Certificate', 'IC-2024-091', 'Bangkok Textiles', 'Fashion Forward Inc', 'Thailand', 'United States', 'Silk and cotton fabrics', 67000.00, 'USD', 'Approved', 'Marine cargo insurance'),
      ('Letter of Credit', 'LC-2024-028', 'Vietnam Manufacturing', 'HomeGoods America', 'Vietnam', 'United States', 'Furniture and home decor items', 198000.00, 'USD', 'Confirmed', 'Irrevocable LC via HSBC'),
      ('Fumigation Certificate', 'FC-2024-014', 'Brazilian Timber Exports', 'BuildRight Materials', 'Brazil', 'United States', 'Hardwood lumber and timber', 34000.00, 'USD', 'Approved', 'ISPM 15 compliant'),
      ('Inspection Certificate', 'ISP-2024-056', 'South African Wines', 'Wine Importers Guild', 'South Africa', 'United States', 'Bottled wines, various vintages', 89000.00, 'USD', 'Approved', 'TTB and FDA clearance'),
      ('Warehouse Receipt', 'WR-2024-019', 'Bonded Warehouse LA', 'Multiple Consignees', 'Various', 'United States', 'Mixed cargo awaiting clearance', 1200000.00, 'USD', 'In Storage', 'FTZ facility - Zone 202'),
      ('Transit Document', 'TD-2024-041', 'Panama Canal Authority', 'Pacific Trade Corp', 'Panama', 'United States', 'Containerized general cargo', 345000.00, 'USD', 'In Transit', 'Canal transit documentation')
    `);

    // Duty Calculations (16 items)
    await pool.query(`INSERT INTO duty_calculations (product_name, hs_code, origin_country, destination_country, declared_value, currency, duty_rate, duty_amount, tax_rate, tax_amount, total_fees, trade_agreement, notes) VALUES
      ('Laptop Computers (100 units)', '8471.30', 'China', 'United States', 125000.00, 'USD', 0.00, 0.00, 0.00, 0.00, 375.00, 'ITA', 'Zero duty under Information Technology Agreement'),
      ('Cotton T-Shirts (5000 pcs)', '6109.10', 'Bangladesh', 'United States', 25000.00, 'USD', 16.50, 4125.00, 0.00, 0.00, 4500.00, 'GSP', 'Standard textile duty rate'),
      ('Lithium Batteries (50 units)', '8507.60', 'South Korea', 'United States', 890000.00, 'USD', 3.40, 30260.00, 0.00, 0.00, 30635.00, 'KORUS FTA', 'Preferential rate under KORUS FTA'),
      ('Coffee Beans (20 tons)', '0901.21', 'Colombia', 'United States', 45000.00, 'USD', 0.00, 0.00, 0.00, 0.00, 135.00, 'GSP', 'Duty free under GSP'),
      ('Steel Coils (100 tons)', '7208.10', 'Japan', 'United States', 150000.00, 'USD', 25.00, 37500.00, 0.00, 0.00, 37875.00, 'None', 'Section 232 steel tariff applies'),
      ('Pharmaceutical Tablets', '3004.10', 'India', 'United States', 78000.00, 'USD', 0.00, 0.00, 0.00, 0.00, 234.00, 'Pharma Agreement', 'Zero duty pharmaceutical'),
      ('OLED TV Panels (200 units)', '8529.90', 'South Korea', 'United States', 340000.00, 'USD', 3.90, 13260.00, 0.00, 0.00, 13632.00, 'KORUS FTA', 'Display component rate'),
      ('Olive Oil (10000 bottles)', '1509.10', 'Italy', 'United States', 85000.00, 'USD', 5.00, 4250.00, 0.00, 0.00, 4505.00, 'None', 'Standard MFN rate from EU'),
      ('Brake Pads (2000 sets)', '6813.81', 'Mexico', 'United States', 56000.00, 'USD', 0.00, 0.00, 0.00, 0.00, 168.00, 'USMCA', 'Zero duty under USMCA rules of origin'),
      ('Solar Panels (500 units)', '8541.40', 'Vietnam', 'United States', 225000.00, 'USD', 14.75, 33187.50, 0.00, 0.00, 33562.50, 'None', 'Section 201 safeguard tariff'),
      ('Fresh Avocados (40 tons)', '0804.40', 'Mexico', 'United States', 88000.00, 'USD', 0.00, 0.00, 0.00, 0.00, 264.00, 'USMCA', 'Zero duty under USMCA - USDA inspection required'),
      ('Red Wine (5000 bottles)', '2204.21', 'France', 'United States', 125000.00, 'USD', 6.30, 7875.00, 0.00, 0.00, 8250.00, 'None', 'Federal excise tax additional'),
      ('Electric Motors (100 units)', '8501.53', 'Taiwan', 'United States', 178000.00, 'USD', 2.40, 4272.00, 0.00, 0.00, 4806.00, 'None', 'Standard industrial rate'),
      ('Rubber Tires (1000 units)', '4011.10', 'Thailand', 'United States', 95000.00, 'USD', 4.00, 3800.00, 0.00, 0.00, 4085.00, 'None', 'DOT markings required'),
      ('Ceramic Tiles (5000 sqm)', '6908.90', 'Spain', 'United States', 67000.00, 'USD', 8.50, 5695.00, 0.00, 0.00, 5896.00, 'None', 'Standard construction rate'),
      ('Silk Fabric (2000 meters)', '5007.20', 'China', 'United States', 120000.00, 'USD', 6.90, 8280.00, 0.00, 0.00, 8640.00, 'None', 'Luxury textile tariff rate')
    `);

    // Country Regulations (16 items)
    await pool.query(`INSERT INTO country_regulations (country, country_code, regulation_type, title, description, effective_date, expiry_date, status, authority, restricted_items, documentation_required) VALUES
      ('United States', 'US', 'Import', 'Section 301 China Tariffs', 'Additional tariffs on Chinese imports covering multiple HS chapters', '2018-07-06', NULL, 'Active', 'USTR', 'Technology, electronics, industrial equipment', 'Standard customs entry, Section 301 exclusion request if applicable'),
      ('European Union', 'EU', 'Import', 'Carbon Border Adjustment Mechanism', 'Carbon tax on imports of carbon-intensive goods', '2026-01-01', NULL, 'Active', 'European Commission', 'Steel, cement, aluminum, fertilizers, electricity', 'CBAM certificate, emissions data declaration'),
      ('China', 'CN', 'Export', 'Rare Earth Export Controls', 'Export licensing requirements for rare earth minerals', '2023-08-01', NULL, 'Active', 'MOFCOM', 'Rare earth elements, gallium, germanium', 'Export license, end-user certificate'),
      ('Japan', 'JP', 'Export', 'Semiconductor Equipment Controls', 'Restrictions on semiconductor manufacturing equipment exports', '2023-07-23', NULL, 'Active', 'METI', 'Advanced semiconductor equipment, EUV lithography', 'Export permit, end-use verification'),
      ('India', 'IN', 'Import', 'Electronics Import Regulations', 'Quality control orders for electronic goods', '2023-04-01', NULL, 'Active', 'BIS', 'Electronics, IT equipment, consumer devices', 'BIS registration, test reports, conformity certificate'),
      ('Brazil', 'BR', 'Import', 'ANVISA Health Product Registration', 'Registration requirements for health and pharmaceutical products', '2020-01-01', NULL, 'Active', 'ANVISA', 'Pharmaceuticals, medical devices, cosmetics', 'ANVISA registration, GMP certificate, product dossier'),
      ('Australia', 'AU', 'Import', 'Biosecurity Import Conditions', 'Strict biosecurity requirements for agricultural imports', '2022-06-01', NULL, 'Active', 'DAFF', 'Food, plants, animal products, wood', 'Phytosanitary certificate, import permit, inspection'),
      ('Russia', 'RU', 'Import/Export', 'Comprehensive Trade Sanctions', 'Western sanctions on Russian trade following Ukraine conflict', '2022-02-24', NULL, 'Active', 'Multiple', 'Technology, luxury goods, oil, financial services', 'Sanctions compliance verification, OFAC license'),
      ('South Korea', 'KR', 'Import', 'Food Safety Certification', 'MFDS certification for imported food products', '2021-01-01', NULL, 'Active', 'MFDS', 'Food products, food additives, health supplements', 'MFDS registration, lab test results, Korean labeling'),
      ('Mexico', 'MX', 'Import', 'NOM Standards Compliance', 'Mexican official standards for imported products', '2020-06-01', NULL, 'Active', 'SE', 'Electronics, textiles, toys, automotive parts', 'NOM certification mark, conformity certificate'),
      ('United Kingdom', 'GB', 'Import', 'Post-Brexit Import Procedures', 'New customs requirements for UK imports post-Brexit', '2021-01-01', NULL, 'Active', 'HMRC', 'All goods from EU and third countries', 'Customs declaration, EORI number, rules of origin proof'),
      ('Canada', 'CA', 'Import', 'CUSMA Rules of Origin', 'Rules of origin requirements under CUSMA/USMCA', '2020-07-01', NULL, 'Active', 'CBSA', 'Automotive, textiles, agricultural products', 'Certificate of origin, regional value content documentation'),
      ('Singapore', 'SG', 'Import', 'Strategic Goods Control', 'Controls on dual-use and military goods', '2019-01-01', NULL, 'Active', 'Enterprise SG', 'Dual-use technology, military items, chemicals', 'Strategic goods permit, end-user certificate'),
      ('UAE', 'AE', 'Import', 'Halal Certification Requirements', 'Mandatory halal certification for food imports', '2020-01-01', NULL, 'Active', 'ESMA', 'Food products, cosmetics, pharmaceuticals', 'Halal certificate, health certificate, COO'),
      ('Germany', 'DE', 'Export', 'Dual-Use Export Controls', 'EU dual-use regulation implementation', '2021-09-09', NULL, 'Active', 'BAFA', 'Dual-use items, cyber-surveillance technology', 'Export license, end-user statement, technical specs'),
      ('Vietnam', 'VN', 'Import', 'Product Quality Inspection', 'Pre-shipment inspection requirements', '2022-01-01', NULL, 'Active', 'MoIT', 'Machinery, steel, chemicals, consumer goods', 'Inspection certificate, quality test report, COO')
    `);

    // Shipments (16 items)
    await pool.query(`INSERT INTO shipments (tracking_number, carrier, origin_country, destination_country, shipper, consignee, goods_description, declared_value, currency, weight_kg, compliance_status, customs_status, estimated_arrival, notes) VALUES
      ('MAEU1234567', 'Maersk', 'China', 'United States', 'Shenzhen Electronics Co', 'TechImport LLC', 'Consumer electronics - 200 laptops', 250000.00, 'USD', 4500.00, 'Cleared', 'Released', '2024-12-15', 'Delivered to port of Long Beach'),
      ('COSCO8901234', 'COSCO', 'South Korea', 'United States', 'Samsung SDI', 'EV Motors Inc', 'EV battery modules - Class 9 DG', 1200000.00, 'USD', 12000.00, 'Cleared', 'Released', '2024-12-20', 'Dangerous goods protocol followed'),
      ('MSC5678901', 'MSC', 'Germany', 'United States', 'BMW AG', 'AutoNation Distribution', 'Automotive parts assortment', 450000.00, 'EUR', 8500.00, 'Cleared', 'In Customs', '2024-12-18', 'Awaiting FDA hold release'),
      ('FDX9012345', 'FedEx', 'Japan', 'United States', 'Tokyo Precision Tools', 'Industrial Supply Co', 'CNC machine components', 89000.00, 'USD', 320.00, 'Cleared', 'Released', '2024-12-10', 'Air freight express delivery'),
      ('DHL7890123', 'DHL', 'India', 'United States', 'Tata Pharma', 'MedSupply Corp', 'Pharmaceutical products', 156000.00, 'USD', 450.00, 'Under Review', 'Held', '2024-12-22', 'FDA inspection required'),
      ('EVER2345678', 'Evergreen', 'Vietnam', 'United States', 'Vietnam Solar Tech', 'SunPower Distribution', 'Solar panel modules - 500 units', 225000.00, 'USD', 9800.00, 'Flagged', 'Held', '2024-12-25', 'Section 201 duty assessment pending'),
      ('HAPAG3456789', 'Hapag-Lloyd', 'Italy', 'United States', 'Milano Fashion SpA', 'Luxury Brands USA', 'Designer leather goods', 890000.00, 'EUR', 1200.00, 'Cleared', 'Released', '2024-12-12', 'High-value shipment - extra insurance'),
      ('UPS4567890', 'UPS', 'United Kingdom', 'United States', 'London Spirits Ltd', 'Premium Imports Inc', 'Scotch whisky - 2000 bottles', 120000.00, 'GBP', 2400.00, 'Cleared', 'Released', '2024-12-14', 'TTB approved, excise tax paid'),
      ('OOCL5678901', 'OOCL', 'Taiwan', 'United States', 'TSMC Logistics', 'Chip Design Corp', 'Semiconductor wafers', 2500000.00, 'USD', 150.00, 'Cleared', 'Released', '2024-12-11', 'High-value tech shipment, security escort'),
      ('CMA6789012', 'CMA CGM', 'Brazil', 'United States', 'Brazil Agri Export', 'FreshMart Distribution', 'Fresh fruits - mangoes and papayas', 34000.00, 'USD', 18000.00, 'Under Review', 'In Customs', '2024-12-19', 'USDA phytosanitary inspection'),
      ('ZIM7890123', 'ZIM', 'Israel', 'United States', 'Dead Sea Minerals', 'Beauty Products Inc', 'Cosmetic minerals and salts', 67000.00, 'USD', 5600.00, 'Cleared', 'Released', '2024-12-13', 'FDA cosmetic notification filed'),
      ('YANG8901234', 'Yang Ming', 'Mexico', 'United States', 'Cerveceria Modelo', 'BevDistribution USA', 'Beer and beverages - 10000 cases', 89000.00, 'USD', 22000.00, 'Cleared', 'Released', '2024-12-16', 'USMCA origin verified, TTB cleared'),
      ('TNT9012345', 'TNT Express', 'Switzerland', 'United States', 'Rolex SA', 'WatchWorld Inc', 'Luxury timepieces', 4500000.00, 'CHF', 45.00, 'Cleared', 'Released', '2024-12-09', 'High security, armed courier'),
      ('PIL0123456', 'PIL', 'Thailand', 'United States', 'Thai Rubber Exports', 'TireMax Distribution', 'Natural rubber sheets', 78000.00, 'USD', 32000.00, 'Cleared', 'In Customs', '2024-12-21', 'Fumigation certificate required'),
      ('WANHAI1234567', 'Wan Hai', 'Bangladesh', 'United States', 'Dhaka Garments Ltd', 'Fashion Forward Inc', 'Ready-made garments - mixed', 45000.00, 'USD', 6800.00, 'Under Review', 'Held', '2024-12-23', 'Textile quota verification pending'),
      ('KMTC2345678', 'KMTC', 'Chile', 'United States', 'Chile Wines SA', 'Wine Importers Guild', 'Bottled wines - mixed varieties', 67000.00, 'USD', 4500.00, 'Cleared', 'Released', '2024-12-17', 'TTB and customs cleared')
    `);

    // Trade Agreements (16 items)
    await pool.query(`INSERT INTO trade_agreements (agreement_name, acronym, member_countries, effective_date, expiry_date, status, tariff_reduction, eligible_products, rules_of_origin, notes) VALUES
      ('United States-Mexico-Canada Agreement', 'USMCA', 'United States, Mexico, Canada', '2020-07-01', NULL, 'Active', 'Up to 100%', 'Most goods with qualifying origin', 'Regional value content 75% for autos, net cost method available', 'Replaced NAFTA. Auto rules significantly stricter.'),
      ('US-Korea Free Trade Agreement', 'KORUS', 'United States, South Korea', '2012-03-15', NULL, 'Active', 'Up to 100%', 'Electronics, automotive, agricultural products', 'Substantial transformation or tariff shift rule', 'Most industrial goods now at zero duty.'),
      ('Comprehensive and Progressive Agreement for Trans-Pacific Partnership', 'CPTPP', 'Japan, Canada, Australia, Mexico, Vietnam, Singapore, +5', '2018-12-30', NULL, 'Active', 'Up to 100%', 'Industrial goods, agriculture, services', 'Product-specific rules, accumulation provisions', 'US withdrew in 2017. UK acceded 2023.'),
      ('EU-Japan Economic Partnership Agreement', 'EU-Japan EPA', 'European Union, Japan', '2019-02-01', NULL, 'Active', 'Up to 100%', 'Automotive, food, industrial products', 'EU and Japan qualifying content rules', 'Largest bilateral FTA at time of signing.'),
      ('Regional Comprehensive Economic Partnership', 'RCEP', 'China, Japan, South Korea, ASEAN, Australia, NZ', '2022-01-01', NULL, 'Active', 'Varies by product', 'Manufactured goods, agriculture', 'Regional cumulation among members, 40% RVC', 'World largest trade bloc by GDP.'),
      ('African Continental Free Trade Area', 'AfCFTA', '54 African Union member states', '2021-01-01', NULL, 'Active', 'Up to 90%', 'Goods and services across Africa', 'Minimum 40% local value added', 'Aims to create single African market.'),
      ('US-Australia Free Trade Agreement', 'AUSFTA', 'United States, Australia', '2005-01-01', NULL, 'Active', 'Up to 100%', 'Most goods, some agricultural exceptions', 'Change in tariff classification plus RVC', 'Mature agreement - most tariffs eliminated.'),
      ('EU-Canada Comprehensive Economic and Trade Agreement', 'CETA', 'European Union, Canada', '2017-09-21', NULL, 'Active (Provisional)', 'Up to 100%', 'Industrial goods, agriculture, services', 'Product-specific rules, bilateral cumulation', 'Investment chapter not yet ratified by all EU members.'),
      ('US-Israel Free Trade Agreement', 'US-Israel FTA', 'United States, Israel', '1985-09-01', NULL, 'Active', 'Up to 100%', 'Most industrial and agricultural goods', '35% substantial transformation in FTA territory', 'First US bilateral FTA. Groundbreaking agreement.'),
      ('ASEAN Free Trade Area', 'AFTA', 'Brunei, Cambodia, Indonesia, Laos, Malaysia, Myanmar, Philippines, Singapore, Thailand, Vietnam', '1992-01-28', NULL, 'Active', 'Up to 100%', 'All goods traded among ASEAN members', 'ASEAN content minimum 40%', 'Common Effective Preferential Tariff scheme.'),
      ('EU-Mercosur Association Agreement', 'EU-Mercosur', 'EU, Brazil, Argentina, Uruguay, Paraguay', '2024-12-06', NULL, 'Signed', 'Up to 100%', 'Automotive, agriculture, industrial goods', 'Product-specific rules pending', 'Concluded after 25 years of negotiations.'),
      ('US-Japan Trade Agreement', 'US-Japan TA', 'United States, Japan', '2020-01-01', NULL, 'Active', 'Partial', 'Agricultural products, digital trade', 'Product-specific for agriculture', 'Phase 1 deal. Limited scope compared to CPTPP.'),
      ('Generalized System of Preferences', 'GSP', 'United States + 119 developing countries', '1976-01-01', NULL, 'Active', 'Up to 100%', 'Approx 3500 product categories', 'Direct shipment, 35% BDC value added', 'Unilateral preference program, renewed periodically.'),
      ('Central America-Dominican Republic FTA', 'CAFTA-DR', 'US, Costa Rica, El Salvador, Guatemala, Honduras, Nicaragua, DR', '2006-03-01', NULL, 'Active', 'Up to 100%', 'Textiles, agriculture, manufactured goods', 'Yarn-forward for textiles, tariff shift for others', 'Important for textile and agricultural trade.'),
      ('US-Singapore Free Trade Agreement', 'USSFTA', 'United States, Singapore', '2004-01-01', NULL, 'Active', 'Up to 100%', 'All goods, services, investment', 'Change in tariff classification', 'Comprehensive agreement including IP and e-commerce.'),
      ('Information Technology Agreement', 'ITA', '82 WTO members', '1997-01-01', NULL, 'Active', '100% elimination', 'IT products, semiconductors, computers, telecom', 'MFN applied - no origin rules needed', 'Expanded in 2015 (ITA-II) to cover 200+ products.')
    `);

    // Sanctions Screenings (16 items)
    await pool.query(`INSERT INTO sanctions_screenings (entity_name, entity_type, country, sanctions_list, risk_score, status, match_details, sanctions_type, authority, screened_by) VALUES
      ('Russian Direct Investment Fund', 'Entity', 'Russia', 'OFAC SDN', 99.00, 'Confirmed Match', 'Exact match on OFAC SDN list. Sanctioned Feb 2022.', 'Blocking Sanctions', 'US Treasury/OFAC', 'Sarah Chen'),
      ('Sberbank of Russia', 'Financial Institution', 'Russia', 'OFAC SDN', 98.50, 'Confirmed Match', 'Listed on SDN. Full blocking sanctions.', 'Financial Sanctions', 'US Treasury/OFAC', 'James Wilson'),
      ('Samsung Electronics', 'Company', 'South Korea', 'OFAC SDN', 1.20, 'Clear', 'No matches found on any sanctions lists.', 'None', 'Multiple', 'Admin User'),
      ('Iran Shipping Lines', 'Entity', 'Iran', 'EU Consolidated', 97.80, 'Confirmed Match', 'Listed on EU sanctions list and OFAC SDN.', 'Comprehensive Sanctions', 'EU/OFAC', 'Sarah Chen'),
      ('Huawei Technologies', 'Company', 'China', 'BIS Entity List', 95.00, 'Confirmed Match', 'On BIS Entity List. Export license required.', 'Export Controls', 'BIS/Commerce', 'James Wilson'),
      ('Toyota Motor Corp', 'Company', 'Japan', 'OFAC SDN', 0.80, 'Clear', 'No sanctions matches. Legitimate multinational.', 'None', 'Multiple', 'Admin User'),
      ('Wagner Group', 'Entity', 'Russia', 'OFAC SDN', 99.90, 'Confirmed Match', 'Designated as transnational criminal organization.', 'Blocking Sanctions', 'US Treasury/OFAC', 'Sarah Chen'),
      ('Al-Quds Force', 'Entity', 'Iran', 'OFAC SDN', 99.95, 'Confirmed Match', 'IRGC-QF designated as terrorist organization.', 'Counter-Terrorism', 'US Treasury/OFAC', 'James Wilson'),
      ('COSCO Shipping (Dalian)', 'Company', 'China', 'OFAC SDN', 75.30, 'Potential Match', 'Subsidiary was briefly listed. Current status requires verification.', 'Targeted Sanctions', 'US Treasury/OFAC', 'Admin User'),
      ('Korea Mining Development Corp', 'Entity', 'North Korea', 'UN Sanctions', 99.80, 'Confirmed Match', 'UN Security Council sanctions for weapons proliferation.', 'WMD Proliferation', 'UN/OFAC', 'Sarah Chen'),
      ('Siemens AG', 'Company', 'Germany', 'OFAC SDN', 2.50, 'Clear', 'No current sanctions. Historical Iran case resolved.', 'None', 'Multiple', 'James Wilson'),
      ('Syrian Scientific Studies Research Center', 'Entity', 'Syria', 'OFAC SDN', 98.00, 'Confirmed Match', 'CW-related designation. Full blocking sanctions.', 'WMD Sanctions', 'US Treasury/OFAC', 'Admin User'),
      ('Mahan Air', 'Entity', 'Iran', 'OFAC SDN', 99.50, 'Confirmed Match', 'Designated for support to IRGC-QF.', 'Counter-Terrorism', 'US Treasury/OFAC', 'Sarah Chen'),
      ('Standard Chartered Bank', 'Financial Institution', 'UK', 'OFAC SDN', 5.00, 'Clear', 'No current listings. Historical sanctions violations settled.', 'None', 'Multiple', 'James Wilson'),
      ('Venezuelan PDVSA', 'Entity', 'Venezuela', 'OFAC SDN', 96.00, 'Confirmed Match', 'State oil company under US sanctions.', 'Blocking Sanctions', 'US Treasury/OFAC', 'Admin User'),
      ('Alibaba Group', 'Company', 'China', 'OFAC SDN', 3.20, 'Clear', 'No sanctions matches. On PCAOB watchlist for audit concerns.', 'None', 'Multiple', 'Sarah Chen')
    `);

    // Products (16 items)
    await pool.query(`INSERT INTO products (product_name, sku, category, hs_code, description, country_origin, unit_value, currency, weight_kg, material, manufacturer, export_controlled) VALUES
      ('MacBook Pro 16"', 'ELEC-001', 'Electronics', '8471.30', '16-inch laptop, M3 Pro chip, 18GB RAM, 512GB SSD', 'China', 2499.00, 'USD', 2.14, 'Aluminum, Glass, Silicon', 'Apple Inc.', false),
      ('Organic Arabica Coffee', 'FOOD-001', 'Food & Beverage', '0901.21', 'Premium single-origin roasted coffee beans, 1kg bag', 'Colombia', 18.50, 'USD', 1.00, 'Coffee Bean', 'Cafe de Colombia', false),
      ('EV Battery Pack 75kWh', 'AUTO-001', 'Automotive', '8507.60', 'Lithium-ion battery pack for electric vehicles', 'South Korea', 8500.00, 'USD', 450.00, 'Lithium, Cobalt, Nickel', 'Samsung SDI', false),
      ('CNC Milling Machine', 'MACH-001', 'Machinery', '8459.61', '5-axis CNC vertical milling center, high precision', 'Japan', 125000.00, 'USD', 8500.00, 'Steel, Cast Iron', 'Mazak Corporation', true),
      ('Kevlar Body Armor', 'DEF-001', 'Defense', '6307.90', 'Level IIIA ballistic vest with trauma plate', 'United States', 850.00, 'USD', 3.50, 'Kevlar, Ceramic', 'Point Blank Solutions', true),
      ('Insulin Pen Needles', 'MED-001', 'Medical', '9018.32', 'Ultra-fine pen needles 4mm x 32G, box of 100', 'Ireland', 15.00, 'USD', 0.05, 'Stainless Steel, Plastic', 'Becton Dickinson', false),
      ('Chilean Cabernet Sauvignon', 'BEV-001', 'Beverages', '2204.21', '2022 vintage, Gran Reserva, 750ml bottle', 'Chile', 22.00, 'USD', 1.30, 'Glass, Cork, Wine', 'Concha y Toro', false),
      ('Carbon Fiber Sheet', 'MAT-001', 'Materials', '6815.10', '3K twill weave carbon fiber sheet, 1m x 1m x 3mm', 'Japan', 180.00, 'USD', 0.60, 'Carbon Fiber, Epoxy Resin', 'Toray Industries', true),
      ('Merino Wool Suit', 'TEX-001', 'Textiles', '6203.11', 'Men''s two-piece suit, 100% merino wool, tailored', 'Italy', 1200.00, 'USD', 1.80, 'Merino Wool', 'Ermenegildo Zegna', false),
      ('GPS Navigation Module', 'ELEC-002', 'Electronics', '8526.91', 'Multi-constellation GNSS receiver module with antenna', 'United States', 45.00, 'USD', 0.02, 'Silicon, Ceramic, PCB', 'u-blox', true),
      ('Titanium Hip Implant', 'MED-002', 'Medical', '9021.31', 'Total hip replacement prosthesis, titanium alloy', 'Switzerland', 4500.00, 'USD', 0.45, 'Titanium Alloy', 'Zimmer Biomet', false),
      ('Organic Avocado Oil', 'FOOD-002', 'Food & Beverage', '1515.90', 'Cold-pressed extra virgin avocado oil, 500ml', 'Mexico', 12.00, 'USD', 0.55, 'Avocado', 'Chosen Foods', false),
      ('Industrial Robot Arm', 'MACH-002', 'Machinery', '8479.50', '6-axis robotic arm, 10kg payload, 1.4m reach', 'Japan', 45000.00, 'USD', 250.00, 'Steel, Aluminum, Servo Motors', 'Fanuc Corporation', true),
      ('Photovoltaic Cell 400W', 'ENER-001', 'Energy', '8541.40', 'Monocrystalline silicon solar cell, 400W rated', 'Vietnam', 180.00, 'USD', 22.00, 'Silicon, Glass, Aluminum', 'JinkoSolar', false),
      ('Night Vision Goggles', 'DEF-002', 'Defense', '9005.80', 'Gen 3 image intensifier, binocular night vision', 'United States', 3200.00, 'USD', 0.65, 'Glass, Aluminum, Phosphor', 'L3Harris Technologies', true),
      ('Lithium Hexafluorophosphate', 'CHEM-001', 'Chemicals', '2826.90', 'Battery-grade electrolyte salt, 25kg drum', 'China', 850.00, 'USD', 25.00, 'Lithium, Fluorine, Phosphorus', 'Tianqi Lithium', false)
    `);

    // Audit Trail (18 items)
    await pool.query(`INSERT INTO audit_trail (action, module, entity_type, entity_id, user_name, user_email, details, ip_address, status, risk_level) VALUES
      ('CREATE', 'HS Codes', 'hs_code', '1', 'Sarah Chen', 'sarah@aicustoms.com', 'Created HS code classification for Laptop Computer - 8471.30', '192.168.1.100', 'Success', 'low'),
      ('SCREEN', 'Compliance', 'entity', '1', 'James Wilson', 'james@aicustoms.com', 'Compliance screening performed on Huawei Technologies - FLAGGED', '192.168.1.101', 'Alert', 'critical'),
      ('APPROVE', 'Documents', 'document', '1', 'Admin User', 'admin@aicustoms.com', 'Approved commercial invoice INV-2024-001 for Shenzhen Electronics shipment', '192.168.1.102', 'Success', 'low'),
      ('CALCULATE', 'Duties', 'calculation', '5', 'Sarah Chen', 'sarah@aicustoms.com', 'Duty calculation: Steel Coils from Japan - $37,500 Section 232 tariff', '192.168.1.100', 'Success', 'medium'),
      ('UPDATE', 'Regulations', 'regulation', '1', 'James Wilson', 'james@aicustoms.com', 'Updated Section 301 tariff rates for China imports', '192.168.1.101', 'Success', 'medium'),
      ('TRACK', 'Shipments', 'shipment', '6', 'Admin User', 'admin@aicustoms.com', 'Shipment EVER2345678 flagged - Section 201 duty assessment for solar panels', '192.168.1.102', 'Alert', 'high'),
      ('SCREEN', 'Sanctions', 'entity', '1', 'Sarah Chen', 'sarah@aicustoms.com', 'Sanctions screening: Russian Direct Investment Fund - CONFIRMED MATCH on OFAC SDN', '192.168.1.100', 'Alert', 'critical'),
      ('CREATE', 'Products', 'product', '4', 'James Wilson', 'james@aicustoms.com', 'Added CNC Milling Machine to product catalog - Export Controlled', '192.168.1.101', 'Success', 'high'),
      ('LOGIN', 'Auth', 'user', '1', 'Admin User', 'admin@aicustoms.com', 'Successful login from authorized IP', '192.168.1.102', 'Success', 'low'),
      ('DELETE', 'Documents', 'document', '99', 'Sarah Chen', 'sarah@aicustoms.com', 'Deleted expired customs declaration CD-2023-150', '192.168.1.100', 'Success', 'low'),
      ('AI_CLASSIFY', 'HS Codes', 'classification', 'N/A', 'James Wilson', 'james@aicustoms.com', 'AI classification requested for new electronic component - result: 8542.31', '192.168.1.101', 'Success', 'low'),
      ('EXPORT', 'Audit', 'report', 'N/A', 'Admin User', 'admin@aicustoms.com', 'Exported compliance audit report for Q4 2024', '192.168.1.102', 'Success', 'low'),
      ('SCREEN', 'Compliance', 'entity', '9', 'Sarah Chen', 'sarah@aicustoms.com', 'Tehran Industrial Group screening - BLOCKED - Iran comprehensive sanctions', '192.168.1.100', 'Alert', 'critical'),
      ('UPDATE', 'Shipments', 'shipment', '5', 'James Wilson', 'james@aicustoms.com', 'Updated DHL7890123 status to HELD - FDA inspection required', '192.168.1.101', 'Success', 'medium'),
      ('VERIFY', 'Agreements', 'agreement', '1', 'Admin User', 'admin@aicustoms.com', 'Verified USMCA origin for automotive parts shipment', '192.168.1.102', 'Success', 'low'),
      ('AI_SCREEN', 'Sanctions', 'screening', 'N/A', 'Sarah Chen', 'sarah@aicustoms.com', 'AI sanctions screening for new supplier in UAE - CLEAR', '192.168.1.100', 'Success', 'low'),
      ('CREATE', 'Duties', 'calculation', '10', 'James Wilson', 'james@aicustoms.com', 'New duty calculation for solar panel import - $33,187.50 Section 201', '192.168.1.101', 'Success', 'medium'),
      ('REVIEW', 'Compliance', 'screening', '6', 'Admin User', 'admin@aicustoms.com', 'Reviewed Global Trade Solutions Ltd screening - requires additional verification', '192.168.1.102', 'Pending', 'medium')
    `);

    console.log('Seed data inserted successfully');
  } catch (err) {
    console.error('Seed failed:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

seed();
