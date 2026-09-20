import http from 'http';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

function request(options) {
  if (typeof options === 'string') {
    options = {
      url: options,
    };
  }
  let client;
  if (options.url) {
    client = options.url.startsWith('http:') ? http : https;
    const requrl = new URL(options.url);
    options.host = requrl.hostname;
    options.port = requrl.port;
    if (!options.port) {
      options.port = options.url.startsWith('http:') ? 80 : 443;
    }
    options.path = `${requrl.pathname}${requrl.search}`;
    delete options.url;
  }
  if (!client) {
    client = options.port === 80 ? http : https;
  }
  let { postData } = options;
  if (postData) {
    if (typeof postData !== 'string') {
      postData = new URLSearchParams(postData).toString();
    }
    delete options.postData;
    if (!options.headers) {
      options.headers = {};
    }
    if (!options.headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    if (!options.headers['Content-Length']) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
  }
  if (!options.method) {
    options.method = 'GET';
  }
  /*
   * Node 24 reads the proxy environment variables itself when
   * `NODE_USE_ENV_PROXY=1`, which makes both proxy-agent dependencies and the
   * block below redundant. The engine floor is Node 22.12, so they stay until
   * it moves; drop them and the two dependencies at that point.
   */
  const proxyServer =
    options.proxy ||
    process.env.https_proxy ||
    process.env.HTTPS_PROXY ||
    process.env.http_proxy ||
    process.env.HTTP_PROXY;
  if (proxyServer) {
    delete options.proxy;
    if (client === https) {
      options.agent = new HttpsProxyAgent(proxyServer);
    } else {
      options.agent = new HttpProxyAgent(proxyServer);
    }
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['Proxy-Connections'] = 'keep-alive';
  }

  return new Promise((resolve, reject) => {
    const req = client.request(options, (res) => {
      let result = '';
      res.on('data', (chunk) => {
        result += chunk;
      });
      res.on('end', () => {
        try {
          const obj = JSON.parse(result);
          resolve(obj);
        } catch {
          resolve(result);
        }
      });
      res.on('error', (err) => reject(err));
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

export default request;
