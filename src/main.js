/*
Application entry point and main JS file
Author: Mark Duske
*/

//Import
const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

const colonyClient = require("./colonyClient");

//Global variables
let mainWindow;
let researchWindow; //Currently Open Research Window

let currentAccount = {}; //The account curently in use

let accountSelectWindow; //Currently open Account Selection Window
let accountSelectCallback;

let colonySelectWindow; //Currently open Colony Selection Window
let colonySelectCallback;

//Already loaded colony information
let existingColonies = [];

//Uncomment line below before releasing for fnial users
//process.env.NODE_ENV = 'prod';

//Initialization
app.on("ready", initMainWindow);

//Functions

/**
 * Open the Main Window
 */
function initMainWindow() {
    mainWindow = new BrowserWindow({
        "minHeight": 700,
        "minWidth": 800,
        "backgroundColor": '#FFFFFF',
        show: false
    });

    mainWindow.loadURL(
        url.format(
            {
                pathname: path.join(__dirname, "mainWindow.html"),
                protocol: "file",
                slashes: true
            }
        )
    );

    //Set Window Menu
    const menuTemplate = Menu.buildFromTemplate(mainWindowMenu);
    Menu.setApplicationMenu(menuTemplate);

    //Close App when Main Window Closes
    mainWindow.on("close", function () {
        app.quit();
    });

    //Ask for an Account to use
    mainWindow.once("ready-to-show", function () {
        console.log("Select Account!");
        mainWindow.show();
        selectAccount(setCurrentAccount, "You must first select the Ethereum account");
    });

}

/**
 * Set the number and other data for the currently selected account
 * @param {*} _accountNumber 
 * @param {*} _accountAddress 
 */
function setCurrentAccount(_accountNumber, _accountAddress) {
    currentAccount = {
        "number": _accountNumber,
        "adress": _accountAddress
    };
    console.log("Account Selected: " + _accountNumber, _accountAddress);

    mainWindow.webContents.send('account:change', _accountNumber, _accountAddress);
}

/**
 * Open a Research Window
 */
function openResearchWindow(_researchId) {
    //Close currently open Research, if any is open
    if (researchWindow != null) {
        researchWindow.close();
        researchWindow = null;
    }

    researchWindow = new BrowserWindow({
        /*"parent": mainWindow,*/
        "minHeight": 700,
        "minWidth": 800
    });

    researchWindow.loadURL(
        url.format(
            {
                pathname: path.join(__dirname, "researchWindow.html"),
                protocol: "file",
                slashes: true
            }
        )
    );

    researchWindow.on("close", function () {
        researchWindow = null;
    });

    if (_researchId > 0) {
        //Retrieve Domain data from Colony
        let researchData;

        //TODO: Load Data

        //Load research information
        researchWindow.webContents.send("research:loadData", researchData);
    }
}

/**
 * Open a Task Window
 */
function openTaskWindow(_taskId) {
    let taskWindow = new BrowserWindow({
        "parent": researchWindow,
        "height": 500,
        "width": 600,
        resizable: false
    });

    taskWindow.loadURL(
        url.format(
            {
                pathname: path.join(__dirname, "taskWindow.html"),
                protocol: "file",
                slashes: true
            }
        )
    );

    if (_taskId > 0) {
        //Retrieve Task data from Colony
        let taskData;

        //TODO: Load Data

        //Load task information
        taskWindow.webContents.send("task:loadData", taskData);
    }
}

/**
 * Create a brand new colony
 */
function createColony() {
    let clientCreation = colonyClient.createColony(0, "Super Colony", "SupCNLY");
    clientCreation.then(function () {
        console.log("Colony CREATED!");
    }, function (reason) {
        console.log("Colony Error! " + reason);
    }).catch(err => console.error(err));
}

/**
 * Open an existing Colony
 */
openColony = async function (_colonyId, _colonyAddress) {
    const accountNumber = currentAccount.number;

    if (accountNumber == null) {
        console.log("Error: No Account selected");

        //Force account Selection
        selectAccount(openColony);
    }

    if (_colonyId > 0) {
        console.log("Open Colony " + _colonyId + " using Account: " + accountNumber);
        console.log("existingColonies.length " + existingColonies.length);
        let colonyData;
        for (var colony in existingColonies) {
            console.log(colony);
            console.log(existingColonies[colony]);
            if (existingColonies[colony].id == _colonyId) {
                colonyData = existingColonies[colony];
                break;
            }
        }
        console.log(JSON.stringify(colonyData));
        mainWindow.webContents.send("colony:change", colonyData);
    } else {
        //Show Colony Selection window
        try {
            await selecColony(openColony);
        } catch (e) {
            console.error(e);
        }
    }

    //Open existing Colony under selected user
    //let listColony = colonyClient.listColonies(accountNumber);

    /*
    listColony.then(function (_colonyList) {
        console.log("Colony LISTED! " + _colonyList);


    }, function (reason) {
        console.log("Colony Error! " + reason);
    }).catch(err => console.error(err));
    */
}

