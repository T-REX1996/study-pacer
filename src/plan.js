import {
  JAPANESE_WEEKDAYS,
  WEEKDAY_KEYS,
  addDays,
  daysBetween,
  formatDate,
  parseDate,
  weekdayOf,
} from './date.js'

/** 計画できる期間の上限(日数)。極端に長い期間で止まらないようにする */
const MAX_DAYS = 3660

/**
 * 休みの曜日の指定を 0(日曜)〜6(土曜) に変換する。
 * 'sun' や '日' のような文字列も、0〜6 の数値も受け付ける。
 */
function parseWeekday(value) {
  if (Number.isInteger(value) && value >= 0 && value <= 6) {
    return value
  }
  if (typeof value === 'string') {
    const byKey = WEEKDAY_KEYS.indexOf(value.trim().toLowerCase())
    if (byKey !== -1) {
      return byKey
    }
    const byJapanese =
      value.length === 1 ? JAPANESE_WEEKDAYS.indexOf(value) : -1
    if (byJapanese !== -1) {
      return byJapanese
    }
  }
  throw new TypeError(`休みの曜日を認識できません: ${String(value)}`)
}

function assertInteger(label, value, min) {
  if (!Number.isInteger(value) || value < min) {
    throw new RangeError(
      `${label}は${min}以上の整数で指定してください: ${String(value)}`,
    )
  }
}

/**
 * 総ページ数を、締め切りまでの勉強する日に振り分ける。
 *
 * - 休みの曜日・休みの日付には 0 ページを割り当てる。
 * - 割り切れないときは、前半の日に 1 ページずつ多く割り当てる。
 * - 締め切り日も勉強する日に含める。
 * - 途中から計画を立て直すときは、startDate に今日を、donePages に
 *   ここまでに終えたページ数を渡す。
 *
 * @param {object} options
 * @param {number} options.totalPages 総ページ数
 * @param {string} options.startDate 開始日 (YYYY-MM-DD)
 * @param {string} options.deadline 締め切り日 (YYYY-MM-DD)
 * @param {Array<string|number>} [options.restWeekdays] 休みの曜日
 * @param {string[]} [options.restDates] 休みの日付 (YYYY-MM-DD)
 * @param {number} [options.donePages] 終えたページ数
 */
export function planStudy({
  totalPages,
  startDate,
  deadline,
  restWeekdays = [],
  restDates = [],
  donePages = 0,
} = {}) {
  assertInteger('総ページ数', totalPages, 1)
  assertInteger('終えたページ数', donePages, 0)

  const start = parseDate(startDate)
  const end = parseDate(deadline)
  if (end < start) {
    throw new RangeError('締め切り日は開始日と同じか、それより後にしてください')
  }
  const length = daysBetween(start, end) + 1
  if (length > MAX_DAYS) {
    throw new RangeError(`期間は${MAX_DAYS}日以内にしてください`)
  }

  const restWeekdaySet = new Set(restWeekdays.map(parseWeekday))
  const restDateSet = new Set(
    restDates.map((date) => formatDate(parseDate(date))),
  )
  const isRest = (time) =>
    restWeekdaySet.has(weekdayOf(time)) || restDateSet.has(formatDate(time))

  const times = Array.from({ length }, (_, index) => addDays(start, index))
  const studyDays = times.filter((time) => !isRest(time)).length

  const done = Math.min(donePages, totalPages)
  const remainingPages = totalPages - done
  if (remainingPages > 0 && studyDays === 0) {
    throw new RangeError('勉強できる日がありません(すべて休みの日です)')
  }

  const base = studyDays > 0 ? Math.floor(remainingPages / studyDays) : 0
  const extra = studyDays > 0 ? remainingPages % studyDays : 0

  let cumulative = done
  let studyIndex = 0
  const days = times.map((time) => {
    const rest = isRest(time)
    let pages = 0
    if (!rest) {
      pages = base + (studyIndex < extra ? 1 : 0)
      studyIndex += 1
    }
    cumulative += pages
    return {
      date: formatDate(time),
      weekday: WEEKDAY_KEYS[weekdayOf(time)],
      rest,
      pages,
      cumulative,
    }
  })

  return {
    totalPages,
    donePages: done,
    remainingPages,
    studyDays,
    restDays: length - studyDays,
    perDay: studyDays > 0 ? Math.ceil(remainingPages / studyDays) : 0,
    completed: remainingPages === 0,
    days,
  }
}
