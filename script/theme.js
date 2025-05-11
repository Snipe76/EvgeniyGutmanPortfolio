document.addEventListener('DOMContentLoaded', function () {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const toggleIcon = themeToggleBtn.querySelector('.toggle-icon');

    // Check for saved theme preference or use OS preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');

    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-theme');
        toggleIcon.textContent = '☀️';
    } else {
        toggleIcon.textContent = '🌙';
    }

    // Toggle theme function
    function toggleTheme() {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
            toggleIcon.textContent = '🌙';
            themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
        } else {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            toggleIcon.textContent = '☀️';
            themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
        }
    }

    // Add event listener for the theme toggle button
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Listen for OS theme changes if user hasn't set a preference
    prefersDarkScheme.addEventListener('change', function (e) {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-theme');
                toggleIcon.textContent = '☀️';
            } else {
                document.body.classList.remove('dark-theme');
                toggleIcon.textContent = '🌙';
            }
        }
    });
}); 