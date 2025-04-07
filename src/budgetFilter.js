const { ipcRenderer } = require("electron");

const fromDateEl = document.getElementById("from-date");
const toDateEl = document.getElementById("to-date");
const expencesBtn = document.getElementById("get-expences");
const list = document.getElementById("list");
const expenditureValue = document.getElementById("expenditure-value");
const displayFromDate = document.getElementById("display-from-date");
const displayToDate = document.getElementById("display-to-date");

expencesBtn.addEventListener("click", () => {
  let fromDate = new Date(fromDateEl.value).toISOString().split("T")[0];
  let toDate = new Date(toDateEl.value).toISOString().split("T")[0];

  if (!fromDate || !toDate || fromDate > toDate) {
    alert("Please select a valid date range.");
    return;
  }

  displayFromDate.innerHTML = fromDate;
  displayToDate.innerHTML = toDate;
  window.onload = loadProducts(fromDate, toDate);
});

const loadProducts = async (fromDate, toDate) => {
  const products = await ipcRenderer.invoke("get-products", { fromDate, toDate });

  let totalExpenses = 0;
  list.innerHTML = ""; // Clear existing list

  products.forEach((product) => {
    listCreator(product.productName, product.amount, product.category, product.date);
    totalExpenses += parseFloat(product.amount);
  });

  expenditureValue.innerText = totalExpenses;
};

const listCreator = (expenseName, expenseValue, category, addingDate, productId) => {
  let sublistContent = document.createElement("div");
  sublistContent.classList.add("sublist-content", "flex-space");
  list.appendChild(sublistContent);
  sublistContent.innerHTML = `<p class="product">${expenseName}</p><p class="amount">${expenseValue}</p><p class="category">${category}</p><p class="date">${addingDate}</p>`;
};
