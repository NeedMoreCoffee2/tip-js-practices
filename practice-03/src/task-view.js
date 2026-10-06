import { getTaskStats } from "./task-service.js";

// Здесь создаётся DOM, но не изменяется состояние приложения.
// Контракт карточки, селекторы и тексты описаны в методичке.
export function createTaskElement(task) {
  const li = document.createElement("li");
  li.classList.add("task-card");
  li.dataset.taskId = task.id;
  if(task.completed) li.classList.add("is-completed");

  const title = document.createElement("h3");
  title.classList.add("task-title");
  title.textContent = task.title;

  const completed = document.createElement("p");
  completed.classList.add("task-status");
  if(task.completed) completed.textContent = "Выполнена";
  else completed.textContent = "В работе";

  const priority = document.createElement("p");
  priority.classList.add("task-priority");
  if(task.priority === "low") priority.textContent = "Низкий";
  else if(task.priority === "medium") priority.textContent = "Средний";
  else priority.textContent = "Высокий";


  const statusButton = document.createElement("button");
  statusButton.type = "button";
  statusButton.dataset.action = "toggle";
  statusButton.setAttribute("aria-pressed", String(task.completed))

  const statusLabel = document.createElement("span");
  statusLabel.classList.add("action-label");
  statusLabel.textContent = "Выполнена";

  statusButton.append(statusLabel);


  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  
  const deleteLabel = document.createElement("span");
  deleteLabel.classList.add("action-label");
  deleteLabel.textContent = "Удалить";

  deleteButton.append(deleteLabel);


  const div = document.createElement("div");
  div.classList.add("task-actions");
  div.append(statusButton, deleteButton)

  li.append(title, completed, priority, div);
  return li;

  // TODO: li.task-card[data-task-id], название, статус, приоритет, две кнопки.
  // Название — через textContent. Обработчики здесь не назначаются.
  //throw new Error("Не реализовано: createTaskElement");
}

export function renderTaskList(listElement, tasks) {
  const cards = tasks.map((task) => createTaskElement(task));
  listElement.replaceChildren(...cards);
  
  // TODO: создать карточки и заменить дочерние элементы списка.
  // Сам listElement сохраняется: на нём находится делегированный обработчик.
  //throw new Error("Не реализовано: renderTaskList");
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  const stats = getTaskStats(tasks);

  summaryElement.querySelector('[data-stat="total"]').textContent = stats.total;
  summaryElement.querySelector('[data-stat="completed"]').textContent = stats.completed;
  summaryElement.querySelector('[data-stat="pending"]').textContent = stats.pending;
  summaryElement.querySelector('[data-stat="progress"]').textContent = `${stats.progress.toFixed(1)}%`;
  summaryElement.querySelector('[data-stat="visible"]').textContent = visibleCount;
  
  // TODO: получить getTaskStats(tasks), обновить пять [data-stat] внутри блока.
  // tasks — ВЕСЬ текущий массив, visibleCount — длина отфильтрованного списка.
  //throw new Error("Не реализовано: renderSummary");
}

export function renderEmptyState(messageElement, total, visibleCount) {
  if(visibleCount > 0)
  {
    messageElement.textContent = "";
    messageElement.hidden = true;
    return;
  }

  if (total === 0) messageElement.textContent = "Список задач пуст.";
  else messageElement.textContent = "Нет задач по выбранному фильтру.";

  messageElement.hidden = false;
  
  // TODO: различать пустой общий список и пустой результат фильтра.
  //throw new Error("Не реализовано: renderEmptyState");
}