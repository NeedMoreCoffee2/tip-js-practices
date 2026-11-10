import { demoTasks, variantTasks, variantNumber } from "./data.js";
import {
  addTask,
  findTaskById,
  removeTask,
  setTaskCompleted,
  updateTask,
} from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderEmptyState, renderSummary, renderTaskList } from "./task-view.js";
import { validateTaskDraft } from "./form-validation.js";
import { loadTasks, removeSavedTasks, saveTasks } from "./task-storage.js";

const elements = {
  list: document.querySelector("#task-list"),
  filters: document.querySelector("#task-filters"),
  summary: document.querySelector("#task-summary"),
  empty: document.querySelector("#empty-message"),
  message: document.querySelector("#operation-message"),
  datasetLabel: document.querySelector("#dataset-label"),
  storageStatus: document.querySelector("#storage-status"),
  form: document.querySelector("#task-form"),
  formHeading: document.querySelector("#form-heading"),
  formMode: document.querySelector("#form-mode"),
  formMessage: document.querySelector("#form-message"),
  idInput: document.querySelector("#task-id"),
  titleInput: document.querySelector("#task-title"),
  priorityInput: document.querySelector("#task-priority"),
  submitButton: document.querySelector("#form-submit"),
  cancelButton: document.querySelector("#cancel-edit"),
  resetButton: document.querySelector("#reset-data"),
};

const params = new URLSearchParams(window.location.search);
const isVariant = params.get("dataset") === "variant";
const isCheckRun = params.get("mode") === "check";
const initialTasks = isVariant ? variantTasks : demoTasks;
const datasetName = isVariant ? "variant" : "demo";
const storageKey = isCheckRun
  ? `tip-js-practice-04:checks:${datasetName}`
  : `tip-js-practice-04:${datasetName}`;

// Готовая граница запуска: даже незавершённый или ошибочный модуль хранилища
// не должен оставлять страницу без диагностического сообщения.
const messageElement = document.querySelector("#operation-message");

function showMessage(text) {
  messageElement.textContent = text;
}

function clearMessage() {
  messageElement.textContent = "";
}

let loaded;
try {
  loaded = loadTasks(window.localStorage, storageKey, initialTasks);
} catch (error) {
  loaded = {
    ok: false,
    source: "fallback",
    tasks: initialTasks.map((task) => ({ ...task })),
    error: `Хранилище не инициализировано: ${error.message}`,
  };
  console.error(error);
}
let currentTasks = loaded.tasks;
let currentFilter = "all";
let editingId = null;

elements.datasetLabel.textContent = isVariant
  ? `Индивидуальный вариант: ${variantNumber ?? "не указан"}`
  : "Общий контрольный набор";

if (loaded.source === "storage") {
  elements.storageStatus.textContent = "Данные восстановлены из localStorage.";
} else if (loaded.ok) {
  elements.storageStatus.textContent = "Используется исходный набор; сохранённых данных пока нет.";
} else {
  elements.storageStatus.textContent = loaded.error;
  elements.storageStatus.classList.add("is-warning");
}

function renderApp() {
  const visibleTasks = getVisibleTasks(currentTasks, currentFilter);

  const listElement = document.querySelector("#task-list");
  const summaryElement = document.querySelector("#task-summary");
  const emptyElement = document.querySelector("#empty-message");
  const filterContainer = document.querySelector("#task-filters");

  renderTaskList(listElement, visibleTasks);
  renderSummary(summaryElement, currentTasks, visibleTasks.length);
  renderEmptyState(emptyElement, currentTasks.length, visibleTasks.length);

  const filterButtons = filterContainer.querySelectorAll("button[data-filter]");
  for (const button of filterButtons) {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }

  // TODO: отобрать видимые задачи; обновить список, общую сводку и пустое состояние.
  // TODO: для кнопок фильтра обновить is-active и aria-pressed.
  // Не изменять currentTasks и не добавлять обработчики событий в этой функции.
  //throw new Error("Не реализовано: renderApp");
}

function clearFieldError(name) {
  const input = elements.form.elements.namedItem(name);
  const message = elements.form.querySelector(`[data-error-for="${name}"]`);
  if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
    input.setCustomValidity("");
    input.removeAttribute("aria-invalid");
  }
  if (message) message.textContent = "";
}

function clearFormErrors() {
  for (const name of ["id", "title", "priority"]) clearFieldError(name);
  elements.formMessage.textContent = "";
}

function showFormErrors(errors) {
  clearFormErrors();
  for (const [name, text] of Object.entries(errors)) {
    const input = elements.form.elements.namedItem(name);
    const message = elements.form.querySelector(`[data-error-for="${name}"]`);
    if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
      input.setCustomValidity(text);
      input.setAttribute("aria-invalid", "true");
    }
    if (message) message.textContent = text;
  }
  elements.form.reportValidity();
}

function setFormMode(id = null) {
  if (id === null || id === undefined) {
    // ---- режим создания ----
    editingId = null;

    elements.form.reset();
    clearFormErrors();

    elements.idInput.disabled = false;
    elements.idInput.value = "";

    elements.formHeading.textContent = "Добавление задачи";
    elements.formMode.textContent = "Новая задача";
    elements.submitButton.textContent = "Добавить задачу";
    elements.cancelButton.hidden = true;

    elements.idInput.focus();
    return;
  }

  // ---- режим редактирования ----
  const task = findTaskById(currentTasks, id);
  if (!task) {
    elements.formMessage.textContent = "Задача для редактирования не найдена.";
    return;
  }

  editingId = task.id;

  clearFormErrors();

  elements.idInput.value = String(task.id);
  elements.idInput.disabled = true;       // disabled не попадёт в FormData
  elements.titleInput.value = task.title;
  elements.priorityInput.value = task.priority;

  elements.formHeading.textContent = "Редактирование задачи";
  elements.formMode.textContent = `Задача #${task.id}`;
  elements.submitButton.textContent = "Сохранить изменения";
  elements.cancelButton.hidden = false;

  elements.titleInput.focus();
}

