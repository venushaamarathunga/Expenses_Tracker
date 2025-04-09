const { app, BrowserWindow, ipcMain, screen } = require("electron");
const { addProduct, editProduct, deleteProduct, getSelectedFilterProducts } = require("./db");

if (process.env.NODE_ENV !== "production") {
  try {
    require("electron-reload")(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`),
    });
  } catch (err) {
    console.warn("electron-reload not found (expected in dev only). Skipping reload setup.");
  }
}

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: Math.floor(width * 0.8),
    height: Math.floor(height * 0.6),
    webPreferences: {
      nodeIntegration: true, // TEMP: Allow using require() in renderer
      contextIsolation: false,
    },
  });

  win.loadFile("src/index.html");

  // Add navigation or change views using JavaScript
  ipcMain.on("navigate-to-budget-data", () => {
    win.loadFile("src/budgetData.html");
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("add-product", (event, product) => {
  try {
    addProduct(product);
    return { success: true };
  } catch (err) {
    console.error("Failed to add product:", err);
    return { success: false };
  }
});

ipcMain.handle("edit-product", async (event, updatedProduct) => {
  try {
    const success = await editProduct(updatedProduct);
    return { success };
  } catch (err) {
    console.error("Failed to edit product:", err);
    return { success: false };
  }
});

ipcMain.handle("delete-product", (event, productId) => {
  try {
    const success = deleteProduct(productId);
    return { success };
  } catch (err) {
    console.error("Failed to delete product:", err);
    return { success: false };
  }
});

ipcMain.handle("get-products", async (event, { fromDate, toDate }) => {
  return getSelectedFilterProducts(fromDate, toDate);
});
