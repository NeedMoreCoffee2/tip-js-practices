export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

// Создаёт URL относительно baseUrl и добавляет непустые параметры query.
// Значения кодируются средствами URL и URLSearchParams, а не вручную.
// export function buildUrl(baseUrl, path, query = {}) {
//   if(typeof baseUrl !== "String") return;
//   if(baseUrl[-1] !== "/") return;
//   if(typeof path !== "String") return;
//   if(path[0] !== "/") return;

  
  
//   // void baseUrl;
//   // void path;
//   // void query;
//   // throw new Error("Не реализовано: buildUrl");
// }

export function buildUrl(baseUrl, path, query = {}) {
  // 1. Валидация baseUrl
  if (typeof baseUrl !== "string" || baseUrl === "") {
    throw new TypeError("baseUrl должен быть непустой строкой");
  }

  let base;
  try {
    base = new URL(baseUrl);
  } catch {
    throw new TypeError(`baseUrl не является абсолютным URL: ${baseUrl}`);
  }

  if (base.protocol !== "http:" && base.protocol !== "https:") {
    throw new TypeError(`baseUrl должен использовать http или https: ${baseUrl}`);
  }
  if (base.search !== "" || base.hash !== "") {
    throw new TypeError(`baseUrl не должен содержать query или hash: ${baseUrl}`);
  }

  // 2. Валидация path
  if (typeof path !== "string" || path.trim() === "") {
    throw new TypeError("path должен быть непустой строкой");
  }
  // Защита от абсолютного URL в path (иначе он перезапишет baseUrl)
  if (/^[a-z][a-z\d+\-.]*:/i.test(path)) {
    throw new TypeError(`path не должен быть абсолютным URL: ${path}`);
  }

  // 3. Нормализация разделителя: ровно один "/" между base и path
  const basePath = base.pathname.replace(/\/+$/, "");   // убрать хвостовые "/"
  const relPath  = path.replace(/^\/+/, "");            // убрать ведущие "/"
  base.pathname = `${basePath}/${relPath}`;

  // 4. Query: пропускаем undefined, null, ""; сохраняем false и 0
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(key, String(value)); // URLSearchParams сам кодирует
  }

  const search = params.toString();
  if (search) base.search = search;

  return base.toString();
}



// fetchFn передаётся явно, чтобы модуль можно было проверить без реальной сети.
// Возвращаемый объект: { requestJson(path, { query, signal, timeoutMs } = {}) }.
// export function createApiClient({
//   baseUrl,
//   fetchFn = globalThis.fetch,
//   timeoutMs = 2000,
// } = {}) {
//   void baseUrl;
//   void fetchFn;
//   void timeoutMs;

//   // TODO:
//   // 1. Проверить конфигурацию и нормализовать baseUrl.
//   // 2. Реализовать асинхронную requestJson.
//   // 3. Выполнять GET с Accept: application/json и ограничением времени.
//   // 4. Проверять response.ok и Content-Type.
//   // 5. Разбирать JSON и преобразовывать ошибки в ApiError.
//   // kind: http | network | invalid-response | timeout | aborted.
//   // HTTP-ошибка сохраняет status, code, details и url.
//   throw new Error("Не реализовано: createApiClient");
// }


export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  // 1. Проверить конфигурацию фабрики
  if (typeof baseUrl !== "string" || baseUrl === "") {
    throw new TypeError("baseUrl должен быть непустой строкой");
  }

  // Нормализуем baseUrl: убеждаемся, что это абсолютный http/https без query/hash
  let normalizedBase;
  try {
    normalizedBase = new URL(baseUrl);
  } catch {
    throw new TypeError(`baseUrl не является абсолютным URL: ${baseUrl}`);
  }
  if (normalizedBase.protocol !== "http:" && normalizedBase.protocol !== "https:") {
    throw new TypeError(`baseUrl должен использовать http или https: ${baseUrl}`);
  }
  if (normalizedBase.search !== "" || normalizedBase.hash !== "") {
    throw new TypeError(`baseUrl не должен содержать query или hash: ${baseUrl}`);
  }

  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией");
  }
  if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs) || timeoutMs <= 0 || !Number.isInteger(timeoutMs)) {
    throw new TypeError("timeoutMs должен быть положительным целым числом");
  }

  // 2. Возвращаем метод requestJson
  async function requestJson(path, { query = {}, signal, timeoutMs: perCallTimeout } = {}) {
    // 3. Создать URL
    const url = buildUrl(baseUrl, path, query);

    // 4. Подготовить сигнал тайм-аута
    const effectiveTimeout =
      typeof perCallTimeout === "number" && Number.isFinite(perCallTimeout) && perCallTimeout > 0
        ? perCallTimeout
        : timeoutMs;

    const timeoutSignal = AbortSignal.timeout(effectiveTimeout);

    // 5. При наличии внешнего сигнала объединить его с тайм-аутом
    const combinedSignal =
      signal === undefined ? timeoutSignal : AbortSignal.any([signal, timeoutSignal]);

    // 6. В отдельном try получить Response
    let response;
    try {
      response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: combinedSignal,
      });
    } catch (error) {
      // 7. Классифицировать отказ fetch
      if (error?.name === "TimeoutError") {
        throw new ApiError("Превышено время ожидания", {
          kind: "timeout",
          url,
          cause: error,
        });
      }
      if (error?.name === "AbortError") {
        throw new ApiError("Запрос отменён", {
          kind: "aborted",
          url,
          cause: error,
        });
      }
      throw new ApiError("Сетевая ошибка", {
        kind: "network",
        url,
        cause: error,
      });
    }

    // 8. Проверить тип результата fetchFn
    if (!(response instanceof Response)) {
      throw new ApiError("fetchFn вернул не Response", {
        kind: "invalid-response",
        url,
        cause: new TypeError("Ожидался объект Response"),
      });
    }

    // 9. Сначала обработать HTTP-ошибку
    if (!response.ok) {
      let code = null;
      let details = null;
      let serverMessage = null;

      // Пытаемся извлечь payload.error, но не падаем, если тела нет или оно не JSON
      try {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const payload = await response.json();
          if (payload && typeof payload === "object" && payload.error) {
            code = payload.error.code ?? null;
            details = payload.error.details ?? null;
            serverMessage = payload.error.message ?? null;
          }
        }
      } catch {
        // тело не JSON или уже прочитано — просто сохраняем status
      }

      const finalMessage = serverMessage || `HTTP ${response.status}`;

      throw new ApiError(finalMessage, {
        kind: "http",
        status: response.status,
        code,
        details,
        url,
      });
    }

    // 10. Для успешного ответа проверить отсутствие тела 204, затем Content-Type
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new ApiError(`Ожидался JSON, получен: ${contentType || "(пусто)"}`, {
        kind: "invalid-response",
        url,
      });
    }

    // 11. Разобрать и вернуть JSON
    try {
      return await response.json();
    } catch (error) {
      throw new ApiError("Не удалось разобрать JSON", {
        kind: "invalid-response",
        url,
        cause: error,
      });
    }
  }

  return { requestJson };
}
