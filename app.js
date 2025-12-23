const SCRIPT_WEB_APP_URL = "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE";

const TYPE_OPTIONS = ["Article", "Video", "Course", "Tool", "Report", "Other"];
const SOURCE_OPTIONS = [
  "LinkedIn Learning",
  "Forbes",
  "YouTube",
  "Company Blog",
  "Government",
  "Other"
];

function createOptionElements(options) {
  const frag = document.createDocumentFragment();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select";
  frag.appendChild(placeholder);
  options.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    frag.appendChild(option);
  });
  return frag;
}

function createRow(sectionName, data = {}) {
  const tr = document.createElement("tr");
  tr.dataset.section = sectionName;

  const titleInput = document.createElement("input");
  titleInput.className = "cell-input";
  titleInput.placeholder = "Link title";
  titleInput.value = data.title || "";

  const urlInput = document.createElement("input");
  urlInput.className = "cell-input";
  urlInput.type = "url";
  urlInput.placeholder = "https://example.com";
  urlInput.value = data.url || "";

  const descInput = document.createElement("textarea");
  descInput.className = "cell-textarea";
  descInput.placeholder = "Short summary";
  descInput.value = data.description || "";

  const typeSelect = document.createElement("select");
  typeSelect.className = "cell-select";
  typeSelect.appendChild(createOptionElements(TYPE_OPTIONS));
  typeSelect.value = data.type || "";

  const sourceSelect = document.createElement("select");
  sourceSelect.className = "cell-select";
  sourceSelect.appendChild(createOptionElements(SOURCE_OPTIONS));
  sourceSelect.value = data.source || "";

  const tagsInput = document.createElement("input");
  tagsInput.className = "cell-input";
  tagsInput.placeholder = "Tags (comma separated)";
  tagsInput.value = data.tags || "";

  [titleInput, urlInput, descInput, tagsInput, typeSelect, sourceSelect].forEach((el) => {
    el.addEventListener("input", () => el.classList.remove("invalid"));
    el.addEventListener("change", () => el.classList.remove("invalid"));
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "icon-btn danger";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    const tbody = tr.closest("tbody");
    tr.remove();
    if (!tbody.querySelector("tr")) {
      tbody.appendChild(createRow(sectionName));
    }
  });

  const duplicateBtn = document.createElement("button");
  duplicateBtn.type = "button";
  duplicateBtn.className = "icon-btn secondary";
  duplicateBtn.textContent = "Duplicate";
  duplicateBtn.addEventListener("click", () => {
    const tbody = tr.closest("tbody");
    const clone = createRow(sectionName, getRowValues(tr));
    tbody.insertBefore(clone, tr.nextSibling);
  });

  const cells = [titleInput, urlInput, descInput, typeSelect, sourceSelect, tagsInput];

  cells.forEach((cellEl) => {
    const td = document.createElement("td");
    if (cellEl) {
      td.appendChild(cellEl);
    }
    tr.appendChild(td);
  });

  const actionCell = document.createElement("td");
  actionCell.className = "actions";
  actionCell.append(deleteBtn, duplicateBtn);
  tr.appendChild(actionCell);

  return tr;
}

function getRowValues(tr) {
  const inputs = tr.querySelectorAll("input, textarea, select");
  const [titleInput, urlInput, descInput, typeSelect, sourceSelect, tagsInput] = inputs;
  return {
    title: titleInput?.value.trim() || "",
    url: urlInput?.value.trim() || "",
    description: descInput?.value.trim() || "",
    type: typeSelect?.value || "",
    source: sourceSelect?.value || "",
    tags: tagsInput?.value.trim() || ""
  };
}

function clearInvalids() {
  document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
}

function setStatus(message, type = "neutral") {
  const status = document.getElementById("submissionStatus");
  status.textContent = message;
  status.className = "status-pill";
  if (type === "working") status.classList.add("working");
  if (type === "success") status.classList.add("success");
  if (type === "error") status.classList.add("error");
}

function setupWorksheets() {
  document.querySelectorAll(".worksheet").forEach((worksheet) => {
    const sectionName = worksheet.dataset.section;
    const tbody = worksheet.querySelector("tbody");
    const addBtn = worksheet.querySelector(".add-row");
    tbody.appendChild(createRow(sectionName));
    addBtn.addEventListener("click", () => {
      tbody.appendChild(createRow(sectionName));
    });
  });
}

