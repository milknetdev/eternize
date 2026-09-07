// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    form[key] = value;
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", 8);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? decodeURIComponent_(value) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param ? /\%/.test(param) ? tryDecodeURIComponent(param) : param : void 0;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  json() {
    return this.#cachedBody("json");
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setHeaders = (headers, map = {}) => {
  for (const key of Object.keys(map)) {
    headers.set(key, map[key]);
  }
  return headers;
};
var Context = class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status = 200;
  #executionCtx;
  #headers;
  #preparedHeaders;
  #res;
  #isFresh = true;
  #layout;
  #renderer;
  #notFoundHandler;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    this.#isFresh = false;
    return this.#res ||= new Response("404 Not Found", { status: 404 });
  }
  set res(_res) {
    this.#isFresh = false;
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    if (value === void 0) {
      if (this.#headers) {
        this.#headers.delete(name);
      } else if (this.#preparedHeaders) {
        delete this.#preparedHeaders[name.toLocaleLowerCase()];
      }
      if (this.finalized) {
        this.res.headers.delete(name);
      }
      return;
    }
    if (options?.append) {
      if (!this.#headers) {
        this.#isFresh = false;
        this.#headers = new Headers(this.#preparedHeaders);
        this.#preparedHeaders = {};
      }
      this.#headers.append(name, value);
    } else {
      if (this.#headers) {
        this.#headers.set(name, value);
      } else {
        this.#preparedHeaders ??= {};
        this.#preparedHeaders[name.toLowerCase()] = value;
      }
    }
    if (this.finalized) {
      if (options?.append) {
        this.res.headers.append(name, value);
      } else {
        this.res.headers.set(name, value);
      }
    }
  };
  status = (status) => {
    this.#isFresh = false;
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    if (this.#isFresh && !headers && !arg && this.#status === 200) {
      return new Response(data, {
        headers: this.#preparedHeaders
      });
    }
    if (arg && typeof arg !== "number") {
      const header = new Headers(arg.headers);
      if (this.#headers) {
        this.#headers.forEach((v, k) => {
          if (k === "set-cookie") {
            header.append(k, v);
          } else {
            header.set(k, v);
          }
        });
      }
      const headers2 = setHeaders(header, this.#preparedHeaders);
      return new Response(data, {
        headers: headers2,
        status: arg.status ?? this.#status
      });
    }
    const status = typeof arg === "number" ? arg : this.#status;
    this.#preparedHeaders ??= {};
    this.#headers ??= new Headers();
    setHeaders(this.#headers, this.#preparedHeaders);
    if (this.#res) {
      this.#res.headers.forEach((v, k) => {
        if (k === "set-cookie") {
          this.#headers?.append(k, v);
        } else {
          this.#headers?.set(k, v);
        }
      });
      setHeaders(this.#headers, this.#preparedHeaders);
    }
    headers ??= {};
    for (const [k, v] of Object.entries(headers)) {
      if (typeof v === "string") {
        this.#headers.set(k, v);
      } else {
        this.#headers.delete(k);
        for (const v2 of v) {
          this.#headers.append(k, v2);
        }
      }
    }
    return new Response(data, {
      status,
      headers: this.#headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => {
    return typeof arg === "number" ? this.#newResponse(data, arg, headers) : this.#newResponse(data, arg);
  };
  text = (text, arg, headers) => {
    if (!this.#preparedHeaders) {
      if (this.#isFresh && !headers && !arg) {
        return new Response(text);
      }
      this.#preparedHeaders = {};
    }
    this.#preparedHeaders["content-type"] = TEXT_PLAIN;
    if (typeof arg === "number") {
      return this.#newResponse(text, arg, headers);
    }
    return this.#newResponse(text, arg);
  };
  json = (object, arg, headers) => {
    const body = JSON.stringify(object);
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "application/json";
    return typeof arg === "number" ? this.#newResponse(body, arg, headers) : this.#newResponse(body, arg);
  };
  html = (html, arg, headers) => {
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "text/html; charset=UTF-8";
    if (typeof html === "object") {
      return resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then((html2) => {
        return typeof arg === "number" ? this.#newResponse(html2, arg, headers) : this.#newResponse(html2, arg);
      });
    }
    return typeof arg === "number" ? this.#newResponse(html, arg, headers) : this.#newResponse(html, arg);
  };
  redirect = (location, status) => {
    this.#headers ??= new Headers();
    this.#headers.set("Location", String(location));
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    return err.getResponse();
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r27) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r27.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r27.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r27.handler;
      }
      subApp.#addRoute(r27.method, r27.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        replaceRequest = options.replaceRequest;
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r27 = { path, method, handler };
    this.router.add(method, path, [handler, r27]);
    this.routes.push(r27);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r27) => {
      const ownRoute = r27[method] ? Object.keys(r27[method]).map((path) => [path, r27[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r27[METHOD_NAME_ALL]).map((path) => [path, r27[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (Object.keys(curNode.#children).includes(key)) {
        curNode = curNode.#children[key];
        const pattern2 = getPattern(p, nextP);
        if (pattern2) {
          possibleKeys.push(pattern2[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    const m = /* @__PURE__ */ Object.create(null);
    const handlerSet = {
      handler,
      possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
      score: this.#order
    };
    m[method] = handlerSet;
    curNode.#methods.push(m);
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "") {
            continue;
          }
          const [key, name, matcher] = pattern;
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// src/worker/neon-db.ts
import { Pool } from "@neondatabase/serverless";
var NeonPreparedStatement = class {
  db;
  sql;
  params;
  constructor(db, sql) {
    this.db = db;
    this.sql = sql.trim();
    this.params = [];
  }
  bind(...params) {
    this.params = params;
    return this;
  }
  async first(column) {
    const result = await this.all();
    if (!result.results || result.results.length === 0) return null;
    if (column) return result.results[0][column];
    return result.results[0];
  }
  async all() {
    try {
      const rows = await this.db.query(this.sql, this.params);
      return { results: rows || [] };
    } catch (err) {
      console.error("NeonDB query failed:", this.sql, err);
      throw err;
    }
  }
  async run() {
    try {
      const { rows, rowCount } = await this.db.exec(this.sql, this.params);
      const result = rows?.[0] || {};
      return {
        success: true,
        meta: {
          last_row_id: result.last_row_id ?? result.id ?? 0,
          // Real affected-row count from PostgreSQL (0 when a scoped WHERE matched nothing).
          changes: rowCount ?? (Array.isArray(rows) ? rows.length : 0)
        }
      };
    } catch (err) {
      console.error("NeonDB run failed:", this.sql, err);
      throw err;
    }
  }
};
var NeonDB = class {
  pool;
  constructor(connectionString) {
    this.pool = new Pool({ connectionString });
  }
  /** Execute a parameterized query, returning just the rows. */
  async query(sql, params = []) {
    const { rows } = await this.exec(sql, params);
    return rows;
  }
  /** Execute a parameterized query, returning rows plus the affected-row count. */
  async exec(sql, params = []) {
    let paramIndex = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++paramIndex}`);
    const result = await this.pool.query(pgSql, params);
    return { rows: result.rows, rowCount: result.rowCount ?? 0 };
  }
  prepare(sql) {
    return new NeonPreparedStatement(this, sql);
  }
};

// node_modules/hono/dist/utils/cookie.js
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var parse = (cookie, name) => {
  if (name && cookie.indexOf(name) === -1) {
    return {};
  }
  const pairs = cookie.trim().split(";");
  const parsedCookie = {};
  for (let pairStr of pairs) {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1) {
      continue;
    }
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName)) {
      continue;
    }
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }
    if (validCookieValueRegEx.test(cookieValue)) {
      parsedCookie[cookieName] = decodeURIComponent_(cookieValue);
      if (name) {
        break;
      }
    }
  }
  return parsedCookie;
};
var _serialize = (name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (name.startsWith("__Secure-") && !opt.secure) {
    throw new Error("__Secure- Cookie must have Secure attributes");
  }
  if (name.startsWith("__Host-")) {
    if (!opt.secure) {
      throw new Error("__Host- Cookie must have Secure attributes");
    }
    if (opt.path !== "/") {
      throw new Error('__Host- Cookie must have Path attributes with "/"');
    }
    if (opt.domain) {
      throw new Error("__Host- Cookie must not have Domain attributes");
    }
  }
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    if (opt.maxAge > 3456e4) {
      throw new Error(
        "Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration."
      );
    }
    cookie += `; Max-Age=${opt.maxAge | 0}`;
  }
  if (opt.domain && opt.prefix !== "host") {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    if (opt.expires.getTime() - Date.now() > 3456e7) {
      throw new Error(
        "Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future."
      );
    }
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
  }
  if (opt.priority) {
    cookie += `; Priority=${opt.priority}`;
  }
  if (opt.partitioned) {
    if (!opt.secure) {
      throw new Error("Partitioned Cookie must have Secure attributes");
    }
    cookie += "; Partitioned";
  }
  return cookie;
};
var serialize = (name, value, opt) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
};

// node_modules/hono/dist/helper/cookie/index.js
var getCookie = (c, key, prefix) => {
  const cookie = c.req.raw.headers.get("Cookie");
  if (typeof key === "string") {
    if (!cookie) {
      return void 0;
    }
    let finalKey = key;
    if (prefix === "secure") {
      finalKey = "__Secure-" + key;
    } else if (prefix === "host") {
      finalKey = "__Host-" + key;
    }
    const obj2 = parse(cookie, finalKey);
    return obj2[finalKey];
  }
  if (!cookie) {
    return {};
  }
  const obj = parse(cookie);
  return obj;
};
var setCookie = (c, name, value, opt) => {
  let cookie;
  if (opt?.prefix === "secure") {
    cookie = serialize("__Secure-" + name, value, { path: "/", ...opt, secure: true });
  } else if (opt?.prefix === "host") {
    cookie = serialize("__Host-" + name, value, {
      ...opt,
      path: "/",
      secure: true,
      domain: void 0
    });
  } else {
    cookie = serialize(name, value, { path: "/", ...opt });
  }
  c.header("Set-Cookie", cookie, { append: true });
};

// src/worker/local-auth-backend.ts
import * as bcrypt from "bcryptjs";
var SESSION_COOKIE_NAME = "eternize_session";
var SUPPORT_COOKIE_NAME = "eternize_support";
function generateId() {
  return "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let result = "";
  for (const b of bytes) result += b.toString(16).padStart(2, "0");
  return result;
}
async function authMiddleware(c, next) {
  const supportToken2 = getCookie(c, SUPPORT_COOKIE_NAME);
  const sessionToken = supportToken2 || getCookie(c, SESSION_COOKIE_NAME);
  if (!sessionToken) {
    return c.json({ error: "N\xE3o autenticado" }, 401);
  }
  const db = c.env.DB;
  if (!db) {
    return c.json({ error: "Banco de dados n\xE3o configurado" }, 500);
  }
  const session = await db.prepare(
    "SELECT user_id, email, name FROM sessions WHERE token = ? AND expires_at > NOW()"
  ).bind(sessionToken).first();
  if (!session) {
    return c.json({ error: "Sess\xE3o expirada ou inv\xE1lida" }, 401);
  }
  c.set("user", { id: session.user_id, email: session.email, name: session.name });
  if (supportToken2) c.set("impersonating", true);
  await next();
}
async function createSession(db, userId, email, name, c) {
  const token = generateToken();
  await db.prepare(
    "INSERT INTO sessions (token, user_id, email, name, expires_at) VALUES (?, ?, ?, ?, NOW() + INTERVAL '60 days')"
  ).bind(token, userId, email, name).run();
  setCookie(c, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 24 * 60 * 60
  });
  return token;
}
async function handleRegister(c) {
  const body = await c.req.json();
  const { name, email, password } = body;
  if (!name || !email || !password) {
    return c.json({ error: "Nome, email e senha s\xE3o obrigat\xF3rios" }, 400);
  }
  if (password.length < 6) {
    return c.json({ error: "A senha deve ter pelo menos 6 caracteres" }, 400);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ error: "Email inv\xE1lido" }, 400);
  }
  const db = c.env.DB;
  if (!db) {
    return c.json({ error: "Banco de dados n\xE3o configurado" }, 500);
  }
  const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase().trim()).first();
  if (existing) {
    return c.json({ error: "Este email j\xE1 est\xE1 cadastrado" }, 409);
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const userId = generateId();
  await db.prepare(
    "INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)"
  ).bind(userId, email.toLowerCase().trim(), passwordHash, name.trim()).run();
  await createSession(db, userId, email.toLowerCase().trim(), name.trim(), c);
  return c.json({ success: true, user: { id: userId, email: email.toLowerCase().trim(), name: name.trim() } }, 201);
}
async function handleLogin(c) {
  const body = await c.req.json();
  const { email, password } = body;
  if (!email || !password) {
    return c.json({ error: "Email e senha s\xE3o obrigat\xF3rios" }, 400);
  }
  const db = c.env.DB;
  if (!db) {
    return c.json({ error: "Banco de dados n\xE3o configurado" }, 500);
  }
  const user = await db.prepare(
    "SELECT id, email, password_hash, name FROM users WHERE email = ?"
  ).bind(email.toLowerCase().trim()).first();
  if (!user) {
    return c.json({ error: "Email ou senha incorretos" }, 401);
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return c.json({ error: "Email ou senha incorretos" }, 401);
  }
  await createSession(db, user.id, user.email, user.name, c);
  return c.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
}
async function handleGetUser(c) {
  return c.json(c.get("user"));
}
async function handleLogout(c) {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);
  const db = c.env.DB;
  if (sessionToken && db) {
    await db.prepare("DELETE FROM sessions WHERE token = ?").bind(sessionToken).run();
  }
  setCookie(c, SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 0
  });
  return c.json({ success: true });
}

// src/worker/routes/auth.ts
var r = new Hono2();
r.post("/api/auth/register", handleRegister);
r.post("/api/auth/login", handleLogin);
r.get("/api/users/me", authMiddleware, handleGetUser);
r.get("/api/logout", handleLogout);
var auth_default = r;

// src/worker/routes/og.ts
var r2 = new Hono2();
var escapeHtml = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function renderCoupleShell(opts) {
  const { origin, title, description, image } = opts;
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const img = escapeHtml(image);
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Eternize" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    <link rel="icon" href="${origin}/favicon.svg" type="image/svg+xml" />
    <link rel="alternate icon" href="${origin}/favicon.ico" />
    <title>${t} - Eternize</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/react-app/main.tsx"></script>
  </body>
</html>`;
}
async function coupleShell(c) {
  const customUrl = c.req.param("customUrl");
  const origin = new URL(c.req.url).origin;
  const wedding = await c.env.DB.prepare(
    `SELECT partner1_name, partner2_name, og_title, og_description, og_image, hero_image_key
     FROM weddings WHERE custom_url = ?`
  ).bind(customUrl).first();
  let title = "Eternize - Casamento";
  let description = "Celebre conosco este momento especial!";
  let image = `${origin}/og.png`;
  if (wedding) {
    title = wedding.og_title || `${wedding.partner1_name} & ${wedding.partner2_name}`;
    description = wedding.og_description || `Voc\xEA est\xE1 convidado(a) para o casamento de ${wedding.partner1_name} e ${wedding.partner2_name}!`;
    if (wedding.og_image) {
      image = wedding.og_image;
    } else if (wedding.hero_image_key) {
      image = wedding.hero_image_key.startsWith("http") ? wedding.hero_image_key : `${origin}/api/files/${wedding.hero_image_key}`;
    }
  }
  return c.html(renderCoupleShell({ origin, title, description, image }));
}
r2.get("/c/:customUrl", coupleShell);
r2.get("/c/:customUrl/*", coupleShell);
var og_default = r2;

// src/worker/routes/weddings.ts
var r3 = new Hono2();
r3.get("/api/wedding", authMiddleware, async (c) => {
  const user = c.get("user");
  const result = await c.env.DB.prepare(
    "SELECT * FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user.id).first();
  return c.json(result || null);
});
r3.post("/api/wedding/publish", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const isPublished = body.is_published ? true : false;
  await c.env.DB.prepare(`
    UPDATE weddings SET is_published = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).bind(isPublished, user.id).run();
  return c.json({ success: true, is_published: isPublished });
});
r3.post("/api/wedding", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const existing = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (existing) {
    await c.env.DB.prepare(`
      UPDATE weddings SET 
        partner1_name = ?, partner2_name = ?, wedding_date = ?,
        venue_name = ?, venue_address = ?, custom_url = ?, pix_key = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(
      body.partner1_name,
      body.partner2_name,
      body.wedding_date,
      body.venue_name,
      body.venue_address,
      body.custom_url,
      body.pix_key,
      user.id
    ).run();
    return c.json({ success: true, id: existing.id });
  }
  const result = await c.env.DB.prepare(`
    INSERT INTO weddings (user_id, partner1_name, partner2_name, wedding_date, venue_name, venue_address, custom_url, pix_key)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    user.id,
    body.partner1_name,
    body.partner2_name,
    body.wedding_date,
    body.venue_name,
    body.venue_address,
    body.custom_url,
    body.pix_key
  ).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r3.put("/api/wedding/theme", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  await c.env.DB.prepare(`
    UPDATE weddings SET 
      template_id = ?, theme_primary_color = ?, theme_secondary_color = ?,
      theme_accent_color = ?, theme_background_color = ?, theme_text_color = ?,
      theme_heading_font = ?, theme_body_font = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).bind(
    body.template_id,
    body.theme_primary_color,
    body.theme_secondary_color,
    body.theme_accent_color,
    body.theme_background_color,
    body.theme_text_color,
    body.theme_heading_font,
    body.theme_body_font,
    user.id
  ).run();
  return c.json({ success: true });
});
r3.put("/api/wedding/settings", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ success: false, error: "Voc\xEA precisa estar logado para salvar configura\xE7\xF5es" }, 401);
  }
  try {
    const body = await c.req.json();
    const wedding = await c.env.DB.prepare(
      "SELECT id FROM weddings WHERE user_id = ?"
    ).bind(user.id).first();
    if (!wedding) {
      return c.json({ success: false, error: "Voc\xEA precisa criar seu casamento primeiro no Painel (aba Dados)" }, 400);
    }
    const BOOL_COLS = [
      "show_story",
      "show_gallery",
      "show_timeline",
      "show_location",
      "show_dresscode",
      "show_gifts",
      "show_rsvp",
      "show_messages",
      "show_godparents",
      "show_parents",
      "show_accommodations"
    ];
    const TEXT_COLS = [
      "hero_image_key",
      "hero_style",
      "our_story",
      "ceremony_time",
      "ceremony_venue",
      "reception_time",
      "reception_venue",
      "dress_code",
      "dress_code_description",
      "dress_code_allowed_colors",
      "dress_code_avoid_colors",
      "timeline_events",
      "instagram_url",
      "music_url",
      "og_title",
      "og_description",
      "og_image",
      "invitation_message"
    ];
    const sets = [];
    const values = [];
    for (const col of BOOL_COLS) {
      if (body[col] === void 0) continue;
      sets.push(`${col} = ?`);
      const v = body[col];
      values.push(!(v === 0 || v === false || v === "0" || v === "false"));
    }
    for (const col of TEXT_COLS) {
      if (body[col] === void 0) continue;
      sets.push(`${col} = ?`);
      values.push(body[col] || null);
    }
    if (sets.length === 0) return c.json({ success: true });
    sets.push("updated_at = CURRENT_TIMESTAMP");
    values.push(user.id);
    await c.env.DB.prepare(
      `UPDATE weddings SET ${sets.join(", ")} WHERE user_id = ?`
    ).bind(...values).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving wedding settings:", error);
    return c.json({ success: false, error: "Erro ao salvar configura\xE7\xF5es. Tente novamente." }, 500);
  }
});
var weddings_default = r3;

// src/worker/lib/ownership.ts
async function getWeddingId(c) {
  const user = c.get("user");
  if (!user) return null;
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  return wedding?.id ?? null;
}

// src/worker/routes/guests.ts
var r4 = new Hono2();
function normalizeCompanions(raw2) {
  if (!Array.isArray(raw2)) return [];
  return raw2.map((comp) => {
    const isObj = typeof comp === "object" && comp !== null;
    const name = (isObj ? comp.name : comp) || "";
    return {
      name: String(name).trim(),
      isChild: isObj ? !!comp.is_child : false,
      isConfirmed: isObj ? !!comp.is_confirmed : false,
      diet: isObj && comp.dietary_restrictions ? String(comp.dietary_restrictions).trim() : null
    };
  }).filter((comp) => comp.name.length > 0);
}
async function insertCompanion(db, guestId, comp) {
  try {
    await db.prepare(
      `INSERT INTO guest_companions (guest_id, name, is_confirmed, is_child, dietary_restrictions)
         VALUES (?, ?, ?, ?, ?)`
    ).bind(guestId, comp.name, comp.isConfirmed, comp.isChild, comp.diet).run();
  } catch {
    await db.prepare(
      `INSERT INTO guest_companions (guest_id, name, is_confirmed, is_child)
         VALUES (?, ?, ?, ?)`
    ).bind(guestId, comp.name, comp.isConfirmed, comp.isChild).run();
  }
}
r4.get("/api/guests", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json([]);
  const { results: guests } = await c.env.DB.prepare(
    "SELECT * FROM guests WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  const guestIds = (guests || []).map((g) => Number(g.id)).filter((n) => Number.isInteger(n));
  if (guestIds.length === 0) return c.json([]);
  const { results: companions } = await c.env.DB.prepare(
    `SELECT * FROM guest_companions WHERE guest_id IN (${guestIds.join(",")})`
  ).all();
  const companionsByGuest = {};
  (companions || []).forEach((comp) => {
    if (!companionsByGuest[comp.guest_id]) {
      companionsByGuest[comp.guest_id] = [];
    }
    companionsByGuest[comp.guest_id].push(comp);
  });
  const guestsWithCompanions = (guests || []).map((guest) => ({
    ...guest,
    companions: companionsByGuest[guest.id] || []
  }));
  return c.json(guestsWithCompanions);
});
r4.post("/api/guests", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  const companions = normalizeCompanions(body.companions);
  const guestsCount = Math.max(Number(body.guests_count) || 1, 1 + companions.length);
  const inserted = await c.env.DB.prepare(`
    INSERT INTO guests (wedding_id, name, email, phone, guests_count, label, confirmation_code, is_child)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `).bind(
    wedding.id,
    body.name,
    body.email,
    body.phone,
    guestsCount,
    body.label || null,
    confirmationCode,
    body.is_child ? true : false
  ).first();
  const guestId = inserted?.id;
  if (!guestId) return c.json({ error: "Failed to create guest" }, 500);
  for (const comp of companions) {
    await insertCompanion(c.env.DB, guestId, comp);
  }
  return c.json({ success: true, id: guestId, confirmation_code: confirmationCode });
});
r4.put("/api/guests/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  const companions = normalizeCompanions(body.companions);
  const guestsCount = Math.max(Number(body.guests_count) || 1, 1 + companions.length);
  const res = await c.env.DB.prepare(`
    UPDATE guests SET
      name = ?, email = ?, phone = ?, guests_count = ?, rsvp_status = ?,
      dietary_restrictions = ?, label = ?, is_child = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(
    body.name,
    body.email,
    body.phone,
    guestsCount,
    body.rsvp_status,
    body.dietary_restrictions,
    body.label || null,
    body.is_child ? true : false,
    id,
    weddingId
  ).run();
  if (!res.meta.changes) return c.json({ error: "Guest not found" }, 404);
  await c.env.DB.prepare("DELETE FROM guest_companions WHERE guest_id = ?").bind(id).run();
  for (const comp of companions) {
    await insertCompanion(c.env.DB, id, comp);
  }
  return c.json({ success: true });
});
r4.delete("/api/guests/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const guest = await c.env.DB.prepare(
    "SELECT id FROM guests WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).first();
  if (!guest) return c.json({ error: "Guest not found" }, 404);
  await c.env.DB.prepare("DELETE FROM guest_companions WHERE guest_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM guests WHERE id = ? AND wedding_id = ?").bind(id, weddingId).run();
  return c.json({ success: true });
});
r4.put("/api/guests/:id/table", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  if (body.table_id) {
    const table = await c.env.DB.prepare(
      "SELECT id FROM wedding_tables WHERE id = ? AND wedding_id = ?"
    ).bind(body.table_id, weddingId).first();
    if (!table) return c.json({ error: "Table not found" }, 404);
  }
  const res = await c.env.DB.prepare(`
    UPDATE guests SET table_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND wedding_id = ?
  `).bind(body.table_id, id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Guest not found" }, 404);
  return c.json({ success: true });
});
var guests_default = r4;

// src/worker/routes/tables.ts
var r5 = new Hono2();
r5.get("/api/tables", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json([]);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_tables WHERE wedding_id = ? ORDER BY table_number, name"
  ).bind(wedding.id).all();
  return c.json(results || []);
});
r5.post("/api/tables", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_tables (wedding_id, name, capacity, shape, table_number)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    wedding.id,
    body.name,
    body.capacity || 10,
    body.shape || "round",
    body.table_number || null
  ).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r5.put("/api/tables/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  const res = await c.env.DB.prepare(`
    UPDATE wedding_tables SET
      name = ?, capacity = ?, shape = ?, table_number = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(body.name, body.capacity, body.shape, body.table_number || null, id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Table not found" }, 404);
  return c.json({ success: true });
});
r5.delete("/api/tables/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const table = await c.env.DB.prepare(
    "SELECT id FROM wedding_tables WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).first();
  if (!table) return c.json({ error: "Table not found" }, 404);
  await c.env.DB.prepare(
    "UPDATE guests SET table_id = NULL WHERE table_id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  await c.env.DB.prepare(
    "DELETE FROM wedding_tables WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  return c.json({ success: true });
});
var tables_default = r5;

// src/worker/routes/tasks.ts
var r6 = new Hono2();
r6.get("/api/tasks", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json({ tasks: [] });
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_tasks WHERE wedding_id = ? ORDER BY sort_order, due_date, id"
  ).bind(wedding.id).all();
  return c.json({ tasks: results || [] });
});
r6.post("/api/tasks", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json({ error: "No wedding found" }, 404);
  const body = await c.req.json();
  const { title, description, category, due_date, sort_order } = body;
  const result = await c.env.DB.prepare(
    `INSERT INTO wedding_tasks (wedding_id, title, description, category, due_date, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(wedding.id, title, description || null, category || null, due_date || null, sort_order || 0).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r6.put("/api/tasks/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  const { title, description, category, due_date, is_completed } = body;
  const completedAt = is_completed ? (/* @__PURE__ */ new Date()).toISOString() : null;
  const res = await c.env.DB.prepare(
    `UPDATE wedding_tasks SET
     title = ?, description = ?, category = ?, due_date = ?, is_completed = ?, completed_at = ?,
     updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND wedding_id = ?`
  ).bind(title, description || null, category || null, due_date || null, is_completed ? true : false, completedAt, id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Task not found" }, 404);
  return c.json({ success: true });
});
r6.put("/api/tasks/:id/toggle", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const task = await c.env.DB.prepare(
    "SELECT is_completed FROM wedding_tasks WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).first();
  if (!task) return c.json({ error: "Task not found" }, 404);
  const newStatus = task.is_completed ? false : true;
  const completedAt = newStatus ? (/* @__PURE__ */ new Date()).toISOString() : null;
  await c.env.DB.prepare(
    `UPDATE wedding_tasks SET is_completed = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND wedding_id = ?`
  ).bind(newStatus, completedAt, id, weddingId).run();
  return c.json({ success: true, is_completed: newStatus });
});
r6.delete("/api/tasks/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "DELETE FROM wedding_tasks WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Task not found" }, 404);
  return c.json({ success: true });
});
r6.post("/api/tasks/seed", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json({ error: "No wedding found" }, 404);
  const existing = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM wedding_tasks WHERE wedding_id = ?"
  ).bind(wedding.id).first();
  if (existing && existing.count > 0) {
    return c.json({ error: "Tasks already exist" }, 400);
  }
  const defaultTasks = [
    { category: "Cerim\xF4nia", title: "Definir local da cerim\xF4nia", sort_order: 1 },
    { category: "Cerim\xF4nia", title: "Contratar celebrante", sort_order: 2 },
    { category: "Cerim\xF4nia", title: "Escolher m\xFAsicas da cerim\xF4nia", sort_order: 3 },
    { category: "Recep\xE7\xE3o", title: "Definir local da festa", sort_order: 4 },
    { category: "Recep\xE7\xE3o", title: "Contratar buffet/catering", sort_order: 5 },
    { category: "Recep\xE7\xE3o", title: "Definir card\xE1pio", sort_order: 6 },
    { category: "Recep\xE7\xE3o", title: "Contratar DJ/banda", sort_order: 7 },
    { category: "Decora\xE7\xE3o", title: "Contratar decorador(a)", sort_order: 8 },
    { category: "Decora\xE7\xE3o", title: "Definir paleta de cores", sort_order: 9 },
    { category: "Decora\xE7\xE3o", title: "Escolher flores e arranjos", sort_order: 10 },
    { category: "Foto & V\xEDdeo", title: "Contratar fot\xF3grafo(a)", sort_order: 11 },
    { category: "Foto & V\xEDdeo", title: "Contratar cinegrafista", sort_order: 12 },
    { category: "Foto & V\xEDdeo", title: "Agendar ensaio pr\xE9-wedding", sort_order: 13 },
    { category: "Vestu\xE1rio", title: "Escolher vestido/traje da noiva", sort_order: 14 },
    { category: "Vestu\xE1rio", title: "Escolher traje do noivo", sort_order: 15 },
    { category: "Vestu\xE1rio", title: "Definir looks dos padrinhos", sort_order: 16 },
    { category: "Vestu\xE1rio", title: "Comprar alian\xE7as", sort_order: 17 },
    { category: "Beleza", title: "Agendar teste de penteado", sort_order: 18 },
    { category: "Beleza", title: "Agendar teste de maquiagem", sort_order: 19 },
    { category: "Convidados", title: "Montar lista de convidados", sort_order: 20 },
    { category: "Convidados", title: "Enviar convites", sort_order: 21 },
    { category: "Convidados", title: "Confirmar lista final", sort_order: 22 },
    { category: "Documenta\xE7\xE3o", title: "Reunir documentos para casamento civil", sort_order: 23 },
    { category: "Documenta\xE7\xE3o", title: "Agendar casamento no cart\xF3rio", sort_order: 24 },
    { category: "Viagem", title: "Reservar lua de mel", sort_order: 25 },
    { category: "Viagem", title: "Providenciar passaportes/vistos", sort_order: 26 }
  ];
  for (const task of defaultTasks) {
    await c.env.DB.prepare(
      `INSERT INTO wedding_tasks (wedding_id, title, category, sort_order) VALUES (?, ?, ?, ?)`
    ).bind(wedding.id, task.title, task.category, task.sort_order).run();
  }
  return c.json({ success: true, count: defaultTasks.length });
});
var tasks_default = r6;

// src/worker/routes/budget.ts
var r7 = new Hono2();
r7.get("/api/budget", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id, total_budget FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json({ total_budget: null, expenses: [] });
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_expenses WHERE wedding_id = ? ORDER BY category, due_date, id"
  ).bind(wedding.id).all();
  return c.json({
    total_budget: wedding.total_budget,
    expenses: results || []
  });
});
r7.put("/api/budget", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json({ error: "No wedding found" }, 404);
  const body = await c.req.json();
  const { total_budget } = body;
  await c.env.DB.prepare(
    "UPDATE weddings SET total_budget = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(total_budget, wedding.id).run();
  return c.json({ success: true });
});
r7.post("/api/expenses", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json({ error: "No wedding found" }, 404);
  const body = await c.req.json();
  const { name, description, category, vendor_name, estimated_amount, paid_amount, is_paid, due_date, notes } = body;
  const paidAt = is_paid ? (/* @__PURE__ */ new Date()).toISOString() : null;
  const result = await c.env.DB.prepare(
    `INSERT INTO wedding_expenses (wedding_id, name, description, category, vendor_name, estimated_amount, paid_amount, is_paid, due_date, paid_at, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(wedding.id, name, description || null, category || null, vendor_name || null, estimated_amount, paid_amount || 0, is_paid ? true : false, due_date || null, paidAt, notes || null).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r7.put("/api/expenses/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  const { name, description, category, vendor_name, estimated_amount, paid_amount, is_paid, due_date, notes } = body;
  const paidAt = is_paid ? (/* @__PURE__ */ new Date()).toISOString() : null;
  const res = await c.env.DB.prepare(
    `UPDATE wedding_expenses SET
     name = ?, description = ?, category = ?, vendor_name = ?, estimated_amount = ?, paid_amount = ?, is_paid = ?, due_date = ?, paid_at = ?, notes = ?,
     updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND wedding_id = ?`
  ).bind(name, description || null, category || null, vendor_name || null, estimated_amount, paid_amount || 0, is_paid ? true : false, due_date || null, paidAt, notes || null, id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Expense not found" }, 404);
  return c.json({ success: true });
});
r7.delete("/api/expenses/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "DELETE FROM wedding_expenses WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Expense not found" }, 404);
  return c.json({ success: true });
});
r7.post("/api/expenses/seed", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json({ error: "No wedding found" }, 404);
  const existing = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM wedding_expenses WHERE wedding_id = ?"
  ).bind(wedding.id).first();
  if (existing && existing.count > 0) {
    return c.json({ error: "Expenses already exist" }, 400);
  }
  const defaultExpenses = [
    { category: "Local", name: "Aluguel do espa\xE7o", estimated_amount: 15e3 },
    { category: "Local", name: "Decora\xE7\xE3o", estimated_amount: 8e3 },
    { category: "Buffet", name: "Buffet completo", estimated_amount: 25e3 },
    { category: "Buffet", name: "Bebidas", estimated_amount: 5e3 },
    { category: "Buffet", name: "Bolo de casamento", estimated_amount: 2e3 },
    { category: "Foto & V\xEDdeo", name: "Fot\xF3grafo", estimated_amount: 6e3 },
    { category: "Foto & V\xEDdeo", name: "Cinegrafista", estimated_amount: 5e3 },
    { category: "M\xFAsica", name: "DJ", estimated_amount: 3e3 },
    { category: "M\xFAsica", name: "M\xFAsico para cerim\xF4nia", estimated_amount: 1500 },
    { category: "Vestu\xE1rio", name: "Vestido da noiva", estimated_amount: 8e3 },
    { category: "Vestu\xE1rio", name: "Traje do noivo", estimated_amount: 3e3 },
    { category: "Vestu\xE1rio", name: "Alian\xE7as", estimated_amount: 4e3 },
    { category: "Beleza", name: "Maquiagem", estimated_amount: 800 },
    { category: "Beleza", name: "Penteado", estimated_amount: 600 },
    { category: "Papelaria", name: "Convites", estimated_amount: 1500 },
    { category: "Outros", name: "Lembrancinhas", estimated_amount: 2e3 },
    { category: "Outros", name: "Transporte", estimated_amount: 1e3 }
  ];
  for (const expense of defaultExpenses) {
    await c.env.DB.prepare(
      `INSERT INTO wedding_expenses (wedding_id, name, category, estimated_amount) VALUES (?, ?, ?, ?)`
    ).bind(wedding.id, expense.name, expense.category, expense.estimated_amount).run();
  }
  return c.json({ success: true, count: defaultExpenses.length });
});
var budget_default = r7;

// src/worker/routes/gifts.ts
var r8 = new Hono2();
r8.get("/api/gifts", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json([]);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_gifts WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  return c.json(results);
});
r8.post("/api/gifts", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_gifts (wedding_id, name, description, price, image_url, category, quota_total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    wedding.id,
    body.name,
    body.description,
    body.price,
    body.image_url,
    body.category,
    body.quota_total || 1
  ).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r8.put("/api/gifts/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  const res = await c.env.DB.prepare(`
    UPDATE wedding_gifts SET
      name = ?, description = ?, price = ?, image_url = ?,
      category = ?, is_available = ?, quota_total = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(
    body.name,
    body.description,
    body.price,
    body.image_url,
    body.category,
    body.is_available ? true : false,
    body.quota_total,
    id,
    weddingId
  ).run();
  if (!res.meta.changes) return c.json({ error: "Gift not found" }, 404);
  return c.json({ success: true });
});
r8.delete("/api/gifts/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "DELETE FROM wedding_gifts WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Gift not found" }, 404);
  return c.json({ success: true });
});
var gifts_default = r8;

// src/worker/routes/messages.ts
var r9 = new Hono2();
r9.get("/api/messages", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json([]);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM guest_messages WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  return c.json(results);
});
r9.put("/api/messages/:id/approve", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "UPDATE guest_messages SET is_approved = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Message not found" }, 404);
  return c.json({ success: true });
});
r9.put("/api/messages/:id/reject", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "UPDATE guest_messages SET is_approved = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Message not found" }, 404);
  return c.json({ success: true });
});
r9.delete("/api/messages/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "DELETE FROM guest_messages WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Message not found" }, 404);
  return c.json({ success: true });
});
var messages_default = r9;

