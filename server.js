import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server as SocketIOServer } from 'socket.io';
import formatMessage from "./utils/messages.js";
import {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    updateUsers,
} from "./utils/users.js";
import bodyParser from "body-parser";
import querystring from "querystring";
import compiler from "./utils/codelly/codelly.js";
import cuid from "cuid";
import fs from "fs-extra";

const options = { stats: true }; // prints stats on console
compiler.init(options);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);


// Set static folder
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const botName = "Code Connect Bot";

// Connect to mongoDB database
// mongoose.connect("mongodb://localhost:27017/codeconnectDB");
mongoose.connect("mongodb+srv://kunaldusk:thMXljqFOmUu9n2U@cluster0.tg40em3.mongodb.net/codeconnectDB");

// Create Project Info Schema
const projectInfoSchema = mongoose.Schema({
    project_id: String,
    project_name: String,
    project_admin: String,
});

const ProjectInfo = mongoose.model("projectinfo", projectInfoSchema);

// Create User schema
const userSchema = mongoose.Schema({
    profile: String,
    name: String,
    email: String,
    password: String,
    projects: [projectInfoSchema]
});

const User = mongoose.model("user", userSchema);

// Create Member Schema
const memberSchema = mongoose.Schema({
    memberProfile: String,
    memberName: String,
    memberEmail: String,
});

const Member = mongoose.model("member", memberSchema);

// Create File Schema
const fileSchema = mongoose.Schema({
    fileName: String,
    fileOwner: String,
    fileContent: String,
    fileLang: String,
    fileStatus: String,
})

const File = mongoose.model("file", fileSchema);

// Message Schema
const messageSchema = mongoose.Schema({
    tempId: Number,
    userName: String,
    text: String,
    time: String,
})

const Message = mongoose.model("message", memberSchema);

// Create Project Schema
const projectSchema = mongoose.Schema({
    projectId: String,
    projectName: String,
    admin: String,
    adminName: String,
    projectLang: String,
    projectContent: String,
    members: [memberSchema],
    files: [fileSchema],
    messages: [messageSchema],
})

const Project = mongoose.model("project", projectSchema);

// **********************************************************************************************************
// Get Routes
// Login Page
app.get("/", (req, res) => {

    // Clear temp folder
    compiler.flush(() => { });

    let login = req.query.login;
    let signup = req.query.signup;
    let message = req.query.message;

    if (login === undefined && signup === undefined && message === undefined) {
        login = "";
        signup = "hide-form";
        message = "";
    }

    res.render("login.ejs", {
        login: login,
        signup: signup,
        message: message,
    });
});

// Home Page
app.get("/home", (req, res) => {
    const currEmail = req.query.userEmail;
    const createForm = req.query.createForm;
    const joinForm = req.query.joinForm;
    const updateForm = req.query.updateForm;
    const headerStop = req.query.headerStop;
    const mainStop = req.query.mainStop;
    const paAlert = req.query.paAlert;
    const alterProjectAlert = req.query.alterProjectAlert;

    User.findOne({ email: currEmail })
        .then((foundUser) => {
            res.render("home.ejs", {
                userDetails: foundUser,
                createFormVisibility: createForm,
                joinFormVisibility: joinForm,
                updateUserFormVisibility: updateForm,
                headerVisibility: headerStop,
                mainVisibility: mainStop,
                alertMessage: paAlert,
                alterProjectMessage: alterProjectAlert,
            });
        })
})

// Main Page
app.get("/main/:projectId", (req, res) => {
    const pId = req.params.projectId;
    const currEmail = req.query.useremail;
    // const updateForm = req.query.updateForm;

    Project.findOne({ projectId: pId })
        .then((foundProject) => {
            if (foundProject) {
                User.findOne({ email: currEmail })
                    .then((foundUser) => {
                        res.render("main.ejs", {
                            userDetails: foundUser,
                            projectDetails: foundProject,
                            updateUserFormVisibility: "",
                            alertMessage: "",
                        })
                    })
            }

            // If project doen't exist
            else {
                const query = querystring.stringify({
                    userEmail: currEmail,
                    createForm: "",
                    joinForm: "",
                    updateForm: "",
                    headerStop: "",
                    mainStop: "",
                    paAlert: "",
                    alterProjectAlert: "This project has been deleted by the admin!",
                });

                res.redirect(`/home?${query}`);
            }
        })
        .catch((err) => {
            console.log(err);
        })
})

