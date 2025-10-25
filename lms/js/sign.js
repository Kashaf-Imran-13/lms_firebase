
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// 1️⃣ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVqkQKg5jk5x76pOQn5Urhy1KLFz6u77M",
  authDomain: "lmsproject-caabf.firebaseapp.com",
  projectId: "lmsproject-caabf",
  storageBucket: "lmsproject-caabf.firebasestorage.app",
  messagingSenderId: "224372757147",
  appId: "1:224372757147:web:79e90fa27442080b41ec3e"
};

// 2️⃣ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 3️⃣ Sign-Up Form Submission
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  try {
    // Create Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user info in Realtime Database
    await set(ref(db, `users/${user.uid}`), {
      fullName: fullName,
      email: email,
      role: role
    });

    // Update Auth profile
    await updateProfile(user, { displayName: fullName });

    alert("Account created and saved in database successfully!");

    // Redirect based on role
    if (role === "student") window.location.href = "studentDashboard.html";
    else window.location.href = "TeacherDashboard.html";

  } catch (error) {
    console.error("Error creating user or saving data:", error);
    alert(error.message);
  }
});

// 4️⃣ Mobile Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('max-h-0');
  mobileMenu.classList.toggle('max-h-96');
});

// 5️⃣ Dark/Light Theme Toggle
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
