// AI Customs & Trade Compliance - SPA Application

const App = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  currentView: 'dashboard',
  data: {},

  features: [
    { id: 'hs-codes', name: 'HS Code Classification', icon: '\ud83d\udcca', desc: 'AI-powered tariff code classification for products', api: '/api/hs-codes', color: '#3b82f6',
      columns: ['product_name','hs_code','chapter','duty_rate','country_origin'],
      fields: [{n:'product_name',l:'Product Name',t:'text',r:true},{n:'description',l:'Description',t:'textarea'},{n:'hs_code',l:'HS Code',t:'text',r:true},{n:'chapter',l:'Chapter',t:'text'},{n:'section',l:'Section',t:'text'},{n:'duty_rate',l:'Duty Rate (%)',t:'number'},{n:'country_origin',l:'Country of Origin',t:'text'},{n:'notes',l:'Notes',t:'textarea'}],
      aiAction: 'classify', aiFields: [{n:'product_name',l:'Product Name',r:true},{n:'description',l:'Description'},{n:'material',l:'Material'},{n:'intended_use',l:'Intended Use'}]
    },
    { id: 'compliance', name: 'Trade Compliance', icon: '\ud83d\udee1\ufe0f', desc: 'Screen entities against restricted/denied party lists', api: '/api/compliance', color: '#10b981',
      columns: ['entity_name','entity_type','country','risk_level','status'],
      fields: [{n:'entity_name',l:'Entity Name',t:'text',r:true},{n:'entity_type',l:'Entity Type',t:'select',o:['Company','Individual','Government','Vessel']},{n:'country',l:'Country',t:'text'},{n:'screening_type',l:'Screening Type',t:'text'},{n:'risk_level',l:'Risk Level',t:'select',o:['low','medium','high','critical']},{n:'status',l:'Status',t:'select',o:['Cleared','Under Review','Flagged']},{n:'match_score',l:'Match Score',t:'number'},{n:'details',l:'Details',t:'textarea'},{n:'screened_by',l:'Screened By',t:'text'}],
      aiAction: 'screen-compliance', aiFields: [{n:'entity_name',l:'Entity Name',r:true},{n:'entity_type',l:'Entity Type'},{n:'country',l:'Country'}]
    },
    { id: 'documents', name: 'Customs Documentation', icon: '\ud83d\udcc4', desc: 'Generate and manage customs declarations and invoices', api: '/api/documents', color: '#8b5cf6',
      columns: ['document_type','reference_number','shipper','destination_country','status'],
      fields: [{n:'document_type',l:'Document Type',t:'select',o:['Commercial Invoice','Bill of Lading','Certificate of Origin','Customs Declaration','Packing List','Import License','Export Declaration','Dangerous Goods Declaration','Phytosanitary Certificate','ATA Carnet'],r:true},{n:'reference_number',l:'Reference Number',t:'text'},{n:'shipper',l:'Shipper',t:'text'},{n:'consignee',l:'Consignee',t:'text'},{n:'origin_country',l:'Origin Country',t:'text'},{n:'destination_country',l:'Destination Country',t:'text'},{n:'goods_description',l:'Goods Description',t:'textarea'},{n:'declared_value',l:'Declared Value',t:'number'},{n:'currency',l:'Currency',t:'select',o:['USD','EUR','GBP','CHF','JPY']},{n:'status',l:'Status',t:'select',o:['Draft','Pending Review','Approved','Filed','In Transit','Active','In Storage','Confirmed']},{n:'notes',l:'Notes',t:'textarea'}],
      aiAction: 'generate-document', aiFields: [{n:'document_type',l:'Document Type',r:true},{n:'shipper',l:'Shipper',r:true},{n:'consignee',l:'Consignee',r:true},{n:'goods_description',l:'Goods Description',r:true},{n:'origin_country',l:'Origin'},{n:'destination_country',l:'Destination'},{n:'declared_value',l:'Value'}]
    },
    { id: 'duties', name: 'Duty & Tax Calculator', icon: '\ud83d\udcb0', desc: 'Calculate import duties, taxes, and fees per shipment', api: '/api/duties', color: '#f59e0b',
      columns: ['product_name','hs_code','origin_country','declared_value','total_fees'],
      fields: [{n:'product_name',l:'Product Name',t:'text',r:true},{n:'hs_code',l:'HS Code',t:'text'},{n:'origin_country',l:'Origin Country',t:'text'},{n:'destination_country',l:'Destination Country',t:'text'},{n:'declared_value',l:'Declared Value',t:'number'},{n:'currency',l:'Currency',t:'select',o:['USD','EUR','GBP']},{n:'duty_rate',l:'Duty Rate (%)',t:'number'},{n:'duty_amount',l:'Duty Amount',t:'number'},{n:'tax_rate',l:'Tax Rate (%)',t:'number'},{n:'tax_amount',l:'Tax Amount',t:'number'},{n:'total_fees',l:'Total Fees',t:'number'},{n:'trade_agreement',l:'Trade Agreement',t:'text'},{n:'notes',l:'Notes',t:'textarea'}],
      aiAction: 'calculate-duty', aiFields: [{n:'product_name',l:'Product Name',r:true},{n:'hs_code',l:'HS Code'},{n:'origin_country',l:'Origin Country',r:true},{n:'destination_country',l:'Destination Country',r:true},{n:'declared_value',l:'Declared Value',r:true},{n:'currency',l:'Currency'}]
    },
    { id: 'regulations', name: 'Country Regulations', icon: '\ud83c\udf10', desc: 'Track import/export regulations by country', api: '/api/regulations', color: '#06b6d4',
      columns: ['country','regulation_type','title','status','authority'],
      fields: [{n:'country',l:'Country',t:'text',r:true},{n:'country_code',l:'Country Code',t:'text'},{n:'regulation_type',l:'Type',t:'select',o:['Import','Export','Import/Export']},{n:'title',l:'Title',t:'text',r:true},{n:'description',l:'Description',t:'textarea'},{n:'effective_date',l:'Effective Date',t:'date'},{n:'expiry_date',l:'Expiry Date',t:'date'},{n:'status',l:'Status',t:'select',o:['Active','Pending','Expired','Suspended']},{n:'authority',l:'Authority',t:'text'},{n:'restricted_items',l:'Restricted Items',t:'textarea'},{n:'documentation_required',l:'Documentation Required',t:'textarea'}]
    },
    { id: 'shipments', name: 'Shipment Tracking', icon: '\ud83d\ude9a', desc: 'Track cross-border shipments with compliance status', api: '/api/shipments', color: '#ec4899',
      columns: ['tracking_number','carrier','origin_country','destination_country','compliance_status','customs_status'],
      fields: [{n:'tracking_number',l:'Tracking Number',t:'text',r:true},{n:'carrier',l:'Carrier',t:'text'},{n:'origin_country',l:'Origin Country',t:'text'},{n:'destination_country',l:'Destination Country',t:'text'},{n:'shipper',l:'Shipper',t:'text'},{n:'consignee',l:'Consignee',t:'text'},{n:'goods_description',l:'Goods Description',t:'textarea'},{n:'declared_value',l:'Declared Value',t:'number'},{n:'currency',l:'Currency',t:'select',o:['USD','EUR','GBP','CHF','JPY']},{n:'weight_kg',l:'Weight (kg)',t:'number'},{n:'compliance_status',l:'Compliance Status',t:'select',o:['Cleared','Under Review','Flagged']},{n:'customs_status',l:'Customs Status',t:'select',o:['Released','In Customs','Held','Pending']},{n:'estimated_arrival',l:'Estimated Arrival',t:'date'},{n:'notes',l:'Notes',t:'textarea'}]
    },
    { id: 'agreements', name: 'Trade Agreements', icon: '\ud83e\udd1d', desc: 'Manage free trade agreements and preferential tariffs', api: '/api/agreements', color: '#14b8a6',
      columns: ['agreement_name','acronym','status','tariff_reduction','effective_date'],
      fields: [{n:'agreement_name',l:'Agreement Name',t:'text',r:true},{n:'acronym',l:'Acronym',t:'text'},{n:'member_countries',l:'Member Countries',t:'textarea'},{n:'effective_date',l:'Effective Date',t:'date'},{n:'expiry_date',l:'Expiry Date',t:'date'},{n:'status',l:'Status',t:'select',o:['Active','Active (Provisional)','Signed','Negotiating','Suspended','Expired']},{n:'tariff_reduction',l:'Tariff Reduction',t:'text'},{n:'eligible_products',l:'Eligible Products',t:'textarea'},{n:'rules_of_origin',l:'Rules of Origin',t:'textarea'},{n:'notes',l:'Notes',t:'textarea'}]
    },
    { id: 'sanctions', name: 'Sanctions Screening', icon: '\u26a0\ufe0f', desc: 'AI-powered sanctions and embargo screening', api: '/api/sanctions', color: '#ef4444',
      columns: ['entity_name','entity_type','country','sanctions_list','risk_score','status'],
      fields: [{n:'entity_name',l:'Entity Name',t:'text',r:true},{n:'entity_type',l:'Entity Type',t:'select',o:['Entity','Company','Individual','Financial Institution','Vessel']},{n:'country',l:'Country',t:'text'},{n:'sanctions_list',l:'Sanctions List',t:'text'},{n:'risk_score',l:'Risk Score',t:'number'},{n:'status',l:'Status',t:'select',o:['Clear','Potential Match','Confirmed Match']},{n:'match_details',l:'Match Details',t:'textarea'},{n:'sanctions_type',l:'Sanctions Type',t:'text'},{n:'authority',l:'Authority',t:'text'},{n:'screened_by',l:'Screened By',t:'text'}],
      aiAction: 'screen-sanctions', aiFields: [{n:'entity_name',l:'Entity Name',r:true},{n:'entity_type',l:'Entity Type'},{n:'country',l:'Country'}]
    },
    { id: 'products', name: 'Product Database', icon: '\ud83d\udce6', desc: 'Maintain product catalog with trade classifications', api: '/api/products', color: '#a855f7',
      columns: ['product_name','sku','category','hs_code','country_origin','export_controlled'],
      fields: [{n:'product_name',l:'Product Name',t:'text',r:true},{n:'sku',l:'SKU',t:'text'},{n:'category',l:'Category',t:'text'},{n:'hs_code',l:'HS Code',t:'text'},{n:'description',l:'Description',t:'textarea'},{n:'country_origin',l:'Country of Origin',t:'text'},{n:'unit_value',l:'Unit Value',t:'number'},{n:'currency',l:'Currency',t:'select',o:['USD','EUR','GBP']},{n:'weight_kg',l:'Weight (kg)',t:'number'},{n:'material',l:'Material',t:'text'},{n:'manufacturer',l:'Manufacturer',t:'text'},{n:'export_controlled',l:'Export Controlled',t:'select',o:['true','false']}]
    },
    { id: 'audit', name: 'Audit Trail', icon: '\ud83d\udcdd', desc: 'Track all compliance actions and decisions', api: '/api/audit', color: '#64748b',
      columns: ['action','module','user_name','status','risk_level','created_at'],
      fields: [{n:'action',l:'Action',t:'text',r:true},{n:'module',l:'Module',t:'text'},{n:'entity_type',l:'Entity Type',t:'text'},{n:'entity_id',l:'Entity ID',t:'text'},{n:'user_name',l:'User Name',t:'text'},{n:'user_email',l:'User Email',t:'text'},{n:'details',l:'Details',t:'textarea'},{n:'ip_address',l:'IP Address',t:'text'},{n:'status',l:'Status',t:'select',o:['Success','Alert','Pending','Failed']},{n:'risk_level',l:'Risk Level',t:'select',o:['low','medium','high','critical']}]
    }
  ],

  init() {
    if (this.token && this.user) {
      this.showApp();
    } else {
      this.showLogin();
    }
  },

  // ─── API ───
  async api(url, opts = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const res = await fetch(url, { ...opts, headers: { ...headers, ...(opts.headers||{}) } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  // ─── Toast ───
  toast(msg, type = 'info') {
    const c = document.getElementById('toasts');
    const icons = { success: '\u2705', error: '\u274c', info: '\u2139\ufe0f' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${icons[type]||''}</span><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  },

  // ─── Modal ───
  openModal(html) {
    document.getElementById('modal').innerHTML = html;
    document.getElementById('modal-overlay').classList.add('active');
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
  },

  // ─── Login ───
  showLogin() {
    document.getElementById('app').innerHTML = `
      <div class="login-container">
        <div class="login-box">
          <div class="logo">
            <h1>\u2693 AI Customs</h1>
            <p>Trade Compliance Platform</p>
          </div>
          <form id="login-form">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="login-email" placeholder="Enter your email" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="login-password" placeholder="Enter your password" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Sign In</button>
          </form>
          <button class="btn-autofill" id="btn-autofill">\u26a1 Auto-fill Demo Credentials</button>
        </div>
      </div>`;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const data = await this.api('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: document.getElementById('login-email').value,
            password: document.getElementById('login-password').value
          })
        });
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        this.showApp();
        this.toast('Welcome back, ' + data.user.name, 'success');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });

    document.getElementById('btn-autofill').addEventListener('click', () => {
      document.getElementById('login-email').value = 'admin@aicustoms.com';
      document.getElementById('login-password').value = 'admin123';
    });
  },

  // ─── App Shell ───
  showApp() {
    const initials = this.user?.name?.split(' ').map(w=>w[0]).join('') || 'U';
    document.getElementById('app').innerHTML = `
      <div class="app">
        <aside class="sidebar">
          <div class="sidebar-header">
            <h2>\u2693 AI Customs</h2>
            <span>Trade Compliance Platform</span>
          </div>
          <nav class="sidebar-nav">
            <div class="nav-item active" data-view="dashboard">
              <span class="nav-icon">\ud83c\udfe0</span> Dashboard
            </div>
            ${this.features.map(f => `
              <div class="nav-item" data-view="${f.id}">
                <span class="nav-icon">${f.icon}</span> ${f.name}
              </div>
            `).join('')}
          </nav>
          <div class="sidebar-footer">
            <div class="user-info">
              <div class="user-avatar">${initials}</div>
              <div class="user-details">
                <div class="user-name">${this.user?.name||'User'}</div>
                <div class="user-role">${this.user?.role||'analyst'}</div>
              </div>
              <button class="btn-logout" id="btn-logout" title="Logout">\u23fb</button>
            </div>
          </div>
        </aside>
        <main class="main-content" id="main-content"></main>
      </div>`;

    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
        const view = el.dataset.view;
        if (view === 'dashboard') this.showDashboard();
        else this.showFeaturePage(view);
      });
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.token = null;
      this.user = null;
      this.showLogin();
    });

    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') this.closeModal();
    });

    this.showDashboard();
  },

  // ─── Dashboard ───
  async showDashboard() {
    this.currentView = 'dashboard';
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p>AI-powered customs and trade compliance overview</p>
      </div>
      <div class="stats-row" id="stats-row">
        <div class="stat-card"><div class="stat-label">Loading...</div><div class="stat-value">--</div></div>
        <div class="stat-card"><div class="stat-label">Loading...</div><div class="stat-value">--</div></div>
        <div class="stat-card"><div class="stat-label">Loading...</div><div class="stat-value">--</div></div>
        <div class="stat-card"><div class="stat-label">Loading...</div><div class="stat-value">--</div></div>
      </div>
      <h2 style="margin-bottom:20px;font-size:20px;">Features</h2>
      <div class="feature-grid" id="feature-grid"></div>`;

    // Load counts
    const counts = {};
    await Promise.all(this.features.map(async f => {
      try {
        const data = await this.api(f.api);
        counts[f.id] = Array.isArray(data) ? data.length : 0;
      } catch { counts[f.id] = 0; }
    }));

    const totalItems = Object.values(counts).reduce((a,b) => a+b, 0);
    document.getElementById('stats-row').innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Total Records</div>
        <div class="stat-value">${totalItems}</div>
        <div class="stat-change positive">Across all modules</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Screenings</div>
        <div class="stat-value">${(counts['compliance']||0)+(counts['sanctions']||0)}</div>
        <div class="stat-change">Compliance & Sanctions</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Shipments</div>
        <div class="stat-value">${counts['shipments']||0}</div>
        <div class="stat-change positive">Cross-border tracking</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Trade Agreements</div>
        <div class="stat-value">${counts['agreements']||0}</div>
        <div class="stat-change">Active agreements</div>
      </div>`;

    document.getElementById('feature-grid').innerHTML = this.features.map(f => `
      <div class="feature-card" data-feature="${f.id}">
        <div class="feature-icon">${f.icon}</div>
        <h3>${f.name}</h3>
        <p>${f.desc}</p>
        <div class="feature-count"><span>${counts[f.id]||0}</span> records</div>
      </div>
    `).join('');

    document.querySelectorAll('.feature-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.feature;
        document.querySelectorAll('.nav-item').forEach(n => {
          n.classList.toggle('active', n.dataset.view === id);
        });
        this.showFeaturePage(id);
      });
    });
  },

  // ─── Feature Page ───
  async showFeaturePage(featureId) {
    this.currentView = featureId;
    const feature = this.features.find(f => f.id === featureId);
    if (!feature) return;
    const main = document.getElementById('main-content');

    let aiPanelHtml = '';
    if (feature.aiAction) {
      aiPanelHtml = `
        <div class="ai-panel">
          <div class="ai-panel-header">
            <h3>\u2728 AI ${feature.name}</h3>
            <button class="btn btn-sm btn-secondary" id="toggle-ai-panel">Toggle</button>
          </div>
          <div class="ai-panel-body" id="ai-panel-body" style="display:none;">
            <form id="ai-form">
              <div class="ai-form-row">
                ${feature.aiFields.map(f => `
                  <div class="form-group">
                    <label>${f.l}</label>
                    <input type="text" name="${f.n}" ${f.r?'required':''} placeholder="Enter ${f.l.toLowerCase()}">
                  </div>
                `).join('')}
              </div>
              <button type="submit" class="btn btn-primary btn-sm">\u2728 Run AI Analysis</button>
            </form>
            <div id="ai-result-container"></div>
          </div>
        </div>`;
    }

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <button class="btn-back" id="btn-back">\u2190</button>
          <h1>${feature.icon} ${feature.name}</h1>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="btn-new-item">\u002b New Item</button>
        </div>
      </div>
      ${aiPanelHtml}
      <div class="data-table-container">
        <div class="table-toolbar">
          <div class="table-search">
            <input type="text" id="table-search" placeholder="Search...">
          </div>
        </div>
        <div style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>${feature.columns.map(c => `<th>${this.formatLabel(c)}</th>`).join('')}</tr>
            </thead>
            <tbody id="table-body">
              <tr><td colspan="${feature.columns.length}" class="loading"><div class="spinner"></div> Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>`;

    document.getElementById('btn-back').addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === 'dashboard'));
      this.showDashboard();
    });

    document.getElementById('btn-new-item').addEventListener('click', () => this.showFormModal(feature));

    if (feature.aiAction) {
      document.getElementById('toggle-ai-panel').addEventListener('click', () => {
        const body = document.getElementById('ai-panel-body');
        body.style.display = body.style.display === 'none' ? 'block' : 'none';
      });
      document.getElementById('ai-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.runAI(feature);
      });
    }

    // Search
    document.getElementById('table-search').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#table-body tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });

    // Load data
    try {
      const data = await this.api(feature.api);
      this.data[featureId] = data;
      this.renderTable(feature, data);
    } catch (err) {
      document.getElementById('table-body').innerHTML = `<tr><td colspan="${feature.columns.length}" style="padding:20px;color:var(--danger)">${err.message}</td></tr>`;
    }
  },

  renderTable(feature, data) {
    const tbody = document.getElementById('table-body');
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="${feature.columns.length}" style="padding:40px;text-align:center;color:var(--text-muted)">No records found</td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(row => `
      <tr data-id="${row.id}">
        ${feature.columns.map(c => `<td>${this.formatCell(c, row[c])}</td>`).join('')}
      </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(tr => {
      tr.addEventListener('click', () => {
        const item = data.find(d => d.id == tr.dataset.id);
        if (item) this.showDetailModal(feature, item);
      });
    });
  },

  formatLabel(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  },

  formatCell(col, val) {
    if (val === null || val === undefined) return '<span style="color:var(--text-muted)">--</span>';
    if (col === 'risk_level' || col === 'risk_score_level') {
      const colors = { low: 'success', medium: 'warning', high: 'danger', critical: 'danger' };
      return `<span class="badge badge-${colors[val]||'neutral'}">${val}</span>`;
    }
    if (col === 'status' || col === 'compliance_status' || col === 'customs_status') {
      const colors = {
        'Cleared': 'success', 'Approved': 'success', 'Active': 'success', 'Released': 'success', 'Clear': 'success', 'Success': 'success', 'Filed': 'info', 'Confirmed': 'success',
        'Under Review': 'warning', 'Pending Review': 'warning', 'Pending': 'warning', 'In Transit': 'info', 'In Customs': 'warning', 'In Storage': 'info', 'Active (Provisional)': 'info', 'Signed': 'info',
        'Flagged': 'danger', 'Held': 'danger', 'Confirmed Match': 'danger', 'Potential Match': 'warning', 'Alert': 'warning'
      };
      return `<span class="badge badge-${colors[val]||'neutral'}">${val}</span>`;
    }
    if (col === 'export_controlled') {
      return val === true || val === 'true' ? '<span class="badge badge-danger">Yes</span>' : '<span class="badge badge-success">No</span>';
    }
    if (col === 'risk_score' || col === 'match_score') {
      const v = parseFloat(val);
      const color = v >= 80 ? 'var(--danger)' : v >= 40 ? 'var(--warning)' : 'var(--success)';
      return `<span style="color:${color};font-weight:600">${v.toFixed(1)}</span>`;
    }
    if (col === 'duty_rate') return val !== null ? `${parseFloat(val).toFixed(2)}%` : '--';
    if (col === 'declared_value' || col === 'total_fees' || col === 'unit_value') return val !== null ? `$${parseFloat(val).toLocaleString()}` : '--';
    if (col === 'created_at' || col === 'updated_at' || col === 'effective_date' || col === 'estimated_arrival') {
      if (!val) return '--';
      return new Date(val).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
    }
    const s = String(val);
    return s.length > 50 ? s.substring(0, 50) + '...' : s;
  },

  // ─── Detail Modal ───
  showDetailModal(feature, item) {
    const fields = feature.fields;
    const detailHtml = fields.map(f => `
      <div class="detail-item ${f.t === 'textarea' ? 'full-width' : ''}">
        <div class="detail-label">${f.l}</div>
        <div class="detail-value">${this.formatCell(f.n, item[f.n])}</div>
      </div>
    `).join('');

    this.openModal(`
      <div class="modal-header">
        <h2>${feature.icon} ${item[feature.fields[0].n] || 'Item Details'}</h2>
        <button class="modal-close" onclick="App.closeModal()">\u00d7</button>
      </div>
      <div class="modal-body">
        <div class="detail-grid">${detailHtml}</div>
        <div class="detail-item full-width" style="margin-top:16px">
          <div class="detail-label">Record ID</div>
          <div class="detail-value">#${item.id}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-danger btn-sm" id="btn-delete-item">Delete</button>
        <button class="btn btn-secondary btn-sm" id="btn-edit-item">Edit</button>
      </div>
    `);

    document.getElementById('btn-edit-item').addEventListener('click', () => {
      this.closeModal();
      this.showFormModal(feature, item);
    });

    document.getElementById('btn-delete-item').addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this item?')) return;
      try {
        await this.api(`${feature.api}/${item.id}`, { method: 'DELETE' });
        this.closeModal();
        this.toast('Item deleted successfully', 'success');
        this.showFeaturePage(feature.id);
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  // ─── Form Modal ───
  showFormModal(feature, item = null) {
    const isEdit = !!item;
    const formFields = feature.fields.map(f => {
      const val = item ? (item[f.n] || '') : '';
      let input;
      if (f.t === 'select') {
        input = `<select name="${f.n}" ${f.r?'required':''}>
          <option value="">Select...</option>
          ${f.o.map(o => `<option value="${o}" ${val==o?'selected':''}>${o}</option>`).join('')}
        </select>`;
      } else if (f.t === 'textarea') {
        input = `<textarea name="${f.n}" ${f.r?'required':''}>${val}</textarea>`;
      } else {
        input = `<input type="${f.t||'text'}" name="${f.n}" value="${val}" ${f.r?'required':''} step="any">`;
      }
      return `<div class="form-group"><label>${f.l}</label>${input}</div>`;
    }).join('');

    this.openModal(`
      <div class="modal-header">
        <h2>${isEdit ? 'Edit' : 'New'} ${feature.name}</h2>
        <button class="modal-close" onclick="App.closeModal()">\u00d7</button>
      </div>
      <form id="item-form">
        <div class="modal-body">${formFields}</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-sm" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">${isEdit ? 'Update' : 'Create'}</button>
        </div>
      </form>
    `);

    document.getElementById('item-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = {};
      const fd = new FormData(e.target);
      fd.forEach((v, k) => { formData[k] = v; });

      try {
        if (isEdit) {
          await this.api(`${feature.api}/${item.id}`, { method: 'PUT', body: JSON.stringify(formData) });
          this.toast('Item updated successfully', 'success');
        } else {
          await this.api(feature.api, { method: 'POST', body: JSON.stringify(formData) });
          this.toast('Item created successfully', 'success');
        }
        this.closeModal();
        this.showFeaturePage(feature.id);
      } catch (err) {
        this.toast(err.message, 'error');
      }
    });
  },

  // ─── AI ───
  async runAI(feature) {
    const form = document.getElementById('ai-form');
    const formData = {};
    new FormData(form).forEach((v, k) => { formData[k] = v; });

    const container = document.getElementById('ai-result-container');
    container.innerHTML = `<div class="loading"><div class="spinner"></div> AI is analyzing... This may take a moment.</div>`;

    try {
      const result = await this.api(`/api/ai/${feature.aiAction}`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      this.renderAIResult(feature, result, container);
    } catch (err) {
      container.innerHTML = `<div class="ai-result"><div class="ai-result-header"><span class="ai-icon">\u274c</span><h3>Error</h3></div><div class="ai-result-body"><p>${err.message}</p></div></div>`;
    }
  },

  renderAIResult(feature, result, container) {
    const data = result.classification || result.screening || result.sanctions || result.calculation || result.document;
    if (!data) {
      container.innerHTML = '<p style="color:var(--text-muted)">No result returned.</p>';
      return;
    }

    // If raw response, display nicely
    if (data.raw_response) {
      container.innerHTML = `
        <div class="ai-result">
          <div class="ai-result-header"><span class="ai-icon">\u2728</span><h3>AI Response</h3></div>
          <div class="ai-result-body"><div style="white-space:pre-wrap;font-size:14px;line-height:1.6">${data.raw_response}</div></div>
        </div>`;
      return;
    }

    let html = '';

    if (feature.aiAction === 'classify') {
      html = this.renderClassificationResult(data);
    } else if (feature.aiAction === 'screen-compliance') {
      html = this.renderComplianceResult(data);
    } else if (feature.aiAction === 'screen-sanctions') {
      html = this.renderSanctionsResult(data);
    } else if (feature.aiAction === 'calculate-duty') {
      html = this.renderDutyResult(data);
    } else if (feature.aiAction === 'generate-document') {
      html = this.renderDocumentResult(data);
    }

    container.innerHTML = `
      <div class="ai-result">
        <div class="ai-result-header">
          <span class="ai-icon">\u2728</span>
          <h3>AI Analysis Result</h3>
        </div>
        <div class="ai-result-body">${html}</div>
      </div>`;
  },

  renderClassificationResult(d) {
    const altCodes = (d.alternative_codes || []).map(a =>
      `<li><strong>${a.code}</strong> - ${a.description}</li>`
    ).join('');

    return `
      <div class="ai-section">
        <h4>Classification Result</h4>
        <div class="ai-grid">
          <div class="ai-grid-item"><div class="label">HS Code</div><div class="value" style="color:var(--accent)">${d.hs_code || '--'}</div></div>
          <div class="ai-grid-item"><div class="label">Chapter</div><div class="value">${d.chapter || '--'}</div></div>
          <div class="ai-grid-item"><div class="label">Section</div><div class="value">${d.section || '--'}</div></div>
          <div class="ai-grid-item"><div class="label">Estimated Duty</div><div class="value">${d.duty_rate_estimate || '--'}</div></div>
        </div>
      </div>
      <div class="ai-section">
        <h4>Confidence</h4>
        <div style="font-size:20px;font-weight:700;margin-bottom:4px">${d.confidence || '--'}</div>
        <div class="ai-score-bar"><div class="ai-score-fill" style="width:${parseInt(d.confidence)||75}%;background:var(--gradient-2)"></div></div>
      </div>
      <div class="ai-section">
        <h4>Description</h4>
        <p style="line-height:1.6">${d.description || '--'}</p>
      </div>
      ${d.reasoning ? `<div class="ai-section"><h4>Reasoning</h4><p style="line-height:1.6">${d.reasoning}</p></div>` : ''}
      ${altCodes ? `<div class="ai-section"><h4>Alternative Codes</h4><ul class="ai-list">${altCodes}</ul></div>` : ''}`;
  },

  renderComplianceResult(d) {
    const results = (d.screening_results || []).map(r =>
      `<li><strong>${r.list_name}</strong>: ${r.match_type} - ${r.details}</li>`
    ).join('');

    const riskColor = { low:'var(--success)', medium:'var(--warning)', high:'var(--danger)', critical:'var(--danger)' };

    return `
      <div class="ai-section">
        <h4>Screening Summary</h4>
        <div class="ai-grid">
          <div class="ai-grid-item"><div class="label">Risk Level</div><div class="value" style="color:${riskColor[d.risk_level]||'var(--text-primary)'}">${(d.risk_level||'--').toUpperCase()}</div></div>
          <div class="ai-grid-item"><div class="label">Match Found</div><div class="value">${d.match_found ? '\u274c Yes' : '\u2705 No'}</div></div>
          <div class="ai-grid-item"><div class="label">Match Score</div><div class="value">${d.match_score || 0}/100</div></div>
        </div>
      </div>
      <div class="ai-section">
        <h4>Summary</h4>
        <p style="line-height:1.6">${d.summary || '--'}</p>
      </div>
      ${results ? `<div class="ai-section"><h4>Screening Results</h4><ul class="ai-list">${results}</ul></div>` : ''}
      ${d.recommendations ? `<div class="ai-section"><h4>Recommendations</h4><p style="line-height:1.6">${d.recommendations}</p></div>` : ''}`;
  },

  renderSanctionsResult(d) {
    const matches = (d.matches || []).map(m =>
      `<li><strong>${m.list}</strong> (${m.confidence || '--'}% confidence): ${m.match_type} - ${m.details}</li>`
    ).join('');
    const lists = (d.lists_checked || []).map(l => `<span class="ai-tag">${l}</span>`).join('');

    const statusColor = { 'clear':'var(--success)', 'potential_match':'var(--warning)', 'confirmed_match':'var(--danger)' };

    return `
      <div class="ai-section">
        <h4>Sanctions Status</h4>
        <div class="ai-grid">
          <div class="ai-grid-item"><div class="label">Status</div><div class="value" style="color:${statusColor[d.sanctions_status]||'var(--text-primary)'}">${(d.sanctions_status||'--').replace(/_/g,' ').toUpperCase()}</div></div>
          <div class="ai-grid-item"><div class="label">Risk Score</div><div class="value">${d.risk_score || 0}/100</div></div>
          <div class="ai-grid-item"><div class="label">Embargo Status</div><div class="value">${d.embargo_status || '--'}</div></div>
        </div>
        <div class="ai-score-bar" style="margin-top:12px"><div class="ai-score-fill" style="width:${d.risk_score||0}%;background:${(d.risk_score||0)>60?'var(--danger)':'var(--success)'}"></div></div>
      </div>
      ${lists ? `<div class="ai-section"><h4>Lists Checked</h4><div>${lists}</div></div>` : ''}
      ${matches ? `<div class="ai-section"><h4>Matches</h4><ul class="ai-list">${matches}</ul></div>` : ''}
      <div class="ai-section">
        <h4>Summary</h4>
        <p style="line-height:1.6">${d.summary || '--'}</p>
      </div>
      ${d.recommendations ? `<div class="ai-section"><h4>Recommendations</h4><p style="line-height:1.6">${d.recommendations}</p></div>` : ''}`;
  },

  renderDutyResult(d) {
    const breakdown = (d.calculation_breakdown || []).map(b =>
      `<li><strong>${b.item}</strong>: ${b.rate || '--'} = $${b.amount || 0}</li>`
    ).join('');
    const agreements = (d.applicable_agreements || []).map(a => `<span class="ai-tag">${a}</span>`).join('');

    return `
      <div class="ai-section">
        <h4>Duty Calculation</h4>
        <div class="ai-grid">
          <div class="ai-grid-item"><div class="label">Duty Rate</div><div class="value">${d.duty_rate || '--'}%</div></div>
          <div class="ai-grid-item"><div class="label">Duty Amount</div><div class="value" style="color:var(--warning)">$${d.duty_amount || 0}</div></div>
          <div class="ai-grid-item"><div class="label">VAT Rate</div><div class="value">${d.vat_rate || 0}%</div></div>
          <div class="ai-grid-item"><div class="label">VAT Amount</div><div class="value">$${d.vat_amount || 0}</div></div>
          <div class="ai-grid-item"><div class="label">Excise Tax</div><div class="value">$${d.excise_tax || 0}</div></div>
          <div class="ai-grid-item"><div class="label">Processing Fee</div><div class="value">$${d.processing_fee || 0}</div></div>
        </div>
      </div>
      <div class="ai-section">
        <h4>Total Landed Cost</h4>
        <div class="value-lg" style="color:var(--accent)">$${d.total_landed_cost || '--'}</div>
        ${d.duty_savings ? `<p style="color:var(--success);margin-top:8px">\u2705 Potential savings: $${d.duty_savings}</p>` : ''}
      </div>
      ${breakdown ? `<div class="ai-section"><h4>Calculation Breakdown</h4><ul class="ai-list">${breakdown}</ul></div>` : ''}
      ${agreements ? `<div class="ai-section"><h4>Applicable Agreements</h4><div>${agreements}</div></div>` : ''}
      ${d.notes ? `<div class="ai-section"><h4>Notes</h4><p style="line-height:1.6">${d.notes}</p></div>` : ''}`;
  },

  renderDocumentResult(d) {
    const goods = (d.goods || []).map(g =>
      `<li>${g.description} - Qty: ${g.quantity}, Unit: $${g.unit_price}, Total: $${g.total}</li>`
    ).join('');
    const declarations = (d.declarations || []).map(dec =>
      `<li>${dec}</li>`
    ).join('');

    return `
      <div class="ai-section">
        <h4>Document Details</h4>
        <div class="ai-grid">
          <div class="ai-grid-item"><div class="label">Title</div><div class="value">${d.document_title || '--'}</div></div>
          <div class="ai-grid-item"><div class="label">Reference</div><div class="value">${d.reference_number || '--'}</div></div>
          <div class="ai-grid-item"><div class="label">Date</div><div class="value">${d.date || '--'}</div></div>
          <div class="ai-grid-item"><div class="label">Terms</div><div class="value">${d.terms_of_sale || '--'}</div></div>
        </div>
      </div>
      <div class="ai-section">
        <h4>Parties</h4>
        <div class="ai-grid">
          <div class="ai-grid-item"><div class="label">Shipper</div><div class="value">${typeof d.shipper_details === 'object' ? JSON.stringify(d.shipper_details) : (d.shipper_details || '--')}</div></div>
          <div class="ai-grid-item"><div class="label">Consignee</div><div class="value">${typeof d.consignee_details === 'object' ? JSON.stringify(d.consignee_details) : (d.consignee_details || '--')}</div></div>
        </div>
      </div>
      ${goods ? `<div class="ai-section"><h4>Goods</h4><ul class="ai-list">${goods}</ul><p style="margin-top:10px;font-weight:600">Subtotal: $${d.subtotal || '--'}</p></div>` : ''}
      ${declarations ? `<div class="ai-section"><h4>Declarations</h4><ul class="ai-list">${declarations}</ul></div>` : ''}
      ${d.regulatory_notes ? `<div class="ai-section"><h4>Regulatory Notes</h4><p style="line-height:1.6">${d.regulatory_notes}</p></div>` : ''}
      ${d.special_instructions ? `<div class="ai-section"><h4>Special Instructions</h4><p style="line-height:1.6">${d.special_instructions}</p></div>` : ''}`;
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => App.init());