// ***********************************************************************************************************
// Post Routes
// Login
app.post("/login", (req, res) => {
    const currEmail = req.body.email;
    const psswd = req.body.password;

    User.findOne({ email: currEmail })
        .then((foundUser) => {
            // User Found
            if (foundUser) {
                // Credentials Match
                if (foundUser.password === psswd) {

                    const query = querystring.stringify({
                        userEmail: foundUser.email,
                        createForm: "",
                        joinForm: "",
                        updateForm: "",
                        headerStop: "",
                        mainStop: "",
                        paAlert: "",
                        alterProjectAlert: "",
                    });

                    res.redirect(`/home?${query}`);
                }
                // Incorrect Credentials
                else {

                    const query = querystring.stringify({
                        login: "",
                        signup: "hide-form",
                        message: "Incorrect login credentials!",
                    })

                    res.redirect(`/?${query}`);
                }
            }
            // User not found
            else {
                const query = querystring.stringify({
                    login: "",
                    signup: "hide-form",
                    message: "User doesn't exist!",
                })

                res.redirect(`/?${query}`);
            }
        })
        .catch((err) => {
            console.log(err);
        })
})

// Signup
app.post("/signup", (req, res) => {
    const currEmail = req.body.email;

    User.findOne({ email: currEmail })
        .then((foundUser) => {
            // User already exists
            if (foundUser) {
                const query = querystring.stringify({
                    login: "hide-form",
                    signup: "",
                    message: "User already exist!",
                })

                res.redirect(`/?${query}`);
            }

            else {
                User.findOne({ name: req.body.username })
                    .then((user) => {
                        // UserName already exists
                        if (user) {
                            const query = querystring.stringify({
                                login: "hide-form",
                                signup: "",
                                message: "Username already exist!",
                            })

                            res.redirect(`/?${query}`);
                        }
                        // New user
                        else {
                            const newUser = new User({
                                profile: req.body.profile,
                                name: req.body.username,
                                email: currEmail,
                                password: req.body.password,
                            })
                            newUser.save();

                            const query = querystring.stringify({
                                userEmail: currEmail,
                                createForm: "",
                                joinForm: "",
                                updateForm: "",
                                headerStop: "",
                                mainStop: "",
                                paAlert: "",
                                alterProjectAlert: "",
                            });

                            res.redirect(`/home?${query}`);
                        }
                    })
            }
        })
        .catch((err) => {
            console.log(err);
        })
});

