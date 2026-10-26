import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { planStudy } from '../src/plan.js'

const pagesOf = (plan) => plan.days.map((day) => day.pages)

describe('planStudy: 基本の振り分け', () => {
  it('割り切れるときは、毎日同じページ数になる', () => {
    const plan = planStudy({
      totalPages: 21,
      startDate: '2026-11-02',
      deadline: '2026-11-08',
    })
    assert.deepEqual(pagesOf(plan), [3, 3, 3, 3, 3, 3, 3])
    assert.equal(plan.perDay, 3)
    assert.equal(plan.studyDays, 7)
    assert.equal(plan.restDays, 0)
  })

  it('割り切れないときは、前半の日に 1 ページずつ多くなる', () => {
    const plan = planStudy({
      totalPages: 30,
      startDate: '2026-11-02',
      deadline: '2026-11-08',
    })
    assert.deepEqual(pagesOf(plan), [5, 5, 4, 4, 4, 4, 4])
    assert.equal(plan.perDay, 5)
  })

  it('累計は最後の日に総ページ数と一致する', () => {
    const plan = planStudy({
      totalPages: 30,
      startDate: '2026-11-02',
      deadline: '2026-11-08',
    })
    assert.equal(plan.days.at(-1).cumulative, 30)
    assert.deepEqual(
      plan.days.map((day) => day.cumulative),
      [5, 10, 14, 18, 22, 26, 30],
    )
  })

  it('開始日と締め切り日が同じなら、その日に全部', () => {
    const plan = planStudy({
      totalPages: 12,
      startDate: '2026-11-02',
      deadline: '2026-11-02',
    })
    assert.deepEqual(pagesOf(plan), [12])
  })

  it('締め切り日も勉強する日に含める', () => {
    const plan = planStudy({
      totalPages: 10,
      startDate: '2026-11-02',
      deadline: '2026-11-03',
    })
    assert.equal(plan.days.length, 2)
    assert.equal(plan.days.at(-1).date, '2026-11-03')
    assert.equal(plan.days.at(-1).pages, 5)
  })
})

describe('planStudy: 休みの扱い', () => {
  it('README の例: 400 ページを日曜休みで 36 日間', () => {
    const plan = planStudy({
      totalPages: 400,
      startDate: '2026-10-27',
      deadline: '2026-12-01',
      restWeekdays: ['sun'],
    })
    assert.equal(plan.days.length, 36)
    assert.equal(plan.studyDays, 31)
    assert.equal(plan.restDays, 5)
    assert.equal(plan.perDay, 13)

    const studyPages = plan.days
      .filter((day) => !day.rest)
      .map((day) => day.pages)
    assert.equal(studyPages.filter((pages) => pages === 13).length, 28)
    assert.equal(studyPages.filter((pages) => pages === 12).length, 3)
    assert.equal(
      studyPages.reduce((sum, pages) => sum + pages, 0),
      400,
    )
    assert.equal(plan.days.at(-1).cumulative, 400)
  })

  it('休みの曜日の日は 0 ページで、rest が true になる', () => {
    const plan = planStudy({
      totalPages: 10,
      startDate: '2026-11-01',
      deadline: '2026-11-03',
      restWeekdays: ['sun'],
    })
    assert.deepEqual(
      plan.days.map((day) => [day.date, day.rest, day.pages]),
      [
        ['2026-11-01', true, 0],
        ['2026-11-02', false, 5],
        ['2026-11-03', false, 5],
      ],
    )
  })

  it('休みの日付を指定できる', () => {
    const plan = planStudy({
      totalPages: 10,
      startDate: '2026-11-02',
      deadline: '2026-11-04',
      restDates: ['2026-11-03'],
    })
    assert.deepEqual(pagesOf(plan), [5, 0, 5])
  })

  it('期間の外の休みの日付は、無視される', () => {
    const plan = planStudy({
      totalPages: 10,
      startDate: '2026-11-02',
      deadline: '2026-11-03',
      restDates: ['2026-12-25'],
    })
    assert.deepEqual(pagesOf(plan), [5, 5])
  })

  it('曜日は英語・日本語・数字のどれでも指定できる', () => {
    const options = {
      totalPages: 12,
      startDate: '2026-11-01',
      deadline: '2026-11-04',
    }
    const expected = planStudy({ ...options, restWeekdays: ['sun'] })
    assert.deepEqual(planStudy({ ...options, restWeekdays: ['日'] }), expected)
    assert.deepEqual(planStudy({ ...options, restWeekdays: [0] }), expected)
    assert.deepEqual(planStudy({ ...options, restWeekdays: ['SUN'] }), expected)
  })

  it('うるう日をまたぐ期間でも、日付が正しく並ぶ', () => {
    const plan = planStudy({
      totalPages: 3,
      startDate: '2028-02-28',
      deadline: '2028-03-01',
    })
    assert.deepEqual(
      plan.days.map((day) => day.date),
      ['2028-02-28', '2028-02-29', '2028-03-01'],
    )
  })
})

