const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const DAY_MS = 24 * 60 * 60 * 1000

/** getUTCDay() の値(0 = 日曜)に対応する英語の曜日名 */
export const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

/** getUTCDay() の値(0 = 日曜)に対応する日本語の曜日名 */
export const JAPANESE_WEEKDAYS = '日月火水木金土'

/**
 * UTC のミリ秒を 'YYYY-MM-DD' に変換する。
 * @param {number} time
 * @returns {string}
 */
export function formatDate(time) {
  return new Date(time).toISOString().slice(0, 10)
}

/**
 * 'YYYY-MM-DD' を、その日の UTC 0 時のミリ秒に変換する。
 * タイムゾーンや夏時間の影響を避けるため、日付の計算はすべて UTC で行う。
 * @param {string} text
 * @returns {number}
 */
export function parseDate(text) {
  const match = typeof text === 'string' ? DATE_PATTERN.exec(text) : null
  if (!match) {
    throw new TypeError(
      `日付は YYYY-MM-DD の形式で指定してください: ${String(text)}`,
    )
  }
  const [year, month, day] = match.slice(1).map(Number)
  const time = Date.UTC(year, month - 1, day)
  if (formatDate(time) !== text) {
    throw new RangeError(`存在しない日付です: ${text}`)
  }
  return time
}

/** @param {number} time @param {number} days */
export function addDays(time, days) {
  return time + days * DAY_MS
}

/** 0(日曜)〜6(土曜) */
export function weekdayOf(time) {
  return new Date(time).getUTCDay()
}

/** start から end までの日数の差(同じ日なら 0) */
export function daysBetween(start, end) {
  return Math.round((end - start) / DAY_MS)
}

/**
 * 実行している環境のタイムゾーンでの「今日」を 'YYYY-MM-DD' で返す。
 * @param {Date} [now]
 */
export function todayLocal(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
