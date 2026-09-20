import type { RequestOptions as HttpRequestOptions } from 'http';

/** Types of the request helper: what it is given and what it answers. */

/**
 * Options of one request: what `http.request` takes, with a full `url` in
 * place of host, port and path, and a body to post.
 */
export interface RequestOptions extends HttpRequestOptions {
  /** Full url; split into host, port and path before the request is made. */
  url?: string;
  /** Body of a form post: a string, or the fields to encode into one. */
  postData?: string | Record<string, string>;
  /** Proxy to go through; without one the environment is read. */
  proxy?: string;
}

/**
 * Answer of a request: the parsed JSON body, or the body as it came when it
 * is not JSON. What a service answers is the caller's to know.
 */
export type RequestResult = unknown;
