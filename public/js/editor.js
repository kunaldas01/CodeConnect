// Code Editor
let editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "text/x-c++src",
    theme: "dracula",
    lineNumbers: true,
    autoCloseBrackets: true,
    focusChanged: false,
});

editor.setSize("100%", "100%");

let previous = editor.getValue();

const userName = document.querySelector("#user-name").value;
const userEmail = document.querySelector("#user-email").value;
const langSelector = document.querySelector("#lang-selector");
const markComplete = document.querySelector(".markComplete");
const approve = document.querySelector(".approve");
const reject = document.querySelector(".reject");
const save = document.querySelector(".saveBtn");

document.querySelector("#fileHeading").innerText = document.querySelector("#project-title").innerText;
document.querySelector("#lang-selector").value = document.querySelector("#project-lang").value;
langSelector.disabled = true;
approve.classList.remove("visible");
reject.classList.remove("viible");
markComplete.classList.add("hidden");
save.classList.add("hidden");
editor.setOption('readOnly', true);

editor.on('change', (editor) => {
    const text = editor.getValue();

    if (text != previous) {
        previous = text;
        socket.emit('textChange', text);
    }
});

// Left Sidebar
const sidebarEl = document.querySelector(".sidebar");
const files = document.querySelector("#fileSection");
const user = document.querySelector("#memberSection");
const message = document.querySelector("#message");

document.querySelector(".sidebarBtn").addEventListener("click", () => {
    sidebarEl.classList.toggle("hide-sidebar");
    // document.querySelector(".editorSection").classList.toggle("clickedE");
});

// Sidebar Menu
const fileBtn = document.querySelector("#fileBtn");
const peopleBtn = document.querySelector("#peopleBtn");
const chatBtn = document.querySelector("#chatBtn");

// User list section
peopleBtn.addEventListener("click", () => {
    if (sidebarEl.classList.contains("hide-sidebar")) {
        sidebarEl.classList.remove("hide-sidebar");
    }

    if (user.classList.contains("hidden")) {
        user.classList.remove("hidden");

        files.classList.add("hidden")
        message.classList.add("hidden");
    }

    peopleBtn.classList.add("selected")
    fileBtn.classList.remove("selected")
    chatBtn.classList.remove("selected")
})

// Message Section
chatBtn.addEventListener("click", () => {
    if (sidebarEl.classList.contains("hide-sidebar")) {
        sidebarEl.classList.remove("hide-sidebar");
    }

    if (message.classList.contains("hidden")) {
        message.classList.remove("hidden");

        files.classList.add("hidden")
        user.classList.add("hidden");
    }

    chatBtn.classList.add("selected")
    peopleBtn.classList.remove("selected")
    fileBtn.classList.remove("selected")
})

// Files Section
fileBtn.addEventListener("click", () => {
    if (sidebarEl.classList.contains("hide-sidebar")) {
        sidebarEl.classList.remove("hide-sidebar");
    }

    if (files.classList.contains("hidden")) {
        files.classList.remove("hidden")

        message.classList.add("hidden");
        user.classList.add("hidden");
    }

    fileBtn.classList.add("selected")
    chatBtn.classList.remove("selected")
    peopleBtn.classList.remove("selected")
})

// Language Option
let option = document.getElementById("lang-selector");
option.addEventListener("change", () => {
    if (option.value == "c") {
        editor.setOption("mode", "text/x-csrc");
    }
    else if (option.value == "cpp") {
        editor.setOption("mode", "text/x-c++src");
    }
    else if (option.value == "java") {
        editor.setOption("mode", "text/x-java");
    }
    else if (option.value == "python") {
        editor.setOption("mode", "text/x-python");
    }
    else if (option.value == "js") {
        editor.setOption("mode", "text/javascript");
    }
    else if (option.value == "sh") {
        editor.setOption("mode", "text/x-sh");
    }
})

const createFileForm = document.querySelector(".createFileForm");
const header = document.querySelector(".header");
const mainSection = document.querySelector(".main-section");

