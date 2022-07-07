# Dev IO

Developers IO を書くためのリポジトリ。

## 使い方

1. `./articles/` 配下に記事を書く
1. `npm run publish` を唱える

### Markdown Header の仕様

| Key         | Value                              | 例                       |
| ----------- | ---------------------------------- | ------------------------ |
| title       | 記事のタイトル                     | 自動化サンプル           |
| description | 記事の概要                         | これは自動化サンプルです |
| slug        | Permalink(日本語ダメ)              | automation-sample        |
| thumbnailId | サムネイルのID                     | 525172                   |
| published   | 公開するか否か                     | false                    |
| postCode    | 自動で付与されます。編集しないで。 | 864131                   |

## How to work?

- playwrightを使って自動化してある。
- markdown headerを読んで記事のメタ情報を扱う。
- MarkdownからWPの独自記法への変換を自動で行う。

## バックログ

- [x] アイキャッチに対応する
- [ ] 新規記事がエラーになる
- [ ] 画像に対応する
- [ ] slugの変更に対応する
- [ ] GHAの整備
- [ ] 記事のバリデーション、見出し1使わないで、とか。
- [ ] `new`コマンドで新しい記事のテンプレ出てくる。
