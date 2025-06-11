import { parse } from "@std/csv/parse"

type Holiday = {
  date: string
  name: string
}

type HolidayJson = {
  [year: string]: {
    [month: string]: {
      [day: string]: Holiday
    }
  }
}

const createHoliday = (date: string, name:string): Holiday => {
  const [ y, m, d ] = date.split('/')
  return {
    // 人間が見やすいように 2桁の月と日をゼロ埋め
    date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    name: name.replace(/[\r\n]/g, "").trim(),
  }
}

const convertToJson = (dates: Holiday[]): HolidayJson => {
  const holidays: HolidayJson = {}
  for (const d of dates) {
    const [ year, month, day ] = d.date.split('-')
    // 月と日を整数に変換 ゼロ埋めは不要
    const _month = parseInt(month, 10)
    const _day = parseInt(day, 10)

    if (!holidays[year]) {
      holidays[year] = {}
    }
    if (!holidays[year][_month]) {
      holidays[year][_month] = {}
    }
    holidays[year][_month][_day] = d
  }
  return holidays
}

async function downloadCsv(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download CSV: ${response.statusText}`)
  }
  const buffer = await response.arrayBuffer()
  const decoder = new TextDecoder("shift_jis")
  return decoder.decode(buffer)
}

function parseCsv(csvData: string): Holiday[] {
  // CSVをパース
  const records = parse(csvData, {
    skipFirstRow: true,
    columns: ["date", "name"]
  }) as Holiday[]

  // csvの各行をHolidayオブジェクトに変換
  return records.map((record) => {
    return createHoliday(record["date"], record["name"])
  })
}

async function main() {
  try {
    console.log("祝日CSVをダウンロードしています...")
    const url = "https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv"
    const csvData = await downloadCsv(url)
    console.log("CSVのダウンロードが完了しました。JSONを作成します...")
    const holidaysJson = convertToJson(parseCsv(csvData))
    const jsonContent = JSON.stringify(holidaysJson, null, 2)
    await Deno.writeTextFile("./src/json/holidays.json", jsonContent)
    console.log("holidays.jsonを作成しました");
  } catch (error) {
    console.error("エラーが発生しました:", error)
  }
}

if (import.meta.main) {
  main()
}
