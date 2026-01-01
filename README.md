# Japanese Holidays API

日本の祝日を取得できるAPI

## エンドポイント

| パス                           | 説明      |                                                                                                                                                                                                                  
|------------------------------|---------|                                                                                                                                                                                                                   
| `/api/ja/`                   | 全ての祝日   |                                                                                                                                                                                                      
| `/api/ja/:year/`             | 指定年の祝日  |                                                                                                                                                                                              
| `/api/ja/:year/:month/`      | 指定年月の祝日 |                                                                                                                                                                                     
| `/api/ja/:year/:month/:day/` | 指定日の祝日  |

## 使用例

```bash                                                                                                                                                                                                                          
curl https://your-domain.com/api/ja/2025/                                                                                                                                                                                        
```

レスポンス

```json
{
  "holidays": [
    {
      "date": "2025-01-01",
      "name": "元日"
    }
  ],
  "length": 1
}                                                                                                                                                                                                                                
```

# 技術

## deno

選定した理由、lint と testを同時に行えて追加するパッケージが少なくなる。

## hono

日本産 webフレームワーク Cloudflare 上でのデプロイするのであれば、一択。
jsxも使える

## denoflare

Cloudflare workerのデプロイは denoflareで行う。
インストール方法は以下、ver0.7.0
なのでアップデートしていれば最新のバージョンへ変更する。

```shell
deno install --global -A --unstable-worker-options --name denoflare --force \
https://raw.githubusercontent.com/skymethod/denoflare/v0.7.0/cli/cli.ts
```

# CI/CD

CI/CDはGitHub Actionsで行う。
テストはdeno testで行う。
lintはdeno lintで行う。