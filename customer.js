// ============================================================
// CUSTOMER APP LOGIC (Premium)
// ============================================================

let qty = 1;
let currentMenu = { name: "आज की थाली", description: "दाल, सब्ज़ी, चावल, रोटी और अचार", price: 49, available: true };

// Toast Notification System
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function updateTotal() {
  document.getElementById("qtyValue").textContent = qty;
  // Animate the price change slightly
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
  else { showToast("एक बार में अधिकतम 10 थाली आर्डर कर सकते हैं!"); }
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

  // Premium Validations with Toasts
  if (!name) return showToast("कृपया अपना नाम लिखें!");
  if (!/^[6-9]\d{9}$/.test(phone)) return showToast("कृपया सही 10 अंकों का मोबाइल नंबर डालें!");
  if (!address) return showToast("कृपया पूरा डिलीवरी एड्रेस लिखें!");

  const btn = document.getElementById("placeOrderBtn");
  btn.disabled = true;
  btn.innerHTML = `<span style="opacity: 0.8">Order भेजा जा रहा है...</span>`;

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
    showToast("कुछ दिक्कत आ गई। कृपया दोबारा ट्राई करें।");
  } finally {
    btn.disabled = false;
    btn.textContent = "Order करें";
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
