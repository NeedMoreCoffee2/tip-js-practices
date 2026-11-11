const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Возвращает { valid, value, errors }.
// value содержит нормализованные title, priority и числовой categoryId.
export function validateTaskDraft(draft, categories) {
  // Защита от некорректных входных данных (null или не объект)
  const safeDraft = (draft && typeof draft === "object") ? draft : {};
  const safeCategories = Array.isArray(categories) ? categories : [];

  const errors = {};
  const value = {};

  // 1. Валидация title
  const titleRaw = safeDraft.title;
  const titleStr = typeof titleRaw === "string" ? titleRaw.trim() : "";
  
  if (titleStr.length === 0) {
    errors.title = "Название не может быть пустым.";
  } else if (titleStr.length > 100) {
    errors.title = "Название не должно превышать 100 символов.";
  } else {
    value.title = titleStr;
  }

  // 2. Валидация priority
  const priorityRaw = safeDraft.priority;
  if (typeof priorityRaw !== "string" || !ALLOWED_PRIORITIES.has(priorityRaw)) {
    errors.priority = "Выберите корректный приоритет (low, medium, high).";
  } else {
    value.priority = priorityRaw;
  }

  // 3. Валидация categoryId
  const categoryIdRaw = safeDraft.categoryId;
  // Если пришла строка из input, приводим её к числу для проверки
  const categoryIdNum = Number(categoryIdRaw);
  
  if (!Number.isSafeInteger(categoryIdNum) || categoryIdNum <= 0) {
    errors.categoryId = "Категория должна быть выбрана.";
  } else {
    // Проверяем, существует ли такая категория в переданном списке
    const categoryExists = safeCategories.some(cat => cat && cat.id === categoryIdNum);
    if (!categoryExists) {
      errors.categoryId = "Выбранная категория не найдена.";
    } else {
      value.categoryId = categoryIdNum;
    }
  }

  // 4. Формирование результата
  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    value: valid ? value : null, // Если невалидно, возвращаем null или пустой объект (по контракту можно вернуть value, но лучше null)
    errors
  };
}