// Update User Details
app.post("/updateDetails", (req, res) => {
    const currEmail = req.body.useremail;
    const profile = req.body.profile;
    const name = req.body.username;
    const oldname = req.body.oldname;
    const password = req.body.password;
    const update = {
        profile: req.body.profile,
        name: req.body.username,
        password: req.body.password,
    }

    User.findOne({ name: req.body.username })
        .then((foundUser) => {
            if (foundUser) {
                // Username already exist!
                if (foundUser.email != currEmail) {
                    const query = querystring.stringify({
                        userEmail: currEmail,
                        createForm: "",
                        joinForm: "",
                        updateForm: "visible",
                        headerStop: "zindex-200",
                        mainStop: "blur",
                        paAlert: "Username already exist!",
                        alterProjectAlert: "",
                    })

                    res.redirect(`/home?${query}`);
                }
                else {
                    User.findOneAndUpdate({ email: currEmail }, update)
                        .then((userInfo) => {
                            userInfo.projects.forEach((item) => {
                                // Update the details in Project Doc
                                Project.findOne({ projectId: item.project_id })
                                    .then((foundProject) => {
                                        if (foundProject) {
                                            // Check if it's admin
                                            if (foundProject.admin === currEmail) {
                                                foundProject.adminName = name;
                                            }

                                            // Update in members array
                                            let foundIndex = foundProject.members.findIndex(member => member.memberName === oldname);
                                            if (foundIndex >= 0) {
                                                foundProject.members[foundIndex].memberProfile = profile;
                                                foundProject.members[foundIndex].memberName = name;
                                            }

                                            // Update in files array
                                            foundIndex = foundProject.files.findIndex(file => file.fileOwner === oldname);
                                            if (foundIndex >= 0) {
                                                foundProject.files[foundIndex].fileOwner = name;
                                            }

                                            // Update in messages array
                                            const chats = foundProject.messages.filter(message => message.userName === oldname);
                                            chats.forEach(chat => {
                                                chat.userName = name;
                                            });

                                            foundProject.save();
                                        }
                                    })
                            });

                            const query = querystring.stringify({
                                userEmail: currEmail,
                                createForm: "",
                                joinForm: "",
                                updateForm: "",
                                headerStop: "",
                                mainStop: "",
                                paAlert: "",
                                alterProjectAlert: "Userdetails updated successfully!",
                            });

                            res.redirect(`/home?${query}`);
                        })
                }
            }
            else {
                User.findOneAndUpdate({ email: currEmail }, update)
                    .then((userInfo) => {
                        userInfo.projects.forEach((item) => {
                            // Update the details in Project Doc
                            Project.findOne({ projectId: item.project_id })
                                .then((foundProject) => {
                                    if (foundProject) {
                                        // Check if it's admin
                                        if (foundProject.admin === currEmail) {
                                            foundProject.adminName = name;
                                        }

                                        // Update in members array
                                        let foundIndex = foundProject.members.findIndex(member => member.memberName === oldname);
                                        if (foundIndex >= 0) {
                                            foundProject.members[foundIndex].memberProfile = profile;
                                            foundProject.members[foundIndex].memberName = name;
                                        }

                                        // Update in files array
                                        foundIndex = foundProject.files.findIndex(file => file.fileOwner === oldname);
                                        if (foundIndex >= 0) {
                                            foundProject.files[foundIndex].fileOwner = name;
                                        }

                                        // Update in messages array
                                        const chats = foundProject.messages.filter(message => message.userName === oldname);
                                        chats.forEach(chat => {
                                            chat.userName = name;
                                        });

                                        foundProject.save();
                                    }
                                })
                        });

                        const query = querystring.stringify({
                            userEmail: currEmail,
                            createForm: "",
                            joinForm: "",
                            updateForm: "",
                            headerStop: "",
                            mainStop: "",
                            paAlert: "",
                            alterProjectAlert: "Userdetails updated successfully!",
                        });

                        console.log("Hello");
                        res.redirect(`/home?${query}`);
                    })
            }

        })
        .catch((err) => {
            console.log(err);
        })
})

// Create Project
app.post("/newProject", (req, res) => {
    const currEmail = req.body.useremail;
    const pId = req.body.pId;
    const pName = req.body.pName;
    const lang = req.body.pLang;

    Project.findOne({ projectId: pId })
        .then((foundProject) => {
            // Project Already Exists
            if (foundProject) {
                const query = querystring.stringify({
                    userEmail: currEmail,
                    createForm: "visible",
                    joinForm: "",
                    updateForm: "",
                    headerStop: "zindex-200",
                    mainStop: "blur",
                    paAlert: "Project Already Exists !",
                    alterProjectAlert: "",
                });

                res.redirect(`/home?${query}`);
            }

            // New Project
            else {
                // Find User and Update Project Data
                const newProjectInfo = new ProjectInfo({
                    project_id: pId,
                    project_name: pName,
                    project_admin: currEmail,
                })

                User.findOne({ email: currEmail })
                    .then((foundUser) => {
                        if (foundUser) {
                            // Add Data in User DB
                            foundUser.projects.push(newProjectInfo);
                            foundUser.save();

                            // Add Data in project DB 
                            const newMember = new Member({
                                memberProfile: foundUser.profile,
                                memberName: foundUser.name,
                                memberEmail: foundUser.email,
                            });

                            const newProject = new Project({
                                projectId: pId,
                                projectName: pName,
                                admin: currEmail,
                                adminName: foundUser.name,
                                projectLang: lang,
                                projectContent: "",
                                members: [newMember],
                            })
                            newProject.save();
                        }
                    })

                const query = querystring.stringify({
                    userEmail: currEmail,
                    createForm: "",
                    joinForm: "",
                    updateForm: "",
                    headerStop: "",
                    mainStop: "",
                    paAlert: "",
                    alterProjectAlert: `Created ${pName} project successfully!`,
                });

                res.redirect(`/home?${query}`);
            }
        })
        .catch((err) => {
            console.log(err);
        })
})

