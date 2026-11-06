
const todoForm = document.getElementById("todo-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

const totalCount = document.getElementById("total-count");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");

const taskCount = document.getElementById("task-count");
const emptyMessage = document.getElementById("empty-message");

const clearCompleted = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");
const currentDate = document.getElementById("current-date");

// Current date
currentDate.textContent = new Date().toLocaleDateString(
    "en-IN",
    {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }
);

// Load tasks from LocalStorage
let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("taskflow_tasks")) || [];

    if (!Array.isArray(tasks)) {
        tasks = [];
    }
} catch {
    tasks = [];
}

let currentFilter = "all";

// Save tasks
function saveTasks() {
    localStorage.setItem(
        "taskflow_tasks",
        JSON.stringify(tasks)
    );
}

// Update statistics
function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    totalCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;

    taskCount.textContent =
        `${total} ${total === 1 ? "task" : "tasks"}`;
}

// Render task list
function renderTasks() {

    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {

        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(task => {

        const li = document.createElement("li");

        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task complete");

        checkbox.addEventListener("change", () => {

            task.completed = checkbox.checked;

            saveTasks();
            renderTasks();

        });

        // Task text
        const span = document.createElement("span");

        span.className = "task-text";
        span.textContent = task.text;

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {

            tasks = tasks.filter(
                item => item.id !== task.id
            );

            saveTasks();
            renderTasks();

        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteButton);

        taskList.appendChild(li);

    });

    // Empty state
    emptyMessage.classList.toggle(
        "hidden",
        filteredTasks.length > 0
    );

    // Update dashboard
    updateStatistics();
}

// Add task
todoForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        taskInput.focus();
        return;
    }

    const newTask = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        text: text,
        completed: false
    };

    tasks.unshift(newTask);

    saveTasks();

    currentFilter = "all";

    filterButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === "all"
        );
    });

    renderTasks();

    taskInput.value = "";
    taskInput.focus();

});

// Filter tasks
filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        renderTasks();

    });

});

// Clear completed tasks
clearCompleted.addEventListener("click", () => {

    tasks = tasks.filter(
        task => !task.completed
    );

    saveTasks();
    renderTasks();

});

// Initial render
renderTasks();
