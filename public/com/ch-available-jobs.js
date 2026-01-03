class ChAvailableJobs extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.fetchJobs();

        // Listen for new job posts to refresh
        document.addEventListener('job-posted', () => {
            this.fetchJobs();
        });
    }

    async fetchJobs() {
        try {
            const res = await fetch('/api/work');
            const jobs = await res.json();
            this.render(jobs);
        } catch (err) {
            console.error("Failed to fetch jobs", err);
            this.shadowRoot.innerHTML = `<div class="error">Failed to load jobs</div>`;
        }
    }

    render(jobs) {
        // Basic CSS reusing some concepts from styles.css but scoped
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 1320px;
          margin: 40px auto;
          padding: 0 20px;
          width: 100%;
          box-sizing: border-box;
        }
        
        h2 {
           font-size: 28px;
           color: #213448;
           margin-bottom: 24px;
           text-align: left;
           border-left: 5px solid #213448;
           padding-left: 15px;
        }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
        }

        .job-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.2s;
        }
        
        .job-card:hover {
            transform: translateY(-5px);
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 5px;
        }

        .user-pic {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #eee;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #555;
            font-size: 14px;
        }
        
        .user-details {
            display: flex;
            flex-direction: column;
        }
        
        .user-name {
            font-weight: bold;
            font-size: 15px;
            color: #213448;
        }
        
        .post-time {
            font-size: 12px;
            color: #888;
        }

        .job-title {
            font-size: 18px;
            font-weight: bold;
            color: #213448;
            margin: 0;
        }

        .job-desc {
            font-size: 14px;
            color: #555;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .job-meta {
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            font-weight: 600;
            color: #213448;
            border-top: 1px solid #eee;
            padding-top: 12px;
        }
        
        .price {
            color: #2e7d32;
        }
        
        .food-badge {
            background: #fff3cd;
            color: #856404;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
        }

        /* Responsive similar to popular */
        @media (max-width: 1100px) {
            .jobs-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
            .jobs-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
            .jobs-grid { grid-template-columns: 1fr; }
        }
        
        .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px;
            color: #888;
            background: #f9f9f9;
            border-radius: 14px;
        }

      </style>

      <h2>Ажлын зарууд</h2>
      <div class="jobs-grid" id="grid"></div>
    `;

        const grid = this.shadowRoot.getElementById('grid');

        if (jobs.length === 0) {
            grid.innerHTML = `<div class="empty-state">Одоогоор ажлын зар байхгүй байна. Та хамгийн эхний зар оруулна уу!</div>`;
            return;
        }

        jobs.forEach(job => {
            const date = new Date(job.createdAt).toLocaleDateString();

            // Initial for Pic
            const userInitial = job.user.name ? job.user.name.charAt(0).toUpperCase() : '?';

            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
            <div class="user-info">
                <div class="user-pic">${userInitial}</div>
                <div class="user-details">
                    <span class="user-name">${job.user.name}</span>
                    <span class="post-time">${date}</span>
                </div>
            </div>
            
            <h3 class="job-title">${job.title}</h3>
            <div class="job-desc">${job.description}</div>
            
            <div class="job-meta">
                <span class="price">${job.price > 0 ? job.price.toLocaleString() + '₮' : 'Negotiable'}</span>
                ${job.hasFood ? '<span class="food-badge">🍱 Food</span>' : ''}
            </div>
        `;
            grid.appendChild(card);
        });
    }
}

customElements.define('ch-available-jobs', ChAvailableJobs);