/**
 * Shows selector to pick a single Account
 */
selectAccount = async function (_callBack, _toastMessage) {
    if (accountSelectWindow != null) {
        accountSelectWindow.close();
        accountSelectWindow = null;
        accountSelectCallback = null;
    }
    //Show window to select Account
    accountSelectWindow = new BrowserWindow({
        "parent": mainWindow,
        "height": 150,
        "width": 500,
        resizable: false,
        modal: true,
        show: false,
        autoHideMenuBar: true
    });

    accountSelectWindow.loadURL(
        url.format(
            {
                pathname: path.join(__dirname, "selectAccountWindow.html"),
                protocol: "file",
                slashes: true
            }
        )
    );

    accountSelectWindow.on("close", function () {
        accountSelectWindow = null;
        accountSelectCallback = null;
    });

    //Retrieve existing accounts
    const accountList = await colonyClient.listAccounts();
    //console.log("Listed Accounts: " + accountList.length);

    //Set Callback fucntion
    accountSelectCallback = _callBack;

    //accountSelectWindow.webContents.toggleDevTools();

    accountSelectWindow.once("ready-to-show", function () {
        //console.log("Show Account Window with " + accountList.length + " accounts!");
        accountSelectWindow.show();
        accountSelectWindow.webContents.send('account:list', accountList, _toastMessage);
    });
}

/**
 * Shows selector to pick a single Account
 */
selecColony = async function (_callBack) {
    const accountNumber = currentAccount.number;

    if (colonySelectWindow != null) {
        try {
            colonySelectWindow.close();
            colonySelectWindow = null;
            colonySelectCallback = null;
        } catch (e) { }
    }

    //Retrieve existing accounts
    const colonyList = (existingColonies.length == 0) ? await colonyClient.listColonies(accountNumber) : existingColonies;
    existingColonies = colonyList;
    console.log("Loaded Colonies: " + colonyList.length);

    //Set Callback function
    colonySelectCallback = _callBack;

    //Show window to select Account
    colonySelectWindow = new BrowserWindow({
        "parent": mainWindow,
        "height": 400,
        "width": 700,
        resizable: false,
        modal: true,
        show: false,
        autoHideMenuBar: true
    });

    colonySelectWindow.loadURL(
        url.format(
            {
                pathname: path.join(__dirname, "selectColonyWindow.html"),
                protocol: "file",
                slashes: true
            }
        )
    );

    colonySelectWindow.on("close", function () {
        colonySelectWindow = null;
        colonySelectCallback = null;
    });

    //accountSelectWindow.webContents.toggleDevTools();

    colonySelectWindow.once("ready-to-show", function () {
        //console.log("Show Account Window with " + accountList.length + " accounts!");
        colonySelectWindow.show();
        colonySelectWindow.webContents.send("colony:list", colonyList, "Select existing DDS Colony to open");
    });
}

//Menu Definition
const mainWindowMenu = [
    {
        label: "Colony",
        submenu: [
            {
                label: "New",
                click() {
                    createColony()
                }
            },
            {
                label: "Open",
                click() {
                    openColony()
                }
            },
            {
                label: "Open Recent..."
            },
            {
                label: "Change Colony",
                click() {
                    selectAccount(setCurrentAccount);
                }
            },
            {
                label: "Quit",
                accelerator: (process.platform == "darwin") ? "Command+Q" : "Ctrl+Q",
                click() {
                    app.quit();
                }
            }
        ]
    },
    {
        label: "Research",
        submenu: [
            {
                label: "New",
                click() {
                    openResearchWindow();
                }
            }
        ]
    }
];

//Adjust Menu for Macs only
if (process.platform == "darwin") {
    mainWindowMenu.unshift({});
}

//Enable Dev Tools
if (process.env.NODE_ENV !== 'prod') {
    mainWindowMenu.push({
        label: "Debug",
        submenu: [
            {
                label: "Toggle Dev Tools",
                accelerator: (process.platform == "darwin") ? "Command+I" : "Ctrl+I",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: "reload"
            }
        ]
    });
}

//Events
ipcMain.on("task:open", function (e, _taskId) {
    openTaskWindow(_taskId);
});

ipcMain.on("research:open", function (e, _researchId) {
    openResearchWindow(_researchId);
});

ipcMain.on("colony:new", function (e, _researchId) {
    createColony();
});

ipcMain.on("account:selected", function (e, _accountNumber, _accountAddress) {
    console.log("Etherium Account Selected " + _accountNumber + " / " + _accountAddress);

    if (accountSelectCallback != null) {
        console.log("Triggering Account Select Callback");
        accountSelectCallback(_accountNumber, _accountAddress);
    }
});

ipcMain.on("colony:selected", function (e, _colonyId, _colonyAddress) {
    console.log("DDS Colony Selected " + _colonyId + " / " + _colonyAddress);

    if (colonySelectCallback != null) {
        console.log("Triggering Colony Select Callback");
        colonySelectCallback(_colonyId, _colonyAddress);
    }
});
