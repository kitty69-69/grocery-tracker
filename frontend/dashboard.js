const API_URL = "https://grocery-tracker-api.onrender.com";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
  window.location.href = "login.html";
}

document.getElementById("userInfo").innerText =
  `Logged in as ${user.username}`;

const groceryForm = document.getElementById("groceryForm");
const groceryList = document.getElementById("groceryList");
const totalAmount = document.getElementById("totalAmount");
const themeToggle = document.getElementById("themeToggle");
const sortBtn = document.getElementById("sortBtn");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

let groceries = [];
let sortAlphabetically = false;

const savedTheme = localStorage.getItem(`theme_${user.id}`);

if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.innerText = "☀️ Light Mode";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem(`theme_${user.id}`, "dark");
    themeToggle.innerText = "☀️ Light Mode";
  } else {
    localStorage.setItem(`theme_${user.id}`, "light");
    themeToggle.innerText = "🌙 Dark Mode";
  }
});

async function loadGroceries() {
  const res = await fetch(`${API_URL}/api/groceries/${user.id}`);
  groceries = await res.json();
  displayGroceries();
}

function displayGroceries() {
  groceryList.innerHTML = "";
  let total = 0;

  let displayItems = [...groceries];

  const searchText = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  if (searchText) {
    displayItems = displayItems.filter((item) =>
      item.item_name.toLowerCase().includes(searchText)
    );
  }

  if (selectedCategory !== "All") {
    displayItems = displayItems.filter((item) =>
      item.category === selectedCategory
    );
  }

  if (sortAlphabetically) {
    displayItems.sort((a, b) =>
      a.item_name.localeCompare(b.item_name)
    );
  }

  displayItems.forEach((item) => {
    const itemTotal = item.quantity * item.price;
    total += itemTotal;

    groceryList.innerHTML += `
      <tr class="${item.purchased ? "purchased-row" : ""}">
        <td>
          <input
            type="checkbox"
            ${item.purchased ? "checked" : ""}
            onchange="togglePurchased(${item.id}, ${item.purchased ? 0 : 1})"
          >
        </td>
        <td>${item.item_name}</td>
        <td>${item.category || "Other"}</td>
        <td>${item.quantity}</td>
        <td>$${itemTotal.toFixed(2)}</td>
        <td>
          <button
            class="btn btn-sm btn-danger"
            onclick="deleteItem(${item.id})"
          >
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  totalAmount.innerText = total.toFixed(2);
}

groceryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const itemName = document.getElementById("itemName").value;
  const quantity = document.getElementById("quantity").value;
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;

  await fetch(`${API_URL}/api/groceries/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: user.id,
      itemName,
      quantity,
      price,
      category,
    }),
  });

  groceryForm.reset();
  loadGroceries();
});

async function deleteItem(id) {
  await fetch(`${API_URL}/api/groceries/${id}`, {
    method: "DELETE",
  });

  loadGroceries();
}

async function togglePurchased(id, purchased) {
  await fetch(`${API_URL}/api/groceries/toggle/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      purchased,
    }),
  });

  loadGroceries();
}

sortBtn.addEventListener("click", () => {
  sortAlphabetically = !sortAlphabetically;

  sortBtn.innerText = sortAlphabetically
    ? "Original Order"
    : "Sort A-Z";

  displayGroceries();
});

searchInput.addEventListener("input", displayGroceries);
categoryFilter.addEventListener("change", displayGroceries);

function togglePasswordMenu() {
  const panel = document.getElementById("passwordPanel");

  if (panel.style.display === "none" || panel.style.display === "") {
    panel.style.display = "block";
  } else {
    panel.style.display = "none";
  }
}

async function changePassword() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  if (!oldPassword || !newPassword) {
    alert("Please enter both old and new password.");
    return;
  }

  const res = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: user.id,
      oldPassword,
      newPassword,
    }),
  });

  const data = await res.json();

  alert(data.message);

  if (res.ok) {
    document.getElementById("oldPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("passwordPanel").style.display = "none";
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

loadGroceries();