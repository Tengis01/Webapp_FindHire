  getStyles(); {
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
