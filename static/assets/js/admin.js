document.addEventListener("DOMContentLoaded", function () {
  // Initialize the socket connection
  const socket = io("https://ptu-08k7.onrender.com"); // Automatically connects to the host that served the page

  // Listen for RFID data
  socket.on("rfid_data", function (data) {
    console.log("Received RFID:", data.rfid);
    document.getElementById("rfid").value = data.rfid;
  });
});

const socket = io.connect("https://ptu-08k7.onrender.com");

socket.on("connect", function () {
  console.log("WebSocket connected!");
});

socket.on("disconnect", function () {
  console.log("WebSocket disconnected!");
});

socket.on("rfid_data", function (data) {
  console.log("Received RFID data:", data);
});
//SIDE NAVIGATION BAR
document.addEventListener("DOMContentLoaded", function () {
  // Sidebar Navigation Elements
  const navItems = document.querySelectorAll(".container-nav-circle");

  // Page Content Sections
  const contentSections = {
    dashboard: document.getElementById("dashboard-content"),
    history: document.getElementById("history-content"),
    record: document.getElementById("record-content"),
    news: document.getElementById("news-content"),
  };

  // Function to Hide All Sections
  function hideAllSections() {
    Object.values(contentSections).forEach((section) => {
      section.style.display = "none";
    });
  }

  // Function to Remove Active Class from Sidebar Buttons
  function removeActiveClass() {
    navItems.forEach((item) => item.classList.remove("active"));
  }

  // Set Default View to Dashboard
  hideAllSections();
  contentSections.dashboard.style.display = "block";
  document.querySelector(".dashboard").classList.add("active");

  // Attach Click Event to Sidebar Items
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      hideAllSections();
      removeActiveClass();
      let sectionClass = this.classList[0];
      if (contentSections[sectionClass]) {
        contentSections[sectionClass].style.display = "block";
      }
      this.classList.add("active");
    });
  });
});
//====================================================================================================

// REGISTER PLAYERS
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form[name='signup_form']");
  const submitButton = form ? form.querySelector(".btn-submit") : null;

  if (!form || !submitButton) {
    console.error(" Error: Registration form or submit button not found.");
    return;
  }

  //  Remove previous event listener before adding a new one
  submitButton.removeEventListener("click", handleFormSubmit);
  submitButton.addEventListener("click", handleFormSubmit);
});

