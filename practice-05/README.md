# Практическая работа № 5. Асинхронные операции и получение данных с сервера

## Данные работы

| Поле | Значение |
|---|---|
| Имя | Соколов Александр Юрьевич |
| Группа | ЭФБО-06-25 |
| Вариант из ПР2–ПР4 | 2 |
| Node.js | v24.21.0 |
| Браузер | Microsoft Edge 154.0.4258.37 |
| Операционная система | Windows 11 |

## Запуск

Рабочая папка: `practice-05` внутри личного репозитория.

Проверка готового API:

```bash
npm run check:api
```

Полный набор после реализации клиента:

```bash
npm test
```

Для ручного сценария необходимы два терминала.

Терминал 1:

```bash
npm start
```

Терминал 2:

```bash
npm run example:fetch
npm run client
```

Адрес API по умолчанию:

```text
http://127.0.0.1:5505/api
```

Если использован другой порт, указать фактические команды и значение переменной `API_URL`.

## Эксперимент с очередями выполнения

До запуска `npm run example:order` записать прогноз порядка меток. После запуска внести фактический порядок и объяснить каждую позицию.

| Этап | Порядок меток | Объяснение |
|---|---|---|
| Прогноз до запуска | A B C D E F | Сначало выполняется синхронный код -> потом асинхронный(микро, затем макро) |
| Фактический результат | A B C D E F | Сначало выполняется синхронный код -> потом асинхронный(микро, затем макро) |

Отдельно указать:

- какие сообщения относятся к синхронному коду;
- какие продолжения попадают в очередь микрозадач;
- почему таймер с задержкой `0` не выполняется немедленно;
- изменится ли вывод, если удалить один из обработчиков Promise.

Ответ:
- Синхронный код: A B C
- Микрозадачи: D E
- Макрозадачи: F
- Задержка `0` означает не немедленно, а как можно скорее после выполнения микрозадач
- Вывод изменится, если удалить один из обработчиков Promise

## Наблюдение за HTTP-ответом

Выполнить `npm run example:fetch` при запущенном API и зафиксировать результат.

| Свойство | Фактическое значение | Что означает |
|---|---|---|
| URL запроса | `http://127.0.0.1:5505/api/tasks?completed=false&priority=high` | Адрес эндпоинта: путь /api/tasks + query-строка с фильтрами completed=false и priority=high. baseUrl берётся из переменной окружения API_URL, иначе - локальный сервер на порту 5505 |
| Метод | `GET` | Метод по умолчанию для fetch(), так как в опциях не указан method. GET - чтение данных, параметры передаются в URL, тела нет |
| Статус | `200` | HTTP-статус ответа. 200 OK - сервер успешно обработал запрос и вернул данные |
| `response.ok` | `true` | `Производное от статуса: true, если статус в диапазоне 200–299. Подтверждает, что запрос успешен (не 4xx/5xx)` |
| `Content-Type` | `application/json; charset=utf-8` | Сервер сообщает, что тело ответа - JSON в кодировке UTF-8. Именно это позволяет безопасно вызвать `response.json()` |
| id полученных задач | 4, 13, 34 | `Результат payload.data.map(task => task.id) - массив идентификаторов задач, удовлетворяющих фильтрам (незавершённые + высокий приоритет). Всего 3 задачи` |
| `meta.filters` | `completed: false, priority: 'high', categoryId: null, q: ''` | `Метаданные ответа: какие фильтры фактически применил сервер. Подтверждает, что completed=false и priority=high дошли и были применены, а categoryId и q не задавались (поэтому null и пустая строка)` |

Добавить сведения из вкладки Network браузера либо из другого HTTP-клиента для запросов `/health`, `/tasks/25` и `/tasks/999`:

