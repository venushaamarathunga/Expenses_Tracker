const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const { v4: uuidv4 } = require("uuid");

const dbPath = path.join(app.getPath("downloads"), "db.json");

function initDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ products: [] }, null, 2));
  }
}

function readDB() {
  initDB();
  const data = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function addProduct(product) {
  const db = readDB();
  product.id = uuidv4();
  db.products.push(product);
  writeDB(db);
  return product;
}

function editProduct(updatedProduct) {
  const db = readDB();

  const index = db.products.findIndex((p) => p.id === updatedProduct.id);

  if (index !== -1) {
    db.products[index] = updatedProduct;

    writeDB(db);
    return { success: true };
  } else {
    return { success: false, message: "Product not found." };
  }
}

function deleteProduct(productId) {
  const db = readDB();
  const index = db.products.findIndex((p) => p.id === productId);

  if (index !== -1) {
    db.products.splice(index, 1);
    writeDB(db);
    return { success: true };
  } else {
    return { success: false, message: "Product not found." };
  }
}

function getSelectedFilterProducts(fromDate, toDate) {
  const data = fs.readFileSync(path.join(app.getPath("downloads"), "db.json"), "utf8");
  const products = JSON.parse(data).products || [];

  if (!fromDate || !toDate) return products;

  const from = new Date(fromDate);
  const to = new Date(toDate);
  return products.filter((p) => {
    const productDate = new Date(p.date);
    return productDate >= from && productDate <= to;
  });
}

module.exports = {
  addProduct,
  editProduct,
  deleteProduct,
  getSelectedFilterProducts,
};
