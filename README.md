# 技術

## deno

選定した理由、lint と testを同時に行えて追加するパッケージが少なくなる。


## hono

## denoflare

cloudflare workerのデプロイは denoflareで行う。
インストール方法は以下、ver0.7.0
なのでアップデートしていれば最新のバージョンへ変更する。

```shell
deno install --global -A --unstable-worker-options --name denoflare --force \
https://raw.githubusercontent.com/skymethod/denoflare/v0.7.0/cli/cli.ts
```
