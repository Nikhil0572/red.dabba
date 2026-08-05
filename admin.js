// ============================================================
// ADMIN PANEL LOGIC
// ============================================================

let currentUser = null;
let allOrders = [];
let ordersUnsubscribe = null;

const STATUS_STEPS = ["Placed", "Preparing", "Out for Delivery", "Delivered"];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---------------- AUTH ----------------

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errEl = document.getElementById("loginError");
  errEl.textContent = "";
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (e) {
    errEl.textContent = "Login fail hua: " + e.message;
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  if (ordersUnsubscribe) ordersUnsubscribe();
  auth.signOut();
});

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    currentUser = null;
    document.getElementById("loginView").style.display = "block";
    document.getElementById("appView").style.display = "none";
    document.getElementById("logoutBtn").style.display = "none";
    if (ordersUnsubscribe) ordersUnsubscribe();
    return;
  }

  const adminDoc = await db.collection("admins").doc(user.uid).get();
  if (!adminDoc.exists) {
    document.getElementById("loginError").textContent =
      "Ye account admin nahi hai. Firestore me 'admins' collection me apni UID se document banayein.";
    auth.signOut();
    return;
  }

  currentUser = user;
  document.getElementById("loginView").style.display = "none";
  document.getElementById("appView").style.display = "block";
  document.getElementById("logoutBtn").style.display = "inline-flex";
  document.getElementById("userLabel").textContent = user.email;

  initTabs();
  listenToOrders();
  await loadMenuIntoForm();
});

// ---------------- TABS ----------------

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => (c.style.display = "none"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).style.display = "block";
    });
  });
}

// ---------------- LIVE ORDERS ----------------

function listenToOrders() {
  const listEl = document.getElementById("ordersList");
  ordersUnsubscribe = db.collection("orders")
    .orderBy("createdAt", "desc")
    .limit(100)
    .onSnapshot((snap) => {
      allOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderOrders();
      updateStats();
    }, (err) => {
      console.error("Orders listen error:", err);
      listEl.textContent = "Orders load nahi ho paye. Firestore rules check karein.";
    });
}

document.getElementById("statusFilter").addEventListener("change", renderOrders);

function renderOrders() {
  const listEl = document.getElementById("ordersList");
  const filter = document.getElementById("statusFilter").value;
  const filtered = filter ? allOrders.filter((o) => o.status === filter) : allOrders;

  if (!filtered.length) {
    listEl.innerHTML = `<div class="loader">कोई order नहीं मिला</div>`;
    return;
  }

  let html = "";
  filtered.forEach((o) => {
    const time = o.createdAt ? new Date(o.createdAt.toMillis()).toLocaleString("en-IN") : "-";
    const statusClass = "status-" + (o.status || "Placed").replace(/\s+/g, "");
    html += `<div class="order-card">
      <div class="order-top">
        <div>
          <div class="order-id">#${o.orderNumber || o.id.slice(0, 6)} · ${time}</div>
          <div class="order-name">${escapeHTML(o.customerName)}</div>
        </div>
        <span class="status-pill ${statusClass}">${o.status}</span>
      </div>
      <div class="order-meta">
        📞 ${escapeHTML(o.phone)}<br>
        📍 ${escapeHTML(o.address)}<br>
        🍽 ${o.qty} × ${escapeHTML(o.thaliName || "Thali")} ${o.note ? "· 📝 " + escapeHTML(o.note) : ""}
      </div>
      <div class="order-amount">₹${o.totalAmount} (COD)</div>
      <select class="status-select" data-id="${o.id}">
        ${STATUS_STEPS.map((s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}
      </select>
    </div>`;
  });
  listEl.innerHTML = html;

  document.querySelectorAll(".status-select").forEach((sel) => {
    sel.addEventListener("change", async (e) => {
      const orderId = e.target.dataset.id;
      const newStatus = e.target.value;
      try {
        await db.collection("orders").doc(orderId).update({ status: newStatus });
      } catch (err) {
        alert("Status update nahi ho paya: " + err.message);
      }
    });
  });
}

function escapeHTML(str) {
  return String(str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

// ---------------- STATS ----------------

function updateStats() {
  const today = todayStr();
  const todayOrders = allOrders.filter((o) => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt.toMillis());
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return ds === today;
  });
  const pending = allOrders.filter((o) => o.status !== "Delivered").length;
  const revenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  document.getElementById("statToday").textContent = todayOrders.length;
  document.getElementById("statPending").textContent = pending;
  document.getElementById("statRevenue").textContent = `₹${revenue}`;
}

// ---------------- MENU MANAGEMENT ----------------

async function loadMenuIntoForm() {
  try {
    const doc = await db.collection("menu").doc("today").get();
    if (doc.exists) {
      const d = doc.data();
      document.getElementById("menuName").value = d.name || "";
      document.getElementById("menuDesc").value = d.description || "";
      document.getElementById("menuPrice").value = d.price || 49;
      document.getElementById("menuAvailable").checked = d.available !== false;
    } else {
      document.getElementById("menuName").value = "आज की थाली";
      document.getElementById("menuDesc").value = "दाल, सब्ज़ी, चावल, रोटी और अचार";
      document.getElementById("menuPrice").value = 49;
    }
  } catch (e) {
    console.error("Menu load error:", e);
  }
}

document.getElementById("saveMenuBtn").addEventListener("click", async () => {
  const name = document.getElementById("menuName").value.trim();
  const description = document.getElementById("menuDesc").value.trim();
  const price = parseFloat(document.getElementById("menuPrice").value) || 49;
  const available = document.getElementById("menuAvailable").checked;
  const msgEl = document.getElementById("menuSaveMsg");

  try {
    await db.collection("menu").doc("today").set({ name, description, price, available }, { merge: true });
    msgEl.textContent = "Menu save ho gaya ✓";
    setTimeout(() => (msgEl.textContent = ""), 3000);
  } catch (e) {
    msgEl.style.color = "#c0392b";
    msgEl.textContent = "Save nahi ho paya: " + e.message;
  }
});
