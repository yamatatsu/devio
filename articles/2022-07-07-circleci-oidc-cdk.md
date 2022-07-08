---
title: CircleCIのOpenIdConnectProviderを信頼するRoleをCDKで作成する
description: CircleCIのOpenIdConnectProviderを信頼するRoleをCDKで作成する
slug: circleci-oidc-cdk
thumbnailId: 455150 # CircleCI
published: true
postCode: 906374
---

↓こちらで作成しているOIDCProviderとIAM RoleをCDKで作成してみました。

https://dev.classmethod.jp/articles/circleci-supported-oidc-so-i-tried-linking-it-with-aws/

## CDKの中身

```ts
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

const CIRCLECI_ORGANIZATION_ID = "CircleCIのORGANIZATIONのID";
const CIRCLECI_PROJECT_ID = "CircleCIのPROJECTのID"
// id providerがcircleciである場合常にこのthumbprintを使う
const CIRCLECI_THUMBPRINT = "9e99a48a9960b14926bb7f3b02e22da2b0ab7280"

/**
 * CircleCIのOIDC認証を用いてdocsのデプロイを行うIAM Roleを作成する
 */
export class RoleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const oidcProvider = new iam.OpenIdConnectProvider(this, "CircleCiOidcProvider", {
      url: `https://oidc.circleci.com/org/${CIRCLECI_ORGANIZATION_ID}`,
      clientIds: [CIRCLECI_ORGANIZATION_ID],
      thumbprints: [CIRCLECI_THUMBPRINT],
    });

    const role = new iam.Role(this, "DeployRole", {
      roleName: `circleci-deploy-role`,
      assumedBy: new iam.OpenIdConnectPrincipal(oidcProvider, {
        StringLike: {
          [`oidc.circleci.com/org/${CIRCLECI_ORGANIZATION_ID}:sub`]: [
            `org/${CIRCLECI_ORGANIZATION_ID}/project/${CIRCLECI_PROJECT_ID}/user/*`
          ]
        }
      })
      // 必要な権限を足してね。
    });
  }
}
```
`CIRCLECI_ORGANIZATION_ID`と`CIRCLECI_PROJECT_ID`と、roleに付ける権限が変数で、他はテンプレとして使える！