// src/worker/routes/photos.ts
var r10 = new Hono2();
r10.get("/api/photos", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json([]);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_photos WHERE wedding_id = ? ORDER BY sort_order ASC, created_at DESC"
  ).bind(wedding.id).all();
  return c.json(results);
});
r10.post("/api/photos", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const formData = await c.req.formData();
  const file = formData.get("file");
  const caption = formData.get("caption");
  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: "Invalid file type. Only JPEG, PNG, WebP and GIF are allowed." }, 400);
  }
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: "File too large. Maximum size is 5MB." }, 400);
  }
  const timestamp = Date.now();
  const storageKey = `weddings/${wedding.id}/photos/${timestamp}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  await c.env.DB.prepare(
    "INSERT INTO files (key, data, content_type, size) VALUES (?, ?, ?, ?)"
  ).bind(storageKey, base64, file.type, file.size).run();
  const maxOrder = await c.env.DB.prepare(
    "SELECT MAX(sort_order) as max_order FROM wedding_photos WHERE wedding_id = ?"
  ).bind(wedding.id).first();
  const sortOrder = (maxOrder?.max_order || 0) + 1;
  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_photos (wedding_id, filename, storage_key, caption, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).bind(wedding.id, file.name, storageKey, caption, sortOrder).run();
  return c.json({
    success: true,
    id: result.meta.last_row_id,
    filename: file.name,
    storage_key: storageKey,
    caption
  });
});
r10.put("/api/photos/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  const updates = [];
  const values = [];
  if (body.caption !== void 0) {
    updates.push("caption = ?");
    values.push(body.caption);
  }
  if (body.sort_order !== void 0) {
    updates.push("sort_order = ?");
    values.push(body.sort_order);
  }
  if (updates.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }
  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id, weddingId);
  const res = await c.env.DB.prepare(
    `UPDATE wedding_photos SET ${updates.join(", ")} WHERE id = ? AND wedding_id = ?`
  ).bind(...values).run();
  if (!res.meta.changes) return c.json({ error: "Photo not found" }, 404);
  return c.json({ success: true });
});
r10.delete("/api/photos/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const photo = await c.env.DB.prepare(`
    SELECT wp.* FROM wedding_photos wp
    JOIN weddings w ON wp.wedding_id = w.id
    WHERE wp.id = ? AND w.user_id = ?
  `).bind(id, user.id).first();
  if (!photo) {
    return c.json({ error: "Photo not found" }, 404);
  }
  await c.env.DB.prepare("DELETE FROM files WHERE key = ?").bind(photo.storage_key).run();
  await c.env.DB.prepare("DELETE FROM wedding_photos WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});
r10.post("/api/upload", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const formData = await c.req.formData();
  const file = formData.get("file");
  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: "Invalid file type. Only JPEG, PNG, WebP and GIF are allowed." }, 400);
  }
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: "File too large. Maximum size is 5MB." }, 400);
  }
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const storageKey = `weddings/${wedding.id}/uploads/${timestamp}-${randomId}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  await c.env.DB.prepare(
    "INSERT INTO files (key, data, content_type, size) VALUES (?, ?, ?, ?)"
  ).bind(storageKey, base64, file.type, file.size).run();
  const url = `/api/files/${storageKey}`;
  return c.json({
    success: true,
    url,
    filename: file.name,
    storage_key: storageKey
  });
});
r10.get("/api/files/:key{.+}", async (c) => {
  const key = c.req.param("key");
  const file = await c.env.DB.prepare(
    "SELECT data, content_type FROM files WHERE key = ?"
  ).bind(key).first();
  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }
  const buffer = Buffer.from(file.data, "base64");
  return new Response(buffer, {
    headers: {
      "Content-Type": file.content_type,
      "Cache-Control": "public, max-age=31536000"
    }
  });
});
var photos_default = r10;

