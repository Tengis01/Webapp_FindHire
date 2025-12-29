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
        const searchPopup = document.querySelector('ch-show-search');

        // Hide default popup if it exists/interferes, or we can keep it for categories logic if separated.
        // For this task, we focus on the main search bar driving the new search component.

        if (!searchInput || !searchIcon || !searchPopup) {
            console.warn('Search elements not found');
            return;
        }

        // Handle search action
        async function performSearch() {
            const query = searchInput.value.trim();

            if (!query) {
                // optional: clear results if empty
                searchPopup.classList.remove('active');
                return;
            }

            console.log('Searching for:', query);

            try {
                // Show loading state if desired, or just wait
                const res = await fetch(`/api/workers?search=${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error('Search failed');

                const data = await res.json();
                console.log('Search results:', data);

                searchPopup.workers = data;
                searchPopup.classList.add('active');

            } catch (err) {
                console.error('Search error:', err);
                alert('Хайлт хийхэд алдаа гарлаа');
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

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchPopup.contains(e.target) && !searchIcon.contains(e.target)) {
                searchPopup.classList.remove('active');
            }
        });

        // Optional: Search while typing (debounce could be added later)
        // searchInput.addEventListener('input', (e) => { ... });
    }
})();
