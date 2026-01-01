const CATEGORY_MAP = {
  "Дотор засал": ["Будаг", "Хана тааз засвар", "Шал"],
  "Тавилга угсралт": ["Гэр ахуйн", "Оффис", "Зөөвөр угсрах"],
  "Цэвэрлэгээ": ["Ерөнхий их", "Орон сууц/байшин", "Оффис"],
  "Нүүлгэлт": ["Оффис нүүлгэлт", "Том овор хүнд даац", "Гэр нүүлгэлт"],
  "Сантехник": ["Дотоод шугам", "Гал тогоо/угаалтуур", "Ариун цэврийн өрөө"],
  "Гадна талбай": ["Зүлэг хадах", "Цас цэвэрлэх", "Явган зам/хашаа"],
  "Цахилгаан": ["Гэрэлтүүлэг", "Розетка/унтраалга", "Засвар үйлчилгээ"]
};

class ChProfilePopup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.user = null;
    this.workerProfile = null;
    this.isEditing = false;
  }

  connectedCallback() {
    this.render();
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  // API to open the drawer
  open(data) {
    this.fetchDataAndOpen();
  }

  async fetchDataAndOpen() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      this.user = data.user;
      this.workerProfile = data.workerProfile;
      this.isEditing = false;

      this.updateContent();

      const backdrop = this.shadowRoot.querySelector('.backdrop');
      const drawer = this.shadowRoot.querySelector('.drawer');
      backdrop.classList.add('open');
      requestAnimationFrame(() => {
        drawer.classList.add('open');
      });

    } catch (e) {
      console.error(e);
    }
  }

  // API to close the drawer
  close() {
    const backdrop = this.shadowRoot.querySelector('.backdrop');
    const drawer = this.shadowRoot.querySelector('.drawer');

    drawer.classList.remove('open');
    setTimeout(() => {
      backdrop.classList.remove('open');
    }, 300); // Wait for drawer transition
  }

  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.updateContent();
  }

  async saveProfile() {
    const shadow = this.shadowRoot;
    // Gather data
    const payload = {};

    // Common fields
    const phoneInput = shadow.querySelector('#edit-phone');
    if (phoneInput) payload.phone = phoneInput.value;

    // Worker fields
    const descInput = shadow.querySelector('#edit-desc');
    if (descInput) payload.description = descInput.value;

    const catInput = shadow.querySelector('#edit-cat');
    if (catInput) payload.category = catInput.value;

    // Subcategories
    const subInputs = shadow.querySelectorAll('input[name="edit-subcat"]:checked');
    if (subInputs.length > 0) {
      payload.subcategories = Array.from(subInputs).map(i => i.value);
    } else {
      // If editing and none selected, maybe send empty array? 
      // Logic: if category changed, subcategories must strictly match.
      // If edit mode active for worker, we include it.
      if (this.user.role === 'Worker') payload.subcategories = [];
    }

    try {
      const res = await fetch('/api/workers/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        // Update local state
        this.user = data.user;
        this.workerProfile = data.workerProfile;
        this.isEditing = false;
        this.updateContent();
        // Show toast if available (assuming ch-toast is on page)
        const toast = document.querySelector('ch-toast');
        if (toast) toast.show('Амжилттай хадгаллаа!', 'success');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Save failed');
    }
  }

  updateContent() {
    const content = this.shadowRoot.querySelector('#content');
    if (!this.user) {
      content.innerHTML = '<p>Loading...</p>';
      return;
    }

    if (this.user.role === 'Worker') {
      content.innerHTML = this.getWorkerTemplate(this.user, this.workerProfile, this.isEditing);

      // Worker Edit Logic
      if (this.isEditing) {
        const catSelect = this.shadowRoot.querySelector('#edit-cat');
        if (catSelect) {
          // Initial render of subcategories
          this.updateSubcategories(catSelect.value);

          // Listener
          catSelect.addEventListener('change', () => {
            this.updateSubcategories(catSelect.value);
          });
        }
      }
    } else {
      content.innerHTML = this.getUserTemplate(this.user, this.isEditing);
    }

    // Re-attach actions
    const editBtn = this.shadowRoot.querySelector('#edit-btn');
    if (editBtn) editBtn.onclick = () => this.toggleEdit();

    const saveBtn = this.shadowRoot.querySelector('#save-btn');
    if (saveBtn) saveBtn.onclick = () => this.saveProfile();

    const cancelBtn = this.shadowRoot.querySelector('#cancel-btn');
    if (cancelBtn) cancelBtn.onclick = () => this.toggleEdit();
  }

  updateSubcategories(category) {
    const container = this.shadowRoot.querySelector('#edit-subcat-container');
    if (!container) return;

    const subs = CATEGORY_MAP[category] || [];
    const currentSubs = this.workerProfile.subcategories || [];

    if (subs.length === 0) {
      container.innerHTML = '<span style="font-size:12px; color:#94A3B8;">Дэд категори байхгүй</span>';
      return;
    }

    container.innerHTML = subs.map(sub => {
      const isChecked = currentSubs.includes(sub) ? 'checked' : '';
      return `
            <label style="display:flex; align-items:center; gap:8px; width:48%; font-size:13px; margin-bottom:6px;">
                <input type="checkbox" name="edit-subcat" value="${sub}" ${isChecked} style="accent-color:#213448;">
                ${sub}
            </label>
          `;
    }).join('');

    // Use flex wrap for 2 columns
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
  }

  getUserTemplate(user, isEditing) {
    // Simple User Edit (Phone only for now)
    return `
      <div class="profile-header">
        <div class="avatar">${user.firstname ? user.firstname[0].toUpperCase() : 'U'}</div>
        <h2>${user.lastname} ${user.firstname}</h2>
        <span class="role-badge user">Хэрэглэгч</span>
      </div>
      
      <div class="info-group">
        <label>Email</label>
        <p>${user.email}</p>
      </div>

       <div class="info-group">
        <label>Утас</label>
        ${isEditing
        ? `<input type="text" id="edit-phone" value="${user.phone || ''}" class="edit-input" />`
        : `<p>${user.phone || 'Оруулаагүй'}</p>`
      }
      </div>

      <div class="info-group">
        <label>Хаяг</label>
        <p>${user.address || 'Оруулаагүй'}</p>
      </div>

      <div class="actions">
        ${isEditing
        ? `<button id="save-btn" class="action-btn save">Хадгалах</button>
               <button id="cancel-btn" class="action-btn cancel">Болих</button>`
        : `<button id="edit-btn" class="action-btn edit">Засах</button>`
      }
      </div>
    `;
  }

  getWorkerTemplate(user, worker, isEditing) {
    // If worker profile not yet loaded/created
    const w = worker || {};
    const cat = w.category || '';
    const desc = w.description || '';
    const subcats = w.subcategories || [];

    return `
      <div class="profile-header">
        <div class="avatar worker">${user.firstname ? user.firstname[0].toUpperCase() : 'W'}</div>
        <h2>${user.lastname} ${user.firstname}</h2>
        <span class="role-badge worker">Ажилтан</span>
         <!-- Top stats -->
         <div class="stats-row">
            <span>⭐ ${w.rating || '5.0'}</span>
            <span>🤝 ${w.jobs || 0} ажил</span>
         </div>
      </div>
      
      <div class="info-group">
        <label>Email</label>
        <p>${user.email}</p>
      </div>

      <div class="info-group">
        <label>Категори</label>
        ${isEditing
        ? `<select id="edit-cat" class="edit-input">
                <option value="Дотор засал" ${cat === 'Дотор засал' ? 'selected' : ''}>Дотор засал</option>
                <option value="Тавилга угсралт" ${cat === 'Тавилга угсралт' ? 'selected' : ''}>Тавилга угсралт</option>
                <option value="Цэвэрлэгээ" ${cat === 'Цэвэрлэгээ' ? 'selected' : ''}>Цэвэрлэгээ</option>
                <option value="Нүүлгэлт" ${cat === 'Нүүлгэлт' ? 'selected' : ''}>Нүүлгэлт</option>
                <option value="Сантехник" ${cat === 'Сантехник' ? 'selected' : ''}>Сантехник</option>
                <option value="Гадна талбай" ${cat === 'Гадна талбай' ? 'selected' : ''}>Гадна талбай</option>
                <option value="Цахилгаан" ${cat === 'Цахилгаан' ? 'selected' : ''}>Цахилгаан</option>
               </select>
               <div id="edit-subcat-container" style="margin-top:10px;"></div>`
        : `
           <p>${cat || 'Мэдээлэл байхгүй'}</p>
           <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
              ${subcats.length > 0
          ? subcats.map(s => `<span style="background:#F1F5F9; color:#475569; padding:2px 8px; border-radius:12px; font-size:12px;">${s}</span>`).join('')
          : '<span style="font-size:12px; color:#94A3B8;">Дэд категоригүй</span>'}
           </div>
        `
      }
      </div>

      <div class="info-group">
        <label>Миний тухай</label>
         ${isEditing
        ? `<textarea id="edit-desc" class="edit-input" rows="4">${desc}</textarea>`
        : `<p>${desc || 'Тайлбар оруулаагүй'}</p>`
      }
      </div>

       <div class="info-group">
        <label>Утас</label>
        ${isEditing
        ? `<input type="text" id="edit-phone" value="${user.phone || ''}" class="edit-input" />`
        : `<p>${user.phone || 'Оруулаагүй'}</p>`
      }
      </div>

      <div class="actions">
        ${isEditing
        ? `<button id="save-btn" class="action-btn save">Хадгалах</button>
               <button id="cancel-btn" class="action-btn cancel">Болих</button>`
        : `<button id="edit-btn" class="action-btn edit">Мэдээлэл засах</button>`
      }
      </div>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          pointer-events: none; /* Let clicks pass through when closed */
        }

        .backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(4px);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        .drawer {
          position: absolute;
          top: 0;
          right: 0;
          width: 400px;
          height: 100%;
          background: white;
          box-shadow: -4px 0 20px rgba(0,0,0,0.1);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          pointer-events: auto;
          font-family: 'Inter', sans-serif;
        }

        .drawer.open {
          transform: translateX(0);
        }

        .header {
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header h3 {
          margin: 0;
          color: #0F172A;
          font-weight: 600;
          font-size: 18px;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #94A3B8;
          transition: color 0.2s;
        }
        .close-btn:hover { color: #334155; }

        .content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        .footer {
          padding: 24px;
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
        }

        /* Profile Styles */
        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 30px;
        }

        .avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: #213448;
          color: white;
          font-size: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .avatar.worker {
          background: linear-gradient(135deg, #FF9F1C, #F97316); 
        }

        .role-badge {
          font-size: 11px;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        
        .role-badge.user {
          background: #F1F5F9;
          color: #475569;
        }
        
        .role-badge.worker {
          background: #FFF7ED;
          color: #C2410C;
        }

        .stats-row {
            display: flex;
            gap: 12px;
            font-size: 14px;
            color: #64748B;
            font-weight: 500;
        }

        .info-group {
          margin-bottom: 24px;
        }

        .info-group label {
          display: block;
          font-size: 12px;
          color: #64748B;
          margin-bottom: 6px;
          font-weight: 600;
        }

        .info-group p {
          margin: 0;
          color: #0F172A;
          font-weight: 500;
          font-size: 15px;
          line-height: 1.5;
        }

        /* Inputs */
        .edit-input {
            width: 100%;
            padding: 10px;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            font-size: 15px;
            font-family: inherit;
            color: #0F172A;
            box-sizing: border-box;
        }
        .edit-input:focus {
            outline: none;
            border-color: #213448;
            box-shadow: 0 0 0 2px rgba(33, 52, 72, 0.1);
        }

        /* Buttons */
        .actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        
        .action-btn {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .action-btn.edit {
            background: #213448;
            color: white;
        }
        .action-btn.edit:hover { background: #334b63; }

        .action-btn.save {
            background: #10B981;
            color: white;
        }
        .action-btn.save:hover { background: #059669; }

        .action-btn.cancel {
            background: #E2E8F0;
            color: #475569;
        }
        .action-btn.cancel:hover { background: #CBD5E1; }

        .logout-btn {
          width: 100%;
          padding: 12px;
          background: #FEF2F2;
          color: #EF4444;
          border: 1px solid #FECACA;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background: #FEE2E2;
        }
      </style>

      <div class="backdrop"></div>
      
      <div class="drawer">
        <div class="header">
          <h3>Миний Профайл</h3>
          <button class="close-btn">×</button>
        </div>
        
        <div class="content" id="content">
          <!-- Dynamic Content -->
        </div>

        <div class="footer">
          <button class="logout-btn">Гарах</button>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.backdrop').addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.logout-btn').addEventListener('click', () => this.logout());
  }
}

customElements.define("ch-profile-popup", ChProfilePopup);
