const users = [];

// Join user to chat
function userJoin(id, userProfile, userName, userEmail, projectId) {
    const user = { id, userProfile, userName, userEmail, projectId };

    users.push(user);

    return user;
}

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// Get room users
function getRoomUsers(projectId) {
    return users.filter(user => user.projectId === projectId);
}

// Update room users
function updateUsers(id, profile, name) {
    const index = users.findIndex(user => user.id === id);

    users[index].userProfile = profile;
    users[index].userName = name;
}

export {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    updateUsers,
};