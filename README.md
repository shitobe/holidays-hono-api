# 技術

## deno

内閣府のCSVから日本の祝日を取得し、jsonを作成する。

## hono

## denoflare

cloudflare workerのデプロイは denoflareで行う。
インストール方法は以下、ver0.7.0
なのでアップデートしていれば最新のバージョンへ変更する。

```shell
deno install --global -A --unstable-worker-options --name denoflare --force \
https://raw.githubusercontent.com/skymethod/denoflare/v0.7.0/cli/cli.ts
```
