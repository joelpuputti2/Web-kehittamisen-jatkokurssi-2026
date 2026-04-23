const customerList = document.getElementById("customer-list");
const customerForm = document.getElementById("customer-form");
const customerIdInput = document.getElementById("customer-id");
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const birthDateInput = document.getElementById("birth-date");
const formStatus = document.getElementById("form-status");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");
const deleteButton = document.getElementById("delete-button");

let customers = [];
let selectedCustomerId = null;

const birthDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatBirthDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return birthDateFormatter.format(date);
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function setStatus(message, type = "info") {
  formStatus.textContent = message;
  formStatus.dataset.type = type;
}

function getFormValues() {
  return {
    first_name: firstNameInput.value.trim(),
    last_name: lastNameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    birth_date: birthDateInput.value,
  };
}

function fillForm(person) {
  customerIdInput.value = person?.id ?? "";
  firstNameInput.value = person?.first_name ?? "";
  lastNameInput.value = person?.last_name ?? "";
  emailInput.value = person?.email ?? "";
  phoneInput.value = person?.phone ?? "";
  birthDateInput.value = toDateInputValue(person?.birth_date);

  const editing = Boolean(person);
  submitButton.textContent = editing ? "Save changes" : "Add customer";
  cancelButton.hidden = !editing;
  deleteButton.hidden = !editing;
}

function clearSelection(message = "Ready to add a new customer.", type = "info") {
  selectedCustomerId = null;
  fillForm(null);
  setStatus(message, type);
}

function renderCustomers() {
  customerList.innerHTML = "";

  if (customers.length === 0) {
    customerList.innerHTML = "<p>No customers found.</p>";
    return;
  }

  customers.forEach((person) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "customer-card";
    card.setAttribute("aria-pressed", String(person.id === selectedCustomerId));

    if (person.id === selectedCustomerId) {
      card.classList.add("is-selected");
    }

    const name = document.createElement("strong");
    name.textContent = `${person.first_name} ${person.last_name}`;

    const email = document.createElement("span");
    email.textContent = `Email: ${person.email}`;

    const phone = document.createElement("span");
    phone.textContent = `Phone: ${person.phone || "-"}`;

    const birthDate = document.createElement("span");
    birthDate.textContent = `Birth date: ${formatBirthDate(person.birth_date)}`;

    card.append(name, email, phone, birthDate);

    card.addEventListener("click", () => {
      selectCustomer(person.id);
    });

    customerList.appendChild(card);
  });
}

async function loadCustomers() {
  try {
    const response = await fetch("/api/persons");

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    customers = await response.json();
    renderCustomers();
  } catch (error) {
    console.error(error);
    customerList.innerHTML = "<p class='error-message'>Error loading data.</p>";
  }
}

async function selectCustomer(id) {
  try {
    const response = await fetch(`/api/persons/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch customer");
    }

    const person = await response.json();
    selectedCustomerId = person.id;
    fillForm(person);
    setStatus(`Editing ${person.first_name} ${person.last_name}.`, "info");
    renderCustomers();
  } catch (error) {
    console.error(error);
    setStatus("Could not load the selected customer.", "error");
  }
}

async function submitCustomer(event) {
  event.preventDefault();

  const values = getFormValues();

  if (!values.first_name || !values.last_name || !values.email) {
    setStatus("First name, last name, and email are required.", "error");
    return;
  }

  const payload = {
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    phone: values.phone || null,
    birth_date: values.birth_date || null,
  };

  try {
    const editing = Boolean(customerIdInput.value);
    const url = editing ? `/api/persons/${customerIdInput.value}` : "/api/persons";
    const method = editing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to save customer");
    }

    await loadCustomers();

    if (editing) {
      selectedCustomerId = data.person.id;
      fillForm(data.person);
      setStatus("Customer updated successfully.", "success");
      renderCustomers();
      return;
    }

    customerForm.reset();
    clearSelection("Customer created successfully.", "success");
  } catch (error) {
    console.error(error);
    setStatus(error.message, "error");
  }
}

async function deleteCustomer() {
  if (!customerIdInput.value) {
    setStatus("Select a customer before deleting.", "error");
    return;
  }

  try {
    const response = await fetch(`/api/persons/${customerIdInput.value}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete customer");
    }

    await loadCustomers();
    clearSelection("Customer deleted successfully.", "success");
  } catch (error) {
    console.error(error);
    setStatus(error.message, "error");
  }
}

customerForm.addEventListener("submit", submitCustomer);
cancelButton.addEventListener("click", () => {
  customerForm.reset();
  clearSelection();
});
deleteButton.addEventListener("click", deleteCustomer);

clearSelection();
loadCustomers();