// Open Create File Form
document.querySelector("#createFileBtn").addEventListener("click", () => {
    createFileForm.classList.add("visible");
    header.classList.add("hide-body");
    mainSection.classList.add("hide-body");
})

// Close Create File Form
document.querySelector("#closeCreateFile").addEventListener("click", () => {
    createFileForm.classList.remove("visible");
    header.classList.remove("hide-body");
    mainSection.classList.remove("hide-body");
})

// Create New File
document.querySelector("#createFile").addEventListener("click", () => {
    const fileName = document.querySelector("#fileName").value;
    const fileLang = document.querySelector("#lang-selection").value;
    let fileContent = "";

    const forkData = document.getElementById("forkContent");
    const fork = document.getElementById("fork");
    if (fork.checked) {
        fileContent = forkData.value;
    }
    else {
        fileContent = "";
    }

    const fileOwner = document.querySelector("#user-name").value;
    const projectId = document.querySelector("#project-id").value;

    const details = {
        fName: fileName,
        fOwner: fileOwner,
        fContent: fileContent,
        fLang: fileLang,
        fStatus: "pending",
        pId: projectId
    }

    // Add file to DB and broadcast
    socket.emit("addFile", details);

    // Close Create File Form
    createFileForm.classList.remove("visible");
    header.classList.remove("hide-body");
    mainSection.classList.remove("hide-body");
})

// Update files
socket.on('updateFile', (details) => {
    outputFiles(details.projectFiles, details.projectId);
})

// Alert for file name already exists
socket.on('alert', (message) => {
    sendAlert(message);
})

function outputFiles(files, pId) {
    files.forEach((file) => {
        if (!document.getElementById(`nm-${file.fileName}`)) {
            const div = document.createElement('div');
            div.classList.add('file');
            div.setAttribute("id", `nm-${file.fileName}`);

            const img = document.createElement('img');
            img.setAttribute("id", `im-${file.fileName}`)
            img.setAttribute("src", `/assets/images/${file.fileStatus}.png`);
            div.appendChild(img);

            const button = document.createElement('button');
            button.setAttribute("id", `funm-${file.fileName}`);
            button.setAttribute("onclick", `openFile('${file.fileName}', '${pId}', '')`);
            button.innerHTML = `${file.fileName}&nbsp;<span>(${file.fileOwner})</span>`;
            div.appendChild(button);

            document.querySelector(".memberFiles").appendChild(div);
        }
        document.querySelector(`#funm-${file.fileName}`).innerHTML = `${file.fileName}&nbsp;<span>(${file.fileOwner})</span>`;
    })
}

let prev = document.querySelector(".adminSection");

// Get File
function openFile(fileName, projectId, owner) {
    const details = {
        fName: fileName,
        pId: projectId,
        owner: owner,
    }

    if (prev) {
        prev.classList.remove("selectedFile");
    }

    if (owner === 'admin') {
        const curr = document.querySelector(".adminSection");
        curr.classList.add("selectedFile");
        prev = curr;
    }
    else {
        const curr = document.querySelector(`#nm-${fileName}`);
        curr.classList.add("selectedFile");
        prev = curr;
    }

    socket.emit('getFile', details);
}

