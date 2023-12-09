const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const socket = io();
const useprofile = document.querySelector("#user-profile").value;
const username = document.querySelector("#user-name").value;
const useremail = document.querySelector("#user-email").value;
const pId = document.querySelector("#project-id").value;

const details = {
  userProfile: useprofile,
  userName: username,
  userEmail: useremail,
  projectId: pId,
}
// Join chatroom
socket.emit('joinRoom', details);

// Get active members
socket.on('activeMembersFiles', ({ projectMembers, activeMembers, projectFiles, projectId }) => {
  outputActiveMembers(projectMembers, activeMembers, "");
  outputFiles(projectFiles, projectId);
});

// Message from server
socket.on('message', (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Output previous messages
socket.on("prevMessage", (messages) => {
  messages.forEach((message) => {
    outputMessage(message);
  })
})

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// When user exits
socket.on("activeMembers", (data) => {
  outputActiveMembers(data.projectMembers, data.activeMembers, "");
  outputMessage(data.message);
})

// Output message to DOM
function outputMessage(message) {
  if (message.userName != "Code Connect Bot") {
    const username = document.getElementById(`user-${message._id}`);
    if (username) {
      username.innerText = message.userName;
      username.innerHTML += `<span>&nbsp;&nbsp;${message.time}</span>`;
      return;
    }
  }
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');

  if (message.userName != "Code Connect Bot") {
    p.setAttribute("id", `user-${message._id}`);
  }

  p.innerText = message.userName;
  p.innerHTML += `<span>&nbsp;&nbsp;${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add users to DOM
function outputActiveMembers(projectMembers, activeMembers, oldUsername) {
  if (oldUsername != "") {
    // projectMembers => profile
    // activeMembers => name
    document.getElementById(`nm-${oldUsername}`).setAttribute("id", `nm-${activeMembers}`);
    document.querySelector(`#im-${oldUsername}`).setAttribute("src", `/assets/images/avatars/${projectMembers}.png`);
    document.querySelector(`#im-${oldUsername}`).setAttribute("id", `im-${activeMembers}`);
    document.querySelector(`#un-${oldUsername}`).innerText = activeMembers;
    document.querySelector(`#un-${oldUsername}`).setAttribute("id", `un-${activeMembers}`);
    return;
  }
  projectMembers.forEach((member) => {
    const memberData = document.getElementById(`nm-${member.memberName}`);

    // Member Data doesn't exist
    if (!memberData) {
      const li = document.createElement('li');
      li.classList.add("member");
      li.setAttribute("id", `nm-${member.memberName}`);

      const img = document.createElement('img');
      img.setAttribute("id", `im-${member.memberName}`);
      img.setAttribute("src", `/assets/images/avatars/${member.memberProfile}.png`);
      li.appendChild(img);

      const pName = document.createElement('p');
      pName.setAttribute("id", `un-${member.memberName}`);
      pName.innerText = member.memberName;
      li.appendChild(pName);

      const pEmail = document.createElement('p');
      pEmail.classList.add("memberEmail");
      pEmail.innerText = member.memberEmail;
      li.appendChild(pEmail);

      // Check if project member is active
      if (activeMembers.find(user => user.userEmail === member.memberEmail)) {
        li.classList.add("active");
      }

      document.querySelector(".memberList").appendChild(li);
    }
    else {
      // Check if project member is active
      if (activeMembers.find(user => user.userEmail === member.memberEmail)) {
        memberData.classList.add("active");
      }
      // If project member is inactive
      else {
        memberData.classList.remove("active");
      }
    }
  });
}