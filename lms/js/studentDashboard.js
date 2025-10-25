import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  child,
  set,
  push,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCVqkQKg5jk5x76pOQn5Urhy1KLFz6u77M",
  authDomain: "lmsproject-caabf.firebaseapp.com",
  projectId: "lmsproject-caabf",
  storageBucket: "lmsproject-caabf.firebasestorage.app",
  messagingSenderId: "224372757147",
  appId: "1:224372757147:web:79e90fa27442080b41ec3e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);


const assignmentsList = document.getElementById("assignmentsList");
const messagesList = document.getElementById("messagesList");

// 🧠 Helper Function: Create Toast Message
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className =
    "fixed bottom-5 right-5 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md animate-fadeIn";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// 👨‍🎓 Auth State Listener
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;
  const dbRef = ref(db);

  try {
    // 🧾 Fetch Student Data
    const snapshot = await get(child(dbRef, `users/${userId}`));
    if (snapshot.exists()) {
      const userData = snapshot.val();
      document.getElementById("welcomeName").innerText = userData.fullName;
      document.getElementById("studentName").innerText = userData.fullName;
    }

    // 🧩 Fetch Teacher Assignments (all teachers)
    const teachersSnap = await get(child(dbRef, "teachers"));
    assignmentsList.innerHTML = "";
    let assignmentCount = 0;

    if (teachersSnap.exists()) {
      const teachers = teachersSnap.val();

      for (const teacherId in teachers) {
        const teacher = teachers[teacherId];
        if (teacher.assignments) {
          for (const asgId in teacher.assignments) {
            const a = teacher.assignments[asgId];
            assignmentCount++;

            // Create assignment card
            const card = document.createElement("div");
            card.className = "assignment-card p-4 rounded-xl";
            card.innerHTML = `
              <h4 class="font-semibold text-lg mb-2">${a.title}</h4>
              <p class="text-gray-600 mb-2">${a.description}</p>
              <p class="text-sm text-gray-500 mb-2">Course: ${a.course}</p>
              <p class="text-sm text-gray-500 mb-3">Due: ${a.dueDate}</p>
              <input type="text" placeholder="Enter submission link (Google Drive, etc.)" 
                id="input-${asgId}" class="w-full border rounded-lg p-2 mb-2">
              <button class="submitBtn bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-500" 
                data-id="${asgId}">Submit</button>
            `;
            assignmentsList.appendChild(card);
          }
        }
      }
      document.getElementById("assignmentsCount").innerText = assignmentCount;
    } else {
      assignmentsList.innerHTML = `<p class="text-gray-500">No assignments available yet.</p>`;
    }

    // 🖱 Handle Submission Click
    document.querySelectorAll(".submitBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const asgId = e.target.getAttribute("data-id");
        const input = document.getElementById(`input-${asgId}`);
        const fileUrl = input.value.trim();

        if (!fileUrl) {
          showToast("Please enter a valid submission link!");
          return;
        }

        const submissionRef = ref(
          db,
          `students/${userId}/submissions/${asgId}`
        );
        await set(submissionRef, {
          fileUrl,
          submittedAt: new Date().toISOString(),
        });

        input.value = "";
        showToast("✅ Assignment submitted successfully!");
      });
    });

    // 📨 Example Messages
    const messages = [
      { from: "Admin", msg: "New course will be added soon!" },
      { from: "Teacher", msg: "Submit your HTML project by Friday." },
    ];
    messagesList.innerHTML = "";
    messages.forEach((m) => {
      const card = document.createElement("div");
      card.className = "message-card p-4 rounded-xl";
      card.innerHTML = `<p><strong>${m.from}:</strong> ${m.msg}</p>`;
      messagesList.appendChild(card);
    });
    document.getElementById("messagesCount").innerText = messages.length;
  } catch (error) {
    console.error(error);
    showToast("⚠️ Error loading data. Please try again later.");
  }
});

// 🚪 Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});
