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

// Соединяет абсолютный baseUrl, путь и непустые query-параметры.
export function buildUrl(baseUrl, path, query = {}) {
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

  if (typeof path !== "string" || path.trim() === "") {
    throw new TypeError("path должен быть непустой строкой");
  }
  if (/^[a-z][a-z\d+\-.]*:/i.test(path)) {
    throw new TypeError(`path не должен быть абсолютным URL: ${path}`);
  }

  const basePath = base.pathname.replace(/\/+$/, "");
  const relPath  = path.replace(/^\/+/, "");
  base.pathname = `${basePath}/${relPath}`;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(key, String(value));
  }

  const search = params.toString();
  if (search) base.search = search;

  return base.toString();
}

export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 3000,
} = {}) {
  // Валидация конфигурации (как в ПР5)
  if (typeof baseUrl !== "string" || baseUrl === "") {
    throw new TypeError("baseUrl должен быть непустой строкой");
  }
  try {
    const normalizedBase = new URL(baseUrl);
    if (normalizedBase.protocol !== "http:" && normalizedBase.protocol !== "https:") {
      throw new TypeError();
    }
    if (normalizedBase.search !== "" || normalizedBase.hash !== "") {
      throw new TypeError();
    }
  } catch {
    throw new TypeError(`baseUrl не является абсолютным URL или содержит query/hash: ${baseUrl}`);
  }
  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией");
  }
  if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs) || timeoutMs <= 0 || !Number.isInteger(timeoutMs)) {
    throw new TypeError("timeoutMs должен быть положительным целым числом");
  }

  // Расширенный метод requestJson
  async function requestJson(path, { 
    method = "GET", 
    query = {}, 
    body, 
    signal, 
    timeoutMs: perCallTimeout 
  } = {}) {
    
    // 1. Проверка и нормализация метода
    const httpMethod = typeof method === "string" ? method.toUpperCase() : "";
    const allowedMethods = ["GET", "POST", "PATCH", "DELETE"];
    if (!allowedMethods.includes(httpMethod)) {
      throw new TypeError(`Недопустимый HTTP-метод: ${method}. Разрешены только ${allowedMethods.join(", ")}`);
    }

    // 2. GET с body отклоняется
    if (httpMethod === "GET" && body !== undefined) {
      throw new TypeError("GET-запрос не может содержать тело (body)");
    }

    // 3. Сборка URL
    const url = buildUrl(baseUrl, path, query);

    // 4. Подготовка сигналов (тайм-аут + отмена)
    const effectiveTimeout = 
      typeof perCallTimeout === "number" && Number.isFinite(perCallTimeout) && perCallTimeout > 0
        ? perCallTimeout
        : timeoutMs;

    const timeoutSignal = AbortSignal.timeout(effectiveTimeout);
    const combinedSignal = signal === undefined ? timeoutSignal : AbortSignal.any([signal, timeoutSignal]);

    // 5. Подготовка заголовков и тела
    const headers = { Accept: "application/json" };
    let requestBody;

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }

    // 6. Выполнение fetch
    let response;
    try {
      response = await fetchFn(url, {
        method: httpMethod,
        headers,
        body: requestBody,
        signal: combinedSignal,
      });
    } catch (error) {
      if (error?.name === "TimeoutError") {
        throw new ApiError("Превышено время ожидания", { kind: "timeout", url, cause: error });
      }
      if (error?.name === "AbortError") {
        throw new ApiError("Запрос отменён", { kind: "aborted", url, cause: error });
      }
      throw new ApiError("Сетевая ошибка", { kind: "network", url, cause: error });
    }

    if (!(response instanceof Response)) {
      throw new ApiError("fetchFn вернул не Response", { kind: "invalid-response", url, cause: new TypeError("Ожидался Response") });
    }

    // 7. Обработка HTTP-ошибки (сначала статус!)
    if (!response.ok) {
      let code = null;
      let details = null;
      let serverMessage = null;

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
        // Игнорируем ошибку парсинга тела ошибки
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

    // 8. Успешные 204 (No Content)
    if (response.status === 204) {
      return null;
    }

    // 9. Проверка Content-Type
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new ApiError(`Ожидался JSON, получен: ${contentType || "(пусто)"}`, { kind: "invalid-response", url });
    }

    // 10. Парсинг JSON
    try {
      return await response.json();
    } catch (error) {
      throw new ApiError("Не удалось разобрать JSON", { kind: "invalid-response", url, cause: error });
    }
  }

  return { requestJson };
}