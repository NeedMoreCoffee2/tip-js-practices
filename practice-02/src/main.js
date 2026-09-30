import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  createTask,
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

console.log("ПР2. Заготовка демонстрационного сценария");
console.log("Количество задач в общем наборе:", demoTasks.length);
console.log("Номер варианта:", variantNumber);
console.log("Количество задач в индивидуальном наборе:", variantTasks.length);


let currentTasks = demoTasks;

console.log("1. Добавление задачи:")
let result = addTask(currentTasks, 20, "Добавить проверку", "high");

if (result.ok) {
  currentTasks = result.tasks;
} else {
  console.error(`Ошибка: ${result.error}`);
}

const { total: total1, completed: completed1, pending: pending1, progress: progress1 } = getTaskStats(currentTasks);

console.log(`Всего: ${total1}; выполнено: ${completed1}; осталось: ${pending1}`);
if (total1 === 0) {
  console.log("Задач пока нет");
} else {
  console.log(`Прогресс: ${progress1.toFixed(1)}%`);
}

///////////////////////////////////
console.log("2. Установка completed = true:")
result = setTaskCompleted(currentTasks, 4, true);

if(result.ok) currentTasks = result.tasks;
else console.error(`Ошибка: ${result.error}`);

const { total: total2, completed: completed2, pending: pending2, progress: progress2 } = getTaskStats(currentTasks);

console.log(`Всего: ${total2}; выполнено: ${completed2}; осталось: ${pending2}`);
if (total2 === 0) {
  console.log("Задач пока нет");
} else {
  console.log(`Прогресс: ${progress2.toFixed(1)}%`);
}
/////////////////////////////////////

console.log("3. Переименование:")
result = renameTask(currentTasks, 10, "Подготовить инструкцию запуска");

if(result.ok) currentTasks = result.tasks;
else console.error(`Ошибка: ${result.error}`);

const { total: total3, completed: completed3, pending: pending3, progress: progress3 } = getTaskStats(currentTasks);

console.log(`Всего: ${total3}; выполнено: ${completed3}; осталось: ${pending3}`);
if (total3 === 0) {
  console.log("Задач пока нет");
} else {
  console.log(`Прогресс: ${progress3.toFixed(1)}%`);
}
///////////////////////////////////////

console.log("4. Удаление:")
result = removeTask(currentTasks, 7);

if(result.ok) currentTasks = result.tasks;
else console.error(`Ошибка: ${result.error}`);

const { total: total4, completed: completed4, pending: pending4, progress: progress4 } = getTaskStats(currentTasks);

console.log(`Всего: ${total4}; выполнено: ${completed4}; осталось: ${pending4}`);
if (total4 === 0) {
  console.log("Задач пока нет");
} else {
  console.log(`Прогресс: ${progress4.toFixed(1)}%`);
}

//////////////////////////////////////////

console.log("5. Проверка сохранности demoTasks:")
// console.log(`demoTasks = ${demoTasks}`);
// console.log(`currentTasks = ${currentTasks}`);
// console.log(demoTasks[0]);
console.log("demotasks:");
for(let i = 0; i < demoTasks.length; i++) console.log(demoTasks[i]);

console.log("currentTasks:");
for(let i = 0; i < currentTasks.length; i++) console.log(currentTasks[i]);

/////////////////////////////////////////////////////////////////////
console.log("");
console.log("Три собственные проверки: ");
const tasksNew = [
    { id: 2, title: "Изучить функции", completed: true, priority: "medium" },
    { id: 6, title: "Подготовить модель задач", completed: false, priority: "high" }
];

let tasksNew1 = tasksNew;

console.log(`Проверка 1: добавим id = 17`);
let resultNew1 = addTask(tasksNew1, 17, "Отправить Лунтика на Луну", "high");

if(resultNew1.ok) tasksNew1 = resultNew1.tasks;
else console.error(`Ошибка: ${resultNew1.error}`);

for(let i = 0; i < tasksNew1.length; i++) console.log(tasksNew1[i]);

console.log(`Проверка 2: переименуем id = 2`);
resultNew1 = renameTask(tasksNew1, 2, "Купить Лунтику пиво");

if(resultNew1.ok) tasksNew1 = resultNew1.tasks;
else console.error(`Ошибка: ${resultNew1.error}`);

for(let i = 0; i < tasksNew1.length; i++) console.log(tasksNew1[i]);

console.log(`Проверка 3: удалим id = 6`);
resultNew1 = removeTask(tasksNew1, 6);

if(resultNew1.ok) tasksNew1 = resultNew1.tasks;
else console.error(`Ошибка: ${resultNew1.error}`);

for(let i = 0; i < tasksNew1.length; i++) console.log(tasksNew1[i]);

console.log("Проверим неизменность tasksNew: ");

for(let i = 0; i < tasksNew.length; i++) console.log(tasksNew[i]);

//////////////////////////////////////////////////////////////////////////


console.log("");
console.log("Общий сценарий вариант 2");
console.log("Исходный массив:");
for(let i = 0; i < variantTasks.length; i++) console.log(variantTasks[i]);
let variantTasksNew = variantTasks;

console.log("Добавление id = 80:");
let varRes = addTask(variantTasksNew, 80, "Подготовить ответы на вопросы", "medium");

if(varRes.ok) 
{
  variantTasksNew = varRes.tasks;
  console.log("Успешное добавление новой задачи");
}
else console.error(`Ошибка: ${varRes.error}`);

console.log("Установить completed = true для id = 11");
varRes = setTaskCompleted(variantTasksNew, 11, true);

if(varRes.ok)
{
  variantTasksNew = varRes.tasks;
  console.log("Успешное изменение задачи");
}
else console.error(`Ошибка: ${varRes.error}`);

console.log("Переименовать id = 23");
varRes = renameTask(variantTasksNew, 23, "Написать план и тезисы");

if(varRes.ok)
{
  variantTasksNew = varRes.tasks;
  console.log("Успешное изменение задачи");
}
else console.error(`Ошибка: ${varRes.error}`);

console.log("Удалить id = 37");
varRes = removeTask(variantTasksNew, 37);

if(varRes.ok)
{
  variantTasksNew = varRes.tasks;
  console.log("Успешное удаление задачи");
}
else console.error(`Ошибка: ${varRes.error}`);

console.log("Попробовать повторно добавить id = 80");
varRes = addTask(variantTasksNew, 80, "Подготовить ответы на вопросы", "medium");

if(varRes.ok)
{
  variantTasksNew = varRes.tasks;
  console.log("Успешное добавление задачи");
}
else console.error(`Ошибка: ${varRes.error}`);

console.log("Новый массив:");
for(let i = 0; i < variantTasksNew.length; i++) console.log(variantTasksNew[i]);
console.log("Старый массив:");
for(let i = 0; i < variantTasks.length; i++) console.log(variantTasks[i]);


// TODO: после реализации функций выполнить общий сценарий из раздела 6.5.
// Текущее состояние хранится в локальной переменной:
// let currentTasks = demoTasks;
// После успешной операции currentTasks получает result.tasks.
// При result.ok === false необходимо вывести ошибку, не заменяя состояние.
// Сводка выводится после каждого этапа; вычисления выполняются в task-service.js.

// TODO: выполнить отдельный сценарий для variantTasks по разделу 7.
// Общий набор demoTasks не заменяется данными варианта.

// TODO: показать хотя бы одну обработанную ошибку и неизменность исходных данных.
// Для удобного вывода объектов допустимо использовать console.table().