function persistCurrentTasks(successMessage) {
  const saved = saveTasks(window.localStorage, storageKey, currentTasks);
  elements.storageStatus.classList.toggle("is-warning", !saved.ok);
  elements.storageStatus.textContent = saved.ok
    ? "Изменения сохранены в localStorage."
    : saved.error;
  elements.message.textContent = saved.ok ? successMessage : `${successMessage} ${saved.error}`;
  renderApp();
  return saved;
}

// Готовая вспомогательная функция из логики ПР3. После полной перерисовки
// возвращает фокус на действие той же задачи либо на активный фильтр.
function restoreTaskFocus(id, action) {
  const actionButton = elements.list.querySelector(
    `[data-task-id="${id}"] button[data-action="${action}"]`,
  );
  const filterButton = elements.filters.querySelector(`[data-filter="${currentFilter}"]`);
  (actionButton ?? filterButton)?.focus();
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(elements.form);
  const draft = {
    id: formData.get("id"),
    title: formData.get("title"),
    priority: formData.get("priority"),
  };

  const validation = validateTaskDraft(draft, currentTasks, editingId);
  if (!validation.ok) {
    showFormErrors(validation.errors);
    return;
  }

  const { id, title, priority } = validation.value;
  const wasEditing = editingId !== null;

  const result = wasEditing
    ? updateTask(currentTasks, editingId, title, priority)
    : addTask(currentTasks, id, title, priority);

  if (!result.ok) {
    showFormErrors({ title: result.error });
    return;
  }

  currentTasks = result.tasks;

  setFormMode(null);

  persistCurrentTasks(
    wasEditing ? "Задача обновлена." : "Задача добавлена.",
  );
}

function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const list = event.currentTarget;
  if (!list.contains(button)) return;

  const action = button.dataset.action;
  if (action !== "toggle" && action !== "delete" && action !== "edit") return;

  const card = button.closest("li[data-task-id]");
  if (!card) return;

  const rawId = card.dataset.taskId;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    showMessage("Некорректный идентификатор задачи.");
    return;
  }

  if (action === "edit") {
    setFormMode(id);
    return;
  }

  // if (action === "toggle") {
  //   const result = setTaskCompleted(currentTasks, id);
  //   if(!result.ok) return;
  //   currentTasks = result.tasks;             // ← сначала обновить состояние
  //   persistCurrentTasks("Статус задачи изменён.");  // ← потом сохранить
  //   restoreTaskFocus(id, action);
  //   return;
  // }
  
  if (action === "toggle") {
    const task = findTaskById(currentTasks, id);
    if (!task) {
      showMessage("Задача не найдена.");
      return;
    }
    const result = setTaskCompleted(currentTasks, id, !task.completed);
    currentTasks = result.tasks;
    persistCurrentTasks("Статус задачи изменён");
    restoreTaskFocus(id, action);
  }

  if (action === "delete") {
    const result = removeTask(currentTasks, id);
    if (!result.ok) return;
    currentTasks = result.tasks;
    if (editingId === id) setFormMode(null); // раздел 6.7
    persistCurrentTasks("Задача удалена.");
    restoreTaskFocus(id, action);
    return;
  }

  // if (!result.ok) {
  //   showMessage(result.error);
  //   return;
  // }

  //currentTasks = result.tasks;
  clearMessage();
  renderApp();
  restoreTaskFocus(id, action);
}

function handleFilterClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-filter]");
  if (!button) return;

  const container = event.currentTarget;
  if (!container.contains(button)) return;

  const filter = button.dataset.filter;
  if (filter !== "all" && filter !== "pending" && filter !== "completed") return;

  currentFilter = filter;
  clearMessage();
  renderApp();
}

function handleResetClick() {
  const removed = removeSavedTasks(window.localStorage, storageKey);

  if (!removed.ok) {
    elements.storageStatus.textContent = removed.error;
    elements.storageStatus.classList.add("is-warning");
    elements.message.textContent = `Не удалось удалить сохранённые данные: ${removed.error}`;
    return;
  }

  currentTasks = initialTasks.map((task) => ({ ...task }));

  currentFilter = "all";
  setFormMode(null);

  renderApp();

  elements.storageStatus.classList.remove("is-warning");
  elements.storageStatus.textContent =
    "Сохранённые данные удалены. Используется исходный набор.";
  elements.message.textContent = "Данные сброшены к исходному набору.";
}

elements.form.addEventListener("submit", handleFormSubmit);
elements.form.addEventListener("input", (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
    clearFieldError(event.target.name);
  }
});
elements.list.addEventListener("click", handleTaskListClick);
elements.filters.addEventListener("click", handleFilterClick);
elements.cancelButton.addEventListener("click", () => setFormMode());
elements.resetButton.addEventListener("click", handleResetClick);

try {
  setFormMode();
  renderApp();
} catch (error) {
  elements.message.textContent = `Ошибка запуска: ${error.message}`;
  console.error(error);
}
