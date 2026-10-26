import { JAPANESE_WEEKDAYS, WEEKDAY_KEYS } from './date.js'

/**
 * planStudy() の結果を、ターミナルに表示する日本語の文字列にする。
 * @param {ReturnType<import('./plan.js').planStudy>} plan
 * @returns {string}
 */
export function formatPlan(plan) {
  const lines = [
    `全${plan.totalPages}ページ(終えた分 ${plan.donePages}ページ、残り ${plan.remainingPages}ページ)`,
  ]

  if (plan.completed) {
    lines.push('すべて終わっています。')
    return lines.join('\n')
  }

  const min = Math.floor(plan.remainingPages / plan.studyDays)
  const perDayText =
    min === plan.perDay
      ? `${plan.perDay}ページ`
      : `${min}〜${plan.perDay}ページ`
  lines.push(
    `勉強する日 ${plan.studyDays}日(休み ${plan.restDays}日)、1日 ${perDayText}`,
    '',
  )

  const width = String(plan.totalPages).length
  for (const day of plan.days) {
    const [, month, date] = day.date.split('-')
    const weekday = JAPANESE_WEEKDAYS[WEEKDAY_KEYS.indexOf(day.weekday)]
    const label = `${month}/${date}(${weekday})`
    if (day.rest) {
      lines.push(`${label}  休み`)
    } else {
      const pages = String(day.pages).padStart(width)
      const cumulative = String(day.cumulative).padStart(width)
      lines.push(`${label}  ${pages}ページ  累計 ${cumulative}`)
    }
  }
  return lines.join('\n')
}