// src/worker/routes/story.ts
var r11 = new Hono2();
r11.get("/api/story-items", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user.id).first();
  if (!wedding) return c.json([]);
  const items = await c.env.DB.prepare(
    "SELECT * FROM wedding_story_items WHERE wedding_id = ? ORDER BY sort_order ASC"
  ).bind(wedding.id).all();
  return c.json(items.results || []);
});
r11.post("/api/story-items", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user.id).first();
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  const { title, description, story_date, image_url } = body;
  const maxOrder = await c.env.DB.prepare(
    "SELECT MAX(sort_order) as max_order FROM wedding_story_items WHERE wedding_id = ?"
  ).bind(wedding.id).first();
  const sortOrder = (maxOrder?.max_order || 0) + 1;
  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_story_items (wedding_id, title, description, story_date, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(wedding.id, title, description || null, story_date || null, image_url || null, sortOrder).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r11.put("/api/story-items/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const { title, description, story_date, image_url } = body;
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user.id).first();
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  await c.env.DB.prepare(`
    UPDATE wedding_story_items 
    SET title = ?, description = ?, story_date = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(title, description || null, story_date || null, image_url || null, id, wedding.id).run();
  return c.json({ success: true });
});
r11.delete("/api/story-items/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user.id).first();
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  await c.env.DB.prepare(
    "DELETE FROM wedding_story_items WHERE id = ? AND wedding_id = ?"
  ).bind(id, wedding.id).run();
  return c.json({ success: true });
});
r11.put("/api/story-items/reorder", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const { items } = body;
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user.id).first();
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  for (const item of items) {
    await c.env.DB.prepare(
      "UPDATE wedding_story_items SET sort_order = ? WHERE id = ? AND wedding_id = ?"
    ).bind(item.sort_order, item.id, wedding.id).run();
  }
  return c.json({ success: true });
});
var story_default = r11;

// src/worker/routes/public-wedding.ts
var r12 = new Hono2();
r12.get("/api/public/wedding/:customUrl", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(`
    SELECT id, partner1_name, partner2_name, wedding_date, venue_name, venue_address, pix_key, custom_url,
           template_id, theme_primary_color, theme_secondary_color, theme_accent_color, 
           theme_background_color, theme_text_color, theme_heading_font, theme_body_font,
           show_story, show_gallery, show_timeline, show_location, show_dresscode, 
           show_gifts, show_rsvp, show_messages, show_godparents, show_parents, show_accommodations, hero_image_key, hero_style, our_story,
           ceremony_time, ceremony_venue, reception_time, reception_venue,
           dress_code, dress_code_description, dress_code_allowed_colors, dress_code_avoid_colors,
           timeline_events, instagram_url, music_url, is_published,
           og_title, og_description, og_image
    FROM weddings WHERE custom_url = ?
  `).bind(customUrl).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  if (!wedding.is_published) {
    return c.json({ error: "Wedding not published", unpublished: true }, 403);
  }
  const storyItems = await c.env.DB.prepare(
    "SELECT * FROM wedding_story_items WHERE wedding_id = ? ORDER BY sort_order ASC"
  ).bind(wedding.id).all();
  return c.json({ wedding, storyItems: storyItems.results || [] });
});
r12.get("/api/public/wedding/:customUrl/gifts", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, description, price, image_url, category, is_available, quota_total, quota_purchased FROM wedding_gifts WHERE wedding_id = ? AND is_available = TRUE ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  return c.json({ gifts: results || [] });
});
r12.get("/api/public/wedding/:customUrl/photos", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const { results } = await c.env.DB.prepare(
    "SELECT id, filename, storage_key, caption, sort_order FROM wedding_photos WHERE wedding_id = ? ORDER BY sort_order ASC, created_at DESC"
  ).bind(wedding.id).all();
  return c.json(results);
});
r12.get("/api/public/wedding/:customUrl/messages", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const { results } = await c.env.DB.prepare(
    "SELECT id, guest_name AS author_name, message AS content, created_at FROM guest_messages WHERE wedding_id = ? AND is_approved = TRUE ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  return c.json({ messages: results });
});
r12.post("/api/public/wedding/:customUrl/rsvp", async (c) => {
  const customUrl = c.req.param("customUrl");
  const body = await c.req.json();
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  if (body.email) {
    const existingGuest = await c.env.DB.prepare(
      "SELECT id FROM guests WHERE wedding_id = ? AND email = ?"
    ).bind(wedding.id, body.email).first();
    if (existingGuest) {
      await c.env.DB.prepare(`
        UPDATE guests SET 
          name = ?, phone = ?, guests_count = ?, rsvp_status = ?,
          dietary_restrictions = ?, message = ?, responded_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        body.name,
        body.phone,
        body.guests_count || 1,
        body.rsvp_status,
        body.dietary_restrictions,
        body.message,
        existingGuest.id
      ).run();
      return c.json({ success: true, updated: true });
    }
  }
  await c.env.DB.prepare(`
    INSERT INTO guests (wedding_id, name, email, phone, guests_count, rsvp_status, dietary_restrictions, message, responded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    wedding.id,
    body.name,
    body.email,
    body.phone,
    body.guests_count || 1,
    body.rsvp_status,
    body.dietary_restrictions,
    body.message
  ).run();
  return c.json({ success: true, updated: false });
});
r12.post("/api/public/wedding/:customUrl/messages", async (c) => {
  const customUrl = c.req.param("customUrl");
  const body = await c.req.json();
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  await c.env.DB.prepare(`
    INSERT INTO guest_messages (wedding_id, guest_name, message, is_approved)
    VALUES (?, ?, ?, NULL)
  `).bind(wedding.id, body.author_name, body.content).run();
  return c.json({ success: true });
});
var public_wedding_default = r12;

// src/worker/routes/confirm.ts
var r13 = new Hono2();
r13.post("/api/public/wedding/:customUrl/find-guest", async (c) => {
  const customUrl = c.req.param("customUrl");
  const body = await c.req.json();
  const { phoneLast4 } = body;
  if (!phoneLast4 || phoneLast4.length !== 4) {
    return c.json({ found: false, error: "Digite os 4 \xFAltimos d\xEDgitos do telefone" }, 400);
  }
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ? AND is_published = TRUE"
  ).bind(customUrl).first();
  if (!wedding) {
    return c.json({ found: false, error: "Casamento n\xE3o encontrado" }, 404);
  }
  const guest = await c.env.DB.prepare(
    "SELECT confirmation_code, name FROM guests WHERE wedding_id = ? AND phone LIKE ? AND confirmation_code IS NOT NULL"
  ).bind(wedding.id, `%${phoneLast4}`).first();
  if (!guest) {
    return c.json({ found: false, error: "N\xE3o encontramos um convite com esse telefone. Verifique os n\xFAmeros e tente novamente." }, 404);
  }
  return c.json({ found: true, confirmation_code: guest.confirmation_code, name: guest.name });
});
r13.get("/api/public/confirm/:code", async (c) => {
  const code = c.req.param("code");
  const guest = await c.env.DB.prepare(`
    SELECT g.*, w.partner1_name, w.partner2_name, w.wedding_date, w.venue_name, w.custom_url, w.show_gifts,
           w.invitation_message, w.ceremony_time, w.ceremony_venue, w.reception_venue
    FROM guests g
    JOIN weddings w ON g.wedding_id = w.id
    WHERE g.confirmation_code = ?
  `).bind(code).first();
  if (!guest) {
    return c.json({ error: "Invalid confirmation code" }, 404);
  }
  const companions = await c.env.DB.prepare(
    "SELECT * FROM guest_companions WHERE guest_id = ?"
  ).bind(guest.id).all();
  const phoneMask = guest.phone ? `${guest.phone.slice(0, 8)}****` : null;
  return c.json({
    guest: {
      id: guest.id,
      name: guest.name,
      phoneMask,
      hasPhone: !!guest.phone,
      isConfirmed: Boolean(guest.is_confirmed),
      confirmedAt: guest.confirmed_at,
      isChild: Boolean(guest.is_child),
      rsvpStatus: guest.rsvp_status,
      dietaryRestrictions: guest.dietary_restrictions,
      message: guest.message
    },
    companions: companions.results || [],
    wedding: {
      partner1_name: guest.partner1_name,
      partner2_name: guest.partner2_name,
      wedding_date: guest.wedding_date,
      venue_name: guest.venue_name,
      custom_url: guest.custom_url,
      show_gifts: guest.show_gifts,
      invitation_message: guest.invitation_message,
      ceremony_time: guest.ceremony_time,
      ceremony_venue: guest.ceremony_venue,
      reception_venue: guest.reception_venue
    }
  });
});
r13.post("/api/public/confirm/:code/verify", async (c) => {
  const code = c.req.param("code");
  const body = await c.req.json().catch(() => ({}));
  const phoneLast4 = String(body.phoneLast4 || "");
  const guest = await c.env.DB.prepare(
    "SELECT phone FROM guests WHERE confirmation_code = ?"
  ).bind(code).first();
  if (!guest) {
    return c.json({ error: "Invalid confirmation code" }, 404);
  }
  if (guest.phone) {
    const actualLast4 = guest.phone.replace(/\D/g, "").slice(-4);
    if (phoneLast4 !== actualLast4) {
      return c.json({ ok: false, error: "Os \xFAltimos 4 d\xEDgitos do telefone n\xE3o conferem" }, 401);
    }
  }
  return c.json({ ok: true });
});
r13.post("/api/public/confirm/:code", async (c) => {
  const code = c.req.param("code");
  const body = await c.req.json();
  const { phoneLast4, confirmedCompanionIds, dietaryRestrictions, message } = body;
  const guest = await c.env.DB.prepare(
    "SELECT id, phone FROM guests WHERE confirmation_code = ?"
  ).bind(code).first();
  if (!guest) {
    return c.json({ error: "Invalid confirmation code" }, 404);
  }
  if (guest.phone) {
    const actualLast4 = guest.phone.replace(/\D/g, "").slice(-4);
    if (phoneLast4 !== actualLast4) {
      return c.json({ error: "Os \xFAltimos 4 d\xEDgitos do telefone n\xE3o conferem" }, 401);
    }
  }
  await c.env.DB.prepare(`
    UPDATE guests SET 
      is_confirmed = TRUE, 
      confirmed_at = CURRENT_TIMESTAMP,
      dietary_restrictions = ?,
      message = ?,
      rsvp_status = 'confirmed',
      responded_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(dietaryRestrictions || null, message || null, guest.id).run();
  if (Array.isArray(confirmedCompanionIds)) {
    await c.env.DB.prepare(
      "UPDATE guest_companions SET is_confirmed = FALSE WHERE guest_id = ?"
    ).bind(guest.id).run();
    for (const compId of confirmedCompanionIds) {
      await c.env.DB.prepare(
        "UPDATE guest_companions SET is_confirmed = TRUE WHERE id = ? AND guest_id = ?"
      ).bind(compId, guest.id).run();
    }
  }
  return c.json({ success: true });
});
r13.post("/api/public/confirm/:code/decline", async (c) => {
  const code = c.req.param("code");
  const body = await c.req.json();
  const { phoneLast4, message } = body;
  const guest = await c.env.DB.prepare(
    "SELECT id, phone FROM guests WHERE confirmation_code = ?"
  ).bind(code).first();
  if (!guest) {
    return c.json({ error: "Invalid confirmation code" }, 404);
  }
  if (guest.phone) {
    const actualLast4 = guest.phone.replace(/\D/g, "").slice(-4);
    if (phoneLast4 !== actualLast4) {
      return c.json({ error: "Os \xFAltimos 4 d\xEDgitos do telefone n\xE3o conferem" }, 401);
    }
  }
  await c.env.DB.prepare(`
    UPDATE guests SET 
      is_confirmed = FALSE, 
      rsvp_status = 'declined',
      message = ?,
      responded_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(message || null, guest.id).run();
  await c.env.DB.prepare(
    "UPDATE guest_companions SET is_confirmed = FALSE WHERE guest_id = ?"
  ).bind(guest.id).run();
  return c.json({ success: true });
});
var confirm_default = r13;

// src/worker/lib/admin.ts
var ADMIN_COOKIE_NAME = "eternize_admin";
async function adminMiddleware(c, next) {
  const token = getCookie(c, ADMIN_COOKIE_NAME);
  if (!token) return c.json({ error: "Admin n\xE3o autenticado" }, 401);
  const db = c.env.DB;
  const row = await db.prepare(
    "SELECT 1 AS ok FROM sessions WHERE token = ? AND user_id = '__admin__' AND expires_at > NOW()"
  ).bind(token).first();
  if (!row) return c.json({ error: "Sess\xE3o admin expirada" }, 401);
  c.set("user", { id: "__admin__", email: "admin", name: "Admin" });
  await next();
}

// src/worker/routes/platform.ts
var r14 = new Hono2();
var DEFAULTS = { commission_pct: 2, maintenance_fee: 12 };
async function readSettings(c) {
  try {
    const row = await c.env.DB.prepare(
      "SELECT commission_pct, maintenance_fee FROM platform_settings WHERE id = 1"
    ).first();
    if (row) {
      return {
        commission_pct: Number(row.commission_pct) || 0,
        maintenance_fee: Number(row.maintenance_fee) || 0
      };
    }
  } catch {
  }
  return { ...DEFAULTS };
}
async function sumOrders(c, column, where, binds, fallback) {
  const run = async (col) => {
    const row = await c.env.DB.prepare(
      `SELECT COALESCE(SUM(${col}), 0) AS total FROM gift_orders WHERE ${where}`
    ).bind(...binds).first();
    return Number(row?.total) || 0;
  };
  try {
    return await run(column);
  } catch {
    return fallback ? run(fallback) : 0;
  }
}
async function computeSplit(c, amount, cardPrice, applyMaintenanceFee) {
  const { commission_pct, maintenance_fee } = await readSettings(c);
  const gift = Number(amount) || 0;
  const card = Number(cardPrice) || 0;
  const fee = applyMaintenanceFee ? maintenance_fee : 0;
  const commission_amount = Math.round(gift * commission_pct) / 100;
  const platform_amount = Math.round((commission_amount + card + fee) * 100) / 100;
  const couple_amount = Math.round((gift - commission_amount) * 100) / 100;
  return { commission_pct, maintenance_fee: fee, commission_amount, platform_amount, couple_amount };
}
r14.get("/api/public/platform-config", async (c) => {
  const settings = await readSettings(c);
  let cardOptions = [];
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, name, price, description FROM gift_card_options WHERE is_active = TRUE ORDER BY sort_order, id"
    ).all();
    cardOptions = results || [];
  } catch {
  }
  if (cardOptions.length === 0) {
    cardOptions = [{ id: 0, name: "Gr\xE1tis", price: 0, description: "Cart\xE3o simples com seu nome e mensagem" }];
  }
  return c.json({
    commissionPct: settings.commission_pct,
    maintenanceFee: settings.maintenance_fee,
    cardOptions
  });
});
r14.get("/api/admin/platform/settings", adminMiddleware, async (c) => {
  return c.json(await readSettings(c));
});
r14.put("/api/admin/platform/settings", adminMiddleware, async (c) => {
  const body = await c.req.json();
  const commission = Math.max(0, Math.min(100, Number(body.commission_pct) || 0));
  const fee = Math.max(0, Number(body.maintenance_fee) || 0);
  try {
    await c.env.DB.prepare(`
      INSERT INTO platform_settings (id, commission_pct, maintenance_fee, updated_at)
      VALUES (1, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        commission_pct = EXCLUDED.commission_pct,
        maintenance_fee = EXCLUDED.maintenance_fee,
        updated_at = CURRENT_TIMESTAMP
    `).bind(commission, fee).run();
  } catch {
    return c.json({ error: "Rode a migra\xE7\xE3o de monetiza\xE7\xE3o no banco antes de configurar." }, 503);
  }
  return c.json({ success: true, commission_pct: commission, maintenance_fee: fee });
});
r14.get("/api/admin/platform/cards", adminMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM gift_card_options ORDER BY sort_order, id"
    ).all();
    return c.json({ cards: results || [] });
  } catch {
    return c.json({ cards: [] });
  }
});
r14.post("/api/admin/platform/cards", adminMiddleware, async (c) => {
  const body = await c.req.json();
  if (!body.name?.trim()) return c.json({ error: "Nome obrigat\xF3rio" }, 400);
  try {
    const max = await c.env.DB.prepare(
      "SELECT COALESCE(MAX(sort_order), -1) AS m FROM gift_card_options"
    ).first();
    const result = await c.env.DB.prepare(`
    INSERT INTO gift_card_options (name, price, description, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
      body.name.trim(),
      Math.max(0, Number(body.price) || 0),
      body.description || null,
      (max?.m ?? -1) + 1,
      body.is_active === false ? false : true
    ).run();
    return c.json({ success: true, id: result.meta.last_row_id });
  } catch {
    return c.json({ error: "Rode a migra\xE7\xE3o de monetiza\xE7\xE3o no banco antes de gerenciar cart\xF5es." }, 503);
  }
});
r14.put("/api/admin/platform/cards/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const res = await c.env.DB.prepare(`
    UPDATE gift_card_options SET
      name = ?, price = ?, description = ?, sort_order = ?, is_active = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    body.name,
    Math.max(0, Number(body.price) || 0),
    body.description || null,
    Number(body.sort_order) || 0,
    body.is_active === false ? false : true,
    id
  ).run();
  if (!res.meta.changes) return c.json({ error: "Cart\xE3o n\xE3o encontrado" }, 404);
  return c.json({ success: true });
});
r14.delete("/api/admin/platform/cards/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const res = await c.env.DB.prepare(
    "DELETE FROM gift_card_options WHERE id = ?"
  ).bind(id).run();
  if (!res.meta.changes) return c.json({ error: "Cart\xE3o n\xE3o encontrado" }, 404);
  return c.json({ success: true });
});
r14.get("/api/admin/platform/revenue", adminMiddleware, async (c) => {
  let row = null;
  try {
    row = await c.env.DB.prepare(`
      SELECT
        COUNT(*)                          AS order_count,
        COALESCE(SUM(commission_amount),0) AS commission_total,
        COALESCE(SUM(card_price),0)        AS card_total,
        COALESCE(SUM(maintenance_fee),0)   AS fee_total,
        COALESCE(SUM(platform_amount),0)   AS platform_total,
        COALESCE(SUM(couple_amount),0)     AS couple_total,
        COALESCE(SUM(amount),0)            AS gross_total
      FROM gift_orders
      WHERE payment_status = 'paid'
    `).first();
  } catch {
    row = null;
  }
  return c.json({
    orderCount: row?.order_count || 0,
    commissionTotal: row?.commission_total || 0,
    cardTotal: row?.card_total || 0,
    feeTotal: row?.fee_total || 0,
    platformTotal: row?.platform_total || 0,
    coupleTotal: row?.couple_total || 0,
    grossTotal: row?.gross_total || 0
  });
});
var platform_default = r14;

