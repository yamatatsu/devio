# Dev IO

Developers IO を書くためのリポジトリ。

## 使い方

TBD

## 自動化

- playwrightを使って自動化してある。
- markdown headerを読んで記事のメタ情報を扱う。
- WPの独自記法への変換を自動で行うため、ここでは素直なMarkdownで書ける。
- [注意] postCodeを変更するとなんかすごくまずそう。変更しないで。

### Markdown Header

| Key         | Value                 | 例                       |
| ----------- | --------------------- | ------------------------ |
| title       | 記事のタイトル        | 自動化サンプル           |
| description | 記事の概要            | これは自動化サンプルです |
| slug        | Permalink(日本語ダメ) | automation-sample        |
| published   | 公開するか否か        | false                    |
| postCode    | 自動で付与されます    | 864131                   |

## バックログ

- [ ] GHAの整備
- [ ] 記事のバリデーション、見出し1使わないで、とか。
- [ ] slugの変更に対応する
- [ ] `new`コマンドで新しい記事のテンプレ出てくる。
