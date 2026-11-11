const PRIORITY_LABELS = Object.freeze({
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
});

export function createTaskElement(task, category) {
  const li = document.createElement("li");
  li.className = "task-card";
  li.dataset.taskId = task.id;

  if (task.completed) {
    li.classList.add("is-completed");
  }

  // Блок с информацией
  const infoDiv = document.createElement("div");
  infoDiv.className = "task-info";

  const title = document.createElement("h3");
  title.className = "task-title";
  // Безопасный вывод пользовательского текста
  title.textContent = task.title; 
  infoDiv.appendChild(title);

  const metaDiv = document.createElement("div");
  metaDiv.className = "task-meta";

  const statusSpan = document.createElement("span");
  statusSpan.className = "task-status";
  statusSpan.textContent = task.completed ? "Выполнено" : "В работе";
  metaDiv.appendChild(statusSpan);

  const prioritySpan = document.createElement("span");
  prioritySpan.className = "task-priority";
  prioritySpan.textContent = `Приоритет: ${PRIORITY_LABELS[task.priority] || task.priority}`;
  metaDiv.appendChild(prioritySpan);

  const categorySpan = document.createElement("span");
  categorySpan.className = "task-category";
  categorySpan.textContent = category ? category.name : "Неизвестно";
  metaDiv.appendChild(categorySpan);

  infoDiv.appendChild(metaDiv);
  li.appendChild(infoDiv);

  // Блок с кнопками
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "task-actions";

  // Кнопка "Переключить статус"
  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.dataset.action = "toggle";
  toggleBtn.className = "btn btn-toggle";
  const toggleLabel = document.createElement("span");
  toggleLabel.className = "action-label";
  toggleLabel.textContent = task.completed ? "Вернуть в работу" : "Завершить";
  toggleBtn.appendChild(toggleLabel);
  actionsDiv.appendChild(toggleBtn);

  // Кнопка "Изменить"
  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.dataset.action = "edit";
  editBtn.className = "btn btn-edit";
  const editLabel = document.createElement("span");
  editLabel.className = "action-label";
  editLabel.textContent = "Изменить";
  editBtn.appendChild(editLabel);
  actionsDiv.appendChild(editBtn);

  // Кнопка "Удалить"
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.dataset.action = "delete";
  deleteBtn.className = "btn btn-delete";
  const deleteLabel = document.createElement("span");
  deleteLabel.className = "action-label";
  deleteLabel.textContent = "Удалить";
  deleteBtn.appendChild(deleteLabel);
  actionsDiv.appendChild(deleteBtn);

  li.appendChild(actionsDiv);

  return li;
}

export function renderTaskList(list, tasks, categories) {
  // Создаем Map для быстрого поиска категории по id
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Создаем фрагмент для эффективной вставки
  const fragment = document.createDocumentFragment();

  for (const task of tasks) {
    const category = categoryMap.get(task.categoryId);
    const taskElement = createTaskElement(task, category);
    fragment.appendChild(taskElement);
  }

  // replaceChildren полностью заменяет содержимое, удаляя старые карточки
  list.replaceChildren(fragment);
}
