// ============================================================
// CUSTOMER APP LOGIC
// ============================================================

let qty = 1;
let currentMenu = { name: "आज की थाली", description: "दाल, सब्ज़ी, चावल, रोटी और अचार", price: 49, available: true };

function updateTotal() {
  document.getElementById("qtyValue").textContent = qty;
  document.getElementById("totalValue").textContent = `₹${qty * currentMenu.price}`;
}

document.getElementById("qtyMinus").addEventListener("click", () => {
  if (qty > 1) qty--;
  updateTotal();
});
document.getElementById("qtyPlus").addEventListener("click", () => {
  if (qty < 10) qty++;
  updateTotal();
});

// ---------------- LOAD TODAY'S MENU ----------------

async function loadMenu() {
  try {
    const doc = await db.collection("menu").doc("today").get();
    if (doc.exists) {
      const d = doc.data();
      currentMenu = {
        name: d.name || currentMenu.name,
        description: d.description || currentMenu.description,
        price: d.price || 49,
        available: d.available !== false
      };
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

// ---------------- PLACE ORDER ----------------

document.getElementById("placeOrderBtn").addEventListener("click", async () => {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const note = document.getElementById("custNote").value.trim();
  const errEl = document.getElementById("orderError");
  errEl.textContent = "";

  if (!name) { errEl.textContent = "कृपया अपना नाम लिखें"; return; }
  if (!/^[6-9]\d{9}$/.test(phone)) { errEl.textContent = "कृपया सही 10 अंकों का phone number डालें"; return; }
  if (!address) { errEl.textContent = "कृपया delivery address लिखें"; return; }

  const btn = document.getElementById("placeOrderBtn");
  btn.disabled = true;
  btn.textContent = "Order भेजा जा रहा है...";

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
    errEl.textContent = "Order place nahi ho paya. Dobara try karein.";
  } finally {
    btn.disabled = false;
    btn.textContent = "Order करें — Cash on Delivery";
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
});