// src/worker/lib/pix/validapay.ts
import { createHmac, timingSafeEqual } from "node:crypto";
var OAUTH_URL = () => process.env.VALIDAPAY_OAUTH_URL || "https://oauth2.validapay.com.br/auth/token";
var BASE_URL = () => (process.env.VALIDAPAY_API_URL || "https://api.validapay.com.br").replace(/\/+$/, "");
var SCOPE = () => process.env.VALIDAPAY_SCOPE || "pix.cob/write";
var PATH_CREATE = "/v1/charges/pix";
var PATH_GET = "/v1/charges/:id";
var WEBHOOK_SIG_HEADER = "x-webhook-signature";
function normalizeStatus(raw2) {
  const s = String(raw2 || "").toUpperCase();
  if (s === "PAID" || s === "APPROVED" || s === "COMPLETED" || s === "SUCCESS") return "paid";
  if (s === "EXPIRED") return "expired";
  if (s === "FAILED" || s === "CANCELED" || s === "CANCELLED" || s === "REFUSED") return "failed";
  return "pending";
}
function isConfigured() {
  return !!process.env.VALIDAPAY_TOKEN || !!process.env.VALIDAPAY_CLIENT_ID && !!process.env.VALIDAPAY_CLIENT_SECRET;
}
var cachedToken = null;
async function getAccessToken() {
  if (process.env.VALIDAPAY_TOKEN) return process.env.VALIDAPAY_TOKEN;
  if (cachedToken && cachedToken.expiresAt - 6e4 > Date.now()) {
    return cachedToken.value;
  }
  const res = await fetch(OAUTH_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.VALIDAPAY_CLIENT_ID || "",
      client_secret: process.env.VALIDAPAY_CLIENT_SECRET || "",
      scope: SCOPE()
    }).toString()
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ValidaPay auth ${res.status} @ ${OAUTH_URL()}: ${text.slice(0, 300)}`);
  }
  const j = await res.json();
  const value = String(j.access_token ?? j.token ?? "");
  if (!value) throw new Error("ValidaPay auth: no access_token in response");
  const ttlSec = Number(j.expires_in ?? 3600) || 3600;
  cachedToken = { value, expiresAt: Date.now() + ttlSec * 1e3 };
  return value;
}
async function authHeaders() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${await getAccessToken()}`
  };
}
function readCharge(j) {
  return {
    chargeId: String(j.chargeId ?? j.id ?? ""),
    emv: String(j.emv ?? j.pixCopiaECola ?? j.brcode ?? ""),
    qrCode: String(j.qrCode ?? j.qrcode ?? ""),
    status: normalizeStatus(j.status ?? "PENDING"),
    expiresAt: j.expiresAt ?? j.expiration ?? null
  };
}
async function createPixCharge(input) {
  const body = {
    amount: Math.round(input.amount * 100) / 100,
    externalTxid: input.checkoutRef
  };
  const doc = (input.customer.document || "").replace(/\D/g, "");
  const email = input.customer.email || "";
  if (doc || email) {
    body.customer = {
      ...doc ? { documentNumber: doc } : {},
      ...email ? { email } : {}
    };
  }
  const res = await fetch(`${BASE_URL()}${PATH_CREATE}`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body)
  });
  if (res.status === 409) {
    const dup = await res.json().catch(() => ({}));
    const id = dup?.chargeId ?? dup?.id;
    if (id) return getCharge(String(id));
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ValidaPay create charge ${res.status} @ ${PATH_CREATE}: ${text.slice(0, 300)}`);
  }
  return readCharge(await res.json());
}
async function getCharge(chargeId) {
  const res = await fetch(`${BASE_URL()}${PATH_GET.replace(":id", encodeURIComponent(chargeId))}`, {
    headers: await authHeaders()
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ValidaPay get charge ${res.status}: ${text.slice(0, 300)}`);
  }
  return readCharge(await res.json());
}
function verifyWebhook(rawBody, signatureHeader) {
  const secret = process.env.VALIDAPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[validapay] VALIDAPAY_WEBHOOK_SECRET not set \u2014 webhook signature not verified");
    return true;
  }
  if (!signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => {
      const i = kv.indexOf("=");
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    })
  );
  const t = parts["t"];
  const v1 = parts["v1"] || signatureHeader.replace(/^sha256=/, "").trim();
  if (!v1) return false;
  const signed = t ? `${t}.${rawBody}` : rawBody;
  const expected = createHmac("sha256", secret).update(signed, "utf8").digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(v1, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

// src/worker/routes/payments.ts
var r15 = new Hono2();
r15.get("/api/gift-orders", authMiddleware, async (c) => {
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(userId).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const orders = await c.env.DB.prepare(`
    SELECT go.*, wg.name as gift_name, wg.image_url as gift_image
    FROM gift_orders go
    LEFT JOIN wedding_gifts wg ON go.gift_id = wg.id
    WHERE go.wedding_id = ?
    ORDER BY go.created_at DESC
  `).bind(wedding.id).all();
  return c.json({ orders: orders.results || [] });
});
r15.put("/api/gift-orders/:id/status", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(userId).first();
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json().catch(() => ({}));
  const paid = !!body.paid;
  const res = await c.env.DB.prepare(`
    UPDATE gift_orders
    SET payment_status = ?, paid_at = ${paid ? "CURRENT_TIMESTAMP" : "NULL"}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ? AND is_converted = FALSE
  `).bind(paid ? "paid" : "pending", id, wedding.id).run();
  if (!res.meta.changes) return c.json({ error: "Pedido n\xE3o encontrado" }, 404);
  if (paid) {
    try {
      await c.env.DB.prepare(
        "UPDATE gift_orders SET couple_amount = amount WHERE id = ? AND (couple_amount IS NULL OR couple_amount = 0)"
      ).bind(id).run();
    } catch {
    }
  }
  return c.json({ success: true, paid });
});
r15.get("/api/balance", authMiddleware, async (c) => {
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id, pix_key FROM weddings WHERE user_id = ?"
  ).bind(userId).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const availableBalance = await sumOrders(
    c,
    "couple_amount",
    "wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE",
    [wedding.id],
    "amount"
  );
  const convertedTotal = await sumOrders(
    c,
    "couple_amount",
    "wedding_id = ? AND payment_status = 'paid' AND is_converted = TRUE",
    [wedding.id],
    "amount"
  );
  const serviceFeesTotal = await sumOrders(
    c,
    "commission_amount",
    "wedding_id = ? AND payment_status = 'paid'",
    [wedding.id],
    null
  );
  const pending = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM cash_withdrawals WHERE wedding_id = ? AND status = 'pending'"
  ).bind(wedding.id).first();
  return c.json({
    availableBalance,
    convertedTotal,
    pendingWithdrawal: pending?.total || 0,
    serviceFeesTotal,
    pixKey: wedding.pix_key || null
  });
});
r15.get("/api/withdrawals", authMiddleware, async (c) => {
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(userId).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const withdrawals = await c.env.DB.prepare(
    "SELECT * FROM cash_withdrawals WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  return c.json({ withdrawals: withdrawals.results || [] });
});
r15.post("/api/withdrawals", authMiddleware, async (c) => {
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id, pix_key FROM weddings WHERE user_id = ?"
  ).bind(userId).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const { amount, pixKey, pixKeyType } = await c.req.json();
  const availableTotal = await sumOrders(
    c,
    "couple_amount",
    "wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE",
    [wedding.id],
    "amount"
  );
  if (!availableTotal || amount > availableTotal) {
    return c.json({ error: "Insufficient balance" }, 400);
  }
  const result = await c.env.DB.prepare(`
    INSERT INTO cash_withdrawals (wedding_id, amount, pix_key, pix_key_type, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(wedding.id, amount, pixKey, pixKeyType).run();
  let ordersToConvert;
  try {
    ordersToConvert = await c.env.DB.prepare(`
      SELECT id, couple_amount AS share FROM gift_orders
      WHERE wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE
      ORDER BY created_at ASC
    `).bind(wedding.id).all();
  } catch {
    ordersToConvert = await c.env.DB.prepare(`
      SELECT id, amount AS share FROM gift_orders
      WHERE wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE
      ORDER BY created_at ASC
    `).bind(wedding.id).all();
  }
  let remaining = amount;
  for (const order of ordersToConvert.results || []) {
    if (remaining <= 0) break;
    await c.env.DB.prepare(`
      UPDATE gift_orders SET is_converted = TRUE, converted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(order.id).run();
    remaining -= Number(order.share) || 0;
  }
  return c.json({ success: true, withdrawalId: result.meta?.last_row_id });
});
r15.post("/api/public/pix-charge", async (c) => {
  if (!isConfigured()) {
    return c.json({ configured: false, error: "Gateway de pagamento n\xE3o configurado" }, 503);
  }
  const body = await c.req.json().catch(() => ({}));
  const ref = String(body.checkout_ref || "").trim();
  const amount = Number(body.amount) || 0;
  if (!ref || amount <= 0) return c.json({ error: "Dados inv\xE1lidos" }, 400);
  try {
    const charge = await createPixCharge({
      amount,
      checkoutRef: ref,
      customer: {
        name: String(body.customer?.name || "Convidado"),
        email: body.customer?.email || null,
        document: (body.customer?.document || "").replace(/\D/g, "") || null
      }
    });
    if (charge.chargeId) {
      try {
        await c.env.DB.prepare(
          "UPDATE gift_orders SET pix_transaction_id = ? WHERE pix_transaction_id = ?"
        ).bind(charge.chargeId, ref).run();
      } catch {
      }
    }
    return c.json({
      configured: true,
      chargeId: charge.chargeId,
      emv: charge.emv,
      qrCode: charge.qrCode,
      expiresAt: charge.expiresAt,
      // the client keeps polling by chargeId when we swapped the ref
      ref: charge.chargeId || ref
    });
  } catch (err) {
    console.error("pix-charge failed:", err);
    return c.json(
      {
        error: "N\xE3o foi poss\xEDvel gerar o PIX.",
        detail: String(err?.message || err).slice(0, 500)
      },
      502
    );
  }
});
r15.get("/api/public/checkout-status/:ref", async (c) => {
  const ref = c.req.param("ref");
  const row = await c.env.DB.prepare(
    "SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE payment_status = 'paid') AS paid FROM gift_orders WHERE pix_transaction_id = ?"
  ).bind(ref).first();
  const total = Number(row?.total) || 0;
  let paidCount = Number(row?.paid) || 0;
  if (total > 0 && paidCount < total && c.req.query("reconcile") === "1" && isConfigured()) {
    try {
      const charge = await getCharge(ref);
      if (charge.status === "paid") {
        await c.env.DB.prepare(
          `UPDATE gift_orders SET payment_status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE pix_transaction_id = ? AND payment_status <> 'paid'`
        ).bind(ref).run();
        paidCount = total;
      }
    } catch (e) {
      console.error("reconcile failed:", e);
    }
  }
  return c.json({ paid: total > 0 && paidCount >= total, total, paidCount });
});
var payments_default = r15;

