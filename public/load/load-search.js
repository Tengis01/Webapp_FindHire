// Main search bar functionality
(function () {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearch);
    } else {
        initSearch();
    }

    function initSearch() {
        const searchInput = document.querySelector('.search-bar input');
        const searchIcon = document.querySelector('.search-bar .fa-search');
        const popup = document.querySelector('#profiles-popup');

        if (!searchInput || !searchIcon || !popup) {
            console.warn('Search elements not found');
            return;
        }

        // Handle search action
        function performSearch() {
            const query = searchInput.value.trim();

            if (!query) {
                alert('Хайлтын түлхүүр үг оруулна уу');
                return;
            }

            console.log('Searching for:', query);

            // Clear any existing category filter and set search
            popup.setAttribute('main', '');
            popup.setAttribute('search', query);

            // Open the popup
            if (typeof popup.showPopup === 'function') {
                popup.showPopup();
            } else {
                console.error('Popup showPopup method not found');
                // Fallback if component API isn't ready
                popup.style.display = 'flex';
            }
        }

        // Trigger search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });

        // Trigger search on icon click
        searchIcon.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch();
        });

        // Make the icon clickable visually
        searchIcon.style.cursor = 'pointer';
    }
})();
