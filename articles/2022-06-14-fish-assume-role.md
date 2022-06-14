---
title: 環境変数に依存しないassume-roleスクリプト作ってみた
description: 環境変数に依存しないassume-roleスクリプト作ってみた
slug: fish-assume-role-script
thumbnailId: 525172 # Tools
published: true
postCode: 864131
---

## 動機

ターミナルの窓を複数開いて、

- CloudWatch Logsを観察しながら（`aws logs tail --follow`）
- AWS CDKをwatchでデプロイしながら（`npx cdk watch`）
- lambdaを実行したり、MQTTを飛ばしたりしたい時がある（`aws lambda invoke`, `aws iot-data publish`）

ので、複数窓でassume-roleのクレデンシャルが共有されてくれると嬉しかった。

ので作りました。

## 先人たちの記事

クラスメソッドの先人たちが無限に記事を書いてくれている。

https://dev.classmethod.jp/articles/write-assume-role-script-with-gratitude/
https://dev.classmethod.jp/articles/eazy-assume-role-with-fzf/
https://dev.classmethod.jp/articles/assumerole-with-direnv/
https://dev.classmethod.jp/articles/1-password-assume-role/

## 仕様

- fish上で動作します
- ターミナルの窓が変わってもクレデンシャルが引き回されます
- `profile`を指定しなくてもクレデンシャルが使えます

## ざっくり概要

1. `~/.aws/credential`を準備します
1. `~/.aws/config`を準備します
1. [fish function](https://fishshell.com/docs/current/cmds/function.html)を作成します
1. assume-roleしたいアカウントの数だけaliasを用意します

## 1. `~/.aws/credential`を準備します

```
[default]
aws_access_key_id=XXXX
aws_secret_access_key=XXXX
aws_session_token=XXXX

[hontai]
aws_access_key_id=[ここにAws Access Key Idを入れてね]
aws_secret_access_key=[ここにAws Secret Access Key]
```

- `XXXX`: `XXXX` のままで問題ないです。これをスクリプトから置き換えます。
- `Aws Access Key Id`: assume-role元のIAM UserのアクセスキーIDを入力します。
- `Aws Secret Access Key`: assume-role元のIAM Userのシークレットアクセスキーを入力します。

## 2. `~/.aws/config`を準備します

```
[default]
region = ap-northeast-1
output = json
```

## 3. fish functionをを作成する

`~/.config/fish/functions/switch_aws_role.fish` というファイルを作成し、以下のコードを書きます。

```bash
function switch_aws_role
  read -sP "MFA Token Code: " MFA_TOKEN_CODE

  set --local ROLE_ARN $argv[1]
  set --local MFA_ARN [ここにIAM UserのMFAのARNを入れてね]
  set --local DATE (date +%s)
  set --local OUTPUT (\
    aws sts assume-role --profile hontai \
                        --role-arn $ROLE_ARN \
                        --role-session-name $DATE-session \
                        --duration-second 3600 \
                        --serial-number $MFA_ARN \
                        --token-code $MFA_TOKEN_CODE)

  set --local AWS_ACCESS_KEY_ID (echo $OUTPUT | jq -r .Credentials.AccessKeyId)
  set --local AWS_SECRET_ACCESS_KEY (echo $OUTPUT | jq -r .Credentials.SecretAccessKey)
  set --local AWS_SESSION_TOKEN (echo $OUTPUT | jq -r .Credentials.SessionToken)

  sed -i "" "2s~\(aws_access_key_id\=\).*~\1$AWS_ACCESS_KEY_ID~g" ~/.aws/credentials
  sed -i "" "3s~\(aws_secret_access_key\=\).*~\1$AWS_SECRET_ACCESS_KEY~g" ~/.aws/credentials
  sed -i "" "4s~\(aws_session_token\=\).*~\1$AWS_SESSION_TOKEN~g" ~/.aws/credentials
end
```

- `IAM UserのMFAのARN`:
  - webコンソールのIAM Userのページで確認できます。
  - 例: `arn:aws:iam::[AWSアカウントID]:mfa/[IAM User name]`

sedを使って`~/.aws/credentials`を書き換えます。
ここのコードが行数センシティブであるため、`~/.aws/credentials`の2,3,4行目が変わると動作しなくなります！ご注意を！

```
  sed -i "" "2s~\(aws_access_key_id\=\).*~\1$AWS_ACCESS_KEY_ID~g" ~/.aws/credentials
  sed -i "" "3s~\(aws_secret_access_key\=\).*~\1$AWS_SECRET_ACCESS_KEY~g" ~/.aws/credentials
  sed -i "" "4s~\(aws_session_token\=\).*~\1$AWS_SESSION_TOKEN~g" ~/.aws/credentials
```
## 4. assume-roleしたいアカウントの数だけaliasを用意します

`~/.config/fish/config.fish`のfish configにaliasを追加します。

```bash
alias switch_aws_role_account_A='switch_aws_role [アカウントAのIAM RoleのARN]'
alias switch_aws_role_account_B='switch_aws_role [アカウントBのIAM RoleのARN]'
alias switch_aws_role_account_C='switch_aws_role [アカウントCのIAM RoleのARN]'
alias switch_aws_role_account_D='switch_aws_role [アカウントDのIAM RoleのARN]'
```

## 使い方

`swiaccd`とか打って`tab`キーを打つとfishがサジェストしてくれます。fishかわいい。
