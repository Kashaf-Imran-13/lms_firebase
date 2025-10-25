// ================= Sidebar Toggle =================
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("-translate-x-full");
});

// ================= Theme Toggle =================
const htmlEl = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  if (theme === "dark") {
    htmlEl.classList.add("dark");
    themeToggle.textContent = "🌙";
  } else {
    htmlEl.classList.remove("dark");
    themeToggle.textContent = "🌞";
  }
  localStorage.setItem("theme", theme);
}

themeToggle.addEventListener("click", () => {
  const current = htmlEl.classList.contains("dark") ? "dark" : "light";
  applyTheme(current === "dark" ? "light" : "dark");
});

(function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) applyTheme(saved);
  else if (window.matchMedia("(prefers-color-scheme: dark)").matches) applyTheme("dark");
  else applyTheme("light");
})();
