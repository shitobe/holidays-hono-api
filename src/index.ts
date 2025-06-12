import { Hono } from '@hono/hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
Deno.serve(app.fetch)
