"use strict";

const result1 = "8" + 2;
console.log("Результат 1:", result1);
console.log("Тип результата 1:", typeof result1);

const result2 = "8" - 2;
console.log("Результат 2:", result2);
console.log("Тип результата 2:", typeof result2);

const result3 = Number("8") + 2;
console.log("Результат 3:", result3);
console.log("Тип результата 3:", typeof result3);

const result4 = "12" > "3";
console.log("Результат 4:", result4);
console.log("Тип результата 4:", typeof result4);

const result5 = 12 === "12";
console.log("Результат 5:", result5);
console.log("Тип результата 5:", typeof result5);

const result6 = Number("");
console.log("Результат 6:", result6);
console.log("Тип результата 6:", typeof result6);

const result7 = Number("text");
console.log("Результат 7:", result7);
console.log("Тип результата 7:", typeof result7);

const result8 = Boolean("false");
console.log("Результат 8:", result8);
console.log("Тип результата 8:", typeof result8);

const result9 = typeof null;
console.log("Результат 9:", result9);
console.log("Тип результата 9:", typeof result9);

const result10 = typeof NaN;
console.log("Результат 10:", result10);
console.log("Тип результата 10:", typeof result10);