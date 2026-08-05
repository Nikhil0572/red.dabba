let qty = 1;
let currentMenu = { name: "Today's Thali", description: "Dal, Veg Curry, Rice, Roti & Pickle", price: 49, available: true };

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function updateTotal() {
  document.getElementById("qtyValue").textContent = qty;
  const totalEl = document.getElementById("totalValue");
  totalEl.style.transform = "scale(1.1)";
  totalEl.textContent = `₹${qty * currentMenu.price}`;
  setTimeout(() => totalEl.style.transform = "scale(1)", 200);
}

document.getElementById("qtyMinus").addEventListener("click", () => {
  if (qty > 1) { qty--; updateTotal(); }
});
document.getElementById("qtyPlus").addEventListener("click", () => {
  if (qty < 10) { qty++; updateTotal(); }
  else { showToast("You can only order up to 10 thalis at once!"); }
});

async function loadMenu() {
  try {
    const doc = await db.collection("menu").doc("today").get();
    if (doc.exists) {
      const d = doc.data();
      currentMenu = { ...currentMenu, ...d };
    }
  } catch (e) {
    console.error("Menu load error:", e);
  }

  document.getElementById("menuName").textContent = currentMenu.name;
  document.getElementById("menuDesc").textContent = currentMenu.description;
  document.getElementById("menuPrice").textContent = `₹${currentMenu.price}`;
  updateTotal();

  if (!currentMenu.available) {
    document.getElementById("orderCard").style.display = "none";
    document.getElementById("unavailableNotice").style.display = "block";
  }
}
loadMenu();

document.getElementById("placeOrderBtn").addEventListener("click", async () => {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const note = document.getElementById("custNote").value.trim();

  if (!name) return showToast("Please enter your name!");
  if (!/^[6-9]\d{9}$/.test(phone)) return showToast("Please enter a valid 10-digit phone number!");
  if (!address) return showToast("Please enter your delivery address!");

  const btn = document.getElementById("placeOrderBtn");
  btn.disabled = true;
  btn.innerHTML = `<span style="opacity: 0.8">Placing Order...</span>`;

  const orderNumber = "RD" + String(Date.now()).slice(-6);
  const totalAmount = qty * currentMenu.price;

  try {
    await db.collection("orders").add({
      orderNumber,
      customerName: name,
      phone,
      address,
      note,
      thaliName: currentMenu.name,
      qty,
      pricePerThali: currentMenu.price,
      totalAmount,
      paymentMode: "COD",
      status: "Placed",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("confirmOrderId").textContent = orderNumber;
    document.getElementById("confirmOverlay").style.display = "block";
  } catch (e) {
    console.error("Order error:", e);
    showToast("Something went wrong. Please try again.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Place Order";
  }
});

document.getElementById("newOrderBtn").addEventListener("click", () => {
  document.getElementById("confirmOverlay").style.display = "none";
  document.getElementById("custName").value = "";
  document.getElementById("custPhone").value = "";
  document.getElementById("custAddress").value = "";
  document.getElementById("custNote").value = "";
  qty = 1;
  updateTotal();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
