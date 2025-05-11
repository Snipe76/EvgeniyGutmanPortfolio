document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // Function to activate the selected tab
    function setActiveTab(tabId) {
        // Update tab buttons
        tabButtons.forEach(button => {
            const isSelected = button.id === tabId;
            button.classList.toggle('active', isSelected);
            button.setAttribute('aria-selected', isSelected);
        });

        // Update tab panels
        tabPanels.forEach(panel => {
            const shouldBeVisible = panel.id === `panel-${tabId.replace('tab-', '')}`;
            panel.classList.toggle('active', shouldBeVisible);
            panel.hidden = !shouldBeVisible;
        });
    }

    // Add click event to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            setActiveTab(this.id);
        });
    });

    // Handle keyboard navigation
    tabButtons.forEach(button => {
        button.addEventListener('keydown', function (event) {
            let index = Array.from(tabButtons).indexOf(this);
            let newIndex;

            switch (event.key) {
                case 'ArrowRight':
                    newIndex = (index + 1) % tabButtons.length;
                    break;
                case 'ArrowLeft':
                    newIndex = (index - 1 + tabButtons.length) % tabButtons.length;
                    break;
                case 'Home':
                    newIndex = 0;
                    break;
                case 'End':
                    newIndex = tabButtons.length - 1;
                    break;
                default:
                    return; // Exit if not a relevant key
            }

            // Activate the new tab
            tabButtons[newIndex].focus();
            setActiveTab(tabButtons[newIndex].id);
            event.preventDefault();
        });
    });
}); 