// src/worker/routes/admin-auth.ts
var r16 = new Hono2();
var COOKIE = { httpOnly: true, path: "/", sameSite: "lax", secure: true };
function adminToken() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return "adm_" + Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}
function expectedPassword(c) {
  return c.env?.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "";
}
r16.post("/api/admin/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  const expected = expectedPassword(c);
  if (!expected) {
    return c.json({ error: "ADMIN_PASSWORD n\xE3o configurado no servidor." }, 500);
  }
  if (password !== expected) {
    await new Promise((res) => setTimeout(res, 350));
    return c.json({ error: "Senha incorreta." }, 401);
  }
  const token = adminToken();
  await c.env.DB.prepare(
    "INSERT INTO sessions (token, user_id, email, name, expires_at) VALUES (?, '__admin__', 'admin', 'Admin', NOW() + INTERVAL '30 days')"
  ).bind(token).run();
  setCookie(c, ADMIN_COOKIE_NAME, token, { ...COOKIE, maxAge: 30 * 24 * 60 * 60 });
  return c.json({ success: true });
});
r16.get("/api/admin/me", async (c) => {
  const token = getCookie(c, ADMIN_COOKIE_NAME);
  if (!token) return c.json({ admin: false });
  const row = await c.env.DB.prepare(
    "SELECT 1 AS ok FROM sessions WHERE token = ? AND user_id = '__admin__' AND expires_at > NOW()"
  ).bind(token).first();
  return c.json({ admin: !!row });
});
r16.post("/api/admin/logout", async (c) => {
  const token = getCookie(c, ADMIN_COOKIE_NAME);
  if (token) await c.env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  setCookie(c, ADMIN_COOKIE_NAME, "", { ...COOKIE, maxAge: 0 });
  return c.json({ success: true });
});
var admin_auth_default = r16;

