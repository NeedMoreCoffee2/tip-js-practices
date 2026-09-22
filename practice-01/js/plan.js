"use strict";

const totalTasks = 15;
const completedTasks = 0;
const dailyLimit = 4;

// Вариант 2, 26 в списке

if(Number.isInteger(totalTasks) === false || Number.isInteger(completedTasks) === false || Number.isInteger(dailyLimit) === false) console.log("Ошибка: значение не является целым числом.");

else if(totalTasks > 1000 || dailyLimit > 1000) console.log("Ошибка: превышена верхняя граница.");

else if(totalTasks < 0 || completedTasks < 0 || dailyLimit < 0) console.log("Ошибка: отрицательное количество.");

else if(completedTasks > totalTasks) console.log("Ошибка: некорректное число выполненных задач.");

else if(completedTasks !== totalTasks && dailyLimit === 0) console.log("Ошибка: дневной лимит равен нулю.")

else if((totalTasks === 0 && completedTasks === 0) || (totalTasks === completedTasks)) console.log("0 дней.")

else
{
    let remains = totalTasks - completedTasks;
    let day = 0;
    let work = dailyLimit;

    console.log(`Осталось задач: ${remains}`);

    while(remains !== 0)
    {
        if(dailyLimit > remains) work = remains;
        remains -= work;
        day += 1;
        console.log(`День ${day}: выполнено ${work}, осталось ${remains}`);
    }
    console.log(`Потребуется дней: ${day}`);
}