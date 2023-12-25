const profileDropdown = document.querySelector(".profileDropdown");
const editProfile = document.querySelector("#edit-profile");
const editForm = document.querySelector(".edit-form");
const mainSection = document.querySelector("#main-section");
const headerSection = document.querySelector("#header");
const profileMenu = document.querySelector(".profile-menu");
const chooseAvatar = document.querySelector(".choose-avatar");
const profileFrame = document.querySelector("#defaultUser");
const profileInput = document.querySelector("#profile");
const newProjectForm = document.querySelector("#create-new");
const joinProjectForm = document.querySelector("#join-exist");
const idContainer = document.querySelector("#project-id");
const exitForm = document.querySelector(".leaveForm");
const deleteForm = document.querySelector(".deleteForm");
const dhdaForm = document.querySelector(".dhdaForm");
const deleteProjectId = document.querySelector("#deleteProjectId");
const deleteProjectName = document.querySelector("#deleteProjectName");
const alertTimeout = document.querySelector(".pedAlert");

let confirmText = "";
let activeBtn = "";
let activeMenu = "";

// Open Profile Menu
document.querySelector(".profile-btn").addEventListener("click", () => {
    profileDropdown.classList.toggle("hidden");
});

// Close Profile Menu when clicked outside
document.addEventListener("click", (e) => {
    if (e.target.id != "profile-btn" && !e.target.classList.contains("profile")) {
        profileDropdown.classList.add("hidden");
    }
});

// Open Edit Profile 
document.querySelector("#edit-profile").addEventListener("click", () => {
    headerSection.classList.add("zindex-200");
    mainSection.classList.add("blur");
    editForm.classList.add("visible");
})

// Close Edit Profile 
document.querySelector("#close-edit").addEventListener("click", () => {
    headerSection.classList.remove("zindex-200");
    mainSection.classList.remove("blur");
    editForm.classList.remove("visible");
    document.querySelector(".updateUserAlertMessage").innerText = "";
})

// Open Profile Menu
document.querySelector(".profile-selector-btn").addEventListener("click", () => {
    profileMenu.classList.add("show");
})

// Close Profile Menu when clicked outside
document.addEventListener("click", (e) => {
    if (e.target.id != "defaultUser" && e.target.id != "photo-camera") {
        profileMenu.classList.remove("show");
    }
});

// Open Avatar Menu
document.querySelector("#chooseProfile").addEventListener("click", () => {
    chooseAvatar.classList.add("showAvatar");
    editForm.classList.add("zindex-200");
    editForm.classList.add("blur");
});

// Close Avatar Menu
document.querySelector("#closeBtn").addEventListener("click", () => {
    chooseAvatar.classList.remove("showAvatar");
    editForm.classList.remove("zindex-200");
    editForm.classList.remove("blur");
})

// Choose Profile
function selectProfile(id) {
    profileFrame.src = `assets/images/avatars/${id}.png`;
    profileInput.value = id;
    chooseAvatar.classList.remove("showAvatar");
    editForm.classList.remove("zindex-200");
    editForm.classList.remove("blur");
}

// Set default avatar
document.querySelector("#defaultProfile").addEventListener("click", () => {
    profileFrame.src = `assets/images/avatars/defaultUser.png`;
    profileInput.value = "defaultUser";
})

// Open create Project form
document.querySelector("#createProject").addEventListener("click", () => {
    headerSection.classList.add("zindex-200");
    mainSection.classList.add("blur");
    newProjectForm.classList.add("visible");
    const id = makeid();
    idContainer.value = id;
})

// Close create Project form
document.querySelector("#cancel-button").addEventListener("click", () => {
    headerSection.classList.remove("zindex-200")
    mainSection.classList.remove("blur");
    newProjectForm.classList.remove("visible");
    document.querySelector(".createAlertMessage").innerText = "";
    document.querySelector(".joinAlertMessage").innerText = "";
})

// Open Join Project Form
document.querySelector("#joinProject").addEventListener("click", () => {
    headerSection.classList.add("zindex-200")
    mainSection.classList.add("blur");
    joinProjectForm.classList.add("visible");
})