// src/worker/routes/admin.ts
import * as bcrypt2 from "bcryptjs";
var r17 = new Hono2();
r17.get("/api/admin/stats", adminMiddleware, async (c) => {
  const totalWeddings = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM weddings"
  ).first();
  const publishedWeddings = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM weddings WHERE is_published = TRUE"
  ).first();
  const totalGuests = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM guests"
  ).first();
  const grossRow = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(amount),0) as total FROM gift_orders WHERE payment_status = 'paid'"
  ).first();
  const platformRevenue = await sumOrders(
    c,
    "platform_amount",
    "payment_status = 'paid'",
    [],
    null
  );
  const giftTotals = { gross: grossRow?.total || 0, platform: platformRevenue };
  const pendingWithdrawals = await c.env.DB.prepare(
    "SELECT COUNT(*) as count, SUM(amount) as total FROM cash_withdrawals WHERE status = 'pending'"
  ).first();
  return c.json({
    totalWeddings: totalWeddings?.count || 0,
    publishedWeddings: publishedWeddings?.count || 0,
    totalGuests: totalGuests?.count || 0,
    totalGiftsValue: giftTotals?.gross || 0,
    platformRevenue: giftTotals?.platform || 0,
    pendingWithdrawals: pendingWithdrawals?.count || 0,
    pendingWithdrawalsAmount: pendingWithdrawals?.total || 0,
    totalRevenue: giftTotals?.platform || 0
  });
});
r17.get("/api/admin/weddings", adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT 
      w.*,
      (SELECT COUNT(*) FROM guests WHERE wedding_id = w.id) as guest_count,
      (SELECT COALESCE(SUM(amount), 0) FROM gift_orders WHERE wedding_id = w.id AND payment_status = 'paid') as gifts_total
    FROM weddings w
    ORDER BY w.created_at DESC
  `).all();
  return c.json({ weddings: results || [] });
});
r17.get("/api/admin/withdrawals", adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT 
      cw.*,
      w.partner1_name,
      w.partner2_name
    FROM cash_withdrawals cw
    JOIN weddings w ON cw.wedding_id = w.id
    ORDER BY 
      CASE WHEN cw.status = 'pending' THEN 0 ELSE 1 END,
      cw.created_at DESC
  `).all();
  return c.json({ withdrawals: results || [] });
});
r17.post("/api/admin/withdrawals/:id/approve", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare(`
    UPDATE cash_withdrawals 
    SET status = 'approved', processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();
  return c.json({ success: true });
});
r17.post("/api/admin/withdrawals/:id/reject", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const withdrawal = await c.env.DB.prepare(
    "SELECT wedding_id, amount FROM cash_withdrawals WHERE id = ?"
  ).bind(id).first();
  if (withdrawal) {
    let remaining = withdrawal.amount;
    const orders = await c.env.DB.prepare(`
      SELECT id, amount FROM gift_orders 
      WHERE wedding_id = ? AND is_converted = TRUE
      ORDER BY converted_at DESC
    `).bind(withdrawal.wedding_id).all();
    for (const order of orders.results || []) {
      if (remaining <= 0) break;
      await c.env.DB.prepare(`
        UPDATE gift_orders SET is_converted = FALSE, converted_at = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(order.id).run();
      remaining -= order.amount;
    }
  }
  await c.env.DB.prepare(`
    UPDATE cash_withdrawals 
    SET status = 'rejected', processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();
  return c.json({ success: true });
});
r17.get("/api/admin/couples", adminMiddleware, async (c) => {
  const q = (c.req.query("q") || "").trim();
  const like = `%${q}%`;
  const { results } = await c.env.DB.prepare(
    `SELECT w.id, w.partner1_name, w.partner2_name, w.custom_url, w.wedding_date,
            w.is_published, w.created_at, w.user_id,
            u.email AS user_email, u.name AS user_name,
            (SELECT COUNT(*) FROM guests WHERE wedding_id = w.id) AS guest_count,
            (SELECT COALESCE(SUM(amount),0) FROM gift_orders WHERE wedding_id = w.id AND payment_status = 'paid') AS gifts_total
     FROM weddings w
     JOIN users u ON u.id = w.user_id
     WHERE ? = ''
        OR u.email ILIKE ? OR u.name ILIKE ?
        OR w.partner1_name ILIKE ? OR w.partner2_name ILIKE ?
        OR w.custom_url ILIKE ?
     ORDER BY w.created_at DESC
     LIMIT 50`
  ).bind(q, like, like, like, like, like).all();
  return c.json({ couples: results || [] });
});
r17.get("/api/admin/couples/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const wedding = await c.env.DB.prepare(
    `SELECT w.*, u.email AS user_email, u.name AS user_name
     FROM weddings w JOIN users u ON u.id = w.user_id WHERE w.id = ?`
  ).bind(id).first();
  if (!wedding) return c.json({ error: "Couple not found" }, 404);
  const counts = await c.env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM guests WHERE wedding_id = ?) AS guests,
       (SELECT COUNT(*) FROM guests WHERE wedding_id = ? AND is_confirmed = TRUE) AS confirmed,
       (SELECT COUNT(*) FROM wedding_gifts WHERE wedding_id = ?) AS gifts,
       (SELECT COUNT(*) FROM wedding_photos WHERE wedding_id = ?) AS photos,
       (SELECT COUNT(*) FROM guest_messages WHERE wedding_id = ?) AS messages`
  ).bind(id, id, id, id, id).first();
  const orders = await c.env.DB.prepare(
    `SELECT id, guest_name, amount, payment_status, is_converted, created_at
     FROM gift_orders WHERE wedding_id = ? ORDER BY created_at DESC LIMIT 20`
  ).bind(id).all();
  const withdrawals = await c.env.DB.prepare(
    `SELECT id, amount, pix_key, pix_key_type, status, created_at, processed_at
     FROM cash_withdrawals WHERE wedding_id = ? ORDER BY created_at DESC`
  ).bind(id).all();
  return c.json({
    wedding,
    counts,
    orders: orders.results || [],
    withdrawals: withdrawals.results || []
  });
});
r17.patch("/api/admin/couples/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const TEXT_COLS = [
    "partner1_name",
    "partner2_name",
    "wedding_date",
    "venue_name",
    "venue_address",
    "custom_url",
    "pix_key"
  ];
  const BOOL_COLS = [
    "is_published",
    "show_story",
    "show_gallery",
    "show_timeline",
    "show_location",
    "show_dresscode",
    "show_gifts",
    "show_rsvp",
    "show_messages",
    "show_godparents",
    "show_parents",
    "show_accommodations"
  ];
  const sets = [];
  const values = [];
  for (const col of TEXT_COLS) {
    if (body[col] === void 0) continue;
    sets.push(`${col} = ?`);
    values.push(body[col] || null);
  }
  for (const col of BOOL_COLS) {
    if (body[col] === void 0) continue;
    sets.push(`${col} = ?`);
    const v = body[col];
    values.push(!(v === 0 || v === false || v === "0" || v === "false"));
  }
  if (sets.length === 0) return c.json({ success: true });
  sets.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);
  const res = await c.env.DB.prepare(
    `UPDATE weddings SET ${sets.join(", ")} WHERE id = ?`
  ).bind(...values).run();
  if (!res.meta.changes) return c.json({ error: "Couple not found" }, 404);
  return c.json({ success: true });
});
r17.post("/api/admin/users/:id/reset-password", adminMiddleware, async (c) => {
  const userId = c.req.param("id");
  const user = await c.env.DB.prepare("SELECT id, email FROM users WHERE id = ?").bind(userId).first();
  if (!user) return c.json({ error: "User not found" }, 404);
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  const tempPassword = "Et-" + Array.from(bytes, (b) => b.toString(36)).join("").slice(0, 10);
  const hash3 = await bcrypt2.hash(tempPassword, 12);
  await c.env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(hash3, userId).run();
  await c.env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();
  return c.json({ success: true, email: user.email, tempPassword });
});
var admin_default = r17;

