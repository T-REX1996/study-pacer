#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { todayLocal } from '../src/date.js'
import { formatPlan } from '../src/format.js'
import { planStudy } from '../src/plan.js'

const HELP = `使い方: study-pacer <総ページ数> --to <締め切り日> [オプション]

オプション:
  --to <日付>          締め切り日 (YYYY-MM-DD)。必須
  --from <日付>        開始日 (YYYY-MM-DD)。省略すると今日
  --done <ページ数>    終えたページ数。省略すると 0
  --rest <曜日>        休みの曜日 (sun, mon ... または 日, 月 ...)。複数指定できる
  --rest-date <日付>   休みの日付 (YYYY-MM-DD)。複数指定できる
  -h, --help           このヘルプを表示する

例:
  study-pacer 400 --to 2026-12-01 --rest sun --done 50
`

function parseInteger(label, text) {
  if (!/^\d+$/.test(text)) {
    throw new Error(`${label}は整数で指定してください: ${text}`)
  }
  return Number(text)
}

function main(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      to: { type: 'string' },
      from: { type: 'string' },
      done: { type: 'string' },
      rest: { type: 'string', multiple: true },
      'rest-date': { type: 'string', multiple: true },
      help: { type: 'boolean', short: 'h' },
    },
  })

  if (values.help) {
    console.log(HELP)
    return
  }
  if (positionals.length !== 1) {
    throw new Error('総ページ数を1つだけ指定してください')
  }
  if (!values.to) {
    throw new Error('--to で締め切り日を指定してください')
  }

  const plan = planStudy({
    totalPages: parseInteger('総ページ数', positionals[0]),
    startDate: values.from ?? todayLocal(),
    deadline: values.to,
    restWeekdays: values.rest ?? [],
    restDates: values['rest-date'] ?? [],
    donePages: values.done ? parseInteger('終えたページ数', values.done) : 0,
  })
  console.log(formatPlan(plan))
}

try {
  main(process.argv.slice(2))
} catch (error) {
  console.error(`エラー: ${error.message}`)
  console.error('使い方は study-pacer --help で確認できます')
  process.exitCode = 1
}
