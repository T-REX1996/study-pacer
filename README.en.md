# study-pacer

English | [日本語](./README.md)

A library and CLI that works backward from a deadline and splits the **pages** of a textbook or workbook into a number of pages per day.

It answers "how many pages a day do I need to finish by the deadline?", skipping your rest days. If you fall behind, you can re-plan with the pages that are left.

> It is meant for materials that have page numbers (paper books, workbooks, e-books with pages). It is not a good fit for videos or web pages, which have no pages. **The CLI output is in Japanese only.**

## Features

- Skips rest weekdays (e.g. Sunday) and rest dates
- When the pages do not divide evenly, the earlier days get one extra page, so the later days have some slack
- Subtracts the pages you have already finished, so you can re-plan midway
- No dependencies (Node.js 22 or later)
- Works as a library and as a CLI

## Install

```sh
# As a library
npm install study-pacer

# As a global CLI
npm install -g study-pacer

# Try it without installing
npx study-pacer 100 --to 2026-11-08 --rest sun
```

## CLI usage

```sh
study-pacer <total pages> --to <deadline> [options]
```

For example, to finish a 100-page workbook between Monday, Nov 2 and Sunday, Nov 8, with Sunday off:

```sh
study-pacer 100 --from 2026-11-02 --to 2026-11-08 --rest sun
```

The output is in Japanese. In English, it reads: "100 pages in total (0 done, 100 left). 6 study days (1 rest day), 16-17 pages a day", followed by one line per day.

```text
全100ページ(終えた分 0ページ、残り 100ページ)
勉強する日 6日(休み 1日)、1日 16〜17ページ

11/02(月)   17ページ  累計  17
11/03(火)   17ページ  累計  34
11/04(水)   17ページ  累計  51
11/05(木)   17ページ  累計  68
11/06(金)   16ページ  累計  84
11/07(土)   16ページ  累計 100
11/08(日)  休み
```

(The weekdays 月 火 水 木 金 土 日 mean Mon Tue Wed Thu Fri Sat Sun, `ページ` means pages, `累計` means the running total, and `休み` means a rest day.)

### Re-plan when you fall behind

If you have finished 60 pages by Nov 5, pass today's date to `--from` and the finished pages to `--done`.

```sh
study-pacer 100 --from 2026-11-05 --to 2026-11-08 --rest sun --done 60
```

### Several rest days

`--rest` and `--rest-date` can be repeated as many times as you need. The example below takes Sunday and Wednesday off (`--rest` twice), plus Nov 10 and Nov 12 (`--rest-date` twice).

```sh
study-pacer 100 --from 2026-11-02 --to 2026-11-15 \
  --rest sun --rest wed \
  --rest-date 2026-11-10 --rest-date 2026-11-12
```

### Options

| Option               | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `--to <date>`        | Deadline (`YYYY-MM-DD`). Required                         |
| `--from <date>`      | Start date (`YYYY-MM-DD`). Defaults to today              |
| `--done <pages>`     | Pages already finished. Defaults to 0                     |
| `--rest <weekday>`   | Rest weekday (`sun`-`sat`, or `日`-`土`). Can be repeated |
| `--rest-date <date>` | Rest date (`YYYY-MM-DD`). Can be repeated                 |
| `-h`, `--help`       | Show the usage                                            |

If the input is invalid, it prints an error message and exits with code 1.

## Library usage

ES Modules only. Use `import`.

```js
import { planStudy, formatPlan } from 'study-pacer'

const plan = planStudy({
  totalPages: 100,
  startDate: '2026-11-02',
  deadline: '2026-11-08',
  restWeekdays: ['sun'],
})

console.log(plan.perDay) // 17 (pages on the heavier days)
console.log(plan.studyDays) // 6
console.log(formatPlan(plan)) // the same text as the CLI (in Japanese)
```

### `planStudy(options)`

| Option         | Type                      | Description                                                                |
| -------------- | ------------------------- | -------------------------------------------------------------------------- |
| `totalPages`   | `number`                  | Total pages (integer, 1 or more). Required                                 |
| `startDate`    | `string`                  | Start date (`YYYY-MM-DD`). Required                                        |
| `deadline`     | `string`                  | Deadline (`YYYY-MM-DD`), the same day as or after the start date. Required |
| `restWeekdays` | `Array<string \| number>` | Rest weekdays: `'sun'`, `'日'`, or `0` (Sunday) to `6` (Saturday)          |
| `restDates`    | `string[]`                | Rest dates (`YYYY-MM-DD`)                                                  |
| `donePages`    | `number`                  | Pages already finished. Defaults to 0                                      |

It returns:

| Property         | Description                                |
| ---------------- | ------------------------------------------ |
| `totalPages`     | Total pages                                |
| `donePages`      | Finished pages (capped at the total pages) |
| `remainingPages` | Pages left                                 |
| `studyDays`      | Number of study days                       |
| `restDays`       | Number of rest days                        |
| `perDay`         | Pages per day (the larger amount)          |
| `completed`      | `true` if everything is already finished   |
| `days`           | The plan for each day                      |

Each item of `days`:

```js
{
  date: '2026-11-02', // date
  weekday: 'mon', // sun-sat
  rest: false, // true on a rest day
  pages: 17, // pages to study that day (0 on a rest day)
  cumulative: 17, // running total at the end of that day, including finished pages
}
```

### `formatPlan(plan)`

Turns the result of `planStudy()` into a Japanese string for the terminal.

## Rules

- Dates use the `YYYY-MM-DD` format. Dates that do not exist (such as `2026-02-30`) are errors.
- The deadline day counts as a study day.
- Dates are calculated in UTC, so time zones and daylight saving time have no effect. Only when `--from` is omitted in the CLI does it use today's date in the local time zone.
- The period can be at most 3660 days (about 10 years).
- Invalid input throws a `TypeError` (wrong format) or a `RangeError` (wrong value). The messages are in Japanese.
- If there are 0 study days (every day is a rest day), it is an error. If everything is already finished, it returns `completed: true` instead of an error.

## Development

```sh
git clone https://github.com/T-REX1996/study-pacer.git
cd study-pacer
npm install

npm test              # tests
npm run lint          # ESLint
npm run format:check  # Prettier
```

## License

[MIT](./LICENSE)
