// ---------- Initial data ----------

const defaultSchedule = {
    Monday: [
        {
            id: 1,
            name: "Data Structures",
            start: "09:00",
            end: "10:00",
            room: "Room 201"
        },
        {
            id: 2,
            name: "Operating Systems",
            start: "10:15",
            end: "11:15",
            room: "Room 202"
        }
    ],
    Tuesday: [
        {
            id: 3,
            name: "Database Management",
            start: "09:00",
            end: "10:00",
            room: "Room 203"
        }
    ],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
};

// ---------- Load saved data ----------

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);

        return saved === null ? fallback : JSON.parse(saved);
    } catch (error) {
        return fallback;
    }
}

let schedule = loadData("studymate-schedule", defaultSchedule);
let tasks = loadData("studymate-tasks", []);

let selectedDay = "Monday";

// Save data in the browser
function saveData() {
    localStorage.setItem("studymate-schedule", JSON.stringify(schedule));
    localStorage.setItem("studymate-tasks", JSON.stringify(tasks));
}

// ---------- Get HTML elements ----------

const currentDate = document.getElementById("current-date");
const daySelector = document.getElementById("day-selector");
const timetableList = document.getElementById("timetable-list");

const classFormContainer = document.getElementById("class-form-container");
const classForm = document.getElementById("class-form");
const openClassForm = document.getElementById("open-class-form");
const cancelClass = document.getElementById("cancel-class");

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

// ---------- Show today's date ----------

currentDate.textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
});

// ---------- Format time ----------

function formatTime(time) {
    const [hours, minutes] = time.split(":").map(Number);

    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

// ---------- Render timetable ----------

function renderTimetable() {
    const classes = schedule[selectedDay] || [];

    timetableList.innerHTML = "";

    // Display classes in time order
    classes.sort((a, b) => a.start.localeCompare(b.start));

    if (classes.length === 0) {
        timetableList.innerHTML = `
            <p class="empty-message">
                No classes scheduled for ${selectedDay}.
                Click "+ Add Class" to get started!
            </p>
        `;
    }

    classes.forEach((item) => {
        const card = document.createElement("div");
        card.className = "class-card";

        const time = document.createElement("div");
        time.className = "class-time";
        time.textContent =
            `${formatTime(item.start)} - ${formatTime(item.end)}`;

        const details = document.createElement("div");
        details.className = "class-details";

        const title = document.createElement("h3");
        title.textContent = item.name;

        const room = document.createElement("p");
        room.textContent = item.room || "Location not specified";

        details.append(title, room);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            schedule[selectedDay] = schedule[selectedDay].filter(
                (entry) => entry.id !== item.id
            );

            saveData();
            renderTimetable();
            updateStats();
        });

        card.append(time, details, deleteButton);
        timetableList.appendChild(card);
    });

    updateStats();
}

// ---------- Select a day ----------

daySelector.addEventListener("click", (event) => {
    const button = event.target.closest(".day-btn");

    if (!button) return;

    selectedDay = button.dataset.day;

    document.querySelectorAll(".day-btn").forEach((dayButton) => {
        dayButton.classList.toggle("active", dayButton === button);
    });

    renderTimetable();
});

// ---------- Open and close class form ----------

openClassForm.addEventListener("click", () => {
    classFormContainer.classList.remove("hidden");
    document.getElementById("class-name").focus();
});

cancelClass.addEventListener("click", () => {
    classFormContainer.classList.add("hidden");
    classForm.reset();
});

// ---------- Add a class ----------

classForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("class-name").value.trim();
    const start = document.getElementById("class-start").value;
    const end = document.getElementById("class-end").value;
    const room = document.getElementById("class-room").value.trim();

    if (!name || !start || !end) {
        alert("Please fill in all required fields.");
        return;
    }

    if (start >= end) {
        alert("End time must be later than start time.");
        return;
    }

    // Prevent overlapping classes
    const hasConflict = (schedule[selectedDay] || []).some((item) => {
        return start < item.end && end > item.start;
    });

    if (hasConflict) {
        alert("This class overlaps with another class.");
        return;
    }

    if (!schedule[selectedDay]) {
        schedule[selectedDay] = [];
    }

    schedule[selectedDay].push({
        id: Date.now(),
        name,
        start,
        end,
        room
    });

    saveData();
    renderTimetable();

    classForm.reset();
    classFormContainer.classList.add("hidden");
});

// ---------- Add a study task ----------

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) return;

    tasks.push({
        id: Date.now(),
        text,
        completed: false
    });

    saveData();
    renderTasks();

    taskForm.reset();
    taskInput.focus();
});

// ---------- Render study tasks ----------

function renderTasks() {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <p class="empty-message">
                No study tasks yet. Add your first task above!
            </p>
        `;
    }

    tasks.forEach((task) => {
        const item = document.createElement("div");

        item.className = "task-item";
        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task completed");

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;

            saveData();
            renderTasks();
        });

        const text = document.createElement("span");
        text.className = "task-text";
        text.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.className = "task-delete";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", "Delete task");

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter((entry) => entry.id !== task.id);

            saveData();
            renderTasks();
        });

        item.append(checkbox, text, deleteButton);
        taskList.appendChild(item);
    });

    updateStats();
}

// ---------- Update summary cards ----------

function updateStats() {
    const totalClasses = Object.values(schedule).reduce(
        (total, classes) => total + classes.length,
        0
    );

    const completed = tasks.filter((task) => task.completed).length;
    const pending = tasks.length - completed;

    document.getElementById("total-classes").textContent = totalClasses;
    document.getElementById("completed-tasks").textContent = completed;
    document.getElementById("pending-tasks").textContent = pending;
}

// ---------- Start the application ----------

renderTimetable();
renderTasks();
