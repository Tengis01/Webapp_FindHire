// load/load-popupscreen.js
// Popup component-үүдийг бүртгэж, popup-controller-г импортлоно

import '../com/ch-mini-job-card.js';
import '../com/ch-popup-screen.js';
import '../com/popup-controller.js';

// Popup тестлэх функц
window.testPopup = function() {
  const popup = document.getElementById("profiles-popup");
  if (popup) {
    popup.open();
  } else {
    console.error('Popup not found');
  }
};