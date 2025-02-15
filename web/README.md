Occha Webプロジェクト

## 始め方
```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) にアクセスして結果を確認


## ディレクトリ構造
 src  
 ├── app : ページ内容  
 ├── components  : 共通コンポーネント  
 ├── features  : 下記記載  
 ├── lib  : ライブラリ関連  
 └── style  : scssのutilsなど

### features ディレクトリ

このプロジェクトではfeaturesデザインを採用しています。  

features/routes/{pagename} に，そのページ内で使われるコンポーネントやスタイルなどを配置します。  
また，共通化できるものはfeatures直下にその名前とともに配置します。

#### settingsページを作る例

app/settings/page.tsx で使うコンポーネントを，features/routes/settings/ に作成します。


#### accountフィーチャーを作る例

features/account/api にapiの処理を書きます。(auth関連など)  
features/account/component に例えばプロフィールアイコンなどのコンポーネントを配置できます。  
