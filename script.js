const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const filterBtns = document.querySelectorAll(".filters button");
const taskCount = document.getElementById("task-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const sortPriorityBtn = document.getElementById("sort-priority");

let sortMode = "none";
let tasks = [];
let currentFilter = "all";

function addTask() {
  const text = taskInput.value.trim(); /* убираем пробелы в начале и конце */
  if (!text) return;

  const priority = document.getElementById("priority").value;

  const newTask = {
    id: Date.now() /* текущее время */,
    text: text,
    completed: false,
    priority: priority,
  };

  tasks.push(newTask);
  renderTasks();
  saveToLocalStorage();
  taskInput.value = "";
}

function renderTasks() {
  taskList.innerHTML = ""; /* очищаем список задач */

  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true; // all
  });

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.draggable = true;
    li.dataset.id = task.id;

    li.innerHTML = `
            <input type="checkbox" ${task.completed ? "checked" : ""}>
            <span class="task-text">${task.text}</span>
            <span class="priority ${task.priority}">${task.priority === "high" ? "Важный" : task.priority === "medium" ? "Средний" : "Обычный"}</span>
            <button class="delete-btn">✕</button>
        `;

    li.querySelector("input").addEventListener("change", () =>
      toggleComplete(task.id),
    );

    li.querySelector(".delete-btn").addEventListener("click", () =>
      deleteTask(task.id),
    );

    const taskText = li.querySelector(".task-text");
    taskText.addEventListener("dblclick", () => editTask(task.id, li));

    taskList.appendChild(li);
  });

  updateTaskCount();

  const emptyState = document.getElementById("empty-state");
  const hasTasks = filteredTasks.length > 0;
  emptyState.classList.toggle("show", !hasTasks);
  updateProgress();
}

function toggleComplete(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
  renderTasks();
  saveToLocalStorage();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  renderTasks();
  saveToLocalStorage();
}

function editTask(id, li) {
  const taskTextSpan = li.querySelector(".task-text");

  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const originalText = task.text;

  li.classList.add("editing");

  const input = document.createElement("input");
  input.type = "text";
  input.value = originalText;
  input.className = "task-edit-input";

  taskTextSpan.replaceWith(input);

  input.focus();
  input.select();

  const saveEdit = () => {
    li.classList.remove("editing");

    let newText = input.value.trim();

    if (newText === "") newText = originalText;

    if (newText !== originalText) {
      tasks = tasks.map((t) => (t.id === id ? { ...t, text: newText } : t));
      saveToLocalStorage();
    }

    renderTasks();
  };

  const cancelEdit = () => {
    li.classList.remove("editing");
    renderTasks();
  };

  input.addEventListener("blur", saveEdit);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  });
}

function updateTaskCount() {
  const active = tasks.filter((t) => !t.completed).length;
  taskCount.textContent = `${active} ${getTaskWord(active)}`;
}

function updateProgress() {
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("progress-bar").style.width = `${percent}%`;
  document.getElementById("progress-text").textContent = `${percent}%`;
}

function sortByPriority() {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  if (sortMode === "none") {
    tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    sortMode = "desc";
    sortPriorityBtn.textContent = "Сортировать по важности ↑";
  } else if (sortMode === "desc") {
    tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    sortMode = "asc";
    sortPriorityBtn.textContent = "Сортировать по важности ↓";
  } else {
    tasks.sort((a, b) => a.id - b.id);
    sortMode = "none";
    sortPriorityBtn.textContent = "Сортировать по важности";
  }
  sortPriorityBtn.classList.toggle("active", sortMode !== "none");
  renderTasks();
  saveToLocalStorage();
}

/* Функция правильного склонения */
function getTaskWord(count) {
  const lastDigit = count % 10;
  const lastTwo = count % 100;

  if (lastTwo >= 11 && lastTwo <= 19) return "активных задач";
  if (lastDigit === 1) return "активная задача";
  if (lastDigit >= 2 && lastDigit <= 4) return "активных задачи";

  return "активных задач";
}

function saveToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("tasks");
  if (saved) {
    tasks = JSON.parse(saved);
  }
  renderTasks();
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  renderTasks();
  saveToLocalStorage();
});

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

sortPriorityBtn.addEventListener("click", sortByPriority);

loadFromLocalStorage();
