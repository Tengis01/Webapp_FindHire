
  renderPublicProfile(worker); {
     const content = this.shadowRoot.querySelector('#content');
     const tabsContainer = this.shadowRoot.querySelector('.tabs');
     if(tabsContainer) tabsContainer.innerHTML = ''; // No tabs for public view

     const w = worker;
     
     content.innerHTML = `
      <div class="profile-header">
        <div class="avatar worker">${w.name ? w.name[0].toUpperCase() : 'W'}</div>
        <h2>${w.name}</h2>
        <span class="role-badge worker">Ажилтан</span>
         <div class="stats-row">
            <span>⭐ ${w.rating || '5.0'}</span>
            <span>🤝 ${w.jobs || 0} ажил</span>
         </div>
      </div>
      
      <div class="info-group">
        <label>Категори</label>
        <p>${w.category || 'Мэдээлэл байхгүй'}</p>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
           ${w.subcategories && w.subcategories.length > 0
           ? w.subcategories.map(s => `<span style="background:#F1F5F9; color:#475569; padding:2px 8px; border-radius:12px; font-size:12px;">${s}</span>`).join('')
           : '<span style="font-size:12px; color:#94A3B8;">Дэд категоригүй</span>'}
        </div>
      </div>
      
      <div class="info-group">
        <label>Миний тухай</label>
        <p>${w.description || 'Тайлбар оруулаагүй'}</p>
      </div>
      
      <div class="info-group">
        <label>Холбоо барих</label>
        <p>📞 ${w.phone || 'Нууцалсан'}</p>
        <p>📧 ${w.email || 'Нууцалсан'}</p>
      </div>

      <div class="info-group">
        <label>Сэтгэгдлүүд</label>
        ${w.reviews && w.reviews.length > 0 ? 
            w.reviews.map(r => `
                <div style="background:#f9fafb; padding:10px; border-radius:8px; margin-bottom:8px;">
                    <div style="font-size:12px; font-weight:bold;">${r.user || 'User'} <span style="color:#F59E0B;">⭐ ${r.rating}</span></div>
                     <div style="font-size:13px; color:#555;">${r.comment}</div>
                </div>
            `).join('') 
            : '<p>Сэтгэгдэл байхгүй</p>'}
      </div>
      
      <div class="actions">
         <button class="action-btn cancel" onclick="this.getRootNode().host.close()">Хаах</button>
      </div>
     `;
  }
