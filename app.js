const SCRIPT_WEB_APP_URL = "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE";

function setStatus(message, type = "neutral") {
  const status = document.getElementById("submissionStatus");
  if (!status) return;
  status.textContent = message;
  status.className = "status-pill";
  if (type === "working") status.classList.add("working");
  if (type === "success") status.classList.add("success");
  if (type === "error") status.classList.add("error");
}

function setupIdentityPanel() {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const savedIndicator = document.getElementById("savedIndicator");
  if (!nameInput || !emailInput || !savedIndicator) return;

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

function enableForm(submissionFields, submitButton) {
  submissionFields.disabled = false;
  submitButton.disabled = false;
}

function disableForm(submissionFields, submitButton) {
  submissionFields.disabled = true;
  submitButton.disabled = true;
}

function clearFieldInvalids(form) {
  form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
}

function initWorkspace() {
  const sectionButtons = document.querySelectorAll("[data-section]");
  const selectedSectionEl = document.getElementById("selectedSection");
  const changeSectionBtn = document.getElementById("changeSection");
  const submissionFields = document.getElementById("submissionFields");
  const submitButton = document.getElementById("submitButton");
  const form = document.getElementById("submissionForm");
  const panel = document.getElementById("submissionPanel");
  if (!sectionButtons.length || !selectedSectionEl || !form || !submissionFields || !submitButton) return;

  let selectedSection = "";
  const titleInput = document.getElementById("title");
  const urlInput = document.getElementById("url");
  const whyInput = document.getElementById("why");
  const sourceTypeInput = document.getElementById("sourceType");

  function resetSubmissionFields() {
    if (titleInput) titleInput.value = "";
    if (urlInput) urlInput.value = "";
    if (whyInput) whyInput.value = "";
    if (sourceTypeInput) sourceTypeInput.value = "";
  }

  function setSection(name) {
    clearFieldInvalids(form);
    resetSubmissionFields();
    selectedSection = name;
    selectedSectionEl.textContent = name;
    changeSectionBtn.hidden = false;
    enableForm(submissionFields, submitButton);
    setStatus("Section selected. Add your link.");
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    if (titleInput) {
      titleInput.focus({ preventScroll: true });
    }
  }

  function clearSection() {
    clearFieldInvalids(form);
    selectedSection = "";
    selectedSectionEl.textContent = "None selected";
    changeSectionBtn.hidden = true;
    disableForm(submissionFields, submitButton);
    resetSubmissionFields();
    setStatus("Choose a section to start");
  }

  sectionButtons.forEach((btn) => {
    btn.addEventListener("click", () => setSection(btn.dataset.section));
  });

  changeSectionBtn?.addEventListener("click", clearSection);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFieldInvalids(form);

    const title = titleInput;
    const url = urlInput;
    const why = whyInput;
    const sourceType = sourceTypeInput;
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const honeypot = document.getElementById("website");

    let hasError = false;

    if (!selectedSection) {
      setStatus("Select a section before submitting.", "error");
      return;
    }

    if (!title.value.trim()) {
      title.classList.add("invalid");
      hasError = true;
    }
    if (!url.value.trim() || !url.value.trim().startsWith("https://")) {
      url.classList.add("invalid");
      hasError = true;
    }
    if (!sourceType.value) {
      sourceType.classList.add("invalid");
      hasError = true;
    }
    if (!why.value.trim()) {
      why.classList.add("invalid");
      hasError = true;
    }
    if (!nameInput.value.trim()) {
      nameInput.classList.add("invalid");
      hasError = true;
    }
    if (!emailInput.value.trim()) {
      emailInput.classList.add("invalid");
      hasError = true;
    }

    if (hasError) {
      setStatus("Please fill in all required fields.", "error");
      return;
    }

    const fd = new FormData();
    fd.append("timestamp", new Date().toLocaleString());
    fd.append("section", selectedSection);
    fd.append("title", title.value.trim());
    fd.append("url", url.value.trim());
    fd.append("description", why.value.trim());
    fd.append("type", "Link");
    fd.append("source", sourceType.value);
    fd.append("tags", "");
    fd.append("name", nameInput.value.trim());
    fd.append("email", emailInput.value.trim());
    fd.append("website", honeypot.value.trim());

    try {
      setStatus("Submitting…", "working");
      await fetch(SCRIPT_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: fd
      });
    } catch (err) {
      setStatus("Something went wrong while submitting. Try again.", "error");
      return;
    }

    title.value = "";
    url.value = "";
    sourceType.value = "";
    why.value = "";
    setStatus("Link submitted. Thank you!", "success");
  });
}

function init() {
  setupIdentityPanel();
  if (document.body.classList.contains("workspace")) {
    initWorkspace();
  }
}

window.addEventListener("DOMContentLoaded", init);
