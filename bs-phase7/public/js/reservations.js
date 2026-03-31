import { initAuthUI, requireAuthOrBlockPage, logout } from "./auth-ui.js";

initAuthUI();
window.logout = logout;

if (!requireAuthOrBlockPage()) {

  throw new Error("Authentication required");
}


const form = document.getElementById("reservationForm");
const formMessage = document.getElementById("formMessage");
const reservationList = document.getElementById("reservationList");
const reservationIdInput = document.getElementById("reservationId");
const clearButton = document.getElementById("clearButton");
const submitButton = document.getElementById("submitButton");
const deleteButton = document.getElementById("deleteButton");

let mode = "create";
let reservations = [];

function showMessage(type, message) {
  if (!formMessage) return;
  formMessage.className = "mt-6 rounded-2xl border px-4 py-3 text-sm whitespace-pre-line";
  formMessage.classList.remove("hidden");

  if (type === "success") {
    formMessage.classList.add("border-emerald-200", "bg-emerald-50", "text-emerald-900");
  } else {
    formMessage.classList.add("border-rose-200", "bg-rose-50", "text-rose-900");
  }

  formMessage.textContent = message;
}

function clearMessage() {
  if (!formMessage) return;
  formMessage.textContent = "";
  formMessage.classList.add("hidden");
}

function toIsoFromDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function toDatetimeLocalFromIso(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function getPayload() {
  return {
    resourceId: Number(document.getElementById("resourceId").value),
    userId: Number(document.getElementById("userId").value),
    startTime: toIsoFromDatetimeLocal(document.getElementById("startTime").value),
    endTime: toIsoFromDatetimeLocal(document.getElementById("endTime").value),
    note: document.getElementById("note").value.trim(),
    status: document.getElementById("status").value,
  };
}

function setMode(nextMode) {
  mode = nextMode;
  if (mode === "create") {
    submitButton.textContent = "Create";
    deleteButton.classList.add("hidden");
    reservationIdInput.value = "";
  } else {
    submitButton.textContent = "Update";
    deleteButton.classList.remove("hidden");
  }
}

function clearForm() {
  form.reset();
  reservationIdInput.value = "";
  setMode("create");
}

function fillForm(item) {
  reservationIdInput.value = item.id;
  document.getElementById("resourceId").value = item.resource_id;
  document.getElementById("userId").value = item.user_id;
  document.getElementById("startTime").value = toDatetimeLocalFromIso(item.start_time);
  document.getElementById("endTime").value = toDatetimeLocalFromIso(item.end_time);
  document.getElementById("note").value = item.note || "";
  document.getElementById("status").value = item.status || "active";
  setMode("edit");
}

function renderList() {
  reservationList.innerHTML = "";

  if (reservations.length === 0) {
    reservationList.innerHTML = '<p class="text-sm text-black/60">No reservations yet.</p>';
    return;
  }

  for (const item of reservations) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "w-full rounded-2xl border border-black/10 p-4 text-left hover:border-brand-blue hover:bg-brand-blue/5 transition";
    button.innerHTML = `
      <p class="text-sm font-semibold">#${item.id} • Resource ${item.resource_id} • User ${item.user_id}</p>
      <p class="mt-1 text-xs text-black/60">${new Date(item.start_time).toLocaleString()} → ${new Date(item.end_time).toLocaleString()}</p>
      <p class="mt-1 text-xs text-black/70">Status: ${item.status}</p>
    `;
    button.addEventListener("click", () => {
      clearMessage();
      fillForm(item);
    });
    reservationList.appendChild(button);
  }
}

async function fetchReservations() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/reservations", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await response.json();
  if (!response.ok || !body.ok) {
    throw new Error(body.error || "Failed to fetch reservations");
  }

  reservations = body.data || [];
  renderList();
}

async function createReservation(payload) {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();
  if (!response.ok || !body.ok) {
    throw new Error(body.error || "Failed to create reservation");
  }
}

async function updateReservation(id, payload) {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/reservations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();
  if (!response.ok || !body.ok) {
    throw new Error(body.error || "Failed to update reservation");
  }
}

async function deleteReservation(id) {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/reservations/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    throw new Error(body?.error || "Failed to delete reservation");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const payload = getPayload();
  if (!payload.resourceId || !payload.userId || !payload.startTime || !payload.endTime || !payload.status) {
    showMessage("error", "Please fill all required fields.");
    return;
  }

  if (new Date(payload.endTime) <= new Date(payload.startTime)) {
    showMessage("error", "End time must be later than start time.");
    return;
  }

  try {
    if (mode === "create") {
      await createReservation(payload);
      showMessage("success", "Reservation created successfully.");
    } else {
      await updateReservation(Number(reservationIdInput.value), payload);
      showMessage("success", "Reservation updated successfully.");
    }

    await fetchReservations();
    clearForm();
  } catch (error) {
    showMessage("error", error.message || "Operation failed.");
  }
});

deleteButton.addEventListener("click", async () => {
  clearMessage();

  const id = Number(reservationIdInput.value);
  if (!id) {
    showMessage("error", "Select a reservation first.");
    return;
  }

  try {
    await deleteReservation(id);
    showMessage("success", "Reservation deleted successfully.");
    await fetchReservations();
    clearForm();
  } catch (error) {
    showMessage("error", error.message || "Delete failed.");
  }
});

clearButton.addEventListener("click", () => {
  clearMessage();
  clearForm();
});

fetchReservations().catch((error) => {
  showMessage("error", error.message || "Failed to load reservations.");
});
