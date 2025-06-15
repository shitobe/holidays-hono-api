export type Holiday = {
  date: string
  name: string
}

export type HolidayMonth = {
  [day: string]: Holiday
}

export type HolidayYear = {
  [month: string]: HolidayMonth
}

export type HolidayJson = {
  [year: string]: HolidayYear
}
