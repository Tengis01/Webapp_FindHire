// load/load-popupscreen.js
// Popup component-үүдийг бүртгэж, popup-controller-г импортлоно

import '../com/ch-mini-job-card.js';
import '../com/ch-popup-screen.js';
import '../com/popup-controller.js';

console.log('✅ Popup components loaded');

// Popup тестлэх функц
window.testPopup = function() {
  const popup = document.getElementById("profiles-popup");
  if (popup) {
    console.log('✅ Popup found');
    console.log('Shadow root:', popup.shadowRoot);
    popup.open();
  } else {
    console.error('❌ Popup not found');
  }
};