import { Hono } from '@hono/hono'
import { cors } from '@hono/hono/cors'
import { logger } from '@hono/hono/logger'
import { holidayController } from './controller.ts'
import { appendTrailingSlash } from '@hono/hono/trailing-slash'
import { secureHeaders } from '@hono/hono/secure-headers'

const app = new Hono()

// ミドルウェア設定
app.use(logger())
app.use(appendTrailingSlash())
app.use(
  '*',
  secureHeaders({
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
    xContentTypeOptions: 'nosniff',
    // 不要なものを無効化
    xFrameOptions: false,
    xXssProtection: false,
  }),
)
app.use(
  cors({
    origin: '*',
    allowMethods: ['GET'],
    allowHeaders: ['Content-Type'],
    credentials: true,
    maxAge: 86400,
  }),
)
app.use('*', async (c, next) => {
  await next()
  c.header('Content-Type', 'application/json; charset=utf-8')
})

const controller = holidayController()

app.get('/', (c) => {
  return c.json({
    message: 'japanese-holidays-api',
    endpoints: {
      '/api/ja/': '日本の祝日を表示',
      '/api/ja/:year': '指定した年の祝日を表示',
      '/api/ja/:year/:month': '指定した年と月の祝日を表示',
      '/api/ja/:year/:month/:day': '指定した年、月、日の祝日を表示',
    },
  })
})

app.get('/api/ja/', async (c) => {
  const holidays = await controller.getHolidays()
  return c.json({
    holidays,
    length: holidays.length,
  })
})

app.get('/api/ja/:year/', async (c) => {
  const year = c.req.param('year')
  const holidays = await controller.getHolidaysByYear(year)
  return c.json({
    holidays,
    length: holidays.length,
  })
})

app.get('/api/ja/:year/:month/', async (c) => {
  const { year, month } = c.req.param()
  const holidays = await controller.getHolidaysByMonth(year, month)
  return c.json({
    holidays,
    length: holidays.length,
  })
})

app.get('/api/ja/:year/:month/:day/', async (c) => {
  const { year, month, day } = c.req.param()
  const holidays = await controller.getHolidaysByDate(year, month, day)
  return c.json({
    holidays,
    length: holidays.length,
  })
})

export { app }
