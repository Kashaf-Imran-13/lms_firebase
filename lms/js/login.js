import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCVqkQKg5jk5x76pOQn5Urhy1KLFz6u77M",
  authDomain: "lmsproject-caabf.firebaseapp.com",
  projectId: "lmsproject-caabf",
  storageBucket: "lmsproject-caabf.firebasestorage.app",
  messagingSenderId: "224372757147",
  appId: "1:224372757147:web:79e90fa27442080b41ec3e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app); // <-- Important: Initialize the database

// Login Form
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const dbRef = ref(db); // Use the initialized database

      get(child(dbRef, `users/${user.uid}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            const role = snapshot.val().role;
            if (role === "student") window.location = "studentDashboard.html";
            else if (role === "teacher") window.location = "teacherDashboard.html";
          } else {
            alert("User data not found!");
          }
        })
        .catch((err) => {
          console.error("Database error:", err);
          alert("Failed to read user data.");
        });
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Mobile Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('max-h-0');
  mobileMenu.classList.toggle('max-h-96');
});

// Theme Toggle
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');
const iconPath = document.getElementById('iconPath');

function updateIcon() {
  if (html.classList.contains('dark')) {
    iconPath.setAttribute('d', 'M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z'); // Moon
  } else {
    iconPath.setAttribute('d', 'M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 4.05l-.71.71M21 12h-1M4 12H3m16.66 4.66l-.71-.71M4.05 19.95l-.71-.71M12 5a7 7 0 100 14 7 7 0 000-14z'); // Sun
  }
}

function toggleTheme() {
  html.classList.toggle('dark');
  localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
  updateIcon();
}

themeToggle.addEventListener('click', toggleTheme);
mobileThemeToggle.addEventListener('click', toggleTheme);

// Load saved theme
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  html.classList.add('dark');
} else {
  html.classList.remove('dark');
}
updateIcon();
