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

// Методы результата:
// getTasks, getTaskById, getCategories, loadInitialData, createTask, updateTask,
// setTaskCompleted, deleteTask и resetDemoData.
// Последний аргумент каждого метода данных — { signal }.
export function createTaskApi(client) {
  // void client;
  // void ALLOWED_FILTERS;
  // void invalidResponse;
  // void isTask;
  // void isCategory;

  // Перенесите getTasks/getCategories/loadInitialData из ПР5 и добавьте:
  // getTaskById(id)               -> GET /tasks/:id
  // createTask(draft)             -> POST /tasks
  // updateTask(id, changes)       -> PATCH /tasks/:id
  // setTaskCompleted(id, value)   -> PATCH /tasks/:id
  // deleteTask(id)                -> DELETE /tasks/:id, ожидается null
  // resetDemoData()               -> POST /debug/reset без тела
  // Любая полученная задача и категория проверяется до передачи интерфейсу.
  //throw new Error("Не реализовано: createTaskApi");

  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("client должен содержать метод requestJson");
  }

  // 2. Нормализация и проверка фильтров
  function normalizeFilters(filters = {}) {
    if (typeof filters !== "object" || filters === null || Array.isArray(filters)) {
      throw new TypeError("filters должен быть обычным объектом");
    }

    const result = {};

    for (const [key, value] of Object.entries(filters)) {
      if (!ALLOWED_FILTERS.has(key)) {
        throw new TypeError(`Недопустимый фильтр: ${key}`);
      }

      // Пропускаем пустые значения (undefined/null), чтобы не передавать их в URL
      if (value === undefined || value === null) continue;

      if (key === "completed") {
        if (typeof value !== "boolean") {
          throw new TypeError("Фильтр completed должен быть boolean");
        }
        result[key] = value;
      } else if (key === "priority") {
        if (typeof value !== "string" || !ALLOWED_PRIORITIES.has(value)) {
          throw new TypeError(`Фильтр priority должен быть одним из: ${[...ALLOWED_PRIORITIES].join(", ")}`);
        }
        result[key] = value;
      } else if (key === "categoryId") {
        if (!isPositiveSafeInteger(value)) {
          throw new TypeError("Фильтр categoryId должен быть положительным целым числом");
        }
        result[key] = value;
      } else if (key === "q") {
        if (typeof value !== "string") {
          throw new TypeError("Фильтр q должен быть строкой");
        }
        if (value.length > 100) throw new TypeError("Фильтр q не должен превышать 100 символов");
        result[key] = value.trim();
      }

      // Важно: false сохраняется как false, преобразование в строку сделает URLSearchParams
      //result[key] = value;
    }

    return result;
  }

  // Вспомогательная функция для проверки массива задач
  function validateTasks(tasks) {
    if (!Array.isArray(tasks)) {
      throw invalidResponse("tasks должен быть массивом");
    }
    const ids = new Set();
    for (const task of tasks) {
      if (!isTask(task)) {
        throw invalidResponse(`Неверная схема задачи: ${JSON.stringify(task)}`);
      }
      if (ids.has(task.id)) {
        throw invalidResponse(`Дубликат id задачи: ${task.id}`);
      }
      ids.add(task.id);
    }
    return tasks;
  }

  // 3. Реализация методов
  async function getTasks(filters = {}) {
    const query = normalizeFilters(filters);
    const payload = await client.requestJson("/tasks", { query: query });

    if (!payload || typeof payload !== "object") {
      throw invalidResponse("Ответ не является объектом");
    }

    validateTasks(payload.data);

    if (payload.meta) {
      if (typeof payload.meta !== "object") {
        throw invalidResponse("meta должна быть объектом");
      }
      if (payload.meta.total !== undefined && payload.meta.total !== payload.data.length) {
        throw invalidResponse(`meta.total (${payload.meta.total}) не совпадает с длиной коллекции (${payload.data.length})`);
      }
    }

    return { tasks: payload.data, meta: payload.meta ?? {} };
  }

  async function getTaskById(id) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id должен быть положительным целым числом");
    }

    const payload = await client.requestJson(`/tasks/${id}`);
    const Task = payload.data;

    if (!isTask(Task)) {
      throw invalidResponse("Ответ не соответствует схеме задачи");
    }

    return Task;
  }

  async function getCategories() {
    const payload = await client.requestJson("/categories");

    // API может возвращать как массив, так и объект { data: [...] }
    const categories = Array.isArray(payload) ? payload : payload?.data;

    if (!Array.isArray(categories)) {
      throw invalidResponse("categories должен быть массивом");
    }

    const ids = new Set();
    for (const category of categories) {
      if (!isCategory(category)) {
        throw invalidResponse(`Неверная схема категории: ${JSON.stringify(category)}`);
      }
      if (ids.has(category.id)) {
        throw invalidResponse(`Дубликат id категории: ${category.id}`);
      }
      ids.add(category.id);
    }

    return categories;
  }

  // 4. Параллельная загрузка
  async function loadInitialData(filters = {}) {
    const [tasksResult, categories] = await Promise.all([
      getTasks(filters),
      getCategories(),
    ]);

    return {
      tasks: tasksResult.tasks,
      categories,
      meta: tasksResult.meta,
    };
  }

  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
  };
}
