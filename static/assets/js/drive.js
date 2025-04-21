function toggleFolder(folderId) {
    let folderIcon = document.querySelector(`i[data-folder-id="${folderId}"]`);
    let folderContents = document.getElementById(`folder-${folderId}`);

    if (!folderContents || !folderIcon) return;

    if (folderContents.style.display === "none" || folderContents.innerHTML === "") {
        // Fetch folder contents from the backend
        fetch(`/folder/${folderId}`)
            .then(response => response.json())
            .then(files => {
                folderContents.innerHTML = ""; // Clear previous content

                files.forEach(file => {
                    let div = document.createElement("div");

                    if (file.mimeType === "application/vnd.google-apps.folder") {
                        // Folder item
                        div.innerHTML = `
                            <i class="fa-solid fa-folder folder-icon" data-folder-id="${file.id}" onclick="toggleFolder('${file.id}')"></i> 
                            <span class="folder" onclick="toggleFolder('${file.id}')">${file.name}</span>
                            <div id="folder-${file.id}" class="folder-contents" style="display:none;"></div>
                        `;
                    } else {
                        // File item (make clickable)
                        let fileLink = file.webViewLink ? file.webViewLink : "#";  
                        let clickEvent = file.webViewLink ? `target="_blank"` : `style="pointer-events: none; opacity: 0.5;"`; 

                        div.innerHTML = `
                            <i class="fa-solid fa-file"></i> 
                            <a href="${fileLink}" ${clickEvent} class="file-link">${file.name}</a>
                        `;
                    }

                    folderContents.appendChild(div);
                });

                folderContents.style.display = "block";
                folderIcon.classList.replace("fa-folder", "fa-folder-open"); // Change to open icon
            })
            .catch(error => console.error("Error fetching folder contents:", error));
    } else {
        // Collapse folder
        folderContents.style.display = "none";
        folderIcon.classList.replace("fa-folder-open", "fa-folder"); // Change back to closed icon
    }
}
function refreshFolder(folderId) {
    let folderContents = document.getElementById(`folder-${folderId}`);
    if (folderContents) {
        folderContents.innerHTML = ""; // Clear before fetching again
        toggleFolder(folderId); // Reload contents
    }
}
