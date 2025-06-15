import { assertEquals, assertRejects } from '@std/assert'
import { stub } from '@std/testing/mock'
// テスト対象の関数をインポート
// ファイルから必要な型と関数を取得
import {
  convertToJson,
  createHoliday,
  downloadCsv,
  Holiday,
  parseCsv,
} from '../scripts/convert-csv.ts'

Deno.test('downloadCsv - 正常にCSVをダウンロードできる', async () => {
  const mockCsvData = 'date,name\n2024/1/1,元日'
  const encoder = new TextEncoder()
  const mockBuffer = encoder.encode(mockCsvData)

  const fetchStub = stub(
    globalThis,
    'fetch',
    () =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockBuffer.buffer),
      } as Response),
  )
  try {
    const result = await downloadCsv('https://example/test.csv')
    const decoder = new TextDecoder('shift_jis')
    assertEquals(result, decoder.decode(mockBuffer))
  } finally {
    fetchStub.restore()
  }
})

Deno.test('downloadCsv - HTTPエラー時に例外を投げる', async () => {
  const fetchStub = stub(
    globalThis,
    'fetch',
    () =>
      Promise.resolve({
        ok: false,
        statusText: 'Not Found',
      } as Response),
  )

  try {
    await assertRejects(
      () => downloadCsv('https://example/notfound.csv'),
      Error,
      'Failed to download CSV: Not Found',
    )
  } finally {
    fetchStub.restore()
  }
})

Deno.test('createHoliday - 日付フォーマットが正しく変換される', () => {
  const result = createHoliday('2024/1/1', '元日')
  assertEquals(result.date, '2024-01-01')
  assertEquals(result.name, '元日')
})

Deno.test('createHoliday - 改行文字が除去される', () => {
  const result = createHoliday('2024/1/1', '元日\r\n')
  assertEquals(result.name, '元日')
})

Deno.test('convertToJson - 祝日データがJSONに正しく変換される', () => {
  const holidays: Holiday[] = [
    { date: '2024-01-01', name: '元日' },
    { date: '2024-01-08', name: '成人の日' },
    { date: '2024-12-31', name: '大晦日' },
  ]

  const result = convertToJson(holidays)

  assertEquals(result['2024']['1']['1'], { date: '2024-01-01', name: '元日' })
  assertEquals(result['2024']['1']['8'], {
    date: '2024-01-08',
    name: '成人の日',
  })
  assertEquals(result['2024']['12']['31'], {
    date: '2024-12-31',
    name: '大晦日',
  })
})

Deno.test('parseCsv - CSVデータが正しくパースされる', () => {
  const csvData = `date,name
2024/1/1,元日
2024/1/8,成人の日`

  const result = parseCsv(csvData)

  assertEquals(result.length, 2)
  assertEquals(result[0], { date: '2024-01-01', name: '元日' })
  assertEquals(result[1], { date: '2024-01-08', name: '成人の日' })
})
