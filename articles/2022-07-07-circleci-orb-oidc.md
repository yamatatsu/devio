---
title: CircleCIで、Orbを使ってOIDCする
description: Orbでサクッと書けるようになってたのでやってみた
slug: circleci-orb-oidc
thumbnailId: 455150 # CircleCI
published: true
postCode: 906278
---

こちらの若槻さんの記事のあとに

https://dev.classmethod.jp/articles/circleci-supported-oidc-so-i-tried-linking-it-with-aws/

公式より、新しいaws-cliのOrbでOIDCをサポートするようになったと発表されていたので試してみた。

<iframe class="hatenablogcard" style="width:100%;height:155px;max-width:680px;" title="aws-cli" src="https://hatenablog-parts.com/embed?url=https://discuss.circleci.com/t/openid-connect-support-added-to-aws-cli-orb-v3-1/43817" width="300" height="150" frameborder="0" scrolling="no"></iframe>

## CircleCIの設定

```yaml
orbs:
  # use over v3.1 for OIDC
  aws-cli: circleci/aws-cli@3.1

commands:
  deploy:
    steps:
      # これだけ！！
      - aws-cli/setup:
          profile-name: WEB-IDENTITY-PROFILE
          role-arn: arn:aws:iam::123456789012:role/your-role-name
          role-session-name: deploy-session
          aws-region: ap-northeast-1 # 環境変数 AWS_DEFAULT_REGION が設定されていれば不要
      # もうAWSコマンドたたけちゃう
      - run:
          name: Get caller identity
          command: aws sts get-caller-identity --profile WEB-IDENTITY-PROFILE
```

※ `role-arn:` には作成した正しいrole名を渡してください。

便利！！！