async function handleFormSubmit(event) {
  event.preventDefault(); // Prevent default form submission

  // Prevent double-click issue by disabling the button temporarily
  const submitButton = event.target;
  submitButton.disabled = true;

  // Gather form data
  const formData = new FormData(
    document.querySelector("form[name='signup_form']")
  );
  let data = {};
  formData.forEach((value, key) => {
    data[key] = value.trim();
  });

  console.log("📨 Sending Registration Data:", data); // Debugging output

  // Ensure required fields are filled
  const requiredFields = [
    "rfid",
    "firstname",
    "lastname",
    "category",
    "age",
    "belt",
    "gym",
    "weight",
    "weight_category",
  ];
  const missingFields = requiredFields.filter(
    (field) => !data[field] || data[field] === "select"
  );

  if (missingFields.length > 0) {
    alert(" Please fill in all required fields: " + missingFields.join(", "));
    submitButton.disabled = false; // Re-enable button
    return;
  }

  try {
    const response = await fetch("/api/players/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log("🔍 Full Server Response:", result); // Debugging

    if (response.status === 400) {
      console.warn("⚠️ Bad Request Error:", result.error);
      alert("❌ Error: " + result.error);
      submitButton.disabled = false;
      return;
    }

    if (result.message) {
      alert("🎉 Player registered successfully!");
      document.querySelector("form[name='signup_form']").reset();
      fetchPlayers(); // Refresh list
    } else {
      alert("❌ Error: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("🚨 Fetch error:", error);
    alert("❌ An error occurred: " + error.message);
  } finally {
    submitButton.disabled = false;
  }
}

//====================================================================================================

//FETCH PLAYERS
document.addEventListener("DOMContentLoaded", function () {
  async function fetchPlayers() {
    const tableBody = document.querySelector("#players-table tbody");
    if (!tableBody) {
      console.error("Error: #players-table tbody not found.");
      return;
    }

    try {
      const response = await fetch("/api/players");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const players = await response.json();
      tableBody.innerHTML = "";

      players.forEach((player) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${player.rfid}</td>
          <td>${player.firstname}</td>
          <td>${player.lastname}</td>
          <td>${player.category}</td>
          <td>${player.age}</td>
          <td>${player.belt}</td>
          <td>${player.gym}</td>
          <td>${player.weight}</td>
        `;
        tableBody.appendChild(row);
      });

      console.log("Players list updated successfully.");
    } catch (error) {
      console.error("Error fetching players:", error);
      tableBody.innerHTML = `<tr><td colspan="8">Failed to load data</td></tr>`;
    }
  }

  async function fetchOverview() {
    const overviewTableBody = document.querySelector("#overview-table tbody");
    if (!overviewTableBody) {
      console.error("Error: #overview-table tbody not found.");
      return;
    }

    try {
      const response = await fetch("/api/overview");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const overviewData = await response.json();

      overviewTableBody.innerHTML = ""; // Clear old rows

      overviewData.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.gym}</td>
          <td>${item.totalScore}</td>
          <td>${item.performing}</td>
          <td>${item.category}</td>
          <td>${item.status}</td>
          <td>${item.timestamp}</td>
        `;
        overviewTableBody.appendChild(row);
      });

      console.log("Overview data loaded successfully.");
    } catch (error) {
      console.error("Error fetching overview data:", error);
    }
  }

  window.fetchPlayers = fetchPlayers;
  fetchPlayers();
  fetchOverview();
});

//====================================================================================================

//FETCH FILES

document.addEventListener("DOMContentLoaded", function () {
  async function fetchFiles() {
    const recordBox = document.querySelector(".record-box");

    if (!recordBox) {
      console.error(" Error: .record-box not found.");
      return;
    }

    try {
      console.log("📨 Fetching files...");
      const response = await fetch("/folder/1NndBdfWTZl4ZMjGZWWb1UjgeVijl986v");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(" Server Response:", data); // Debugging output

      if (!Array.isArray(data)) {
        throw new Error(" API response is not an array!");
      }

      recordBox.innerHTML = ""; // Clear previous records

      if (data.length === 0) {
        recordBox.innerHTML = "<p>No files found.</p>";
        return;
      }

      data.forEach((file) => {
        const div = document.createElement("div");

        if (file.mimeType === "application/vnd.google-apps.folder") {
          div.innerHTML = `
            <i class="fa-solid fa-folder folder-icon" onclick="toggleFolder('${file.id}')"></i>
            <span class="folder" onclick="toggleFolder('${file.id}')">${file.name}</span>
          `;
        } else {
          div.innerHTML = `
            <i class="fa-solid fa-file file-icon"></i>
            <a href="${file.webViewLink}" target="_blank" class="file">${file.name}</a>
          `;
        }
        recordBox.appendChild(div);
      });

      console.log(" Record files updated successfully.");
    } catch (error) {
      console.error(" Error fetching files:", error);
      recordBox.innerHTML = "<p> Failed to load files.</p>";
    }
  }

  // Automatically fetch records when the page loads
  document.addEventListener("DOMContentLoaded", function () {
    fetchFiles();
  });
});

//====================================================================================================
//REFRESH FILES
document.addEventListener("DOMContentLoaded", function () {
  async function fetchDashboardData() {
    try {
      const response = await fetch("/api/dashboard_data");
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const playerCount = document.getElementById("number-players");
      if (playerCount) playerCount.textContent = data.players;
    } catch (error) {
      console.error(" Error fetching dashboard data:", error);
    }
  }

  fetchDashboardData();
});
//====================================================================================================

//BUTTON
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".open-window").forEach((button) => {
    button.addEventListener("click", function () {
      const url = this.getAttribute("data-url");
      if (url) {
        window.open(url, "_blank"); //  Open in a new tab
      } else {
        console.error(" Error: No URL found for this button.");
      }
    });
  });
});
//====================================================================================================
//ARCHIVE RECORDS
document.addEventListener("DOMContentLoaded", function () {
  const archiveButton = document.getElementById("archiveRecordButton");

  if (!archiveButton) {
    console.error(" Error: Archive button not found.");
    return;
  }

  //  Remove any previous event listener before adding a new one
  archiveButton.removeEventListener("click", handleArchiveRequest);
  archiveButton.addEventListener("click", handleArchiveRequest);
});

async function handleArchiveRequest() {
  //  Prevent multiple clicks by disabling the button
  const archiveButton = document.getElementById("archiveRecordButton");
  if (!archiveButton) return;

  if (archiveButton.disabled) return; // Prevent duplicate requests
  archiveButton.disabled = true; // Disable button to prevent spam clicking

  const confirmArchive = confirm(
    " Are you sure you want to archive the record contents?"
  );
  if (!confirmArchive) {
    archiveButton.disabled = false; // Re-enable button if canceled
    return;
  }

  try {
    console.log("📨 Sending archive request...");

    const response = await fetch("/api/archiveRecords", { method: "POST" });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(" Archive Response:", result);

    if (result.message) {
      alert(result.message);
      fetchFiles(); //  Refresh record box after archiving
    } else {
      alert(" Error: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error(" Failed to archive record content:", error);
    alert(" Failed to connect to archive API.");
  } finally {
    archiveButton.disabled = false; //  Re-enable button after request completes
  }
}

//====================================================================================================
//SHOW ARCHIVES
document.getElementById("show-archives").addEventListener("click", function () {
  const archiveFolderId = "1GM5-ZA57QPylEhcMexwhhVmdd2g09ZRX"; // Replace with actual archive folder ID
  const archiveURL = `https://drive.google.com/drive/folders/${archiveFolderId}`;
  window.open(archiveURL, "_blank"); //  Open in a new tab
});
//====================================================================================================

document
  .getElementById("archiveRecordButton")
  .addEventListener("click", async function () {
    if (this.disabled) return;
    this.disabled = true;

    const confirmArchive = confirm(
      " Are you sure you want to archive the record contents?"
    );
    if (!confirmArchive) {
      this.disabled = false;
      return;
    }

    try {
      console.log("📨 Sending archive request...");
      const response = await fetch("/api/archiveRecords", { method: "POST" });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log(" Archive Response:", result);

      if (result.message) {
        alert(result.message);
        fetchFiles();
        if (result.pdf_link) {
          window.open(result.pdf_link, "_blank");
        }
      } else {
        alert(" Error: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error(" Failed to archive record content:", error);
      alert(" Failed to connect to archive API.");
    } finally {
      this.disabled = false;
    }
  });
