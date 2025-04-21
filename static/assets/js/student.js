document.addEventListener("DOMContentLoaded", function () {
    // Sidebar Navigation
    const mainPageBtn = document.getElementById("mainPageBtn");
    const newsEventsBtn = document.getElementById("newsEventsBtn");
    const mainPage = document.getElementById("mainPage");
    const newsEvents = document.getElementById("newsEvents");

    mainPageBtn.addEventListener("click", function () {
        mainPage.style.display = "block";
        newsEvents.style.display = "none";
        mainPageBtn.classList.add("active");
        newsEventsBtn.classList.remove("active");
    });

    newsEventsBtn.addEventListener("click", function () {
        mainPage.style.display = "none";
        newsEvents.style.display = "block";
        newsEventsBtn.classList.add("active");
        mainPageBtn.classList.remove("active");
    });

    // Profile Dropdown Menu
    const profileContainer = document.querySelector(".profile-container");
    const profileMenu = document.getElementById("profileMenu");

    profileContainer.addEventListener("click", function () {
        profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block";
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!profileContainer.contains(event.target)) {
            profileMenu.style.display = "none";
        }
    });


    // Load Student Data (For Display)
    document.getElementById("studentName").textContent = "Cyrus Clifford Aguas"; 
    document.getElementById("studentBelt").textContent = "Legendary Belt";
});
