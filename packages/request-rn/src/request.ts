/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// React Native and Node (since 18) both ship a global `fetch`, so this package
// no longer needs an HTTP client. The option shape stays the one axios used, so
// that callers of `request` do not have to change.
async function request(options) {
  if (typeof options === 'string') {
    options = {
      url: options,
    };
  }
  const { url, method = 'get', headers, data, params } = options;
  const target = new URL(url);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      target.searchParams.set(key, String(value));
    }
  }
  const init: RequestInit = {
    method: method.toUpperCase(),
    headers: { ...headers },
  };
  if (data !== undefined) {
    if (typeof data === 'string') {
      init.body = data;
    } else {
      init.body = JSON.stringify(data);
      init.headers = { 'Content-Type': 'application/json', ...init.headers };
    }
  }
  const response = await fetch(target, init);
  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Not JSON: hand back the raw text, as axios did.
  }
  if (!response.ok) {
    const error: any = new Error(
      `Request failed with status code ${response.status}`
    );
    error.status = response.status;
    error.data = body;
    throw error;
  }
  return body;
}

export default request;
