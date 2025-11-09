const tabContent = document.getElementById("tab-content");
const ageInput = document.getElementById("age");
const ageSubmit = document.getElementById("age-submit");
const ageError = document.getElementById("age-error");

ageSubmit.addEventListener("click", () => {
  const age = Number(ageInput.value);
  if (age < 18) {
    ageError.textContent = "You must be 18 or older to use this tool.";
    localStorage.removeItem("userAge");
    return;
  }
  ageError.textContent = "";
  localStorage.setItem("userAge", age);
});

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => loadTab(btn.dataset.tab));
});

function loadTab(tabName) {
  tabContent.innerHTML = `
    <h2>${tabName.toUpperCase()} Contribution Tracking</h2>
    <label>Contribution This Year:</label>
    <input type="number" id="contrib-input" />
    <button id="save-btn">Save</button>
    <p id="result"></p>
  `;

  document.getElementById("save-btn").addEventListener("click", () => {
    const value = Number(document.getElementById("contrib-input").value);
    const data = JSON.parse(localStorage.getItem("contribData") || "{}");
    data[tabName] = value;
    localStorage.setItem("contribData", JSON.stringify(data));
    document.getElementById("result").textContent = `Saved: ${value}`;
  });
}
