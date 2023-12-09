const profileMenu = document.querySelector(".profile-menu");
const chooseAvatar = document.querySelector(".choose-avatar");
const loginform = document.querySelector("#login-form");
const signupform = document.querySelector("#signup-form");
const profileFrame = document.querySelector("#defaultUser");
const profileInput = document.querySelector("#profile");
const loginAlertMessage = document.querySelector(".login-alert-message");
const signupAlertMessage = document.querySelector(".signup-alert-message");

// Show Profile Menu
document.querySelector(".profile-selector-btn").addEventListener("click", () => {
    profileMenu.classList.add("visible");
})

// Close Profile Menu when clicked outside
document.addEventListener("click", (e) => {
    if (e.target.id != "defaultUser" && e.target.id != "photo-camera") {
        profileMenu.classList.remove("visible");
    }
});

// Show Avatar Menu
document.querySelector("#chooseProfile").addEventListener("click", () => {
    chooseAvatar.classList.add("showAvatar");
    signupform.classList.add("hideMain");
});

// Hide Avatar Menu
document.querySelector("#closeBtn").addEventListener("click", () => {
    chooseAvatar.classList.remove("showAvatar");
    signupform.classList.remove("hideMain");
})

// Show login form
document.querySelector("#login").addEventListener("click", () => {
    loginform.classList.remove("hide-form");
    signupform.classList.add("hide-form");
    loginAlertMessage.innerText = "";
})

// Show signup form
document.querySelector("#signup").addEventListener("click", () => {
    signupform.classList.remove("hide-form");
    loginform.classList.add("hide-form");
    signupAlertMessage.innerText = "";
})

// Choose Profile
function selectProfile(id) {
    profileFrame.src = `assets/images/avatars/${id}.png`;
    profileInput.value = id;
    chooseAvatar.classList.remove("showAvatar");
    signupform.classList.remove("hideMain");
}

// Set default avatar
document.querySelector("#defaultProfile").addEventListener("click", () => {
    profileFrame.src = `assets/images/avatars/defaultUser.png`;
    profileInput.value = "defaultUser";
})

// Validate Password
const pswd = document.querySelector("#password");
const confirmPswd = document.querySelector("#confirm-password");

function onChange() {
    if (pswd.value != confirmPswd.value) {
        confirmPswd.setCustomValidity('Passwords do not match');
    }
    else {
        confirmPswd.setCustomValidity("");
    }
}