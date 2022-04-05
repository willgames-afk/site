const path = require("path");



function createWindow() {
    const win = new BrowserWindow({
		//   Pad + width + pad + devTools
        width: (20 + 640 + 20 + 515),

		// topBar + Pad + height + lcd + pad
        height:  (28 + 10 + 480 + 192 + 10),
        backgroundColor: "white",
        webPreferences: {
            preload: path.join(__dirname, "js/renderer.js")
        }
    });
    win.loadFile('index.html');
    console.dir(win);
    win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
   /* if (process.platform !== 'darwin')*/ app.quit() //Not quitting on window close is annoying during dev
})nom 