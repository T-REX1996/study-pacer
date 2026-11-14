# study-pacer

参考書や問題集のページ数を、締め切りから逆算して1日あたりのページ数に振り分ける、ライブラリ兼 CLI。
npm で公開している（MIT）。依存パッケージなし（Node.js 22 以上、ES Modules）。

## 構成
- src/ ライブラリ本体（date.js 日付、format.js 表示、plan.js 計算、index.js エントリ）
- bin/study-pacer.js CLI のエントリ
- test/ テスト（node:test）
- README.md（日本語）/ README.en.md（英語）

## コマンド
- テスト: `npm test`
- Lint: `npm run lint`
- 整形チェック: `npm run format:check`（整形は `npm run format`）

## ルール
- 実行時の依存パッケージを増やさない（devDependencies のみ可）
- 機能を変えたら、test/ にテストを足し、README.md と README.en.md の両方を更新する
- CLI の表示は日本語のみ（README に明記されている仕様）
- 公開物に含まれるのは src と bin だけ（package.json の `files`）。それ以外を公開物に依存させない
- 変更後は `npm test`、`npm run lint`、`npm run format:check` をすべて通す
- バージョンの変更（`npm version` や publish）は、私が指示したときだけ行う
