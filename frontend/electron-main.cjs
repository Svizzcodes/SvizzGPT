const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 720,
    height: 600,
    minWidth: 400,
    minHeight: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: true,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Make sure it floats above full-screen windows on macOS without exiting full-screen
  if (process.platform === 'darwin') {
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
  } else {
    mainWindow.setAlwaysOnTop(true, 'pop-up-menu');
  }

  // Load the running Vite dev server or built files
  const devUrl = 'http://localhost:5173';
  mainWindow.loadURL(devUrl).catch(() => {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerShortcuts() {
  // Global shortcut for Windows & Mac: Cmd+Shift+Space or Ctrl+Shift+Space
  const shortcuts = ['CommandOrControl+Shift+Space', 'Alt+Space', 'CommandOrControl+Shift+S'];

  shortcuts.forEach((key) => {
    try {
      globalShortcut.register(key, () => {
        if (!mainWindow) {
          createWindow();
        } else {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      });
    } catch (e) {
      console.log(`Failed to register ${key}:`, e);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  registerShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
