
import "./ch-mini-job-card.js";

class ChShowSearch extends HTMLElement {
  constructor() {
    super();
    this.results = [];
  }

  set workers(data) {
    this.results = data;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        ch-show-search {
          display: block;
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          z-index: 1000;
          margin-top: 10px;
          overflow: hidden;
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
          transition: all 0.3s ease;
        }

        ch-show-search.active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }

        .search-results-container {
          max-height: 600px; /* Increased height */
          overflow-y: auto;
          padding: 20px;
        }

        /* Custom Scrollbar */
        .search-results-container::-webkit-scrollbar {
          width: 8px;
        }
        .search-results-container::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 4px;
        }
        .search-results-container::-webkit-scrollbar-thumb {
          background: #ccc; 
          border-radius: 4px;
        }
        .search-results-container::-webkit-scrollbar-thumb:hover {
          background: #aaa; 
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .no-results {
          text-align: center;
          padding: 30px;
          color: #666;
        }
        
        .no-results i {
          font-size: 24px;
          margin-bottom: 10px;
          color: #ccc;
          display: block;
        }

        .header {
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
        }
        
        .header h3 {
          margin: 0;
          font-size: 16px;
          color: #444;
          font-weight: 600;
        }

        .close-btn {
          cursor: pointer;
          font-size: 18px;
          color: #999;
          background: none;
          border: none;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .close-btn:hover {
          background: #eee;
          color: #333;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          ch-show-search {
            width: calc(100vw - 32px);
            max-width: 100%;
            left: 16px;
            right: 16px;
          }

          .search-results-container {
            max-height: 500px;
            padding: 16px;
          }

          .results-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .header {
            padding: 14px 16px;
          }

          .header h3 {
            font-size: 15px;
          }
        }

        @media (max-width: 480px) {
          .search-results-container {
            max-height: 400px;
            padding: 12px;
          }

          .results-grid {
            gap: 12px;
          }

          .header {
            padding: 12px 14px;
          }

          .header h3 {
            font-size: 14px;
          }

          .no-results {
            padding: 24px;
          }
        }

      </style>
      
      <div class="header">
        <h3>Хайлтын илэрц (${this.results.length})</h3>
        <button class="close-btn" onclick="this.closest('ch-show-search').classList.remove('active')">&times;</button>
      </div>

      <div class="search-results-container">
        ${this.results.length > 0
        ? `<div class="results-grid"></div>`
        : `<div class="no-results">
              <i class="fa fa-search"></i>
              <p>Илэрц олдсонгүй</p>
            </div>`
      }
      </div>
    `;

    if (this.results.length > 0) {
      const grid = this.querySelector('.results-grid');
      this.results.forEach(worker => {
        const card = document.createElement('ch-mini-job-card');
        // Ensure string properties for attributes
        card.setAttribute('name', worker.name || '');
        card.setAttribute('rating', worker.rating || '0');
        card.setAttribute('jobs', worker.jobs || '');
        card.setAttribute('desc', worker.description || '');
        card.setAttribute('pic', worker.pic || '');

        // Handle potential array or string types for robustness
        const sub = Array.isArray(worker.subcategories) ? worker.subcategories.join(',') : (worker.subcategories || '');
        card.setAttribute('sub', sub);

        grid.appendChild(card);
      });
    }
  }
}

customElements.define("ch-show-search", ChShowSearch);