// Found File
socket.on('foundFile', (details) => {
    document.querySelector("#fileHeading").innerText = details.name;
    editor.setValue(details.content);
    document.querySelector("#lang-selector").value = details.lang;

    // File owner
    if (details.owner === userName) {
        // Root File
        if (details.name === document.querySelector("#project-title").innerText) {
            langSelector.disabled = false;
            markComplete.classList.add("hidden");
            approve.classList.remove("visible");
            reject.classList.remove("visible");
            save.classList.remove("hidden");
            editor.setOption('readOnly', false);
        }
        else {
            langSelector.disabled = false;
            markComplete.classList.remove("hidden");
            approve.classList.remove("visible");
            reject.classList.remove("visible");
            save.classList.remove("hidden");
            editor.setOption('readOnly', false);

            // If Status is pending
            if (details.status === "pending") {
                markComplete.innerText = "Mark as complete";
                markComplete.classList.add("realMarkComplete");

            }
            // If Status is completed or approved
            else {
                markComplete.innerText = "Completed";
                markComplete.classList.remove("realMarkComplete");
            }
        }
    }
    // Not the file owner
    else {
        // But its admin baby!
        if (userEmail === details.projectAdmin) {
            langSelector.disabled = true;
            markComplete.classList.add("hidden");
            approve.classList.add("visible");
            reject.classList.add("visible");
            save.classList.add("hidden");
            editor.setOption('readOnly', true); // disables the editor

            // If Status is pending
            if (details.status === "pending") {
                approve.innerText = "Pending";
                reject.innerText = "Reject";
                approve.classList.remove("realApprove");
                reject.classList.remove("realReject");
                approve.disabled = true;
                reject.disabled = true;
            }
            // If Status is completed 
            else if (details.status === "complete") {
                approve.innerText = "Approve";
                reject.innerText = "Reject";
                approve.classList.add("realApprove");
                reject.classList.add("realReject");
                approve.disabled = false;
                reject.disabled = false;
            }
            // If Status is rejected
            else if (details.status === "reject") {
                approve.innerText = "Approve";
                reject.innerText = "Rejected";
                approve.classList.add("realApprove");
                reject.classList.remove("realReject");
                approve.disabled = false;
                reject.disabled = false;
            }
            // If Status is approved
            else if (details.status === "approve") {
                approve.innerText = "Approved";
                reject.innerText = "Reject";
                approve.classList.remove("realApprove");
                reject.classList.add("realReject");
                approve.disabled = false;
                reject.disabled = false;
            }
        }
        else {
            langSelector.disabled = true;
            markComplete.classList.add("hidden");
            approve.classList.remove("visible");
            reject.classList.remove("visible");
            save.classList.add("hidden");
            editor.setOption('readOnly', true); // disables the editor
        }
    }
})

// Save File data
save.addEventListener("click", () => {
    const fileName = document.querySelector("#fileHeading").innerText;
    const projectName = document.querySelector("#project-title").innerText;
    let details = "";

    // In case of root file
    if (fileName === projectName) {
        document.getElementById("forkContent").value = editor.getValue();
        details = {
            projectId: document.querySelector("#project-id").value,
            fileName: fileName,
            fileOwner: document.querySelector("#user-name").value,
            fileContent: editor.getValue(),
            fileLang: document.querySelector("#lang-selector").value,
        }
    }
    else {
        details = {
            projectId: document.querySelector("#project-id").value,
            fileName: fileName,
            fileOwner: document.querySelector("#user-name").value,
            fileContent: editor.getValue(),
            fileLang: document.querySelector("#lang-selector").value,
        }
    }

    socket.emit("saveFile", details);
})

// File saved alert
socket.on('filesaved', (message) => {
    sendAlert(message);
})

const markCompleteForm = document.querySelector(".markCompleteForm");

// Mark as Complete
markComplete.addEventListener("click", () => {
    const fName = document.querySelector("#fileHeading").innerText;
    // If status is pending
    if (markComplete.innerText === "Mark as complete") {
        document.querySelector("#complete-alert").innerText = `Mark "${fName}" file as complete?`
    }
    // If status is complete or approved
    else {
        document.querySelector("#complete-alert").innerText = `Mark "${fName}" file as incomplete?`
    }
    markCompleteForm.classList.add("visible");
    header.classList.add("hide-body");
    mainSection.classList.add("hide-body");
})

// Close Mark Complete Form
document.querySelector("#cancel-complete").addEventListener("click", () => {
    markCompleteForm.classList.remove("visible");
    header.classList.remove("hide-body");
    mainSection.classList.remove("hide-body");
})

// Confirm Complete
document.querySelector("#confirm-complete").addEventListener("click", () => {
    const pId = document.querySelector("#project-id").value;
    const fName = document.querySelector("#fileHeading").innerText;

    socket.emit("markComplete", { pId, fName });

    markCompleteForm.classList.remove("visible");
    header.classList.remove("hide-body");
    mainSection.classList.remove("hide-body");
})