function setupIdentityPanel() {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const savedIndicator = document.getElementById("savedIndicator");

  const savedName = localStorage.getItem("aihub_name") || "";
  const savedEmail = localStorage.getItem("aihub_email") || "";
  if (savedName) nameInput.value = savedName;
  if (savedEmail) emailInput.value = savedEmail;
  if (savedName || savedEmail) {
    savedIndicator.textContent = "Saved locally";
    savedIndicator.classList.add("active");
  }

  function persist() {
    localStorage.setItem("aihub_name", nameInput.value.trim());
    localStorage.setItem("aihub_email", emailInput.value.trim());
    savedIndicator.textContent = "Saved locally";
    savedIndicator.classList.add("active");
    nameInput.classList.remove("invalid");
    emailInput.classList.remove("invalid");
  }

  nameInput.addEventListener("input", persist);
  emailInput.addEventListener("input", persist);
}

function collectRows(name, email, honeypot) {
  const rowsToSubmit = [];
  let hasInvalid = false;
  clearInvalids();

  document.querySelectorAll(".worksheet").forEach((worksheet) => {
    const sectionName = worksheet.dataset.section;
    worksheet.querySelectorAll("tbody tr").forEach((tr) => {
      const { title, url, description, type, source, tags } = getRowValues(tr);
      const isEmpty = !title && !url && !description && !type && !source && !tags;
      if (isEmpty) return;

      const requiredMissing = [];
      const inputs = tr.querySelectorAll("input, textarea, select");
      const [titleInput, urlInput, descInput] = inputs;
      if (!title) requiredMissing.push(titleInput);
      if (!url) requiredMissing.push(urlInput);
      if (!description) requiredMissing.push(descInput);
      if (requiredMissing.length) {
        hasInvalid = true;
        requiredMissing.forEach((input) => input.classList.add("invalid"));
        return;
      }

      rowsToSubmit.push({
        section: sectionName,
        title,
        url,
        description,
        type,
        source,
        tags,
        name,
        email,
        website: honeypot
      });
    });
  });

  return { rowsToSubmit, hasInvalid };
}

async function submitRows(rows) {
  let failure = false;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    setStatus(`Submitting ${i + 1} of ${rows.length}…`, "working");
    const fd = new FormData();
    fd.append("timestamp", new Date().toLocaleString());
    fd.append("section", row.section);
    fd.append("title", row.title);
    fd.append("url", row.url);
    fd.append("description", row.description);
    fd.append("type", row.type);
    fd.append("source", row.source);
    fd.append("tags", row.tags);
    fd.append("name", row.name);
    fd.append("email", row.email);
    fd.append("website", row.website);

    try {
      await fetch(SCRIPT_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: fd
      });
    } catch (err) {
      failure = true;
      break;
    }
  }
  return failure;
}

function removeSubmittedRows() {
  document.querySelectorAll(".worksheet").forEach((worksheet) => {
    const tbody = worksheet.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    rows.forEach((tr) => {
      const { title, url, description, type, source, tags } = getRowValues(tr);
      const isEmpty = !title && !url && !description && !type && !source && !tags;
      if (!isEmpty) {
        tr.remove();
      }
    });
    if (!tbody.querySelector("tr")) {
      tbody.appendChild(createRow(worksheet.dataset.section));
    }
  });
}

function setupSubmission() {
  const submitButtons = [
    document.getElementById("submitTop"),
    document.getElementById("submitBottom")
  ];

  submitButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const honeypot = document.getElementById("website").value.trim();

      if (!nameInput.value.trim() || !emailInput.value.trim()) {
        setStatus("Please enter your Name and Email before submitting.", "error");
        nameInput.classList.add("invalid");
        emailInput.classList.add("invalid");
        return;
      }

      const { rowsToSubmit, hasInvalid } = collectRows(
        nameInput.value.trim(),
        emailInput.value.trim(),
        honeypot
      );

      if (hasInvalid) {
        setStatus("Some rows are missing Title, URL, or Description.", "error");
        return;
      }

      if (!rowsToSubmit.length) {
        setStatus("No rows to submit. Fill in at least one row.", "error");
        return;
      }

      setStatus("Starting submission…", "working");
      const failed = await submitRows(rowsToSubmit);

      if (failed) {
        setStatus("Something went wrong while submitting. Try again.", "error");
        return;
      }

      removeSubmittedRows();
      setStatus("All rows submitted. Thank you!", "success");
    });
  });
}

function init() {
  setupWorksheets();
  setupIdentityPanel();
  setupSubmission();
}

window.addEventListener("DOMContentLoaded", init);
