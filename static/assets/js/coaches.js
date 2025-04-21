document.addEventListener("DOMContentLoaded", function () {
    // Get all sidebar navigation elements
    const navItems = document.querySelectorAll(".container-nav-circle");
    
    // Get all main page content sections
    const contentSections = {
        dashboard: document.getElementById("dashboard-content"),
        profile: document.getElementById("profile-content"),
        history: document.getElementById("history-content"),
        record: document.getElementById("record-content"),
        news: document.getElementById("news-content")
    };

    // Function to hide all content sections
    function hideAllSections() {
        Object.values(contentSections).forEach(section => {
            section.style.display = "none";
        });
    }

    // Function to remove active class from all buttons
    function removeActiveClass() {
        navItems.forEach(item => {
            item.classList.remove("active");
        });
    }

    // Set default view (Dashboard)
    hideAllSections();
    contentSections.dashboard.style.display = "block";
    document.querySelector(".dashboard").classList.add("active"); // Set Dashboard as active by default

    // Attach click events to sidebar menu items
    navItems.forEach(item => {
        item.addEventListener("click", function () {
            hideAllSections(); // Hide all sections first
            removeActiveClass(); // Remove active class from all buttons

            // Get section name from the class of the clicked item
            let sectionClass = this.classList[0]; // e.g., "dashboard", "profile", etc.

            // Display the corresponding section
            if (contentSections[sectionClass]) {
                contentSections[sectionClass].style.display = "block";
            }

            // Add active class to the clicked button
            this.classList.add("active");
        });
    });
});