// Display Complete Status
socket.on("completeStatus", (data) => {
    // If we are in the same file
    if (document.querySelector("#fileHeading").innerText === data.fName) {
        // If Status is pending
        if (data.fstatus === "pending") {
            markComplete.innerText = "Mark as complete";
            markComplete.classList.add("realMarkComplete");
            markComplete.disabled = false;

            approve.innerText = "Pending";
            reject.innerText = "Reject";
            approve.classList.remove("realApprove");
            reject.classList.remove("realReject");
            approve.disabled = true;
            reject.disabled = true;
        }
        // If Status is completed
        else if (data.fstatus === "complete") {
            markComplete.innerText = "Completed";
            markComplete.classList.remove("realMarkComplete");
            markComplete.disabled = false;

            approve.innerText = "Approve";
            reject.innerText = "Reject";
            approve.classList.add("realApprove");
            reject.classList.add("realReject");
            approve.disabled = false;
            reject.disabled = false;
        }
        // If status is rejected
        else if (data.fstatus === "reject") {
            markComplete.innerText = "Rejected";
            markComplete.classList.remove("realMarkComplete");
            markComplete.disabled = true;

            approve.innerText = "Approve";
            reject.innerText = "Rejected";
            approve.classList.add("realApprove");
            reject.classList.remove("realReject");
            approve.disabled = false;
            reject.disabled = false;
        }
        // If Status is approved
        else if (data.fstatus === "approve") {
            markComplete.innerText = "Approved";
            markComplete.classList.remove("realMarkComplete");
            markComplete.disabled = false;

            approve.innerText = "Approved";
            reject.innerText = "Reject";
            approve.classList.remove("realApprove");
            reject.classList.add("realReject");
            approve.disabled = false;
            reject.disabled = false;
        }
    }
    document.getElementById(`im-${data.fName}`).src = `/assets/images/${data.fstatus}.png`;
})

// Open Reject form
const rejectForm = document.querySelector(".rejectForm");

reject.addEventListener("click", () => {
    const fName = document.querySelector("#fileHeading").innerText;
    // If status is complete
    if (reject.innerText === "Reject") {
        document.querySelector("#reject-alert").innerText = `Reject "${fName}"?`
    }
    // If status is rejected
    else {
        document.querySelector("#reject-alert").innerText = `Remove reject from "${fName}" file?`
    }

    rejectForm.classList.add("visible");
    header.classList.add("hide-body");
    mainSection.classList.add("hide-body");
})

// Close Reject form
document.querySelector("#cancel-reject").addEventListener("click", () => {
    rejectForm.classList.remove("visible");
    header.classList.remove("hide-body");
    mainSection.classList.remove("hide-body");
})

// Confirm Reject
document.querySelector("#confirm-reject").addEventListener("click", () => {
    const pId = document.querySelector("#project-id").value;
    const fName = document.querySelector("#fileHeading").innerText;

    socket.emit("reject", { pId, fName });

    rejectForm.classList.remove("visible");
    header.classList.remove("hide-body");
    mainSection.classList.remove("hide-body");
})


// Open Approve form
const approveForm = document.querySelector(".approveForm");

approve.addEventListener("click", () => {
    const fName = document.querySelector("#fileHeading").innerText;
    // If status is complete
    if (approve.innerText === "Approve") {
        document.querySelector("#approve-alert").innerText = `Approve "${fName}"?`
    }
    // If status is approved
    else {
        document.querySelector("#approve-alert").innerText = `Unapprove "${fName}" file?`
    }
    approveForm.classList.add("visible");
    header.classList.add("hide-body");
    mainSection.classList.add("hide-body");
})

// Close Approve form
document.querySelector("#cancel-approve").addEventListener("click", () => {
    approveForm.classList.remove("visible");
    header.classList.remove("hide-body");
    mainSection.classList.remove("hide-body");
})

// Confirm Approve
document.querySelector("#confirm-approve").addEventListener("click", () => {
    const pId = document.querySelector("#project-id").value;
    const fName = document.querySelector("#fileHeading").innerText;

    socket.emit("approve", { pId, fName });

    approveForm.classList.remove("visible");
    header.classList.remove("hide-body");
    mainSection.classList.remove("hide-body");
})

