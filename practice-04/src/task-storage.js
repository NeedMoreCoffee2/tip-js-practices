export const STORAGE_VERSION = 1;
const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Все функции принимают объект storage явно, чтобы их можно было проверить
// без обращения к глобальному window.localStorage.

export function isValidTask(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  if (!Number.isSafeInteger(value.id) || value.id <= 0) return false;
  if (typeof value.title !== "string") return false;

  const trimmedTitle = value.title.trim();

  if (trimmedTitle.length < 1 || trimmedTitle.length > 100) return false;
  if (typeof value.completed !== "boolean") return false;
  if (!ALLOWED_PRIORITIES.has(value.priority)) return false;
  return true;
}

export function isValidTaskList(value) {
// TODO: проверить массив задач, поля каждой задачи и уникальность id.
if (!Array.isArray(value)) return false;

  const was = new Set();
  for (const task of value)
  {
    if (isValidTask(task) === false) return false;
    if (was.has(task.id)) return false;
    was.add(task.id);
  }
  return true;
//throw new Error("Не реализовано: isValidTaskList");
}


export function loadTasks(storage, key, fallbackTasks) {
  // TODO: прочитать строку, разобрать объект { version, tasks }, проверить данные.
  // Нет записи: { ok: true, source: "initial", tasks: копия fallbackTasks }.
  // Есть корректная запись: { ok: true, source: "storage", tasks: новая копия }.
  // Ошибка чтения, JSON или схемы: { ok: false, source: "fallback",
  // tasks: копия fallbackTasks, error: "понятное сообщение" }.

  //   loadTasks выполняет последовательность:

  // Создаёт независимую копию fallbackTasks.
  // Внутри try вызывает storage.getItem(key).
  // Для null возвращает исходную копию с source: "initial".
  // Разбирает JSON и проверяет версию и задачи.
  // Для корректной записи возвращает новую копию с source: "storage".
  // Для исключения или неверной схемы возвращает fallback с непустой ошибкой.
  //   throw new Error("Не реализовано: loadTasks");
  const fallback = fallbackTasks.map((task) => ({...task}));

  let raw;
  try
  {
    raw = storage.getItem(key);
  }
  catch(error)
  {
    return { ok: false, source: "fallback", tasks: fallback, error: "Не удалось прочитать сохранённые данные." };
  }

  if(raw === null) return { ok: true, source: "initial", tasks: fallback};

  let parsed;
  try
  {
    parsed = JSON.parse(raw);
  }
  catch (error)
  {
    return { ok: false, source: "fallback", tasks: fallback, error: "Сохранённые данные повреждены и не могут быть прочитаны.", };
  }

  if (
    parsed === null ||
    typeof parsed !== "object" ||
    parsed.version !== STORAGE_VERSION ||
    !isValidTaskList(parsed.tasks)
  ) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallback,
      error: "Сохранённые данные не соответствуют ожидаемой схеме.",
    };
  }

  return { ok: true, source: "storage", tasks: parsed.tasks.map((task) => ({...task})) };

}

export function saveTasks(storage, key, tasks) {
  // TODO: проверить задачи и сохранить JSON.stringify({ version, tasks }).
  // Вернуть { ok: true } либо { ok: false, error: "..." }; исключение не выпускать.

  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Некорректный список задач: запись отменена." };
  }

  try {
    const payload = { version: STORAGE_VERSION, tasks: tasks };
    storage.setItem(key, JSON.stringify(payload));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Не удалось сохранить данные." };
  }
  //throw new Error("Не реализовано: saveTasks");
}

export function removeSavedTasks(storage, key) {
  // TODO: удалить только переданный ключ; вернуть результат и перехватить исключение.
  //throw new Error("Не реализовано: removeSavedTasks");
   try {
    storage.removeItem(key);
    return { ok: true };
  }
  catch (error) {
    return { ok: false, error: "Не удалось удалить сохранённые данные." };
  }
}