describe('planStudy: 途中からの立て直し', () => {
  it('終えたページを引いて、残りを割り直す', () => {
    const plan = planStudy({
      totalPages: 100,
      donePages: 40,
      startDate: '2026-11-02',
      deadline: '2026-11-04',
    })
    assert.equal(plan.remainingPages, 60)
    assert.deepEqual(pagesOf(plan), [20, 20, 20])
    assert.deepEqual(
      plan.days.map((day) => day.cumulative),
      [60, 80, 100],
    )
  })

  it('すべて終えていたら、completed になり、各日 0 ページ', () => {
    const plan = planStudy({
      totalPages: 100,
      donePages: 100,
      startDate: '2026-11-02',
      deadline: '2026-11-04',
    })
    assert.equal(plan.completed, true)
    assert.equal(plan.remainingPages, 0)
    assert.equal(plan.perDay, 0)
    assert.deepEqual(pagesOf(plan), [0, 0, 0])
  })

  it('総ページ数より多く終えていても、completed として返す', () => {
    const plan = planStudy({
      totalPages: 100,
      donePages: 120,
      startDate: '2026-11-02',
      deadline: '2026-11-04',
    })
    assert.equal(plan.completed, true)
    assert.equal(plan.donePages, 100)
  })

  it('すべて終えていれば、全部が休みの期間でもエラーにならない', () => {
    const plan = planStudy({
      totalPages: 10,
      donePages: 10,
      startDate: '2026-11-01',
      deadline: '2026-11-01',
      restWeekdays: ['sun'],
    })
    assert.equal(plan.completed, true)
  })
})

describe('planStudy: 入力のエラー', () => {
  const valid = {
    totalPages: 100,
    startDate: '2026-11-02',
    deadline: '2026-11-08',
  }

  it('締め切りが開始日より前なら RangeError', () => {
    assert.throws(
      () => planStudy({ ...valid, startDate: '2026-11-09' }),
      RangeError,
    )
  })

  it('勉強できる日が 0 日なら RangeError', () => {
    assert.throws(
      () =>
        planStudy({
          ...valid,
          startDate: '2026-11-01',
          deadline: '2026-11-01',
          restWeekdays: ['sun'],
        }),
      RangeError,
    )
  })

  it('総ページ数が 0 以下・小数・数値以外なら RangeError', () => {
    for (const totalPages of [0, -5, 1.5, '100', undefined, NaN]) {
      assert.throws(() => planStudy({ ...valid, totalPages }), RangeError)
    }
  })

  it('終えたページ数が負・小数なら RangeError', () => {
    for (const donePages of [-1, 2.5]) {
      assert.throws(() => planStudy({ ...valid, donePages }), RangeError)
    }
  })

  it('日付の形式が違うと TypeError、存在しない日付は RangeError', () => {
    assert.throws(
      () => planStudy({ ...valid, startDate: '2026/11/02' }),
      TypeError,
    )
    assert.throws(
      () => planStudy({ ...valid, deadline: '2026-02-30' }),
      RangeError,
    )
    assert.throws(
      () => planStudy({ ...valid, restDates: ['11月3日'] }),
      TypeError,
    )
  })

  it('知らない曜日は TypeError', () => {
    for (const weekday of ['funday', 7, -1, '']) {
      assert.throws(
        () => planStudy({ ...valid, restWeekdays: [weekday] }),
        TypeError,
      )
    }
  })

  it('期間が長すぎると RangeError', () => {
    assert.throws(
      () =>
        planStudy({
          ...valid,
          startDate: '2000-01-01',
          deadline: '2026-01-01',
        }),
      RangeError,
    )
  })

  it('引数がなくても、例外で止まる', () => {
    assert.throws(() => planStudy(), RangeError)
  })
})