// Join Project
app.post("/joinProject", (req, res) => {
    const currEmail = req.body.useremail;
    const pId = req.body.pId;
    const pName = req.body.pName;

    Project.findOne({ projectId: pId })
        .then((foundProject) => {
            // Project Found
            if (foundProject) {
                // Project Names Match
                if (foundProject.projectName === pName) {
                    // Find User and Update Project Data
                    const newProjectInfo = new ProjectInfo({
                        project_id: foundProject.projectId,
                        project_name: foundProject.projectName,
                        project_admin: foundProject.admin,
                    })

                    User.findOne({ email: currEmail })
                        .then((foundUser) => {
                            if (foundUser) {
                                // Update Data in User DB
                                foundUser.projects.push(newProjectInfo);
                                foundUser.save();

                                // Update Data in project DB 
                                const newMember = new Member({
                                    memberProfile: foundUser.profile,
                                    memberName: foundUser.name,
                                    memberEmail: foundUser.email,
                                });

                                foundProject.members.push(newMember);
                                foundProject.save();
                            }
                        })

                    const query = querystring.stringify({
                        userEmail: currEmail,
                        createForm: "",
                        joinForm: "",
                        updateForm: "",
                        headerStop: "",
                        mainStop: "",
                        paAlert: "",
                        alterProjectAlert: `Joined ${pName} project successfully!`,
                    });

                    res.redirect(`/home?${query}`);
                }
                // Invalid Credentials
                else {
                    const query = querystring.stringify({
                        userEmail: currEmail,
                        createForm: "",
                        joinForm: "visible",
                        updateForm: "",
                        headerStop: "zindex-200",
                        mainStop: "blur",
                        paAlert: "Invalid Credentials!",
                        alterProjectAlert: "",
                    });

                    res.redirect(`/home?${query}`);
                }
            }
            // Project Doesn't Exist
            else {
                const query = querystring.stringify({
                    userEmail: currEmail,
                    createForm: "",
                    joinForm: "visible",
                    updateForm: "",
                    headerStop: "zindex-200",
                    mainStop: "blur",
                    paAlert: "Project Doesn't Exist!",
                    alterProjectAlert: "",
                });

                res.redirect(`/home?${query}`);
            }
        })
        .catch((err) => {
            console.log(err);
        })
})


// Exit Project
app.post("/exitProject", (req, res) => {
    const currEmail = req.body.useremail;
    const pId = req.body.project_id;
    const pName = req.body.project_name;

    // Update in the Project Document
    Project.findOneAndUpdate({ projectId: pId }, { $pull: { members: { memberEmail: currEmail } } })
        .then(() => {
            // Update User Doecument
            User.findOneAndUpdate({ email: currEmail }, { $pull: { projects: { project_id: pId } } })
                .then(() => {
                    const query = querystring.stringify({
                        userEmail: currEmail,
                        createForm: "",
                        joinForm: "",
                        updateForm: "",
                        headerStop: "",
                        mainStop: "",
                        paAlert: "",
                        alterProjectAlert: `Exited ${pName} project successfully!`,
                    });

                    res.redirect(`/home?${query}`);
                })
        })
        .catch((err) => {
            console.log(err);
        })
})

