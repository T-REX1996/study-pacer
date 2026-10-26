import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const CLI = fileURLToPath(new URL('../bin/study-pacer.js', import.meta.url))

function run(...args) {
  const result = spawnSync(process.execPath, [CLI, ...args], {
    encoding: 'utf8',
  })
  return { status: result.status, stdout: result.stdout, stderr: result.stderr }
}

describe('CLI', () => {
  it('計画を表示して、終了コード 0 で終わる', () => {
    const { status, stdout } = run(
      '30',
      '--from',
      '2026-11-02',
      '--to',
      '2026-11-04',
    )
    assert.equal(status, 0)
    assert.match(stdout, /全30ページ/)
    assert.match(stdout, /11\/02\(月\)\s+10ページ\s+累計 10/)
  })

  it('--rest と --done と --rest-date を指定できる', () => {
    const { status, stdout } = run(
      '100',
      '--from',
      '2026-11-01',
      '--to',
      '2026-11-05',
      '--rest',
      '日',
      '--rest-date',
      '2026-11-03',
      '--done',
      '40',
    )
    assert.equal(status, 0)
    assert.match(stdout, /残り 60ページ/)
    assert.match(stdout, /11\/01\(日\)\s+休み/)
    assert.match(stdout, /11\/03\(火\)\s+休み/)
  })

  it('--rest は何度でも指定できる', () => {
    const { status, stdout } = run(
      '30',
      '--from',
      '2026-11-01',
      '--to',
      '2026-11-07',
      '--rest',
      'sun',
      '--rest',
      'sat',
    )
    assert.equal(status, 0)
    assert.match(stdout, /勉強する日 5日\(休み 2日\)/)
  })

  it('--help で使い方を表示する', () => {
    const { status, stdout } = run('--help')
    assert.equal(status, 0)
    assert.match(stdout, /使い方: study-pacer/)
  })

  it('--to がないとエラーで、終了コード 1', () => {
    const { status, stderr } = run('100')
    assert.equal(status, 1)
    assert.match(stderr, /エラー: --to/)
  })

  it('総ページ数が整数でないとエラー', () => {
    const { status, stderr } = run('abc', '--to', '2026-12-01')
    assert.equal(status, 1)
    assert.match(stderr, /エラー: 総ページ数は整数/)
  })

  it('締め切りが開始日より前だとエラー', () => {
    const { status, stderr } = run(
      '100',
      '--from',
      '2026-12-01',
      '--to',
      '2026-11-01',
    )
    assert.equal(status, 1)
    assert.match(stderr, /エラー: 締め切り日/)
  })

  it('知らないオプションはエラー', () => {
    const { status, stderr } = run('100', '--to', '2026-12-01', '--foo')
    assert.equal(status, 1)
    assert.match(stderr, /エラー/)
  })
})