// src/worker/routes/support.ts
var r18 = new Hono2();
var COOKIE2 = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: true
};
function supportToken() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return "sup_" + Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}
r18.post("/api/admin/couples/:id/impersonate", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const w = await c.env.DB.prepare(
    `SELECT w.id, w.partner1_name, w.partner2_name, u.id AS user_id, u.email, u.name
     FROM weddings w JOIN users u ON u.id = w.user_id WHERE w.id = ?`
  ).bind(id).first();
  if (!w) return c.json({ error: "Couple not found" }, 404);
  const token = supportToken();
  await c.env.DB.prepare(
    "INSERT INTO sessions (token, user_id, email, name, expires_at) VALUES (?, ?, ?, ?, NOW() + INTERVAL '12 hours')"
  ).bind(token, w.user_id, w.email, w.name).run();
  setCookie(c, SUPPORT_COOKIE_NAME, token, { ...COOKIE2, maxAge: 12 * 60 * 60 });
  console.log(`[support] ${c.get("user")?.email} -> wedding ${id} (${w.email})`);
  return c.json({ success: true });
});
r18.get("/api/support/context", async (c) => {
  const token = getCookie(c, SUPPORT_COOKIE_NAME);
  if (!token) return c.json({ impersonating: false });
  const s = await c.env.DB.prepare(
    "SELECT user_id, name FROM sessions WHERE token = ? AND expires_at > NOW()"
  ).bind(token).first();
  if (!s) return c.json({ impersonating: false });
  const w = await c.env.DB.prepare(
    "SELECT partner1_name, partner2_name, custom_url FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(s.user_id).first();
  return c.json({
    impersonating: true,
    account: s.name,
    couple: w ? `${w.partner1_name ?? ""} & ${w.partner2_name ?? ""}`.replace(/^ & | & $/g, "").trim() || s.name : s.name,
    customUrl: w?.custom_url ?? null
  });
});
r18.post("/api/support/stop", async (c) => {
  const token = getCookie(c, SUPPORT_COOKIE_NAME);
  if (token) await c.env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  setCookie(c, SUPPORT_COOKIE_NAME, "", { ...COOKIE2, maxAge: 0 });
  return c.json({ success: true });
});
var support_default = r18;

// src/worker/routes/gift-templates.ts
var r19 = new Hono2();
r19.get("/api/admin/gift-list-types", adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT glt.*, 
      (SELECT COUNT(*) FROM gift_templates WHERE list_type_id = glt.id) as item_count
    FROM gift_list_types glt
    ORDER BY glt.sort_order, glt.id
  `).all();
  return c.json({ listTypes: results || [] });
});
r19.post("/api/admin/gift-list-types", adminMiddleware, async (c) => {
  const body = await c.req.json();
  const { name, description } = body;
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const maxOrder = await c.env.DB.prepare(
    "SELECT MAX(sort_order) as max FROM gift_list_types"
  ).first();
  const result = await c.env.DB.prepare(`
    INSERT INTO gift_list_types (name, slug, description, sort_order)
    VALUES (?, ?, ?, ?)
  `).bind(name, slug, description || null, (maxOrder?.max || 0) + 1).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r19.put("/api/admin/gift-list-types/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, description, is_active } = body;
  await c.env.DB.prepare(`
    UPDATE gift_list_types 
    SET name = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(name, description || null, is_active ? true : false, id).run();
  return c.json({ success: true });
});
r19.delete("/api/admin/gift-list-types/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM gift_templates WHERE list_type_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM gift_template_categories WHERE list_type_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM gift_list_types WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});
r19.get("/api/admin/gift-list-types/:id/templates", adminMiddleware, async (c) => {
  const listTypeId = c.req.param("id");
  const { results: templates } = await c.env.DB.prepare(`
    SELECT * FROM gift_templates WHERE list_type_id = ? ORDER BY sort_order, id
  `).bind(listTypeId).all();
  const { results: categories } = await c.env.DB.prepare(`
    SELECT * FROM gift_template_categories WHERE list_type_id = ? ORDER BY sort_order, id
  `).bind(listTypeId).all();
  return c.json({ templates: templates || [], categories: categories || [] });
});
r19.post("/api/admin/gift-templates", adminMiddleware, async (c) => {
  const body = await c.req.json();
  const { list_type_id, name, description, price, category, image_url } = body;
  const maxOrder = await c.env.DB.prepare(
    "SELECT MAX(sort_order) as max FROM gift_templates WHERE list_type_id = ?"
  ).bind(list_type_id).first();
  const result = await c.env.DB.prepare(`
    INSERT INTO gift_templates (list_type_id, name, description, price, category, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    list_type_id,
    name,
    description || null,
    price || 0,
    category || null,
    image_url || null,
    (maxOrder?.max || 0) + 1
  ).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r19.put("/api/admin/gift-templates/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, description, price, category, image_url, is_active, sort_order } = body;
  await c.env.DB.prepare(`
    UPDATE gift_templates 
    SET name = ?, description = ?, price = ?, category = ?, image_url = ?, 
        is_active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    name,
    description || null,
    price || 0,
    category || null,
    image_url || null,
    is_active !== void 0 ? is_active ? true : false : 1,
    sort_order || 0,
    id
  ).run();
  return c.json({ success: true });
});
r19.delete("/api/admin/gift-templates/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM gift_templates WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});
r19.get("/api/admin/gift-list-types/:id/categories", adminMiddleware, async (c) => {
  const listTypeId = c.req.param("id");
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM gift_template_categories WHERE list_type_id = ? ORDER BY sort_order, id
  `).bind(listTypeId).all();
  return c.json({ categories: results || [] });
});
r19.post("/api/admin/gift-categories", adminMiddleware, async (c) => {
  const body = await c.req.json();
  const { list_type_id, name, color_class } = body;
  const maxOrder = await c.env.DB.prepare(
    "SELECT MAX(sort_order) as max FROM gift_template_categories WHERE list_type_id = ?"
  ).bind(list_type_id).first();
  const result = await c.env.DB.prepare(`
    INSERT INTO gift_template_categories (list_type_id, name, color_class, sort_order)
    VALUES (?, ?, ?, ?)
  `).bind(list_type_id, name, color_class || "bg-gray-100 text-gray-700", (maxOrder?.max || 0) + 1).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r19.put("/api/admin/gift-categories/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, color_class, sort_order } = body;
  await c.env.DB.prepare(`
    UPDATE gift_template_categories 
    SET name = ?, color_class = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(name, color_class || "bg-gray-100 text-gray-700", sort_order || 0, id).run();
  return c.json({ success: true });
});
r19.delete("/api/admin/gift-categories/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM gift_template_categories WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});
r19.get("/api/public/gift-templates", async (c) => {
  const { results: listTypes } = await c.env.DB.prepare(`
    SELECT id, name, slug, description FROM gift_list_types 
    WHERE is_active = TRUE ORDER BY sort_order, id
  `).all();
  const result = [];
  for (const lt of listTypes || []) {
    const { results: templates } = await c.env.DB.prepare(`
      SELECT id, name, description, price, category, image_url 
      FROM gift_templates WHERE list_type_id = ? AND is_active = TRUE 
      ORDER BY sort_order, id
    `).bind(lt.id).all();
    const { results: categories } = await c.env.DB.prepare(`
      SELECT id, name, color_class FROM gift_template_categories 
      WHERE list_type_id = ? ORDER BY sort_order, id
    `).bind(lt.id).all();
    result.push({
      ...lt,
      templates: templates || [],
      categories: categories || []
    });
  }
  return c.json({ listTypes: result });
});
r19.get("/api/public/gift-templates/:listId", async (c) => {
  const listId = c.req.param("listId");
  const { results: templates } = await c.env.DB.prepare(`
    SELECT id, name, description, price, category, image_url 
    FROM gift_templates WHERE list_type_id = ? AND is_active = TRUE 
    ORDER BY sort_order, id
  `).bind(listId).all();
  const { results: categories } = await c.env.DB.prepare(`
    SELECT id, name, color_class FROM gift_template_categories 
    WHERE list_type_id = ? ORDER BY sort_order, id
  `).bind(listId).all();
  return c.json({ templates: templates || [], categories: categories || [] });
});
var gift_templates_default = r19;

// src/worker/routes/godparents.ts
var r20 = new Hono2();
r20.get("/api/godparents", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json([]);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_godparents WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();
  return c.json(results);
});
r20.post("/api/godparents", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_godparents (wedding_id, name, role, description, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    wedding.id,
    body.name,
    body.role,
    body.description,
    body.image_url,
    body.sort_order || 0
  ).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r20.put("/api/godparents/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  const res = await c.env.DB.prepare(`
    UPDATE wedding_godparents SET
      name = ?, role = ?, description = ?, image_url = ?, sort_order = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(
    body.name,
    body.role,
    body.description,
    body.image_url,
    body.sort_order || 0,
    id,
    weddingId
  ).run();
  if (!res.meta.changes) return c.json({ error: "Godparent not found" }, 404);
  return c.json({ success: true });
});
r20.delete("/api/godparents/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "DELETE FROM wedding_godparents WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Godparent not found" }, 404);
  return c.json({ success: true });
});
r20.get("/api/public/wedding/:customUrl/godparents", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, role, description, image_url, sort_order FROM wedding_godparents WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();
  return c.json({ godparents: results || [] });
});
var godparents_default = r20;

