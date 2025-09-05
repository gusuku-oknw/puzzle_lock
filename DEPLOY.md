# 🚀 GitHub Pages デプロイガイド

## 📋 デプロイ手順

### 1. GitHubリポジトリを作成

1. GitHub で新しいリポジトリを作成
   - リポジトリ名: `puzzle_lock` (または好きな名前)
   - **Public** に設定 (GitHub Pages無料利用のため)

### 2. ローカルコードをプッシュ

```bash
# Gitリポジトリを初期化
git init

# ファイルを追加
git add .

# コミット
git commit -m "🎉 Initial commit: Puzzle Maker App"

# リモートリポジトリを追加 (YOUR_USERNAME を実際のユーザー名に変更)
git remote add origin https://github.com/YOUR_USERNAME/puzzle_lock.git

# メインブランチにプッシュ
git branch -M main
git push -u origin main
```

### 3. GitHub Pages を有効化

1. GitHubのリポジトリページで **Settings** タブをクリック
2. 左サイドバーの **Pages** をクリック
3. Source で **GitHub Actions** を選択

### 4. 自動デプロイの確認

- コードをプッシュすると自動でビルド＆デプロイが実行されます
- **Actions** タブでデプロイ状況を確認できます
- 完了すると `https://YOUR_USERNAME.github.io/puzzle_lock/` でアクセス可能

## 🔧 技術仕様

### ビルド設定
- **Base URL**: `/puzzle_lock/` (GitHub Pages用)
- **自動デプロイ**: GitHub Actions workflow
- **PWA**: Service Worker + Manifest 自動生成

### GitHub Actions ワークフロー
- **トリガー**: main ブランチへのプッシュ
- **Node.js**: v20
- **ビルド**: `npm run build`
- **デプロイ**: GitHub Pages

### PWA機能
- ✅ オフライン対応
- ✅ インストール可能
- ✅ アプリアイコン設定済み
- ✅ モバイル最適化

## 📱 授業での活用方法

### 1. QRコード生成
デプロイ完了後のURLをQRコード化して配布

### 2. PWAインストール
生徒にブラウザの「インストール」ボタンからアプリ化を案内

### 3. オフライン利用
初回アクセス後はインターネットなしでも動作

## 🛠️ 開発環境のセットアップ

### Windows環境での開発
**推奨**: Yarn を使用してください

```bash
# Yarn で依存関係をインストール
yarn install

# 開発サーバー起動
yarn dev

# プロダクションビルド
yarn build
```

### npm を使いたい場合
Windows環境でのrollup問題がありますが、GitHub Actions（Linux環境）では正常動作します。

### 解決済み ✅
- **開発サーバー**: `yarn dev` で正常動作
- **プロダクションビルド**: `yarn build` で正常動作  
- **PWA機能**: Service Worker + Manifest 正常生成
- **GitHub Actions**: npm での自動デプロイ対応済み

## ✅ デプロイ完了チェックリスト

- [ ] GitHubリポジトリ作成
- [ ] コードをプッシュ
- [ ] GitHub Pages 有効化
- [ ] Actions タブでデプロイ成功確認
- [ ] デプロイ先URLで動作確認
- [ ] PWA インストール動作確認
- [ ] QRコード生成して授業準備完了

---

**📌 Note**: GitHub Pages の反映には数分かかる場合があります。デプロイ後、少し待ってからアクセスしてください。