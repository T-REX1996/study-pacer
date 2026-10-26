import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatPlan } from '../src/format.js'
import { planStudy } from '../src/plan.js'

describe('formatPlan', () => {
  it('毎日同じページ数なら、範囲ではなく 1 つの数字で表示する', () => {
    const plan = planStudy({
      totalPages: 30,
      startDate: '2026-11-02',
      deadline: '2026-11-04',
    })
    assert.equal(
      formatPlan(plan),
      [
        '全30ページ(終えた分 0ページ、残り 30ページ)',
        '勉強する日 3日(休み 0日)、1日 10ページ',
        '',
        '11/02(月)  10ページ  累計 10',
        '11/03(火)  10ページ  累計 20',
        '11/04(水)  10ページ  累計 30',
      ].join('\n'),
    )
  })

  it('割り切れないときは、少ない日〜多い日の範囲で表示する', () => {
    const plan = planStudy({
      totalPages: 10,
      startDate: '2026-11-02',
      deadline: '2026-11-04',
    })
    assert.match(formatPlan(plan), /1日 3〜4ページ/)
  })

  it('休みの日は「休み」と表示する', () => {
    const plan = planStudy({
      totalPages: 10,
      startDate: '2026-11-01',
      deadline: '2026-11-02',
      restWeekdays: ['sun'],
    })
    const lines = formatPlan(plan).split('\n')
    assert.equal(lines.at(-2), '11/01(日)  休み')
    assert.equal(lines.at(-1), '11/02(月)  10ページ  累計 10')
  })

  it('すべて終えているときは、その旨だけを表示する', () => {
    const plan = planStudy({
      totalPages: 10,
      donePages: 10,
      startDate: '2026-11-02',
      deadline: '2026-11-04',
    })
    assert.equal(
      formatPlan(plan),
      '全10ページ(終えた分 10ページ、残り 0ページ)\nすべて終わっています。',
    )
  })
})
