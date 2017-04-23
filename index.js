'use strict';
const electron = require('electron');
const path = require('path');
const app = electron.app;
const dialog = electron.dialog;
const log = require('electron-log');
//log.transports.file.level = 'info';

// Disable error dialogs by overriding
// FIX: https://goo.gl/YsDdsS
dialog.showErrorBox = function(title, content) {
    console.log(`${title}\n${content}`);
};

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	electron.BrowserWindow.removeDevToolsExtension("devtron");

	var loading_Winow = new electron.BrowserWindow({
		frame: false,
		width: 200,
		height: 300,
		show: true,
		resizable: false,
		transparent: true,
		position: "center",
		backgroundColor: "#BF404040",
		title: "Loading...",
		icon: path.resolve(path.join(__dirname, 'images', 'imvuicon.png'))
	});

	const win = new electron.BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
			plugins: true,
			preload: path.resolve(path.join(__dirname, 'manipulatIMVU.js')),
			webSecurity: false
		},
		frame: false,
		width: 1300,
		height: 800,
		show: false,
		backgroundColor: "#404040",
		icon: path.resolve(path.join(__dirname, 'images', 'imvuicon.png'))
	});

	loading_Winow.loadURL(`file://${__dirname}/loading.html`);
	win.loadURL('https://secure.imvu.com/next/');

	win.on('closed', onClosed);

	win.webContents.setFrameRate(60);

	win.webContents.on('did-finish-load', function() {
		if(loading_Winow){
			loading_Winow.close();
			loading_Winow = undefined;
		}

	    win.show();
	});
	return win;
}

app.on('window-all-closed', () => {
	log.info("Killed all windows");
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	log.info("Created mainWindow");
	mainWindow = createMainWindow();
});