```text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 24
Cache-Control: no-store
X-Content-Type-Options: nosniff
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Accept, Content-Type
Access-Control-Max-Age: 600
Date: Tue, 10 Nov 2026 17:56:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"data":{"status":"ok"}}HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 1429
Cache-Control: no-store
X-Content-Type-Options: nosniff
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Accept, Content-Type
Access-Control-Max-Age: 600
Date: Tue, 10 Nov 2026 17:56:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"data":[{"id":1,"title":"Изучить функции","completed":true,"priority":"medium","categoryId":1},{"id":4,"title":"Подготовить модель задач","completed":false,"priority":"high","categoryId":2},{"id":7,"title":"Проверить методы массивов","completed":false,"priority":"low","categoryId":1},{"id":10,"title":"Оформить README","completed":true,"priority":"medium","categoryId":3},{"id":13,"title":"Разобрать Promise","completed":false,"priority":"high","categoryId":1},{"id":16,"title":"Проверить учебный API","completed":true,"priority":"high","categoryId":2},{"id":19,"title":"Описать контракт запросов","completed":false,"priority":"medium","categoryId":3},{"id":22,"title":"Подготовить демонстрацию","completed":false,"priority":"low","categoryId":2},{"id":25,"title":"Исправить обработку ошибок","completed":true,"priority":"high","categoryId":2},{"id":28,"title":"Добавить фильтры API","completed":false,"priority":"medium","categoryId":2},{"id":31,"title":"Сверить отчёт","completed":true,"priority":"low","categoryId":3},{"id":34,"title":"Провести рефакторинг клиента","completed":false,"priority":"high","categoryId":2}],"meta":{"total":12,"filters":{"completed":null,"priority":null,"categoryId":null,"q":""}}}HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 443
Cache-Control: no-store
X-Content-Type-Options: nosniff
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Accept, Content-Type
Access-Control-Max-Age: 600
Date: Tue, 10 Nov 2026 17:56:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"data":[{"id":4,"title":"Подготовить модель задач","completed":false,"priority":"high","categoryId":2},{"id":13,"title":"Разобрать Promise","completed":false,"priority":"high","categoryId":1},{"id":34,"title":"Провести рефакторинг клиента","completed":false,"priority":"high","categoryId":2}],"meta":{"total":3,"filters":{"completed":false,"priority":"high","categoryId":null,"q":""}}}HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 129
Cache-Control: no-store
X-Content-Type-Options: nosniff
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Accept, Content-Type
Access-Control-Max-Age: 600
Date: Tue, 10 Nov 2026 17:56:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"data":{"id":25,"title":"Исправить обработку ошибок","completed":true,"priority":"high","categoryId":2}}HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
Content-Length: 112
Cache-Control: no-store
X-Content-Type-Options: nosniff
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Accept, Content-Type
Access-Control-Max-Age: 600
Date: Tue, 10 Nov 2026 17:56:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"TASK_NOT_FOUND","message":"Задача с id 999 не найдена.","details":{"id":999}}}HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 130
Cache-Control: no-store
X-Content-Type-Options: nosniff
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Accept, Content-Type
Access-Control-Max-Age: 600
Date: Tue, 10 Nov 2026 17:56:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"data":[{"id":1,"name":"Учёба"},{"id":2,"name":"Проект"},{"id":3,"name":"Организация"}],"meta":{"total":3}}
```

## Организация кода

Кратко описать ответственность файлов:

| Файл | Ответственность |
|---|---|
| `api/server.mjs` | Запуск сервера |
| `src/api-client.js` | Создание URL. Передача и проверка значений |
| `src/task-api.js` | Функции `getTasks, getTaskById, getCategories, loadInitialData` |
| `src/variant.js` | Модификация решения с помощью варианта |
| `src/main.js` | Отрисовка списка задач |

Объяснить, почему `fetchFn` передаётся в `createApiClient`, почему HTTP-ошибки проверяются отдельно от сетевых и почему JSON после разбора всё равно проверяется по контракту.

fetchFn передаётся в createApiClient для тестируемости (внедрение зависимости). В тестах можно передать фейковую функцию и проверить логику клиента (тайм-аут, битый JSON, 500-е) без запуска реального сервера и сети.

