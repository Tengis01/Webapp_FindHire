
class ChJobDetailsModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.job = null;
        this.currentUser = null;
    }

    connectedCallback() {
        this.render();
        this.checkAuth();
    }

    async checkAuth() {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            this.currentUser = data.user;
            // Optionally re-render if needed or store
        } catch (e) {
            console.log("Not logged in");
        }
    }

    // Method to open the modal with job data
    async open(jobId) {
        this.style.display = 'flex';
        this.shadowRoot.innerHTML = `<div class="loading">Loading...</div>`;
        
        try {
            const res = await fetch(`/api/work/${jobId}`);
            if (!res.ok) throw new Error("Job not found");
            const data = await res.json();
            this.job = data;
            
            // Re-fetch auth to be sure
            await this.checkAuth();
            
            this.render();
        } catch (e) {
            console.error(e);
            this.shadowRoot.innerHTML = `<div class="error">Failed to load job details. <button id="close-err">Close</button></div>`;
            this.shadowRoot.getElementById('close-err').onclick = () => this.close();
        }
    }

    close() {
        this.style.display = 'none';
        this.job = null;
    }

    render() {
        if (!this.job) return;

        const { title, description, price, isDeal, hasFood, userId, applicants, status } = this.job;
        const isOwner = this.currentUser && String(this.currentUser._id) === String(userId._id);
        const isWorker = this.currentUser && this.currentUser.role === 'Worker';

        // Styling
        const style = `
        <style>
           /* ... existing styles ... */
           ${this.getStyles()}
        </style>
        `;

        // Body Content
        let content = `
            <button class="close-btn" id="close">&times;</button>
            <h2>${title}</h2>
            
            <div class="meta-row">
                <span class="tag">${this.job.category}</span>
                <span class="tag price-tag">${price > 0 ? price.toLocaleString() + '₮' : 'Negotiable'}</span>
                ${hasFood ? '<span class="tag food-tag">Food</span>' : ''}
            </div>

            <p class="description">${description}</p>
        `;

        // Contact Info (Only for Workers/Owner)
        if (isWorker || isOwner) {
            content += `
                <div class="section-title">Холбоо барих</div>
                <p>👤 <b>${userId.firstname} ${userId.lastname}</b></p>
                <p>📞 <b>${userId.phone}</b></p>
                <br>
            `;
        }

        // Action Area for WORKERS
        if (isWorker && status === 'OPEN') {
            // Check if THIS worker user has applied
            // applicant.workerId is populated with { userId: ... }
            const hasApplied = applicants && applicants.find(a => 
                a.workerId && String(a.workerId.userId) === String(this.currentUser._id)
            );
            
            if (hasApplied) {
                 content += `
                    <div style="background:#ECFDF5; border:1px solid #10B981; color:#047857; padding:15px; border-radius:10px; text-align:center;">
                        ✅ Та аль хэдийн энэ ажилд санал илгээсэн байна.
                    </div>
                 `;
            } else {
                content += `
                    <div class="section-title">Ажил авах хүсэлт илгээх</div>
                    <div class="input-group">
                        <label>Таны санал болгох үнэ (₮)</label>
                        <input type="number" id="bid-price" value="${price > 0 ? price : ''}" placeholder="Үнэ оруулах">
                    </div>
                     <div class="input-group">
                        <label>Боломжит өдөр</label>
                        <input type="date" id="bid-date">
                    </div>
                    <div class="input-group">
                        <label>Зурвас (Заавал биш)</label>
                        <textarea id="bid-message" rows="2" placeholder="Би хийж чадна..."></textarea>
                    </div>
                    <div class="actions">
                        <button class="btn-primary" id="apply-btn">Зөвшөөрөх (Submit)</button>
                        <button class="btn-secondary" id="cancel-btn">Татгалзах</button>
                    </div>
                `;
            }

        } else if (isWorker) {
             content += `<p style="color:#666; text-align:center;">Энэ ажил хаагдсан эсвэл дууссан байна.</p>`;
        }

        // Action Area for OWNERS
        if (isOwner) {
            // Applicants are now managed in My Profile -> My Works
            content += `
                <div style="background:#F3F4F6; padding:15px; border-radius:10px; text-align:center; margin-top:20px;">
                    <p style="margin:0; color:#4B5563; font-size:14px;">
                        📌 Ирсэн саналуудыг <b>"Миний Профайл > Миний ажлууд"</b> хэсгээс харна уу.
                    </p>
                </div>
            `;
        }

        this.shadowRoot.innerHTML = style + `<div class="modal-content">${content}</div>`;

        // Event Listeners
        this.shadowRoot.getElementById('close')?.addEventListener('click', () => this.close());
        this.shadowRoot.getElementById('cancel-btn')?.addEventListener('click', () => this.close());
        
        // Apply Action
        this.shadowRoot.getElementById('apply-btn')?.addEventListener('click', () => this.submitApplication());

        // Hire/View Actions (Use delegation)
        const appList = this.shadowRoot.querySelector('.applicant-list');
        if (appList) {
            appList.addEventListener('click', (e) => {
                const target = e.target;
                const workerId = target.getAttribute('data-id');
                if (!workerId) return;

                if (target.textContent.includes('Сонгох')) {
                    this.hireWorker(workerId);
                } else if (target.textContent.includes('Дэлгэрэнгүй')) {
                    // Open Profile Popup
                    // We can emit event or call global
                    document.dispatchEvent(new CustomEvent('show-worker-profile', { detail: { workerId } }));
                }
            });
        }
    }

    async submitApplication() {
        const price = this.shadowRoot.getElementById('bid-price').value;
        const message = this.shadowRoot.getElementById('bid-message').value;
        const date = this.shadowRoot.getElementById('bid-date').value;
        
        try {
            const res = await fetch(`/api/work/${this.job._id}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price, message, date })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                document.querySelector('ch-toast').show('Амжилттай илгээлээ!', 'success');
                this.close();
            } else {
                document.querySelector('ch-toast').show(data.error || 'Алдаа гарлаа', 'error');
            }
        } catch (e) {
            document.querySelector('ch-toast').show('Сүлжээний алдаа', 'error');
        }
    }

    async hireWorker(workerId) {
        if (!confirm("Та энэ ажилтныг сонгохдоо итгэлтэй байна уу?")) return;

        try {
             const res = await fetch(`/api/work/${this.job._id}/hire/${workerId}`, {
                method: 'POST'
            });
            
            const data = await res.json();
            
             if (res.ok) {
                document.querySelector('ch-toast').show('Ажилтан сонгогдлоо!', 'success');
                this.close();
                // Trigger refresh of jobs list?
                document.dispatchEvent(new Event('job-posted'));
            } else {
                document.querySelector('ch-toast').show(data.error, 'error');
            }
        } catch (e) {
            document.querySelector('ch-toast').show('Сүлжээний алдаа', 'error');
        }
    }

    getStyles() {
      return `
            :host {
                display: none; /* Hidden by default */
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                z-index: 1000;
                justify-content: center;
                align-items: center;
                font-family: 'Inter', sans-serif;
            }

            .modal-content {
                background: white;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                border-radius: 20px;
                padding: 30px;
                position: relative;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                animation: slideUp 0.3s ease-out;
            }

            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .close-btn {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #888;
                padding: 5px;
            }

            h2 { margin-top: 0; color: #213448; font-size: 24px; }
            
            .meta-row {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                color: #555;
                font-size: 14px;
            }

            .tag {
                background: #f0f2f5;
                padding: 4px 10px;
                border-radius: 6px;
                font-weight: 500;
            }

            .price-tag { color: #2e7d32; background: #e8f5e9; }
            .food-tag { color: #f57c00; background: #fff3e0; }

            .description {
                line-height: 1.6;
                color: #444;
                margin-bottom: 30px;
                background: #f9f9f9;
                padding: 15px;
                border-radius: 12px;
            }

            .section-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 10px;
                color: #213448;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
            }

            .input-group {
                margin-bottom: 15px;
            }
            
            input, textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 8px;
                margin-top: 5px;
                box-sizing: border-box;
                font-family: inherit;
            }

            .actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }

            button {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s;
            }

            .btn-primary { background: #213448; color: white; }
            .btn-secondary { background: #e0e0e0; color: #333; }
            .btn-danger { background: #ffebee; color: #c62828; }

            /* Applicants List */
            .applicant-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .applicant-card {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px;
                border: 1px solid #eee;
                border-radius: 10px;
            }

            .applicant-info { display: flex; flex-direction: column; }
            .applicant-name { font-weight: bold; }
            .applicant-quote { font-size: 13px; color: #666; }

            .applicant-actions { display: flex; gap: 5px; }
            .btn-sm { padding: 6px 12px; font-size: 13px; }
      `;
  }
}

customElements.define('ch-job-details-modal', ChJobDetailsModal);