// Close Join Project Form
document.querySelector("#cancel-join").addEventListener("click", () => {
    headerSection.classList.remove("zindex-200")
    mainSection.classList.remove("blur");
    joinProjectForm.classList.remove("visible");
    document.querySelector(".createAlertMessage").innerText = "";
    document.querySelector(".joinAlertMessage").innerText = "";
})

// Generate Project Id
document.querySelector("#generate-projectId").addEventListener("click", () => {
    const id = makeid();
    idContainer.value = id;
})

// Code Generator
function makeid() {
    let result = '';
    const length = 20;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = 62;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

// Copy Code to Clipboard
function myFunction() {
    var copyText = document.getElementById("project-id");

    // Select the text field
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(copyText.value);

    // Copy the text inside the text field
    var tooltip = document.getElementById("myTooltip");

    // Notify
    tooltip.innerHTML = "Copied: " + copyText.value;
}

function outFunc() {
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copy to clipboard";
}

function projectMenu(pId) {
    // Check If a menu is already open
    if (activeMenu) {
        document.getElementById(`${activeMenu}`).classList.remove("show");
        activeBtn = "";
        activeMenu = "";
    }
    document.querySelector(`#pid-${pId}`).classList.toggle("show");
    activeBtn = `bt-${pId}`;
    activeMenu = `pid-${pId}`;
}

// Close Project Menu when clicked outside
document.addEventListener("click", (event) => {
    if (event.target.id != activeBtn && activeMenu) {
        document.getElementById(`${activeMenu}`).classList.remove("show");
        activeBtn = "";
        activeMenu = "";
    }
})

// Show Exit Project Form
function exitProject(pId, pName) {
    headerSection.classList.add("zindex-200")
    mainSection.classList.add("blur");
    exitForm.classList.add("visible");
    document.querySelector("#exit-alert").innerText = `Exit "${pName}" project ?`;
    document.querySelector("#exitProject").value = pId;
    document.querySelector("#exitProjectName").value = pName;
}

// Close Exit Project Form
document.querySelector("#cancel-exit").addEventListener("click", () => {
    headerSection.classList.remove("zindex-200")
    mainSection.classList.remove("blur");
    exitForm.classList.remove("visible");
})

// Delete Project
function deleteProject(uName, uEmail, pId, pName, pAdmin) {
    // If the user has delete access to the project
    if (uEmail === pAdmin) {
        headerSection.classList.add("zindex-200")
        mainSection.classList.add("blur");
        deleteForm.classList.add("visible");
        document.querySelector("#deleteAlert").innerText = `Permanently delete "${pName}" project ?`;
        document.querySelector("#confirmAlert").innerText = `To confirm, type "${uName}/${pName}" in the box below`;
        deleteProjectId.value = `${pId}`;
        deleteProjectName.value = `${pName}`;
        confirmText = `${uName}/${pName}`;
    }

    // If the user doesn't have delete access to the project
    else {
        headerSection.classList.add("zindex-200")
        mainSection.classList.add("blur");
        dhdaForm.classList.add("visible");
        document.querySelector("#dhdaAlert").innerText = `Sorry, you don't have delete access to "${pName}" project !`
    }
}

// Confirm Delete Text
document.querySelector("#confirmText").addEventListener("keyup", (event) => {
    if (event.target.value === confirmText) {
        deleteProjectId.classList.add("enabledBtn");
        deleteProjectId.disabled = false;
    }
    else {
        deleteProjectId.classList.remove("enabledBtn");
        deleteProjectId.disabled = true;
    }
})

// Close Delete Project Form
function closeDelete() {
    headerSection.classList.remove("zindex-200")
    mainSection.classList.remove("blur");
    deleteForm.classList.remove("visible");
}

// Close don't have delete access to the project
document.querySelector("#dhdaClose").addEventListener("click", () => {
    headerSection.classList.remove("zindex-200")
    mainSection.classList.remove("blur");
    dhdaForm.classList.remove("visible");
})

// Alert Timeout
function deleteAllAlerts() {
    if (alertTimeout.innerText.length > 0) {
        alertTimeout.classList.add("visible")
        setTimeout(() => {
            alertTimeout.classList.remove("visible")
            alertTimeout.innerText = "";
        }, 5000);
    }
}

