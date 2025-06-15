import { Hono } from '@hono/hono'
import { cors } from '@hono/hono/cors'
import { logger } from '@hono/hono/logger'
import { cache } from '@hono/hono/cache'
import {
  fileReadCache,
  holidayController,
  holidayDateCache,
  holidayMonthCache,
  holidayYearCache,
} from './controller.ts'
const app = new Hono()

// ミドルウェア設定
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET'],
  }),
)

// Honoのキャッシュミドルウェア（HTTPキャッシュヘッダー）
app.use(
  '/api/ja/*',
  cache({
    cacheName: 'holiday-api',
    cacheControl: 'max-age=3600', // 1時間キャッシュ
  }),
)

const controller = holidayController()

app.get('/', (c) => {
  return c.json({
    message: 'japanese-holidays-api',
    endpoints: {
      '/api/ja': '日本の祝日を表示',
      '/api/ja/:year': '指定した年の祝日を表示',
      '/api/ja/:year/:month': '指定した年と月の祝日を表示',
      '/api/ja/:year/:month/:day': '指定した年、月、日の祝日を表示',
    },
  })
})

app.get('/api/ja', async (c) => {
  c.header('X-Cache-Status', fileReadCache.size > 0 ? 'HIT' : 'MISS')
  const holidays = await controller.getHolidays()
  return c.json({
    holidays,
    length: holidays.length,
  })
})

app.get('/api/ja/:year', async (c) => {
  c.header('X-Cache-Status', holidayYearCache.size > 0 ? 'HIT' : 'MISS')
  const year = c.req.param('year')
  const holidays = await controller.getHolidaysByYear(year)
  return c.json({
    holidays,
    length: holidays.length,
  })
})

app.get('/api/ja/:year/:month', async (c) => {
  c.header('X-Cache-Status', holidayMonthCache.size > 0 ? 'HIT' : 'MISS')
  const { year, month } = c.req.param()
  const holidays = await controller.getHolidaysByMonth(year, month)
  return c.json({
    holidays,
    length: holidays.length,
  })
})

app.get('/api/ja/:year/:month/:day', async (c) => {
  c.header('X-Cache-Status', holidayDateCache.size > 0 ? 'HIT' : 'MISS')
  const { year, month, day } = c.req.param()
  const holidays = await controller.getHolidaysByDate(year, month, day)
  return c.json({
    holidays,
    length: holidays.length,
  })
})

app.get('/api/cache/status', (c) => {
  const cacheStatus = {
    fileReadCache: fileReadCache.size,
    holidayYearCache: holidayYearCache.size,
    holidayMonthCache: holidayMonthCache.size,
    holidayDateCache: holidayDateCache.size,
  }
  return c.json({
    status: cacheStatus,
    timestamp: new Date().toISOString(),
  })
})

Deno.serve(app.fetch)
