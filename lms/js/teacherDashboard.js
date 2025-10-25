// teacherDashboard.js (modular Firebase v9)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  update,
  remove,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

/* ---------- Firebase config (use yours) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyCVqkQKg5jk5x76pOQn5Urhy1KLFz6u77M",
  authDomain: "lmsproject-caabf.firebaseapp.com",
  databaseURL: "https://lmsproject-caabf-default-rtdb.firebaseio.com/",
  projectId: "lmsproject-caabf",
  storageBucket: "lmsproject-caabf.appspot.com",
  messagingSenderId: "224372757147",
  appId: "1:224372757147:web:79e90fa27442080b41ec3e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

/* ---------- DOM elements ---------- */
const welcomeName = document.getElementById("welcomeName");
const teacherNameTop =
  document.getElementById("teacherNameTop") ||
  document.getElementById("teacherName");
const coursesList = document.getElementById("coursesList");
const assignmentsList = document.getElementById("assignmentsList");
const coursesCount = document.getElementById("coursesCount");
const assignmentsCount = document.getElementById("assignmentsCount");
const studentsCount = document.getElementById("studentsCount");

// Course Modal
const openCourseModalBtn = document.getElementById("openCourseModalBtn");
const courseModal = document.getElementById("courseModal");
const courseForm = document.getElementById("courseForm");
const courseModalTitle = document.getElementById("courseModalTitle");
const courseTitle = document.getElementById("courseTitle");
const courseimg = document.getElementById("courseimg");
const courseDescription = document.getElementById("courseDescription");
const closeCourseModal = document.getElementById("closeCourseModal");

// Assignment Modal
const openAssignmentModalBtn = document.getElementById(
  "openAssignmentModalBtn"
);
const assignmentModal = document.getElementById("assignmentModal");
const assignmentForm = document.getElementById("assignmentForm");
const assignmentModalTitle = document.getElementById("assignmentModalTitle");
const assignmentTitle = document.getElementById("assignmentTitle");
const assignmentDescription = document.getElementById("assignmentDescription");
const assignmentDue = document.getElementById("assignmentDue");
const closeAssignmentModal = document.getElementById("closeAssignmentModal");

// Profile
const profileForm = document.getElementById("profileForm");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");

// Buttons
const logoutBtn = document.getElementById("logoutBtn");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");

let currentUid = null;
let editingCourseKey = null;
let editingAssignmentKey = null;

