---
title: cdk init の結果に要らない記述あるよなーと思って調べたら5年前のCDK初期の姿を垣間見た
description: 「いらん記述を消せる話」をしようと思ったらエモい気持ちになった
slug: remove-redundant-for-cdk-init
thumbnailId: 930946 # cdk
published: true
postCode: 982690
---

※本エントリは、[AWS CDK Advent Calendar 2022](https://qiita.com/advent-calendar/2022/cdk)の２日目の記事となります。

親の顔より見た`npx cdk init app --language=typescript`ですが、不要な記述や不要なライブラリが含まれています。

個人的には、余計な依存を消したりミスリードになりうる記述は消すようにしているので、それを紹介するとともに、

CDKの開発初期の5年前にさかのぼって、それらの不要な実装がどのような経緯で生まれたのかを追ってみます。

## 前提

`cdk.json`の`app`を見てわかるように、初期化されたcdkアプリケーションは`ts-node`で動作します。

```json
{
  "app": "npx ts-node --prefer-ts-exts bin/cdk-init-app-sample.ts"
}
```

https://www.npmjs.com/package/ts-node

`cdk`コマンドは内部でこの`cdk.json`を参照し、`app`に書かれたコマンドを実行します。

- cdkアプリケーションは`cdk`コマンドを使って実行される
- `cdk`コマンドは`cdk.json`の`app`を参照し、`ts-node`で実行される。

この2点を前提に、後述の修正を紹介していきます。

## package.json

`package.json`の記述は、js,tsエンジニアにとって、そのアプリケーションの使い方を知る大きなヒントになります。

なので`package.json`を使い方に合わせてシンプルにするべく、不要な記述は除去していきます。

### `bin`

```json
  "bin": {
    "cdk-init-app-sample": "bin/cdk-init-app-sample.js"
  },
```

[npmのドキュメント](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#bin)にあるとおり、`package.json`の`bin`はそのアプリケーションを`PATH`に登録してcliから実行する場合に記述します。

`bin`に記述されている`bin/cdk-init-app-sample.js`は単体で実行しても何の効果もなく、`cdk`コマンドを用いて`cdk.json`から呼び出されて初めて機能します。

なので、この`bin`の記述は除去することができます。

### `scripts.build`, `scripts.watch`

```json
 "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
  }    
```

`ts-node` を使っているので`tsc`を用いて`.js`に変換する必要はありません。

### `dependencies.source-map-support`

`ts-node`は、[READMEに記載の通り](https://www.npmjs.com/package/ts-node#:~:text=Features-,Automatic%20sourcemaps%20in%20stack%20traces,-Automatic%20tsconfig.json)もともとsource-mapを備えており、これによりCDK実行時のエラーのトレースログはtypescriptファイルの行番号を示すことができます。

`ts-node`がすでに実現してくれているので、追加で`source-map-support`を使う必要はありません。

後述の通りこの`source-map-support`は`bin`ディレクトリのファイル内で使われているのですが、その記述含め、不要なので除去できます。

## binディレクトリのファイル

先頭の2行、

```ts
#!/usr/bin/env node
import 'source-map-support/register';
```

が不要です。

- 1行目のshebangは不要です。
- `source-map-support`も不要です（前述の通り`ts-node`がもともとサポートしているので）

## `.npmignore`

ファイル自体が不要です。npmパッケージとして公開する際に除外するものを指定するファイルです。

## なぜ必要のない記述があるのか

歴史を紐解くと、これらのコードは5年前の2018年に生まれたのがわかりました。  
当時のまだv0として開発していたcdkのコードを読んでみました。

https://github.com/aws/aws-cdk/tree/e2d2e8f16506d873b789fd06250c0d819f01a358

このときはまだ`cdk.json`の仕組みを入れる前（[`cdk.json`の仕組みが実装されるのはこの7日後](https://github.com/aws/aws-cdk/commit/7ac129d742a109462a2b76ea82718bd775dcd8d2)）であり、かつ`ts-node`は採用されておらず、`cdk deploy`に`--app=bin/app.js`のようにオプション指定することで、synthesizeを実行していたようです。

そのため、binディレクトリのtsファイルは`tsc`によってjsファイルにコンパイルする必要があり、加えてshebangを与えておくことで`--app`の指定を簡略化していたようです。

package.jsonの`bin`は、他の人が作成した便利cdk実装（例えば`awesome-cdk-app`のようなライブラリ）を、`cdk deploy --app='npx awesome-cdk-app'`のように実行できるようにinit templateに用意されていたと思われます。

現在では`--app`の指定はできるものの`cdk.json`で予め指定するのが一般化しており,かつ`ts-node`が採用され、便利cdk実装の再利用は[construct hub](https://constructs.dev/)で公開されたものをconstructとして組み込むのがあたりまえになっています。

## まとめ

「この実装いらんよなぁ」と思って脳死で除去していた実装の経緯を探ったら、CDKの超初期のプロトタイプ実装を垣間見ることができ、エモい気持ちになりました。

この気持を共有すべく、[アドベントカレンダーの2日目](https://qiita.com/advent-calendar/2022/cdk)として紹介させていただきました。

以上です！
