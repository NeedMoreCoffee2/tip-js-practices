"use strict";

const totalTasks = 15;
const completedTasks = 0;

// Вариант 2, 26 в списке

if(totalTasks > 1000) console.log("Ошибка: превышена верхняя граница.");

else if(totalTasks === 0 && completedTasks === 0) console.log("Задач пока нет")

else if(totalTasks < 0 || completedTasks < 0) console.log("Ошибка: отрицательное количество.");

else if(completedTasks > totalTasks) console.log("Ошибка: выполнено больше, чем существует.");

else if(Number.isInteger(totalTasks) === false || Number.isInteger(completedTasks) === false) console.log("Ошибка: значение не является целым числом.");

else
{
    console.log("Всего задач:", totalTasks);
    console.log("Выполнено:", completedTasks);
    console.log("Осталось:", totalTasks - completedTasks);
    const progress = completedTasks / totalTasks * 100;
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
    if(totalTasks !== 0 && completedTasks === 0) console.log("Статус: Не начато");
    else if(totalTasks !== 0 && completedTasks > 0 && completedTasks !== totalTasks) console.log("Статус: В работе");
    else console.log("Статус: Завершено");
}