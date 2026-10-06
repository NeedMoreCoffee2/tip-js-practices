// Заготовка модуля. throw ниже отмечает отсутствие реализации,
// а не способ обработки некорректных данных в готовом решении.
// Для предусмотренных ошибок необходимо возвращать { ok: false, error: "..." }.
// console.log(), prompt(), document и чтение внешнего состояния здесь не нужны.

export function createTask(id, title, priority = "medium") {
  if(Number.isSafeInteger(id) === false) return { ok: false, error: "Число должно быть безопасным целым" };
  if(typeof(title) !== "string") return { ok: false, error: "Название должно быть строкой" };
  title = title.trim();
  if(priority !== "low" && priority !== "medium" && priority !== "high") return { ok: false, error: "Приоритет задан неверно"}; 
  if(title.length === 0 || title.length > 100) return { ok: false, error: "Длина названия должна находиться в диапозоне от 1 до 100 включительно" }
  //if(Number.isSafeInteger(id) && id > 0 && title.lenght() >= 1 && title.lenght() <= 100)
  if(id <= 0) return { ok: false, error: "ID не может быть меньше единицы" };

  return { ok: true , task: {id, title, completed: false, priority}}
  //return { id, title, completed: false, priority}
  // TODO: проверить поля и вернуть результат создания задачи.
  //throw new Error("Не реализовано: createTask");
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);  
  
  // TODO: найти задачу с помощью find(); отсутствие результата — undefined.
  //throw new Error("Не реализовано: findTaskById");
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
  
  // TODO: вернуть новый массив невыполненных задач с помощью filter().
  //throw new Error("Не реализовано: getPendingTasks");
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
  
  
  // TODO: вернуть массив названий с помощью map().
  //throw new Error("Не реализовано: getTaskTitles");
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  //if(total === 0) return "Задач пока нет";

  let complete = 0;
  for(let i = 0; i < total; i++)
  {
    if(tasks[i].completed === true) complete++;
  }

  const pending = total - complete;
  let progress = 0;
  if(total !== 0) progress = complete / total * 100;
  //if(Number.isInteger(progress) === false) progress = progress.toFixed(1);

  return { total: total, completed: complete, pending: pending, progress: progress };

  
  // TODO: вернуть { total, completed, pending, progress }.
  //throw new Error("Не реализовано: getTaskStats");
}

export function addTask(tasks, id, title, priority = "medium") {
  if(findTaskById(tasks, id)) return { ok: false, error: "Такой id уже существует" };
  
  const newTask = createTask(id, title, priority);
  if(newTask.ok === false) return newTask;

  const newTasks = [...tasks, newTask.task];
  return { ok: true, tasks: newTasks};

  //const i = tasks.length;
  //tasks[i] = newTask.task;
  //return { ok: true, tasks: tasks };
  
  // TODO: проверить данные через createTask(), исключить дублирование id,
  // вернуть { ok: true, tasks: новыйМассив } без изменения исходного массива.
  //throw new Error("Не реализовано: addTask");
}

export function setTaskCompleted(tasks, id, completed) {
  if(typeof(completed) !== "boolean") return { ok: false, error: "completed должен быть типа Boolean"};
  //if(findTaskById(tasks, id) === undefined) return { ok: false, error: "Задачи с таким id не существует" };
  const task = findTaskById(tasks, id);
  if(task === undefined) return { ok: false, error: "Задачи с таким id не существует" };

  // const newTask = {...task, completed: completed};
  // const newTasks = [...tasks, newTask];

  const newTasks = tasks.map((newTask) => newTask.id === id ? { ...newTask, completed: completed } : newTask);

  return { ok: true, tasks: newTasks };
  
  // TODO: проверить id и completed, найти задачу, создать обновлённые данные.
  //throw new Error("Не реализовано: setTaskCompleted");
}

export function renameTask(tasks, id, title) {
  const task = findTaskById(tasks, id);
  if(task === undefined) return { ok: false, error: "Задачи с таким id не существует" };

  const newTitle = createTask(id, title);
  if(newTitle.ok === false) return { ok: false, error: "title задан неверно" };

  const newTasks = tasks.map((newTask) => newTask.id === id ? { ...newTask, title: newTitle.task.title } : newTask);

  return { ok: true, tasks: newTasks};

  
  
  // TODO: проверить id и title, изменить только название выбранной задачи.
  //throw new Error("Не реализовано: renameTask");
}

export function removeTask(tasks, id) {
  const task = findTaskById(tasks, id);
  if(task === undefined) return { ok: false, error: "Задачи с таким id не существует" };

  const newTasks = tasks.filter((task) => task.id !== id);

  return { ok: true, tasks: newTasks};
  
  
  // TODO: проверить id, обработать отсутствие задачи, вернуть новый массив.
  //throw new Error("Не реализовано: removeTask");
}