/* ---------- helpers ---------- */
function showToast(msg, t = 2500) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.add("hidden"), t);
}
function openModal(mod) {
  mod.classList.remove("hidden");
}
function closeModal(mod) {
  mod.classList.add("hidden");
}
function safe(s) {
  return String(s ?? "")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/* ---------- auth ---------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }
  currentUid = user.uid;

  // Load teacher profile
  try {
    const userSnap = await get(child(ref(db), `users/${currentUid}`));
    const u = userSnap.exists()
      ? userSnap.val()
      : { fullName: user.displayName || "Teacher", email: user.email };
    welcomeName.textContent = u.fullName || user.displayName || "Teacher";
    if (teacherNameTop)
      teacherNameTop.textContent = u.fullName || user.displayName || "Teacher";
    profileName.value = u.fullName || user.displayName || "";
    profileEmail.value = u.email || user.email || "";
  } catch (e) {
    console.error(e);
  }

  // Real-time data
  const coursesRef = ref(db, `teachers/${currentUid}/courses`);
  onValue(coursesRef, (snap) => renderCourses(snap.val()));

  const assignmentsRef = ref(db, `teachers/${currentUid}/assignments`);
  onValue(assignmentsRef, (snap) => renderAssignments(snap.val()));
});

/* ---------- render ---------- */
function renderCourses(data) {
  coursesList.innerHTML = "";
  if (!data) {
    coursesCount.textContent = "0";
    return;
  }
  const entries = Object.entries(data);
  coursesCount.textContent = entries.length;

  entries.forEach(([key, course]) => {
    const el = document.createElement("div");
    el.className =
      "course-card bg-white dark:bg-gray-800 shadow-md p-4 rounded-xl hover:shadow-lg transition";
    el.innerHTML = `
      <img src="${safe(
        course.image || "https://via.placeholder.com/300x150?text=No+Image"
      )}" 
           alt="Course Image" class="w-full h-40 object-cover rounded-md mb-3">
      <h4 class="text-lg font-semibold">${safe(course.title)}</h4>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">${safe(
        course.description || ""
      )}</p>
      <div class="mt-4 flex gap-2">
        <button class="btn-primary edit-course" data-key="${key}">Edit</button>
        <button class="btn-ghost delete-course" data-key="${key}">Delete</button>
      </div>
    `;
    coursesList.appendChild(el);
  });
}

function renderAssignments(data) {
  assignmentsList.innerHTML = "";
  if (!data) {
    assignmentsCount.textContent = "0";
    return;
  }
  const entries = Object.entries(data);
  assignmentsCount.textContent = entries.length;
  entries.forEach(([key, asg]) => {
    const el = document.createElement("div");
    el.className =
      "assignment-card bg-white dark:bg-gray-800 shadow-md p-4 rounded-xl hover:shadow-lg transition";
    el.innerHTML = `
      <h4 class="text-lg font-semibold">${safe(asg.title)}</h4>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">${safe(
        asg.description || ""
      )}</p>
      <p class="text-xs text-gray-500 mt-1">Due: ${safe(asg.due || "—")}</p>
      <div class="mt-4 flex gap-2">
        <button class="btn-primary edit-assignment" data-key="${key}">Edit</button>
        <button class="btn-ghost delete-assignment" data-key="${key}">Delete</button>
      </div>
    `;
    assignmentsList.appendChild(el);
  });
}

/* ---------- course modal logic ---------- */
openCourseModalBtn.addEventListener("click", () => {
  editingCourseKey = null;
  courseModalTitle.textContent = "Add Course";
  courseTitle.value = "";
  courseDescription.value = "";
  courseimg.value = "";
  openModal(courseModal);
});
closeCourseModal.addEventListener("click", () => closeModal(courseModal));

courseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const t = courseTitle.value.trim();
  const d = courseDescription.value.trim();
  const img = courseimg.value.trim();
  if (!t) return showToast("Course title required");

  const base = ref(db, `teachers/${currentUid}/courses`);
  try {
    if (editingCourseKey) {
      await update(
        ref(db, `teachers/${currentUid}/courses/${editingCourseKey}`),
        {
          title: t,
          description: d,
          image: img,
        }
      );
      showToast("Course updated");
    } else {
      const newRef = push(base);
      await set(newRef, {
        title: t,
        description: d,
        image: img,
        createdAt: Date.now(),
      });
      showToast("Course added");
    }
    closeModal(courseModal);
  } catch (err) {
    console.error(err);
    showToast("Error saving course");
  }
});

/* ---------- assignment modal logic ---------- */
openAssignmentModalBtn.addEventListener("click", () => {
  editingAssignmentKey = null;
  assignmentModalTitle.textContent = "Add Assignment";
  assignmentTitle.value = "";
  assignmentDescription.value = "";
  assignmentDue.value = "";
  openModal(assignmentModal);
});
closeAssignmentModal.addEventListener("click", () =>
  closeModal(assignmentModal)
);

assignmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const t = assignmentTitle.value.trim();
  const d = assignmentDescription.value.trim();
  const due = assignmentDue.value || "";
  if (!t) return showToast("Assignment title required");

  try {
    if (editingAssignmentKey) {
      await update(
        ref(db, `teachers/${currentUid}/assignments/${editingAssignmentKey}`),
        {
          title: t,
          description: d,
          due,
        }
      );
      showToast("Assignment updated");
    } else {
      const newRef = push(ref(db, `teachers/${currentUid}/assignments`));
      await set(newRef, {
        title: t,
        description: d,
        due,
        createdAt: Date.now(),
      });
      showToast("Assignment created");
    }
    closeModal(assignmentModal);
  } catch (err) {
    console.error(err);
    showToast("Error saving assignment");
  }
});

/* ---------- logout ---------- */
logoutBtn.addEventListener("click", () =>
  signOut(auth).then(() => (location.href = "login.html"))
);
