const { ipcRenderer } = require("electron");

let userAmount = document.getElementById("user-amount");
let addingDate = document.getElementById("adding-date");
const category = document.getElementById("category");
const addAmountButton = document.getElementById("add-amount");
const editAmountButton = document.getElementById("edit-amount");
const cancelButton = document.getElementById("cancel");
const productTitle = document.getElementById("product-title");
const productTitleError = document.getElementById("product-title-error");
const expenditureValue = document.getElementById("expenditure-value");
const list = document.getElementById("list");
const filterMonth = document.getElementById("filter-month");

let now = new Date();
let fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
let toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
editAmountButton.style.display = "none";

//Function To Create List
const listCreator = (expenseName, expenseValue, category, addingDate, productId) => {
  let sublistContent = document.createElement("div");
  sublistContent.classList.add("sublist-content", "flex-space");
  list.appendChild(sublistContent);
  sublistContent.innerHTML = `<p class="product">${expenseName}</p><p class="amount">${expenseValue}</p><p class="category">${category}</p><p class="date">${addingDate}</p>`;

  let editButton = document.createElement("button");
  editButton.classList.add("fa-solid", "fa-pen-to-square", "edit");
  editButton.style.fontSize = "1.2em";
  editButton.addEventListener("click", () => {
    console.log("clicked Edit : ", productId);
    editElement(editButton, true, productId);
  });

  let deleteButton = document.createElement("button");
  deleteButton.classList.add("fa-solid", "fa-trash-can", "delete");
  deleteButton.style.fontSize = "1.2em";
  deleteButton.addEventListener("click", () => {
    deleteElement(deleteButton, productId);
  });

  sublistContent.appendChild(editButton);
  sublistContent.appendChild(deleteButton);
};

//Function To Modify List Elements
const editElement = async (element, edit = false, productId) => {
  // Ensure that productId is valid
  if (!productId) {
    console.error("Invalid product ID");
    return;
  }

  let parentDiv = element.parentElement;
  let currentExpense = expenditureValue.innerText;
  let parentAmount = parentDiv.querySelector(".amount").innerText;

  if (edit) {
    let parentCategory = parentDiv.querySelector(".category").innerText;
    let parentText = parentDiv.querySelector(".product").innerText;
    let parentDate = parentDiv.querySelector(".date").innerText;

    productTitle.value = parentText;
    userAmount.value = parentAmount;
    addingDate.value = parentDate;
    category.value = parentCategory;

    addAmountButton.style.display = "none";
    editAmountButton.style.display = "block";

    disableButtons(true);
  }

  expenditureValue.innerText = parseInt(currentExpense) - parseInt(parentAmount);
  parentDiv.remove();

  editAmountButton.addEventListener("click", async () => {
    const updatedProduct = {
      id: productId,
      productName: productTitle.value,
      amount: parseFloat(userAmount.value),
      category: category.value,
      date: addingDate.value,
    };

    const result = await ipcRenderer.invoke("edit-product", updatedProduct);

    if (result.success) {
      alert("Product updated successfully!");
      loadProducts(fromDate, toDate);

      productTitle.value = "";
      userAmount.value = "";
      category.value = "";
      addingDate.value = new Date().toISOString().split("T")[0];
      addAmountButton.style.display = "block";
      editAmountButton.style.display = "none";
    } else {
      alert("Failed to update product.");
    }
  });
};

// Function to delete list item (delete)
const deleteElement = async (element, productId) => {
  let parentDiv = element.parentElement;
  let result = await ipcRenderer.invoke("delete-product", productId);

  if (result.success) {
    alert("Product deleted successfully!");
    parentDiv.remove();
  } else {
    alert("Failed to delete product.");
  }
};

//Function To Add Expenses
addAmountButton.addEventListener("click", async () => {
  //empty checks
  if (!userAmount.value || !productTitle.value || category.value == "" || !addingDate.value) {
    productTitleError.classList.remove("hide");
    return false;
  }

  const product = {
    productName: productTitle.value,
    amount: parseFloat(userAmount.value),
    category: category.value,
    date: addingDate.value,
  };

  const result = await ipcRenderer.invoke("add-product", product);

  if (result.success) {
    alert("Product added successfully!");
    loadProducts(fromDate, toDate);

    productTitle.value = "";
    userAmount.value = "";
    category.value = "";
    addingDate.value = new Date().toISOString().split("T")[0];
  } else {
    alert("Failed to save product!");
  }
});

cancelButton.addEventListener("click", () => {
  productTitle.value = "";
  userAmount.value = "";
  category.value = "";
  addingDate.value = new Date().toISOString().split("T")[0];
  editAmountButton.style.display = "none";
  addAmountButton.style.display = "block";
  loadProducts(fromDate, toDate);
});

//Function To Disable Edit and Delete Button
const disableButtons = (bool) => {
  let editButtons = document.getElementsByClassName("edit");
  Array.from(editButtons).forEach((element) => {
    element.disabled = bool;
  });
};

// Function to load all products on startup
const loadProducts = async (fromDate, toDate) => {
  const products = await ipcRenderer.invoke("get-products", { fromDate, toDate });

  let totalExpenses = 0;
  list.innerHTML = "";

  products.forEach((product) => {
    listCreator(product.productName, product.amount, product.category, product.date, product.id);
    totalExpenses += parseFloat(product.amount);
  });

  expenditureValue.innerText = totalExpenses;
};

// Load products on page load for current month
window.onload = () => {
  loadProducts(fromDate, toDate);
};

//Get Data from filter month
filterMonth.addEventListener("change", () => {
  const selectedMonth = filterMonth.value || new Date().toISOString().slice(0, 7); // e.g., "2025-04"
  const fromDate = `${selectedMonth}-01`;
  const toDate = new Date(new Date(fromDate).getFullYear(), new Date(fromDate).getMonth() + 1, 0).toISOString().split("T")[0];

  window.onload = loadProducts(fromDate, toDate);
});