// Delete Project
app.post("/deleteProject", (req, res) => {
    const currEmail = req.body.useremail;
    const pId = req.body.deleteProjectId;
    const pName = req.body.deleteProjectName;

    Project.deleteOne({ projectId: pId })
        .then(() => {
            // Update admin's User Doecument
            User.findOneAndUpdate({ email: currEmail }, { $pull: { projects: { project_id: pId } } })
                .then(() => {
                    const query = querystring.stringify({
                        userEmail: currEmail,
                        createForm: "",
                        joinForm: "",
                        updateForm: "",
                        headerStop: "",
                        mainStop: "",
                        paAlert: "",
                        alterProjectAlert: `Deleted ${pName} project successfully!`,
                    });

                    res.redirect(`/home?${query}`);
                })
        })
        .catch((err) => {
            console.log(err);
        })
})

// **********************************************************************************************************
// Sockets
// Run when client connects
io.on("connection", (socket) => {
    socket.on("joinRoom", (details) => {
        const user = userJoin(socket.id, details.userProfile, details.userName, details.userEmail, details.projectId);

        socket.join(user.projectId);

        // Output previous messages
        Project.findOne({ projectId: user.projectId })
            .then((foundProject) => {
                if (foundProject) {
                    socket.emit("prevMessage", foundProject.messages);

                    // Welcome current user
                    socket.emit("message", formatMessage(botName, "Welcome to Code Connect!"));

                }
            })

        // Broadcast when a user connects
        socket.broadcast
            .to(user.projectId)
            .emit(
                "message",
                formatMessage(botName, `${user.userName} has joined the project`)
            );

        // Get Project Members and files
        Project.findOne({ projectId: user.projectId })
            .then((foundProject) => {
                // Send active members info and files
                io.to(user.projectId).emit("activeMembersFiles", {
                    projectMembers: foundProject.members,
                    activeMembers: getRoomUsers(user.projectId),
                    projectFiles: foundProject.files,
                    projectId: user.projectId,
                });
            })
            .catch((err) => {
                console.log(err);
            })

        // Create File
        socket.on('addFile', (details) => {
            const fName = details.fName;
            const fOwner = details.fOwner;
            const fContent = details.fContent;
            const fLang = details.fLang;
            const fStatus = details.fStatus;
            const pId = details.pId;

            Project.findOne({ projectId: pId })
                .then((foundProject) => {
                    if (foundProject) {
                        if (!foundProject.files.find(file => file.fileName === fName) && foundProject.projectName != fName) {
                            const newFile = new File({
                                fileName: fName,
                                fileOwner: fOwner,
                                fileContent: fContent,
                                fileLang: fLang,
                                fileStatus: fStatus,
                            })

                            foundProject.files.push(newFile);
                            foundProject.save();

                            const details = {
                                projectFiles: foundProject.files,
                                projectId: pId,
                            }
                            io.to(user.projectId).emit('updateFile', details);
                        }
                        else {
                            socket.emit("alert", `A file with the filename "${fName}" already exists`)
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        })

        // Get File
        socket.on('getFile', (details) => {
            Project.findOne({ projectId: details.pId })
                .then((foundProject) => {
                    if (foundProject) {
                        // If root file
                        if (details.owner === 'admin') {
                            // Send file
                            socket.emit('foundFile', {
                                name: foundProject.projectName,
                                content: foundProject.projectContent,
                                lang: foundProject.projectLang,
                                owner: foundProject.adminName,
                                status: "",
                                projectAdmin: foundProject.admin,
                            });
                        }
                        // Other Files
                        else {
                            const foundFile = foundProject.files.find(file => file.fileName === details.fName);

                            // Send file
                            socket.emit('foundFile', {
                                name: foundFile.fileName,
                                content: foundFile.fileContent,
                                lang: foundFile.fileLang,
                                owner: foundFile.fileOwner,
                                status: foundFile.fileStatus,
                                projectAdmin: foundProject.admin,
                            });
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        })

        // Save File
        socket.on("saveFile", (details) => {
            Project.findOne({ projectId: details.projectId })
                .then((foundProject) => {
                    if (foundProject) {
                        // In case of root file
                        if (foundProject.projectName === details.fileName) {
                            foundProject.projectLang = details.fileLang;
                            foundProject.projectContent = details.fileContent;
                        }
                        // In case of other files
                        else {
                            const foundIndex = foundProject.files.findIndex(file => file.fileName === details.fileName);
                            foundProject.files[foundIndex].fileContent = details.fileContent;
                            foundProject.files[foundIndex].fileLang = details.fileLang;
                        }

                        foundProject.save();

                        socket.emit('filesaved', "File saved successfully");
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        })

        // Mark status as complete
        socket.on("markComplete", (details) => {
            let status = "";
            Project.findOne({ projectId: details.pId })
                .then((foundProject) => {
                    if (foundProject) {
                        const foundIndex = foundProject.files.findIndex(file => file.fileName === details.fName);
                        // If is status is pending
                        if (foundProject.files[foundIndex].fileStatus === "pending") {
                            foundProject.files[foundIndex].fileStatus = "complete";
                        }
                        // If status is complete or approved
                        else {
                            foundProject.files[foundIndex].fileStatus = "pending";
                        }

                        foundProject.save();

                        const data = {
                            fName: details.fName,
                            fstatus: foundProject.files[foundIndex].fileStatus,
                        }
                        io.to(user.projectId).emit("completeStatus", data);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        })

        // Approve
        socket.on("approve", (details) => {
            Project.findOne({ projectId: details.pId })
                .then((foundProject) => {
                    if (foundProject) {
                        const foundIndex = foundProject.files.findIndex(file => file.fileName === details.fName);
                        // If is status is complete 
                        if (foundProject.files[foundIndex].fileStatus === "complete" || foundProject.files[foundIndex].fileStatus === "reject") {
                            foundProject.files[foundIndex].fileStatus = "approve";
                        }
                        // If status is approved
                        else if (foundProject.files[foundIndex].fileStatus === "approve") {
                            foundProject.files[foundIndex].fileStatus = "complete";
                        }

                        foundProject.save();

                        const data = {
                            fName: details.fName,
                            fstatus: foundProject.files[foundIndex].fileStatus,
                        }
                        io.to(user.projectId).emit("approveStatus", data);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        })

        // Reject
        socket.on("reject", (details) => {
            Project.findOne({ projectId: details.pId })
                .then((foundProject) => {
                    if (foundProject) {
                        const foundIndex = foundProject.files.findIndex(file => file.fileName === details.fName);
                        // If is status is complete 
                        if (foundProject.files[foundIndex].fileStatus === "complete" || foundProject.files[foundIndex].fileStatus === "approve") {
                            foundProject.files[foundIndex].fileStatus = "reject";
                        }
                        // If status is rejected
                        else if (foundProject.files[foundIndex].fileStatus === "reject") {
                            foundProject.files[foundIndex].fileStatus = "complete";
                        }

                        foundProject.save();

                        const data = {
                            fName: details.fName,
                            fstatus: foundProject.files[foundIndex].fileStatus,
                        }
                        io.to(user.projectId).emit("approveStatus", data);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        })

        // Compile code
        socket.on("compile", (codeData) => {
            const code = codeData.code;
            const lang = codeData.lang;
            const input = codeData.input;
            const fName = codeData.fName;
            let output = "";

            // For C and Cpp
            if (lang === "c") {
                if (!input) {
                    var envData = { OS: "linux", cmd: "gcc" }; // ( uses gcc command to compile )
                    compiler.compileCPP(envData, code, function (data) {
                        if (data.error) {
                            output = data.error;
                        }
                        else {
                            output = data.output;
                        }
                        socket.emit("outputData", output);
                    });
                }
                else {
                    var envData = { OS: "linux", cmd: "gcc" }; // ( uses gcc command to compile )
                    compiler.compileCPPWithInput(envData, code, input, function (data) {
                        if (data.error) {
                            output = data.error;
                        }
                        else {
                            output = data.output
                        }
                        socket.emit("outputData", output);
                    });
                }
            }

            else if (lang === "cpp") {
                if (!input) {
                    var envData = { OS: "linux", cmd: "g++", options: { timeout: 100000 } }; // ( uses gcc command to compile )
                    compiler.compileCPP(envData, code, function (data) {
                        if (data.error) {
                            output = data.error;
                        }
                        else {
                            output = data.output;
                        }
                        socket.emit("outputData", output);
                    });
                }
                else {
                    var envData = { OS: "linux", cmd: "g++", options: { timeout: 100000 } }; // ( uses gcc command to compile )
                    compiler.compileCPPWithInput(envData, code, input, function (data) {
                        if (data.error) {
                            output = data.error;
                        }
                        else {
                            output = data.output
                        }
                        socket.emit("outputData", output);
                    });
                }
            }

            // For Java
            else if (lang === "java") {
                if (!input) {
                    var envData = { OS: "linux", file: fName }; // (Support for Linux in Next version)
                    compiler.compileJava(envData, code, function (data) {
                        if (data.error) {
                            output = data.error;
                        }
                        else {
                            output = data.output;
                        }
                        socket.emit("outputData", output);
                    });
                }
                else {
                    var envData = { OS: "linux", file: fName }; // (Support for Linux in Next version)
                    compiler.compileJavaWithInput(envData, code, input, function (data) {
                        if (data.error) {
                            output = data.error;
                        }
                        else {
                            output = data.output;
                        }
                        socket.emit("outputData", output);
                    });
                }
            }
            else if (lang === "py") {
                if (!input) {
                    var envData = { cmd: "python3" };
                    compiler.compilePython(envData, code, function (data) {
                        if (data.error) {
                            output = data.error;
                        }
                        else {
                            output = data.output;
                        }
                        socket.emit("outputData", output);
                    });
                }
                else {
                    var envData = { cmd: "python3" };
                    compiler.compilePythonWithInput(envData, code, input, function (data) {
                        if (data.error) {
                            output = data.error;
                        }
                        else {
                            output = data.output;
                        }
                        socket.emit("outputData", output);
                    });
                }
            }
        })

        // Listen for chatMessage
        socket.on("chatMessage", (msg) => {
            const user = getCurrentUser(socket.id);
            Project.findOne({ projectId: user.projectId })
                .then((foundProject) => {
                    if (foundProject) {
                        const data = formatMessage(user.userName, msg);
                        const newMessage = {
                            tempId: 1,
                            userName: data.userName,
                            text: data.text,
                            time: data.time,
                        };
                        foundProject.messages.push(newMessage);

                        const index = foundProject.messages.findIndex(item => item.tempId === 1);

                        foundProject.messages[index].tempId = 0;
                        foundProject.save();

                        io.to(user.projectId).emit("message", foundProject.messages[index]);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        });

        // Download Code
        socket.on("download", ({ fName, admin }) => {
            fs.emptyDir("./public/downloads")
                .then(() => {
                    console.log("hello");
                    let filename = cuid.slug();
                    const path = `/downloads/${filename}`;
                    Project.findOne({ projectId: user.projectId })
                        .then((foundProject) => {
                            if (foundProject) {
                                let fData = "";
                                let flang = "";

                                if (admin) {
                                    fData = foundProject.projectContent;
                                    flang = foundProject.projectLang;
                                }
                                else {
                                    const foundIndex = foundProject.files.findIndex(file => file.fileName === fName);
                                    fData = foundProject.files[foundIndex].fileContent;
                                    flang = foundProject.files[foundIndex].fileLang;
                                }

                                fs.writeFile("./public" + path + "." + flang, fData, (err) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        socket.emit("download", { path, fName, flang });
                                    }
                                });
                            }
                        })
                })
                .catch((err) => {
                    console.log(err);
                })
        })

        // Update user details
        socket.on("updateUser", (data) => {
            const profile = data.profile;
            const oldname = data.oldname;
            const name = data.username;
            const email = data.email;
            const password = data.password;
            const update = {
                profile: profile,
                name: name,
                password: password,
            }
            let query = "";

            User.findOne({ name: name })
                .then((foundUser) => {
                    if (foundUser) {
                        if (foundUser.email != email) {
                            // User already exists!
                            socket.emit("userNameExists", "Username already exists!");
                        }
                        // Didn't change username
                        else {
                            User.findOneAndUpdate({ email: email }, update)
                                .then((userInfo) => {
                                    userInfo.projects.forEach((item) => {
                                        // Update the details in Project Doc
                                        Project.findOne({ projectId: item.project_id })
                                            .then((foundProject) => {
                                                if (foundProject) {
                                                    // Check if it's admin
                                                    if (foundProject.admin === email) {
                                                        foundProject.adminName = name;
                                                    }

                                                    // Update in members array
                                                    let foundIndex = foundProject.members.findIndex(member => member.memberName === oldname);
                                                    foundProject.members[foundIndex].memberProfile = profile;
                                                    foundProject.members[foundIndex].memberName = name;

                                                    // Update in user array
                                                    updateUsers(user.id, profile, name);

                                                    // Update in files array
                                                    foundIndex = foundProject.files.findIndex(file => file.fileOwner === oldname);
                                                    if (foundIndex >= 0) {
                                                        foundProject.files[foundIndex].fileOwner = name;
                                                    }

                                                    // Update in messages array
                                                    const chats = foundProject.messages.filter(message => message.userName === oldname);
                                                    chats.forEach(chat => {
                                                        chat.userName = name;
                                                    });

                                                    foundProject.save();

                                                    query = {
                                                        profile: profile,
                                                        name: name,
                                                        oldname: oldname,
                                                        email: email,
                                                        password: password,
                                                        files: foundProject.files,
                                                        pId: foundProject.projectId,
                                                        messages: foundProject.messages,
                                                    };

                                                    io.to(foundProject.projectId).emit("updateSuccess", query);
                                                }
                                            })
                                    })
                                })
                        }
                    }
                    // Changed username
                    else {
                        User.findOneAndUpdate({ email: email }, update)
                            .then((userInfo) => {
                                userInfo.projects.forEach((item) => {
                                    // Update the details in Project Doc
                                    Project.findOne({ projectId: item.project_id })
                                        .then((foundProject) => {
                                            if (foundProject) {
                                                // Check if it's admin
                                                if (foundProject.admin === email) {
                                                    foundProject.adminName = name;
                                                }

                                                // Update in members array
                                                let foundIndex = foundProject.members.findIndex(member => member.memberName === oldname);
                                                foundProject.members[foundIndex].memberProfile = profile;
                                                foundProject.members[foundIndex].memberName = name;

                                                // Update in user array
                                                updateUsers(user.id, profile, name);

                                                // Update in files array
                                                foundIndex = foundProject.files.findIndex(file => file.fileOwner === oldname);
                                                if (foundIndex >= 0) {
                                                    foundProject.files[foundIndex].fileOwner = name;
                                                }
                                                // Update in messages array
                                                const chats = foundProject.messages.filter(message => message.userName === oldname);
                                                chats.forEach(chat => {
                                                    chat.userName = name;
                                                });

                                                foundProject.save();

                                                query = {
                                                    profile: profile,
                                                    name: name,
                                                    oldname: oldname,
                                                    email: email,
                                                    password: password,
                                                    files: foundProject.files,
                                                    pId: foundProject.projectId,
                                                    messages: foundProject.messages,
                                                };

                                                io.to(foundProject.projectId).emit("updateSuccess", query);
                                            }
                                        })
                                })
                            })
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        })
    });

    // Runs when client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if (user) {
            // Get Project Members
            Project.findOne({ projectId: user.projectId })
                .then((foundProject) => {
                    // Send active members info
                    io.to(user.projectId).emit("activeMembers", {
                        message: formatMessage(botName, `${user.userName} has left the chat`),
                        projectMembers: foundProject.members,
                        activeMembers: getRoomUsers(user.projectId),
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    });
});

// Exit Room
app.get("/exitRoom/:useremail", (req, res) => {
    const currEmail = req.params.useremail;

    const query = querystring.stringify({
        userEmail: currEmail,
        createForm: "",
        joinForm: "",
        headerStop: "",
        mainStop: "",
        paAlert: "",
        alterProjectAlert: "",
    });

    res.redirect(`/home?${query}`);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});