// Display approve
socket.on("approveStatus", (data) => {
    // If we are in the same file
    if (document.querySelector("#fileHeading").innerText === data.fName) {
        // If Status is pending
        if (data.fstatus === "pending") {
            markComplete.innerText = "Mark as complete";
            markComplete.classList.add("realMarkComplete");
            markComplete.disabled = false;

            approve.innerText = "Pending";
            reject.innerText = "Reject";
            approve.classList.remove("realApprove");
            reject.classList.remove("realReject");
            approve.disabled = true;
            reject.disabled = true;
        }
        // If Status is completed
        else if (data.fstatus === "complete") {
            markComplete.innerText = "Completed";
            markComplete.classList.remove("realMarkComplete");
            markComplete.disabled = false;

            approve.innerText = "Approve";
            reject.innerText = "Reject";
            approve.classList.add("realApprove");
            reject.classList.add("realReject");
            approve.disabled = false;
            reject.disabled = false;
        }
        // If Status is rejected
        else if (data.fstatus === "reject") {
            console.log("Rejected");
            markComplete.innerText = "Rejected";
            markComplete.classList.remove("realMarkComplete");
            markComplete.disabled = true;

            approve.innerText = "Approve";
            reject.innerText = "Rejected";
            approve.classList.add("realApprove");
            reject.classList.remove("realReject");
            approve.disabled = false;
            reject.disabled = false;
        }
        // If Status is approved
        else if (data.fstatus === "approve") {
            markComplete.innerText = "Approved";
            markComplete.classList.remove("realMarkComplete");
            markComplete.disabled = false;

            approve.innerText = "Approved";
            reject.innerText = "Reject";
            approve.classList.remove("realApprove");
            reject.classList.add("realReject");
            approve.disabled = false;
            reject.disabled = false;
        }
    }
    document.getElementById(`im-${data.fName}`).src = `/assets/images/${data.fstatus}.png`;
})

// Open run window
const runWindow = document.querySelector(".runWindow");
document.querySelector(".runWindowBtn").addEventListener("click", () => {
    runWindow.classList.toggle("hide-runWindow");
})

// Compile code
document.querySelector("#runBtn").addEventListener("click", () => {
    const codeData = {
        fName: document.querySelector("#fileHeading").innerText,
        code: editor.getValue(),
        lang: document.querySelector("#lang-selector").value,
        input: document.querySelector("#input").value,
    }
    socket.emit("compile", codeData);
})

// Show to output
socket.on("outputData", (output) => {
    console.log(output);
    document.querySelector("#output").innerText = output;
})

// Download code
const download = document.querySelector(".downloadBtn");
download.addEventListener("click", () => {
    const fName = document.querySelector("#fileHeading").innerText;
    let admin = false;
    if (fName === document.querySelector("#project-title").innerText) {
        admin = true;
    }
    socket.emit("download", { fName, admin });
})

socket.on("download", (details) => {
    const a = document.createElement('a');
    a.setAttribute("href", `${details.path}.${details.flang}`);
    a.setAttribute("download", `${details.fName}.${details.flang}`);

    a.click();
    a.remove();
})

// **************************************************************************************************************************

const profileDropdown = document.querySelector(".profileDropdown");
const editProfile = document.querySelector("#edit-profile");
const editForm = document.querySelector(".edit-form");

const profileMenu = document.querySelector(".profile-menu");
const chooseAvatar = document.querySelector(".choose-avatar");
const profileFrame = document.querySelector("#defaultUser");
const profileInput = document.querySelector("#profile");

// Open Profile Menu
document.querySelector("#profile-btn").addEventListener("click", () => {
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
    header.classList.add("blur");
    mainSection.classList.add("blur");
    editForm.classList.add("visible");
})

// Close Edit Profile 
document.querySelector("#close-edit").addEventListener("click", () => {
    header.classList.remove("blur");
    mainSection.classList.remove("blur");
    editForm.classList.remove("visible");
    document.querySelector(".updateUserAlertMessage").innerText = "";
})

