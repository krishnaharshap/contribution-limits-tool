const tabButtons = document.querySelectorAll(".tab");
const contentSections = document.querySelectorAll(".content");

function activateTab(button) {
  const accountType = button.id.replace("tab-", "");
  const targetSection = document.getElementById(`content-${accountType}`);

  tabButtons.forEach((btn) => btn.classList.remove("active"));
  contentSections.forEach((section) => section.classList.remove("active"));

  button.classList.add("active");
  targetSection.classList.add("active");

  renderContributionForm(targetSection, accountType);
}

function renderContributionForm(section, accountType) {
  const storageKey = `contribution-${accountType}`;
  const savedAmount = Number(localStorage.getItem(storageKey) || 0);

  section.innerHTML = `
    <h2>${accountType.toUpperCase()} Contribution Tracking</h2>
    <label for="contrib-input">Contribution this year</label>
    <input type="number" id="contrib-input" min="0" value="${savedAmount}" />
    <button id="save-btn">Save</button>
    <p id="result"></p>
  `;

  section.querySelector("#save-btn").addEventListener("click", () => {
    const input = section.querySelector("#contrib-input");
    const result = section.querySelector("#result");
    const value = Number(input.value);

    if (Number.isNaN(value) || value < 0) {
      result.textContent = "Enter a valid, non-negative amount.";
      return;
    }

    localStorage.setItem(storageKey, value);
    result.textContent = `Saved: ${value}`;
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => activateTab(button));
});

renderContributionForm(document.getElementById("content-tfsa"), "tfsa");
