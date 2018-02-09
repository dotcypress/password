const { createServer } = require('http')
const url = require('url')
const next = require('next')
const { join } = require('path')

const app = next({ dev: process.env.NODE_ENV !== 'production' })
app.prepare().then(() => startServer(app))
  const handle = app.getRequestHandler()

function startServer(app) {
  createServer((req, res) => {
    const parsedUrl = url.parse(req.url)
    const { pathname } = parsedUrl
    if (pathname === '/service-worker.js') {
      const filePath = join(__dirname, '.next', pathname)
      app.serveStatic(req, res, filePath)
    } else {
      handle(req, res, parsedUrl)
    }
  }).listen(process.env.PORT || 3000)
}