export function queryTostring<T extends Record<string, any>>(
  params: T
): string {
  const text = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");

  return `?${text}`;
}

export function queryParse<T extends Record<string, any>>(
  queryString: string
): T {
  const query = queryString.startsWith("?")
    ? queryString.slice(1)
    : queryString;

  return query.split("&").reduce((acc, param) => {
    const [key, value] = param.split("=").map(decodeURIComponent);
    return { ...acc, [key]: value };
  }, {} as T);
}
