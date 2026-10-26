import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  addDays,
  daysBetween,
  formatDate,
  parseDate,
  todayLocal,
  weekdayOf,
} from '../src/date.js'

describe('parseDate / formatDate', () => {
  it('YYYY-MM-DD を変換して、元に戻せる', () => {
    assert.equal(formatDate(parseDate('2026-10-27')), '2026-10-27')
  })

  it('うるう日を受け付ける', () => {
    assert.equal(formatDate(parseDate('2028-02-29')), '2028-02-29')
  })

  it('存在しない日付は RangeError', () => {
    assert.throws(() => parseDate('2026-02-30'), RangeError)
    assert.throws(() => parseDate('2027-02-29'), RangeError)
    assert.throws(() => parseDate('2026-13-01'), RangeError)
  })

  it('形式が違うと TypeError', () => {
    assert.throws(() => parseDate('2026/10/27'), TypeError)
    assert.throws(() => parseDate('2026-1-5'), TypeError)
    assert.throws(() => parseDate(20261027), TypeError)
    assert.throws(() => parseDate(undefined), TypeError)
  })
})

describe('日付の計算', () => {
  it('月またぎ・年またぎで日数を足せる', () => {
    assert.equal(formatDate(addDays(parseDate('2026-10-31'), 1)), '2026-11-01')
    assert.equal(formatDate(addDays(parseDate('2026-12-31'), 1)), '2027-01-01')
  })

  it('daysBetween は同じ日なら 0', () => {
    const day = parseDate('2026-10-27')
    assert.equal(daysBetween(day, day), 0)
    assert.equal(daysBetween(day, parseDate('2026-10-30')), 3)
  })

  it('曜日は 0(日曜)〜6(土曜)', () => {
    assert.equal(weekdayOf(parseDate('2026-10-25')), 0)
    assert.equal(weekdayOf(parseDate('2026-10-27')), 2)
    assert.equal(weekdayOf(parseDate('2026-10-31')), 6)
  })
})

describe('todayLocal', () => {
  it('指定した日時のローカルの日付を返す', () => {
    assert.equal(todayLocal(new Date(2026, 0, 5, 23, 59)), '2026-01-05')
  })
})
