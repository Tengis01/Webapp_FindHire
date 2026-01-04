class ChWalletModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.state = 'balance'; // 'balance', 'banks', 'qr'
    this.selectedBank = null;
    this.balance = 0;

    this.banks = [
      { name: 'Khan Bank', icon: '/icon/bankicon/khaanbank.jpeg', color: '#FF6B35' },
      { name: 'Golomt Bank', icon: '/icon/bankicon/golomtbank.jpeg', color: '#2E86DE' },
      { name: 'mBank', icon: '/icon/bankicon/mbank.png', color: '#9B59B6' },
      { name: 'SocialPay', icon: '/icon/bankicon/socialpay.jpeg', color: '#E74C3C' },
      { name: 'Khas Bank', icon: '/icon/bankicon/khasbank.jpeg', color: '#F39C12' },
      { name: 'TDB', icon: '/icon/bankicon/tdbank.png', color: '#27AE60' }
    ];
  }

  connectedCallback() {
    this.render();
  }

  async fetchBalance() {
    try {
      const res = await fetch('/api/wallet/balance');
      const data = await res.json();
      this.balance = data.balance || 0;
      this.render();
    } catch (err) {
      console.error('Balance fetch failed', err);
    }
  }

  async open() {
    this.state = 'balance';
    await this.fetchBalance();
    const overlay = this.shadowRoot.querySelector('.modal-overlay');
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    const overlay = this.shadowRoot.querySelector('.modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      this.state = 'balance';
      this.selectedBank = null;
    }
  }

  showBankSelection() {
    console.log('showBankSelection called, current state:', this.state);
    this.state = 'banks';
    console.log('new state set to banks, re-rendering...');
    this.render();
  }

  selectBank(bank) {
    console.log('Bank selected:', bank.name);
    this.selectedBank = bank;
    this.state = 'qr';
    this.render();
  }

  async confirmPayment() {
    const amount = this.topupAmount || 50000; // Use stored amount

    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method: this.selectedBank.name })
      });

      const data = await res.json();

      if (res.ok) {
        // Show success animation
        const modal = this.shadowRoot.querySelector('.modal-content');
        modal.classList.add('success-sparkle');

        setTimeout(() => {
          this.balance = data.balance;
          this.state = 'balance';
          this.render();

          // Update header balance
          const header = document.querySelector('ch-header');
          if (header) header.checkAuth();

          const toast = document.querySelector('ch-toast');
          if (toast) toast.show('Данс амжилттай цэнэглэгдлээ! 🎉', 'success');
        }, 1500);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      const toast = document.querySelector('ch-toast');
      if (toast) toast.show('Алдаа гарлаа: ' + err.message, 'error');
    }
  }

  render() {
    // Initial render - create the structure
    if (!this.shadowRoot.querySelector('.modal-overlay')) {
      this.shadowRoot.innerHTML = `
        <style>
          .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center;
            z-index: 3000; opacity: 0; pointer-events: none;
            transition: opacity 0.3s;
          }
          .modal-overlay.open { opacity: 1; pointer-events: auto; }
          
          .modal-content {
            background: white; width: 90%; max-width: 500px;
            border-radius: 20px; padding: 32px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            position: relative; transform: scale(0.9);
            transition: transform 0.3s;
          }
          .modal-overlay.open .modal-content { transform: scale(1); }
          
          .close-btn {
            position: absolute; top: 20px; right: 20px;
            background: none; border: none; font-size: 28px;
            color: #999; cursor: pointer;
          }
          
          h2 { margin: 0 0 24px; color: #213448; font-size: 28px; text-align: center; }
          
          .balance-display {
            text-align: center; margin-bottom: 30px;
          }
          .balance-label { color: #64748B; font-size: 14px; margin-bottom: 8px; }
          .balance-amount {
            font-size: 48px; font-weight: 700; color: #213448;
          }
          
          .topup-btn {
            width: 100%; padding: 16px; background: #2e7d32;
            color: white; border: none; border-radius: 12px;
            font-size: 18px; font-weight: 600; cursor: pointer;
            transition: all 0.3s; animation: pulse-btn 2s infinite;
          }
          @keyframes pulse-btn {
            0%, 100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.4); }
            50% { box-shadow: 0 0 0 10px rgba(46, 125, 50, 0); }
          }
          .topup-btn:hover { background: #27882f; transform: translateY(-2px); }
          
          .banks-grid {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 16px; animation: cascade 0.5s;
          }
          @keyframes cascade {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .bank-card {
            padding: 20px; border: 2px solid #e5e7eb;
            border-radius: 12px; cursor: pointer;
            transition: all 0.3s; text-align: center;
            background: white;
          }
          .bank-card:hover {
            border-color: #2e7d32;
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          }
          .bank-icon {
            width: 60px; height: 60px; object-fit: contain;
            margin-bottom: 10px; border-radius: 8px;
          }
          .bank-name { font-weight: 600; color: #213448; font-size: 14px; }
          
          .qr-container {
            text-align: center;
            animation: fadeIn 0.4s;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .qr-code {
            width: 250px; height: 250px; margin: 20px auto;
            border: 2px solid #e5e7eb; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            background: #f9f9f9; font-size: 12px; color: #999;
          }
          .qr-actions {
            display: flex; gap: 12px; margin-top: 20px;
          }
          .qr-actions button {
            flex: 1; padding: 12px; border-radius: 8px;
            font-weight: 600; cursor: pointer; transition: all 0.2s;
          }
          .save-btn { background: #f1f5f9; border: 1px solid #cbd5e1; color: #213448; }
          .save-btn:hover { background: #e2e8f0; }
          .confirm-btn { background: #2e7d32; border: none; color: white; }
          .confirm-btn:hover { background: #27882f; }
          
          .success-sparkle {
            animation: sparkle 1s;
          }
          @keyframes sparkle {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.5) drop-shadow(0 0 20px gold); }
          }
          
          .back-btn {
            margin-bottom: 20px; background: #f1f5f9;
            border: none; padding: 8px 16px; border-radius: 8px;
            cursor: pointer; font-weight: 600; color: #213448;
          }
        </style>

        <div class="modal-overlay">
          <div class="modal-content">
            <button class="close-btn">&times;</button>
            <div id="modal-body"></div>
          </div>
        </div>
      `;

      // Attach persistent event listeners
      this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => this.close());
      this.shadowRoot.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) this.close();
      });
    }

    // Update only the body content
    const body = this.shadowRoot.querySelector('#modal-body');
    if (body) {
      body.innerHTML = this.renderContent();
      this.attachDynamicListeners();
    }
  }

  async confirmWithdraw() {
    const ibanInput = this.shadowRoot.querySelector('#withdraw-iban');
    const amountInput = this.shadowRoot.querySelector('#withdraw-amount');
    const iban = ibanInput ? ibanInput.value : '';
    const amount = amountInput ? Number(amountInput.value) : 0;

    if (iban.length !== 18) {
      alert("Please enter a valid 18-digit Account Number");
      return;
    }

    if (amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (amount > this.balance) {
      alert("Insufficient balance");
      return;
    }

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, iban })
      });

      const data = await res.json();

      if (res.ok) {
        const modal = this.shadowRoot.querySelector('.modal-content');
        modal.classList.add('success-sparkle');
        setTimeout(() => {
          this.balance = data.balance;
          this.state = 'balance';
          this.render();
          document.querySelector('ch-toast')?.show('Татлага амжилттай хийгдлээ!', 'success');
          // Update header balance
          const header = document.querySelector('ch-header');
          if (header) header.checkAuth();
        }, 1000);
      } else {
        document.querySelector('ch-toast')?.show(data.error, 'error');
      }
    } catch (e) {
      console.error(e);
    }
  }

  renderContent() {
    if (this.state === 'balance') {
      const formatted = this.balance.toLocaleString('en-US');
      return `
        <h2>Хэтэвч</h2>
        <div class="balance-display">
          <div class="balance-label">Одоогийн үлдэгдэл</div>
          <div class="balance-amount">${formatted}₮</div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display:block; margin-bottom: 8px; font-weight: 500;">Цэнэглэх дүн</label>
            <input type="number" id="topup-amount" value="100000" style="width:100%; padding: 12px; font-size: 18px; border: 1px solid #ddd; border-radius: 12px; box-sizing: border-box;" />
        </div>

        <div style="display:flex; gap:10px;">
            <button class="topup-btn" style="flex:1;">Данс цэнэглэх</button>
            <button class="withdraw-btn" style="flex:1; background:#F8FAFC; color:#213448; border:1px solid #E2E8F0;">Таталт хийх</button>
        </div>
      `;
    } else if (this.state === 'withdraw') {
      const formatted = this.balance.toLocaleString('en-US');
      return `
            <button class="back-btn">← Буцах</button>
            <h2>Таталт хийх</h2>
            <div class="balance-display">
                 <div class="balance-label">Боломжит үлдэгдэл</div>
                 <div class="balance-amount" style="font-size:32px;">${formatted}₮</div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display:block; margin-bottom: 8px; font-weight: 500;">Дансны дугаар (IBAN)</label>
                <input type="text" id="withdraw-iban" placeholder="XXXX XXXX XXXX" style="width:100%; padding: 12px; font-size: 16px; border: 1px solid #ddd; border-radius: 12px; box-sizing: border-box;" />
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display:block; margin-bottom: 8px; font-weight: 500;">Татах дүн</label>
                <input type="number" id="withdraw-amount" placeholder="0.00" style="width:100%; padding: 12px; font-size: 18px; border: 1px solid #ddd; border-radius: 12px; box-sizing: border-box;" />
            </div>
            
            <button class="confirm-withdraw-btn" style="width:100%; padding:16px; background:#213448; color:white; border:none; border-radius:12px; font-size:18px; font-weight:600; cursor:pointer;">
                Зөвшөөрөх
            </button>
        `;
    } else if (this.state === 'banks') {
      return `
        <button class="back-btn">← Буцах</button>
        <h2>Банк сонгох</h2>
        <div class="banks-grid">
          ${this.banks.map(bank => `
            <div class="bank-card" data-bank="${bank.name}">
              <img src="${bank.icon}" alt="${bank.name}" class="bank-icon">
              <div class="bank-name">${bank.name}</div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (this.state === 'qr') {
      return `
        <button class="back-btn">← Буцах</button>
        <h2>${this.selectedBank.name}</h2>
        <div class="qr-container">
          <div class="qr-code">
            QR Code<br><br>
            <em>"Education Only<br>Demo Transaction"</em>
          </div>
          <div class="qr-actions">
            <button class="save-btn">Зураг татах</button>
            <button class="confirm-btn">Төлбөр баталгаажуулах</button>
          </div>
        </div>
      `;
    }
  }

  attachDynamicListeners() {
    // Attach listeners specific to current state
    if (this.state === 'balance') {
      const topupBtn = this.shadowRoot.querySelector('.topup-btn');
      if (topupBtn) {
        topupBtn.addEventListener('click', () => {
          const input = this.shadowRoot.querySelector('#topup-amount');
          this.topupAmount = input ? Number(input.value) : 50000;
          this.showBankSelection();
        });
      }

      const withdrawBtn = this.shadowRoot.querySelector('.withdraw-btn');
      if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => {
          this.state = 'withdraw';
          this.render();
        });
      }
    } else if (this.state === 'withdraw') {
      const backBtn = this.shadowRoot.querySelector('.back-btn');
      if (backBtn) backBtn.addEventListener('click', () => { this.state = 'balance'; this.render(); });

      const confirmWithdrawBtn = this.shadowRoot.querySelector('.confirm-withdraw-btn');
      if (confirmWithdrawBtn) confirmWithdrawBtn.addEventListener('click', () => this.confirmWithdraw());
    }

    // Common Listeners (Back btn for banks/qr)
    const backBtn = this.shadowRoot.querySelector('.back-btn');
    if (backBtn && (this.state === 'banks' || this.state === 'qr')) {
      backBtn.addEventListener('click', () => {
        this.state = this.state === 'qr' ? 'banks' : 'balance';
        this.render();
      });
    }

    this.shadowRoot.querySelectorAll('.bank-card').forEach(card => {
      card.addEventListener('click', () => {
        const bankName = card.dataset.bank;
        const bank = this.banks.find(b => b.name === bankName);
        if (bank) this.selectBank(bank);
      });
    });

    const confirmBtn = this.shadowRoot.querySelector('.confirm-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.confirmPayment());
    }
  }
}

customElements.define('ch-wallet-modal', ChWalletModal);
