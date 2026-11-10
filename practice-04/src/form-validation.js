const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Чистая проверка данных формы. DOM и показ сообщений выполняются в main.js.
// draft: { id, title, priority }; editingId: null либо id редактируемой задачи.
export function validateTaskDraft(draft, tasks, editingId = null) {
  // TODO: нормализовать и проверить id, title и priority.
  // В режиме создания id должен быть уникальным.
  // В режиме редактирования используется editingId и проверяется наличие задачи.
  // Успех: { ok: true, value: { id, title, priority } }.
  // Отказ: { ok: false, errors: { id?: "...", title?: "...", priority?: "..." } }.
  // ALLOWED_PRIORITIES можно использовать при проверке приоритета.

  let errors = {};
  let ok = true;

  let id;
  let title;
  let priority;

  if(editingId !== null)
  {
    if(Number.isSafeInteger(editingId) === false || editingId <= 0)
    {
      errors.id = "Некорректный идентификатор редактируемой задачи";
      ok = false;
    }
    else
    {
      let ifIn = 0;
      for(let i = 0; i < tasks.length; i++)
      {
        if(tasks[i].id === editingId) ++ifIn;
      }
      if(ifIn === 0)
      {
        errors.id = "Идентификатор редактируемой записи должен совпадать с ID в tasks";
        ok = false;
      }
      else id = editingId;
    }
  }

  else
    {
      const raw = draft.id;

      const strRaw = typeof raw === "number" ? String(raw) : raw;

      if(typeof strRaw !== "string" || strRaw.trim() === "")
      {
        errors.id = "Некорректный идентификатор";
        ok = false;
      }
      else
      {
        const intRaw = Number(raw);
        if(Number.isSafeInteger(intRaw) === false || intRaw <= 0)
        {
          errors.id = "Идентификатор должен быть положительным целым числом";
          ok = false;
        }
        else
        {
          let ifIn = 0;
          for(let i = 0; i < tasks.length; i++)
          {
            if(tasks[i].id === intRaw) ++ifIn;
          }
          if(ifIn !== 0)
          {
            errors.id = "Идентификатор создаваемой записи не должен совпадать с ID в tasks";
            ok = false;
          }
          else id = intRaw;
        }
      }
    }

  if(typeof draft.title !== "string")
  {
    errors.title = "Название не является строкой";
    ok = false;
  }
  else
  {
    const titleLen = draft.title.trim().length;
    if(titleLen < 1 || titleLen > 100)
    {
      errors.title = "Длина названия должна быть от 1 до 100";
      ok = false;
    }
    else title = draft.title.trim();
  }

  priority = draft.priority;
  
  if(typeof priority !== "string" || !ALLOWED_PRIORITIES.has(priority))
  {
    errors.priority = "Приоритет задан неверно";
    ok = false;
  }
  else priority = priority.trim();

  if(ok === false) return { ok: false, errors: errors};
  else return { ok: true, value: { id: id, title: title, priority: priority } };
  //throw new Error("Не реализовано: validateTaskDraft");
}