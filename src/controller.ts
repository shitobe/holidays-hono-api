import type {
  Holiday,
  HolidayJson,
  HolidayMonth,
  HolidayYear,
} from './type.ts'

// 型ガード関数のセット
function isHoliday(value: any): value is Holiday {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.date === 'string' &&
    typeof value.name === 'string'
  )
}

const getHolidaysJson = async (): Promise<HolidayJson> => {
  try {
    const text = await Deno.readTextFile('./src/store/holidays.json')
    return JSON.parse(text)
  } catch (e) {
    console.error('Error reading holidays.json:', e)
    return {}
  }
}

const flattenJson = (
  json: HolidayJson | Holiday | HolidayYear | HolidayMonth,
): Holiday[] => {
  const result: Holiday[] = []
  function _flatten(
    obj: HolidayJson | Holiday | HolidayYear | HolidayMonth,
  ): void {
    if (isHoliday(obj)) {
      result.push(obj)
      return
    }

    for (const value of Object.values(obj)) {
      _flatten(value)
    }
  }
  _flatten(json)
  return result
}

export const holidayController = () => {
  const isValidateYear = (year: string | number): boolean => {
    // 年が文字列である場合、数値に変換
    if (typeof year !== 'number') {
      year = parseInt(year, 10)
    }
    // 年が数値であり、1955年以降であることを確認
    return !(isNaN(year) || year < 1955)
  }
  const isValidateMonth = (month: string | number): boolean => {
    // 月が文字列である場合、数値に変換
    if (typeof month !== 'number') {
      month = parseInt(month, 10)
    }
    // 月が数値であり、1から12の範囲内であることを確認
    return !(isNaN(month) || month < 1 || month > 12)
  }
  const isValidateDay = (day: string | number): boolean => {
    // 日が文字列である場合、数値に変換
    if (typeof day !== 'number') {
      day = parseInt(day, 10)
    }
    // 日が数値であり、1から31の範囲内であることを確認
    // ただし、月によっては31日が存在しない場合もあるため、ここでは簡易的なチェックのみを行う
    return !(isNaN(day) || day < 1 || day > 31)
  }

  const getHolidays = async (): Promise<Holiday[]> => {
    console.log('Getting all holidays...')
    const holidaysJson = await getHolidaysJson()
    if (!holidaysJson) {
      console.error('Holidays JSON is not available')
      return []
    }
    return flattenJson(holidaysJson)
  }

  const getHolidaysByYear = async (year: string): Promise<Holiday[]> => {
    console.log('Getting holidays for year:', year)

    if (!isValidateYear(year)) {
      throw new Error(`Invalid year: ${year}`)
    }

    const holidaysJson = await getHolidaysJson()
    if (!holidaysJson || !holidaysJson[year]) {
      console.error(
        'Holidays JSON is not available and no holidays found for year:',
        year,
      )
      return []
    }
    return flattenJson(holidaysJson[year])
  }
  const getHolidaysByMonth = async (
    year: string,
    month: string,
  ): Promise<Holiday[]> => {
    console.log('Getting holidays for year/month:', year, month)

    if (!isValidateYear(year)) {
      throw new Error(`Invalid year: ${year}`)
    }
    if (!isValidateMonth(month)) {
      throw new Error(`Invalid month: ${month}`)
    }

    const holidaysJson = await getHolidaysJson()
    if (!holidaysJson || !holidaysJson[year][month]) {
      console.error(
        'Holidays JSON is not available and no holidays found for year/month:',
        year,
        month,
      )
      return []
    }
    return flattenJson(holidaysJson[year][month])
  }
  const getHolidaysByDate = async (
    year: string,
    month: string,
    day: string,
  ): Promise<Holiday[]> => {
    console.log('Getting holidays for year/month/day:', year, month, day)
    if (!isValidateYear(year)) {
      throw new Error(`Invalid year: ${year}`)
    }
    if (!isValidateMonth(month)) {
      throw new Error(`Invalid month: ${month}`)
    }
    const monthOfLastDate = new Date(parseInt(year), parseInt(month), 0)
      .getDate()
    if (!isValidateDay(day) || parseInt(day) > monthOfLastDate) {
      throw new Error(`Invalid day: ${day}`)
    }

    const holidaysJson = await getHolidaysJson()
    if (!holidaysJson || !holidaysJson[year][month][day]) {
      console.error(
        'Holidays JSON is not available and no holidays found for year/month/day:',
        year,
        month,
        day,
      )
      return []
    }
    return flattenJson(holidaysJson[year][month][day])
  }

  return {
    getHolidays,
    getHolidaysByYear,
    getHolidaysByMonth,
    getHolidaysByDate,
    isValidateYear,
    isValidateMonth,
    isValidateDay,
  }
}