// Show Profile Menu
document.querySelector(".profile-selector-btn").addEventListener("click", () => {
    profileMenu.classList.add("show");
})

// Close Profile Menu when clicked outside
document.addEventListener("click", (e) => {
    if (e.target.id != "defaultUser" && e.target.id != "photo-camera") {
        profileMenu.classList.remove("show");
    }
});

// Show Avatar Menu
document.querySelector("#chooseProfile").addEventListener("click", () => {
    chooseAvatar.classList.add("showAvatar");
});

// Hide Avatar Menu
document.querySelector("#closeBtn").addEventListener("click", () => {
    chooseAvatar.classList.remove("showAvatar");
})

// Choose Profile
function selectProfile(id) {
    profileFrame.src = `/assets/images/avatars/${id}.png`;
    profileInput.value = id;
    chooseAvatar.classList.remove("showAvatar");
}

// Set default avatar
document.querySelector("#defaultProfile").addEventListener("click", () => {
    profileFrame.src = `/assets/images/avatars/defaultUser.png`;
    profileInput.value = "defaultUser";
})

// Change User Details
document.querySelector(".save-btn").addEventListener("click", (event) => {
    event.preventDefault();
    const profile = document.querySelector("#profile").value;
    const username = document.querySelector("#username").value;
    const oldname = document.querySelector("#oldname").value;
    const email = document.querySelector("#useremail").value;
    const password = document.querySelector("#password").value;

    const data = {
        profile: profile,
        username: username,
        oldname: oldname,
        email: email,
        password: password,
    }

    header.classList.remove("blur");
    mainSection.classList.remove("blur");
    editForm.classList.remove("visible");
    document.querySelector(".updateUserAlertMessage").innerText = "";

    socket.emit("updateUser", data);
})

// Username already exists
socket.on("userNameExists", (message) => {
    header.classList.add("blur");
    mainSection.classList.add("blur");
    editForm.classList.add("visible");
    document.querySelector(".updateUserAlertMessage").innerText = message;
})

// Update Successfull
socket.on("updateSuccess", (query) => {
    // If the its the owner who updated
    if (query.email === document.querySelector("#useremail").value) {
        // Update profile dropdown
        document.querySelector("#profile-btn").setAttribute("src", `/assets/images/avatars/${query.profile}.png`);
        document.querySelector("#profile-image").setAttribute("src", `/assets/images/avatars/${query.profile}.png`);

        document.querySelector("#userName").innerText = query.name;
        document.querySelector("#useremail").innerText = query.email;

        // Update edit form
        document.querySelector("#defaultUser").setAttribute("src", `/assets/images/avatars/${query.profile}.png`);
        document.querySelector("#profile").value = query.profile;
        document.querySelector("#oldname").value = query.name;
        document.querySelector("#username").value = query.name;
        document.querySelector("#useremail").value = query.email;
        document.querySelector("#email").value = query.email;
        document.querySelector("#password").value = query.password;

        sendAlert("Details updated successfully!");
    }
    // Output members
    outputActiveMembers(query.profile, query.name, query.oldname);

    // Output messages
    query.messages.forEach((message) => {
        outputMessage(message);
    });

    // Output Files
    outputFiles(query.files, query.pId);

    // If admin
    const pName = document.querySelector("#project-title").innerText;
    if (query.oldname === document.querySelector("#project-admin").value) {
        document.querySelector("#adminFile").innerHTML = `${pName}&nbsp;<span>(${query.name})</span>`;
        document.querySelector("#project-admin").value = query.name;
    }

    // Update main js
    document.querySelector("#user-profile").value = query.profile;
    document.querySelector("#user-name").value = query.name;
})

// Alert
function sendAlert(message) {
    const alertMessage = document.querySelector(".pedAlert");
    alertMessage.innerText = message;
    alertMessage.classList.add("visible");

    setTimeout(() => {
        alertMessage.classList.remove("visible");
        alertMessage.innerText = "";
    }, 5000);
}