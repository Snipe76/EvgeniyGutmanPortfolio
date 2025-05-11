document.addEventListener('DOMContentLoaded', function () {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav-links');

    // Function to update ARIA attributes and menu state
    function toggleMenu(open) {
        nav.classList.toggle('active', open);
        burger.setAttribute('aria-expanded', open);
        burger.textContent = open ? '×' : '≡';
    }

    burger.addEventListener('click', function () {
        const isExpanded = burger.getAttribute('aria-expanded') === 'true';
        toggleMenu(!isExpanded);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        if (window.innerWidth < 1440 &&
            !event.target.closest('#nav-links') &&
            !event.target.closest('#burger') &&
            nav.classList.contains('active')) {
            toggleMenu(false);
        }
    });

    // Handle window resize
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1440) {
            nav.classList.add('active');
            burger.setAttribute('aria-expanded', 'true');
        } else if (nav.classList.contains('active')) {
            toggleMenu(false);
        }
    });

    // Handle keyboard navigation
    nav.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && nav.classList.contains('active') && window.innerWidth < 1440) {
            toggleMenu(false);
        }
    });

    // Set initial states
    if (window.innerWidth >= 1440) {
        toggleMenu(true);
    } else {
        toggleMenu(false);
    }
}); 