// src/worker/routes/parents.ts
var r21 = new Hono2();
r21.get("/api/parents", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json([]);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_parents WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();
  return c.json(results);
});
r21.post("/api/parents", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_parents (wedding_id, name, role, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    wedding.id,
    body.name,
    body.role,
    body.image_url,
    body.sort_order || 0
  ).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r21.put("/api/parents/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  const res = await c.env.DB.prepare(`
    UPDATE wedding_parents SET
      name = ?, role = ?, image_url = ?, sort_order = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(
    body.name,
    body.role,
    body.image_url,
    body.sort_order || 0,
    id,
    weddingId
  ).run();
  if (!res.meta.changes) return c.json({ error: "Parent not found" }, 404);
  return c.json({ success: true });
});
r21.delete("/api/parents/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "DELETE FROM wedding_parents WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Parent not found" }, 404);
  return c.json({ success: true });
});
r21.get("/api/public/wedding/:customUrl/parents", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, role, image_url, sort_order FROM wedding_parents WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();
  return c.json({ parents: results || [] });
});
var parents_default = r21;

// src/worker/routes/accommodations.ts
var r22 = new Hono2();
r22.get("/api/accommodations", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json([]);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_accommodations WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();
  return c.json(results);
});
r22.post("/api/accommodations", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_accommodations (wedding_id, name, description, address, phone, website, price_range, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    wedding.id,
    body.name,
    body.description,
    body.address,
    body.phone,
    body.website,
    body.price_range,
    body.image_url,
    body.sort_order || 0
  ).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r22.put("/api/accommodations/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  const res = await c.env.DB.prepare(`
    UPDATE wedding_accommodations SET
      name = ?, description = ?, address = ?, phone = ?, website = ?,
      price_range = ?, image_url = ?, sort_order = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(
    body.name,
    body.description,
    body.address,
    body.phone,
    body.website,
    body.price_range,
    body.image_url,
    body.sort_order || 0,
    id,
    weddingId
  ).run();
  if (!res.meta.changes) return c.json({ error: "Accommodation not found" }, 404);
  return c.json({ success: true });
});
r22.delete("/api/accommodations/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "DELETE FROM wedding_accommodations WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Accommodation not found" }, 404);
  return c.json({ success: true });
});
r22.get("/api/public/wedding/:customUrl/accommodations", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, description, address, phone, website, price_range, image_url, sort_order FROM wedding_accommodations WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();
  return c.json({ accommodations: results || [] });
});
var accommodations_default = r22;

// src/worker/routes/contributions.ts
var r23 = new Hono2();
r23.get("/api/contributions", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json([]);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM pix_contributions WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  return c.json(results || []);
});
r23.put("/api/contributions/:id/confirm", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(`
    UPDATE pix_contributions
    SET payment_status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Contribution not found" }, 404);
  return c.json({ success: true });
});
r23.delete("/api/contributions/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "DELETE FROM pix_contributions WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Contribution not found" }, 404);
  return c.json({ success: true });
});
r23.get("/api/public/wedding/:customUrl/contributions", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  if (!wedding) return c.json({ contributions: [] });
  const { results } = await c.env.DB.prepare(`
    SELECT contributor_name, amount, message, is_anonymous, created_at
    FROM pix_contributions 
    WHERE wedding_id = ? AND payment_status = 'paid'
    ORDER BY created_at DESC
  `).bind(wedding.id).all();
  return c.json({ contributions: results || [] });
});
r23.post("/api/public/wedding/:customUrl/contributions", async (c) => {
  const customUrl = c.req.param("customUrl");
  const body = await c.req.json();
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  const result = await c.env.DB.prepare(`
    INSERT INTO pix_contributions (wedding_id, contributor_name, amount, message, is_anonymous, payment_status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).bind(
    wedding.id,
    body.contributor_name,
    body.amount,
    body.message || null,
    body.is_anonymous ? true : false
  ).run();
  return c.json({ success: true, id: result.meta.last_row_id });
});
r23.post("/api/public/gift-order", async (c) => {
  const body = await c.req.json();
  if (!body.wedding_id || !body.gift_id || !body.guest_name) {
    return c.json({ error: "Missing required fields" }, 400);
  }
  const amount = Number(body.amount) || 0;
  const cardPrice = Number(body.card_price) || 0;
  const split = await computeSplit(c, amount, cardPrice, !!body.apply_maintenance_fee);
  const checkoutRef = body.checkout_ref ? String(body.checkout_ref) : null;
  const common = [
    body.wedding_id,
    body.gift_id,
    body.guest_name,
    body.guest_email || null,
    amount,
    body.message || null,
    body.card_type || "gratis",
    body.card_sender_name || body.guest_name,
    body.card_message || null,
    cardPrice,
    checkoutRef
  ];
  let id;
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO gift_orders (
        wedding_id, gift_id, guest_name, guest_email, amount, message,
        card_type, card_sender_name, card_message, card_price, pix_transaction_id,
        maintenance_fee, commission_pct, commission_amount, platform_amount, couple_amount,
        payment_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      ...common,
      split.maintenance_fee,
      split.commission_pct,
      split.commission_amount,
      split.platform_amount,
      split.couple_amount
    ).run();
    id = result.meta.last_row_id;
  } catch {
    const result = await c.env.DB.prepare(`
      INSERT INTO gift_orders (
        wedding_id, gift_id, guest_name, guest_email, amount, message,
        card_type, card_sender_name, card_message, card_price, pix_transaction_id,
        payment_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(...common).run();
    id = result.meta.last_row_id;
  }
  return c.json({ success: true, id });
});
var contributions_default = r23;

// src/worker/routes/guest-photos.ts
var r24 = new Hono2();
r24.get("/api/public/wedding/:customUrl/guest-photos", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  const { results } = await c.env.DB.prepare(`
    SELECT id, guest_name, filename, storage_key, caption, created_at
    FROM guest_photos 
    WHERE wedding_id = ? AND is_approved = TRUE
    ORDER BY created_at DESC
  `).bind(wedding.id).all();
  return c.json({ photos: results });
});
r24.post("/api/public/wedding/:customUrl/guest-photos", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ? AND is_published = TRUE"
  ).bind(customUrl).first();
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  const formData = await c.req.formData();
  const guestName = formData.get("guest_name");
  const file = formData.get("file");
  const caption = formData.get("caption");
  if (!guestName || guestName.trim() === "") {
    return c.json({ error: "Guest name is required" }, 400);
  }
  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: "Invalid file type. Only JPEG, PNG, WebP and GIF allowed." }, 400);
  }
  if (file.size > 10 * 1024 * 1024) {
    return c.json({ error: "File too large. Maximum 10MB." }, 400);
  }
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const storageKey = `weddings/${wedding.id}/guest-photos/${timestamp}-${randomId}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  await c.env.DB.prepare(
    "INSERT INTO files (key, data, content_type, size) VALUES (?, ?, ?, ?)"
  ).bind(storageKey, base64, file.type, file.size).run();
  const result = await c.env.DB.prepare(`
    INSERT INTO guest_photos (wedding_id, guest_name, filename, storage_key, caption, is_approved)
    VALUES (?, ?, ?, ?, ?, NULL)
  `).bind(wedding.id, guestName.trim(), file.name, storageKey, caption || null).run();
  return c.json({
    success: true,
    id: result.meta.last_row_id,
    filename: file.name
  });
});
r24.get("/api/guest-photos", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json({ photos: [] });
  const { results } = await c.env.DB.prepare(`
    SELECT id, guest_name, filename, storage_key, caption, is_approved, created_at
    FROM guest_photos 
    WHERE wedding_id = ?
    ORDER BY created_at DESC
  `).bind(wedding.id).all();
  return c.json({ photos: results });
});
r24.put("/api/guest-photos/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const body = await c.req.json();
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  const photo = await c.env.DB.prepare(
    "SELECT id FROM guest_photos WHERE id = ? AND wedding_id = ?"
  ).bind(id, wedding.id).first();
  if (!photo) return c.json({ error: "Photo not found" }, 404);
  await c.env.DB.prepare(`
    UPDATE guest_photos SET is_approved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(body.is_approved, id).run();
  return c.json({ success: true });
});
r24.delete("/api/guest-photos/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  const photo = await c.env.DB.prepare(
    "SELECT storage_key FROM guest_photos WHERE id = ? AND wedding_id = ?"
  ).bind(id, wedding.id).first();
  if (!photo) return c.json({ error: "Photo not found" }, 404);
  await c.env.DB.prepare("DELETE FROM files WHERE key = ?").bind(photo.storage_key).run();
  await c.env.DB.prepare("DELETE FROM guest_photos WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});
var guest_photos_default = r24;

// src/worker/routes/dashboard.ts
var r25 = new Hono2();
r25.get("/api/dashboard/stats", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first();
  if (!wedding) {
    return c.json({
      totalGuests: 0,
      confirmedGuests: 0,
      totalGifts: 0,
      totalMessages: 0,
      totalAmount: 0
    });
  }
  const guestsCount = await c.env.DB.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN is_confirmed = TRUE OR rsvp_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed
    FROM guests WHERE wedding_id = ?
  `).bind(wedding.id).first();
  const companionsCount = await c.env.DB.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN gc.is_confirmed = TRUE AND g.is_confirmed = TRUE THEN 1 ELSE 0 END) as confirmed
    FROM guest_companions gc
    INNER JOIN guests g ON gc.guest_id = g.id
    WHERE g.wedding_id = ?
  `).bind(wedding.id).first();
  const guestsStats = {
    total: (guestsCount?.total || 0) + (companionsCount?.total || 0),
    confirmed: (guestsCount?.confirmed || 0) + (companionsCount?.confirmed || 0)
  };
  const giftsCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM wedding_gifts WHERE wedding_id = ?"
  ).bind(wedding.id).first();
  const messagesCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM guest_messages WHERE wedding_id = ?"
  ).bind(wedding.id).first();
  const totalAmount = await sumOrders(
    c,
    "couple_amount",
    "wedding_id = ? AND payment_status = 'paid'",
    [wedding.id],
    "amount"
  );
  return c.json({
    totalGuests: guestsStats?.total || 0,
    confirmedGuests: guestsStats?.confirmed || 0,
    totalGifts: giftsCount?.count || 0,
    totalMessages: messagesCount?.count || 0,
    totalAmount
  });
});
var dashboard_default = r25;

// src/worker/routes/webhooks.ts
var r26 = new Hono2();
async function markPaid(db, key) {
  await db.prepare(
    `UPDATE gift_orders
         SET payment_status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE pix_transaction_id = ? AND payment_status <> 'paid'`
  ).bind(key).run();
  try {
    await db.prepare(
      "UPDATE gift_orders SET couple_amount = amount WHERE pix_transaction_id = ? AND (couple_amount IS NULL OR couple_amount = 0)"
    ).bind(key).run();
  } catch {
  }
}
r26.post("/api/webhooks/validapay", async (c) => {
  const raw2 = await c.req.text();
  const sig = c.req.header(WEBHOOK_SIG_HEADER) || c.req.header("X-Webhook-Signature");
  if (!verifyWebhook(raw2, sig)) {
    return c.json({ error: "invalid signature" }, 401);
  }
  let body;
  try {
    body = JSON.parse(raw2);
  } catch {
    return c.json({ error: "invalid body" }, 400);
  }
  const status = normalizeStatus(body.status ?? (body.event === "payment.success" ? "PAID" : ""));
  const key = body?.chargeId || body?.externalTxid || body?.metadata?.checkoutRef;
  if (status === "paid" && key) {
    await markPaid(c.env.DB, String(key));
  }
  return c.json({ received: true });
});
var webhooks_default = r26;

// src/worker/index.ts
var app = new Hono2();
app.use("*", async (c, next) => {
  const neonUrl = c.env?.NEON_DATABASE_URL || process.env.NEON_DATABASE_URL || "";
  if (neonUrl) {
    if (!c.env) c.env = {};
    c.env.DB = new NeonDB(neonUrl);
  }
  await next();
});
app.route("/", auth_default);
app.route("/", og_default);
app.route("/", weddings_default);
app.route("/", guests_default);
app.route("/", tables_default);
app.route("/", tasks_default);
app.route("/", budget_default);
app.route("/", gifts_default);
app.route("/", messages_default);
app.route("/", photos_default);
app.route("/", story_default);
app.route("/", public_wedding_default);
app.route("/", confirm_default);
app.route("/", payments_default);
app.route("/", admin_auth_default);
app.route("/", admin_default);
app.route("/", support_default);
app.route("/", gift_templates_default);
app.route("/", godparents_default);
app.route("/", parents_default);
app.route("/", accommodations_default);
app.route("/", contributions_default);
app.route("/", guest_photos_default);
app.route("/", dashboard_default);
app.route("/", platform_default);
app.route("/", webhooks_default);
var index_default = app;
export {
  index_default as default
};
