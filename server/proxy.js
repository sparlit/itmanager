// Minimal, dependency-free reverse proxy to route /customer to 3003 and /internal to 3004
const http = require('http')
const { URL } = require('url')

const forward = (req, res, target) => {
  const url = new URL(req.url, target)
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: req.method,
    headers: req.headers
  }
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res, { end: true })
  })
  req.pipe(proxyReq, { end: true })
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/customer/')) {
    const path = req.url.replace('/customer', '') || '/'
    req.url = path
    forward(req, res, 'http://localhost:3003')
  } else if (req.url.startsWith('/internal/')) {
    const path = req.url.replace('/internal', '') || '/'
    req.url = path
    forward(req, res, 'http://localhost:3004')
  } else if (req.url === '/' || req.url === '') {
    res.writeHead(302, { Location: '/customer/' })
    res.end()
  } else {
    res.statusCode = 404
    res.end('Not found. Use /customer or /internal paths.')
  }
})

server.listen(3000, () => {
  console.log('Proxy listening on http://localhost:3000')
})