HTTP-ошибки проверяются отдельно от сетевых потому, что это разные события. Сетевой сбой (сервер выключен) отклоняет Promise от fetch и ловится в catch. А HTTP-ошибка (404, 500) - это успешный ответ сервера (Promise разрешается), просто с плохим статусом. Если их смешать в одном catch, HTTP-ошибка ошибочно превратится в сетевую (network), и клиент запутается.

JSON после разбора проверяется по контракту потому, что response.json() проверяет только синтаксис (валидность JSON), но не смысл. Сервер может прислать валидный JSON, но с неверной структурой (например, строку вместо массива задач). Проверка схемы (isTask, isCategory) сразу превращает такие "сюрпризы" в понятную ошибку invalid-response, спасая приложение от падения в глубине кода.

## Реализация общего клиента

Указать принятые решения для `buildUrl` и `requestJson`.

| Требование | Как реализовано | Проверка |
|---|---|---|
| Нормализация `baseUrl` | Через `new URL(baseUrl)` с проверкой протокола `(http:/https:)` и отсутствия `query/hash`. Путь и baseUrl очищаются от лишних / на стыке. | Бросает `TypeError` при передаче относительного адреса, ftp:// или URL с ?x=1. |
| Кодирование query-параметров | Создается объект `URLSearchParams`, в него через `append` добавляются значения (кроме undefined, null, ""). false и 0 сохраняются за счет строгих проверок. | В URL пробелы превращаются в +, спецсимволы (&, #) и кириллица кодируются (например, %D0%9C). Входной объект не мутирует. |
| Заголовок `Accept` | В вызов fetchFn передается объект `headers: { Accept: "application/json" }`. | При передаче фейкового `fetchFn` можно убедиться, что заголовок присутствует в объекте init. |
| Проверка `response.ok` | Выполняется после `fetch` до чтения тела. Если `false`, выбрасывается `ApiError` с `kind: "http"`, куда извлекаются `status`, `code` и `details` из `payload.error`. | Запрос `/tasks/999` возвращает 404, клиент бросает `ApiError`, а не пытается парсить ответ как успешный. |
| Проверка `Content-Type` | Выполняется для успешных ответов (кроме 204) через `response.headers.get("content-type").includes("application/json")`. | Если сервер вернет text/html со статусом 200 (например, страницу логина), клиент бросит ошибку `invalid-response`. |
| Разбор JSON | `await response.json()` обернут в отдельный `try/catch`. | Если тело содержит поврежденный JSON (например, обрезанный), `SyntaxError` перехватывается и преобразуется в `ApiError` с `kind: "invalid-response"`. |
| Ограничение времени | Создается сигнал `AbortSignal.timeout(timeoutMs)`. Он автоматически «выстреливает» через заданное время, прерывая запрос. | Запрос на `/debug/delay?ms=150` с `timeoutMs: 20` падает с ошибкой `kind: "timeout"`. |
| Внешняя отмена | Внешний `signal` (если передан) объединяется с сигналом тайм-аута через `AbortSignal.any([signal, timeoutSignal])`. | Вызов `controller.abort()` обрывает запрос и приводит к `ApiError` с `kind: "aborted"`. |

## Классификация ошибок

| Сценарий | Ожидаемый `kind` | Фактические поля `ApiError` | Итог |
|---|---|---|---|
| Задача `999` | `http` | status: 404, code: "TASK_NOT_FOUND", details: { id: 999 }, url: ".../api/tasks/999", message: "HTTP 404" | Сервер вернул 404 и структурированный JSON |
| `completed=yes` | `http` | status: 400, code: "INVALID_QUERY", details: { ... } (описание неверного параметра), url: ".../api/tasks?completed=yes", message: "HTTP 400" | Сервер отклонил неверный тип фильтра |
| `/debug/error` | `http` | status: 503, code: "SERVICE_UNAVAILABLE", details: null, url: ".../api/debug/error", message: "HTTP 503" | Сервер вернул 503 с JSON-ошибкой |
| `/debug/invalid-json` | `invalid-response` | status: null, code: null, url: ".../api/debug/invalid-json", cause: SyntaxError (от response.json()), message: "Не удалось разобрать JSON" | Статус 200, Content-Type верный, но тело повреждено - SyntaxError перехвачен и превращён в invalid-response |
| `/debug/text` | `invalid-response` | status: null, code: null, url: ".../api/debug/text", cause: null (или отсутствует), message: "Ожидался JSON, получен: text/plain..." | Статус 200, но Content-Type не JSON - проверка срабатывает до парсинга |
| Не запущен API | `network` | status: null, code: null, url: ".../api/...", cause: TypeError (от fetch, fetch failed), message: "Сетевая ошибка" | fetch отклонён (соединение не установлено) |
| Задержка больше тайм-аута | `timeout` | status: null, code: null, url: ".../api/debug/delay?ms=150", cause: DOMException (name: TimeoutError), message: "Превышено время ожидания" | AbortSignal.timeout сработал раньше, чем сервер ответил на запрос |
| Явный `AbortController.abort()` | `aborted` | status: null, code: null, url: ".../api/debug/delay?ms=150", cause: DOMException (name: AbortError), message: "Запрос отменён" | Внешний сигнал сработал через AbortSignal.any, клиент отличил отмену от тайм-аута по error.name |

## Доменный модуль задач

Зафиксировать фактические результаты:

| Вызов | Результат |
|---|---|
| `getTasks()` | Количество: 12, id = {1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34} |
| `getTasks({ completed: false, priority: "high" })` | Количество: 3, id = {4, 13, 34} |
| `getTaskById(25)` | `{ id: 25, title: "Исправить обработку ошибок", completed: true, priority: "high", categoryId: 2, }` |
| `getCategories()` | id = `{1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34}`, category = `{'Учёба', 'Проект', 'Учёба', 'Организация', 'Учёба', 'Проект', 'Организация', 'Проект', 'Проект', 'Проект', 'Организация', 'Проект'}` |
| `loadInitialData(...)` | Состав: `tasks: массив из 3 задач (id 4, 13, 34), categories: массив из 3 категорий, meta: { total: 3, filters: { completed: false, priority: "high", categoryId: null, q: "" } }` |

## Последовательная и параллельная загрузка

Сравнить два сценария получения задач и категорий через `/debug/delay`. Каждый сценарий выполнить минимум три раза с одинаковыми задержками.

| Сценарий | Запуск 1, мс | Запуск 2, мс | Запуск 3, мс | Наблюдение |
|---|---:|---:|---:|---|
| Два последовательных `await` | 308 | 305 | 310 | Время равно сумме задержек двух запросов (~150 + ~150) плюс накладные расходы на сеть и парсинг. |
| `Promise.all` | 153 | 151 | 156 | Время равно максимуму из двух задержек (~150), так как запросы выполняются одновременно. |

## Общий контрольный сценарий

| Шаг | Действие | Ожидаемый результат | Фактический результат | Итог |
|---:|---|---|---|---|
| 1 | Запустить API и проверить `/health` | `200`, JSON со статусом `ok` | `200`, JSON со статусом `ok` | Выполнено |
| 2 | Получить все задачи | 12 задач | Получен массив data из 12 объектов, meta.total равен 12 | Выполнено |
| 3 | Отобрать незавершённые задачи высокого приоритета | id `[4, 13, 34]` | id `[4, 13, 34]` | Выполнено |
| 4 | Параллельно получить задачи и категории | Обе части результата доступны | loadInitialData вернула объект, в котором есть и tasks (массив), и categories (массив из 3 элементов) | Выполнено |
| 5 | Запросить задачу `999` | `ApiError`, `http`, статус `404` | Выброшен ApiError с полями: kind: "http", status: 404, code: "TASK_NOT_FOUND", details: { id: 999 } | Выполнено |
| 6 | Остановить API и повторить запрос | `ApiError`, `network` | Выброшен ApiError с полями: kind: "network", cause: TypeError | Выполнено |
| 7 | Запустить API повторно | Клиент снова получает данные | Запуск npm start восстановил сервер, npm run client снова успешно вывел таблицу задач и ошибку 404 | Выполнено |

## Индивидуальный вариант

| Поле | Значение |
|---|---|
| Номер варианта | 2 |
| Переданные фильтры | { completed: true } |
| URL запроса | http://127.0.0.1:5505/api/tasks?completed=true |
| Полученные id | [1, 10, 16, 25, 31] |
| `meta.total` | 5 |
| Соответствие ожидаемому результату | Соответствует |

## Протокол проверки API

Вставить реальный вывод `npm run check:api`.

```text

> tip-js-practice-05@1.0.0 check:api
> node checks/api-server.checks.js

OK: 01. health возвращает состояние API и обязательные заголовки
OK: 02. список задач сохраняет контрольный порядок
OK: 03. completed=false отбирает невыполненные задачи
OK: 04. несколько фильтров применяются совместно
OK: 05. q выполняет регистронезависимый поиск по названию
OK: 06. пустой q не отбирает задачи
OK: 07. неверное значение completed даёт JSON-ошибку 400
OK: 08. неизвестный и повторяющийся параметры отклоняются
OK: 09. задача запрашивается по положительному id
OK: 10. отсутствующая задача даёт структурированную ошибку 404
OK: 11. неверный формат id даёт ошибку 400
OK: 12. API возвращает категории
OK: 13. категория запрашивается по id, отсутствие даёт 404
OK: 14. HEAD возвращает заголовки без тела
OK: 15. OPTIONS сообщает правила CORS
OK: 16. неподдерживаемый метод даёт 405 и Allow
OK: 17. неизвестный маршрут даёт ошибку 404
OK: 18. отладочные маршруты воспроизводят 503, не-JSON и задержку

Итог API: успешно 18, ошибок 0.
```

## Протокол модульных проверок клиента

Вставить реальный вывод `npm run check:client`.

```text

> tip-js-practice-05@1.0.0 check:client
> node checks/api-client.checks.js

OK: 01. buildUrl соединяет baseUrl и путь без двойного слеша
OK: 02. buildUrl кодирует параметры и сохраняет false и 0
OK: 03. buildUrl не изменяет входной объект query
OK: 04. createApiClient проверяет конфигурацию
OK: 05. requestJson выполняет GET с Accept и signal
OK: 06. requestJson возвращает разобранный JSON успешного ответа
OK: 07. успешный ответ 204 преобразуется в null
OK: 08. JSON-ошибка 404 преобразуется в ApiError с полями контракта
OK: 09. HTTP-ошибка без JSON сохраняет приоритет статуса
OK: 10. успешный ответ с неверным Content-Type отклоняется
OK: 11. повреждённый JSON успешного ответа отклоняется
OK: 12. значение вместо Response отклоняется как неверный ответ
OK: 13. сетевая ошибка преобразуется и сохраняется как cause
OK: 14. превышение времени запроса имеет kind timeout
OK: 15. внешний AbortSignal отличает отмену от тайм-аута
OK: 16. ApiError от обработки ответа не маскируется как network
OK: 17. createTaskApi требует requestJson
OK: 18. getTasks нормализует допустимые фильтры
OK: 19. getTasks отклоняет неверные и неизвестные фильтры до запроса
OK: 20. getTaskById проверяет id и путь
OK: 21. getCategories возвращает проверенный массив
OK: 22. ответы задач проверяются по схеме
OK: 23. коллекция задач отклоняет повторяющиеся id и неверный meta.total
OK: 24. одиночная задача и категории проверяются по схеме
OK: 25. loadInitialData начинает два независимых запроса параллельно
OK: 26. loadInitialData передаёт отказ одного из запросов вызывающему коду

Итог клиента: успешно 26, ошибок 0.
```

## Протокол интеграционных проверок

Вставить реальный вывод `npm run check:integration`.

```text

> tip-js-practice-05@1.0.0 check:integration
> node checks/integration.checks.js

OK: 01. клиент получает полный список от реального API
OK: 02. логические false и несколько фильтров доходят до API
OK: 03. строка поиска кодируется и обрабатывается
OK: 04. клиент получает одну задачу
OK: 05. клиент получает категории
OK: 06. параллельная начальная загрузка собирает общий результат
OK: 07. ошибка 404 сохраняет код и детали API
OK: 08. ошибка запроса 400 не считается сетевой
OK: 09. ошибка сервера 503 сохраняет вид http
OK: 10. повреждённый JSON определяется как invalid-response
OK: 11. неожиданный Content-Type определяется как invalid-response
OK: 12. медленный ответ прерывается по тайм-ауту
OK: 13. внешний AbortController отменяет реальный запрос

Итог интеграции: успешно 13, ошибок 0.
```

## Собственные проверки

| № | Исходное состояние и действие | Ожидаемый результат | Фактический результат | Итог |
|---:|---|---|---|---|
| 1 | completed=true&priority=medium | {"data":[{"id":1,"title":"Изучить функции","completed":true,"priority":"medium","categoryId":1},{"id":10,"title":"Оформить README","completed":true,"priority":"medium","categoryId":3}],"meta":{"total":2,"filters":{"completed":true,"priority":"medium","categoryId":null,"q":""}}} | {"data":[{"id":1,"title":"Изучить функции","completed":true,"priority":"medium","categoryId":1},{"id":10,"title":"Оформить README","completed":true,"priority":"medium","categoryId":3}],"meta":{"total":2,"filters":{"completed":true,"priority":"medium","categoryId":null,"q":""}}} | Фильтры применены корректно |
| 2 | http://127.0.0.1:5505/api/tasksогогогого | Ошибка | {"error":{"code":"ROUTE_NOT_FOUND","message":"Маршрут /api/tasks%D0%BE%D0%B3%D0%BE%D0%B3%D0%BE%D0%B3%D0%BE%D0%B3%D0%BE не найден."}} | HTTP-ошибка |
| 3 | Поставим delay ms в 5000 ms и AbortSignal.timeout в 50 ms | TimeoutError | TimeoutError | Принудиьельно-вызванная ошибка. Показывает, что timeout работает корректно |

## Отладка

Указать точки останова до `fetch`, после получения `Response`, перед `response.json()` и в обработчике ошибки. Для одного успешного и одного ошибочного запроса записать значения URL, `response.status`, `response.ok`, `Content-Type`, разобранного payload и итогового `ApiError`.

| Этап отладки | Успешный запрос | Ошибочный запрос |
| --- | --- | --- |
| До fetch (URL) | http://127.0.0.1:5505/api/tasks?completed=false&priority=high | http://127.0.0.1:5505/api//tasks/999
| После fetch (status) | 200 | 404 |
| После fetch (ok) | true | false |
| После fetch (Content-Type) | application/json; charset=utf-8 | application/json; charset=utf-8 |
| Перед json() / payload | Объект { data: [...], meta: {...} } | Объект { error: { code: "TASK_NOT_FOUND", ... } } |
| Итоговый ApiError | - (успех) | kind: "http", status: 404, code: "TASK_NOT_FOUND" |

## Дополнительное задание

Не выполнено.

## Вывод

Вот краткий вывод (3-4 строки):

В ходе работы был реализован двухуровневый API-клиент с корректной обработкой асинхронности. Исправлены ошибки валидации фильтров, извлечения текста ошибок и парсинга ответов. Четко разграничены состояния: ожидание Promise (pending), HTTP-ошибки (ответ получен, но статус не 2xx), сетевые сбои (нет ответа), неверный формат (схема/JSON), тайм-ауты и явные отмены. Клиент успешно проходит все автоматизированные проверки.