// import { ApiError } from "./api-client.js";
// import { validateTaskDraft } from "./form-validation.js";

// export function messageForError(error) {
//   if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
//   if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
//   if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
//   if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
//   if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
//   if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
//   return "Не удалось выполнить операцию.";
// }

// // view — адаптер из dom-app.js. Контроллер не должен обращаться к document.
// // Обязательные методы результата:
// // start, applyFilters, refresh, submit, beginEdit, cancelEdit,
// // toggleTask, deleteTask, resetData и destroy.
// export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
//   void api;
//   void view;
//   void validateDraft;
//   void ApiError;

//   // TODO:
//   // 1. Хранить текущие tasks, categories, filters и editingId.
//   // 2. При загрузке показывать loading, затем ready/empty или error.
//   // 3. Перед новой загрузкой отменять предыдущую через AbortController.
//   // 4. Не позволять устаревшему ответу изменить интерфейс.
//   // 5. После успешной мутации повторно запросить список с текущими фильтрами.
//   // 6. Ошибку отменённого запроса не показывать пользователю.
//   // 7. Если категории ещё не были получены, retry снова выполняет начальную загрузку.
//   throw new Error("Не реализовано: createAppController");
// }
import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  // 1. Проверка зависимостей (тест 23)
  if (!api || typeof api.getTasks !== "function" || typeof api.loadInitialData !== "function") {
    throw new TypeError("api должен содержать методы getTasks и loadInitialData");
  }
  if (!view || typeof view.setListState !== "function" || typeof view.setTasks !== "function") {
    throw new TypeError("view должен содержать методы отрисовки списка");
  }

  // Состояние
  let currentTasks = [];
  let currentCategories = [];
  let currentFilters = {};
  let editingId = null;
  let loadController = null;
  let loadSequence = 0;

  // --- Внутренние функции ---

  async function loadCurrentTasks() {
    if (loadController) {
      loadController.abort();
    }
    loadController = new AbortController();
    const currentSequence = ++loadSequence;
    const signal = loadController.signal;

    // Устанавливаем состояние loading
    view.setListState("loading");

    try {
      let result;
      if (currentCategories.length === 0) {
        result = await api.loadInitialData(currentFilters, { signal });
        currentCategories = result.categories;
        view.setCategories(currentCategories); // Обновляем селекты в DOM
      } else {
        result = await api.getTasks(currentFilters, { signal });
      }

      if (currentSequence !== loadSequence) return; // Игнорируем устаревший ответ

      currentTasks = result.tasks;

      view.setTotal(currentTasks.length); // Обновляем счетчик

      // Отрисовка
      if (currentTasks.length === 0) {
        view.setListState("empty");
      } else {
        view.setTasks(currentTasks, currentCategories);
        view.setListState("ready");
      }

    } catch (error) {
      if (currentSequence !== loadSequence) return;
      if (error instanceof ApiError && error.kind === "aborted") return;

      view.setListState("error", messageForError(error));
    }
  }

  async function performMutation(mutationFn, successMessage) {
    view.setMutationPending(true);
    try {
      await mutationFn();
      view.notify(successMessage, "success");
      await loadCurrentTasks();
    } catch (error) {
      if (!(error instanceof ApiError && error.kind === "aborted")) {
        view.notify(messageForError(error), "error");
      }
    } finally {
      view.setMutationPending(false);
    }
  }

  // --- Публичные методы ---

  async function start(filters = {}) {
    currentFilters = filters;
    await loadCurrentTasks();
  }

  async function applyFilters(newFilters) {
    currentFilters = newFilters;
    await loadCurrentTasks();
  }

  async function refresh() {
    await loadCurrentTasks();
  }

  async function submit(draft) {
    const validation = validateDraft(draft, currentCategories);
    
    if (!validation.valid) {
      view.showFormErrors(validation.errors);
      return;
    }
    
    view.showFormErrors({});

    if (editingId) {
      const id = editingId;
      await performMutation(
        () => api.updateTask(id, validation.value),
        "Задача обновлена."
      );
      editingId = null;
      view.setFormTask(null); // Сброс формы
    } else {
      await performMutation(
        () => api.createTask(validation.value),
        "Задача создана."
      );
      view.setFormTask(null); // Сброс формы
    }
  }

  function beginEdit(id) {
    const task = currentTasks.find((t) => t.id === id);
    if (!task) return;

    editingId = id;
    view.setFormTask(task); // Заполняем форму
  }

  function cancelEdit() {
    editingId = null;
    view.setFormTask(null); // Сброс формы
  }

  async function toggleTask(id) {
    const task = currentTasks.find((t) => t.id === id);
    if (!task) return;

    await performMutation(
      () => api.setTaskCompleted(id, !task.completed),
      task.completed ? "Задача возвращена в работу." : "Задача завершена."
    );
  }

  async function deleteTask(id) {
    await performMutation(
      () => api.deleteTask(id),
      "Задача удалена."
    );
  }

  async function resetData() {
    await performMutation(
      () => api.resetDemoData(),
      "Данные восстановлены."
    );
  }

  function destroy() {
    if (loadController) {
      loadController.abort();
    }
  }

  return {
    start,
    applyFilters,
    refresh,
    submit,
    beginEdit,
    cancelEdit,
    toggleTask,
    deleteTask,
    resetData,
    destroy,
  };
}