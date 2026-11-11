import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("client должен содержать метод requestJson");
  }

  // Нормализация фильтров (из ПР5)
  function normalizeFilters(filters = {}) {
    if (typeof filters !== "object" || filters === null || Array.isArray(filters)) {
      throw new TypeError("filters должен быть обычным объектом");
    }

    const result = {};

    for (const [key, value] of Object.entries(filters)) {
      if (!ALLOWED_FILTERS.has(key)) {
        throw new TypeError(`Недопустимый фильтр: ${key}`);
      }

      if (value === undefined || value === null) continue;

      if (key === "completed") {
        if (typeof value !== "boolean") throw new TypeError("Фильтр completed должен быть boolean");
        result[key] = value;
      } else if (key === "priority") {
        if (typeof value !== "string" || !ALLOWED_PRIORITIES.has(value)) {
          throw new TypeError(`Фильтр priority должен быть одним из: ${[...ALLOWED_PRIORITIES].join(", ")}`);
        }
        result[key] = value;
      } else if (key === "categoryId") {
        if (!isPositiveSafeInteger(value)) throw new TypeError("Фильтр categoryId должен быть положительным целым числом");
        result[key] = value;
      } else if (key === "q") {
        if (typeof value !== "string") throw new TypeError("Фильтр q должен быть строкой");
        if (value.length > 100) throw new TypeError("Фильтр q не должен превышать 100 символов");
        result[key] = value.trim();
      }
    }
    return result;
  }

  function validateTasks(tasks) {
    if (!Array.isArray(tasks)) throw invalidResponse("tasks должен быть массивом");
    const ids = new Set();
    for (const task of tasks) {
      if (!isTask(task)) throw invalidResponse(`Неверная схема задачи: ${JSON.stringify(task)}`);
      if (ids.has(task.id)) throw invalidResponse(`Дубликат id задачи: ${task.id}`);
      ids.add(task.id);
    }
    return tasks;
  }

  // --- Чтение (GET) ---

  async function getTasks(filters = {}, options = {}) {
    const query = normalizeFilters(filters);
    const payload = await client.requestJson("/tasks", { 
      method: "GET",
      query, 
      signal: options.signal 
    });

    if (!payload || typeof payload !== "object") {
      throw invalidResponse("Ответ не является объектом");
    }

    validateTasks(payload.data);

    if (payload.meta) {
      if (typeof payload.meta !== "object") throw invalidResponse("meta должна быть объектом");
      if (payload.meta.total !== undefined && payload.meta.total !== payload.data.length) {
        throw invalidResponse(`meta.total (${payload.meta.total}) не совпадает с длиной коллекции (${payload.data.length})`);
      }
    }

    return { tasks: payload.data, meta: payload.meta ?? {} };
  }

  async function getTaskById(id, options = {}) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("id должен быть положительным целым числом");

    const payload = await client.requestJson(`/tasks/${id}`, { 
      method: "GET",
      signal: options.signal 
    });
    
    const taskData = payload.data;

    if (!isTask(taskData)) throw invalidResponse("Ответ не соответствует схеме задачи");

    return taskData;
  }

  async function getCategories(options = {}) {
    const payload = await client.requestJson("/categories", { 
      method: "GET",
      signal: options.signal 
    });

    const categories = Array.isArray(payload) ? payload : payload?.data;

    if (!Array.isArray(categories)) throw invalidResponse("categories должен быть массивом");

    const ids = new Set();
    for (const category of categories) {
      if (!isCategory(category)) throw invalidResponse(`Неверная схема категории: ${JSON.stringify(category)}`);
      if (ids.has(category.id)) throw invalidResponse(`Дубликат id категории: ${category.id}`);
      ids.add(category.id);
    }

    return categories;
  }

  // --- Изменение (POST, PATCH, DELETE) ---

  async function createTask(draft, options = {}) {
    const payload = await client.requestJson("/tasks", {
      method: "POST",
      body: draft,
      signal: options.signal,
    });

    const taskData = payload.data;
    if (!isTask(taskData)) throw invalidResponse("Созданная задача не прошла проверку схемы");

    return taskData;
  }

  async function updateTask(id, changes, options = {}) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("id должен быть положительным целым числом");

    const payload = await client.requestJson(`/tasks/${id}`, {
      method: "PATCH",
      body: changes,
      signal: options.signal,
    });

    const taskData = payload.data;
    if (!isTask(taskData)) throw invalidResponse("Обновлённая задача не прошла проверку схемы");

    return taskData;
  }

  async function setTaskCompleted(id, completed, options = {}) {
    return updateTask(id, { completed }, options);
  }

  async function deleteTask(id, options = {}) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("id должен быть положительным целым числом");

    const payload = await client.requestJson(`/tasks/${id}`, {
      method: "DELETE",
      signal: options.signal,
    });

    if (payload !== null) {
      throw invalidResponse("При удалении сервер вернул тело, ожидалось 204 No Content");
    }

    return null;
  }

  async function resetDemoData(options = {}) {
    const payload = await client.requestJson("/debug/reset", {
      method: "POST",
      signal: options.signal,
    });

    // Можно вернуть ответ как есть (обычно там { data: { reset: true } })
    return payload.data;
  }

  // --- Комбинированная загрузка ---

  async function loadInitialData(filters = {}, options = {}) {
    const [taskResult, categories] = await Promise.all([
      getTasks(filters, options),
      getCategories(options),
    ]);

    return {
      tasks: taskResult.tasks,
      categories,
      meta: taskResult.meta,
    };
  }

  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
    createTask,
    updateTask,
    setTaskCompleted,
    deleteTask,
    resetDemoData,
  };
}