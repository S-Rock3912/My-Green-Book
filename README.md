# My Yardage Book ⛳

プロ仕様のデジタルヤーデージブック生成Webアプリ。

## 機能一覧

| 機能 | 説明 |
|------|------|
| コース管理 | コース名・所在地・18ホール管理 |
| ホール情報 | PAR / ハンディキャップ / 総距離 |
| コース図 | 画像アップロード + 描画ツール |
| マーカー配置 | ティー / 中間ポイント(0〜4個) / ピン |
| 距離自動計算 | マーカー位置から比例計算 |
| グリーン図 | 画像アップロード + 描画ツール |
| グリーン距離 | 手前 / センター / 奥 |
| ピン位置 | 前・中・奥のピン登録 |
| プレーヤーメモ | 風向き / 狙い目ライン / 危険エリア |
| PDFエクスポート | A6サイズ印刷最適化 |

## 描画ツール

- ペン (フリーハンド)
- 直線 / 矢印
- 四角形 / 円 (塗りつぶし対応)
- テキスト (フォントサイズ調整可)
- 消しゴム
- Undo / Redo (Ctrl+Z / Ctrl+Y)

## セットアップ

### 必要環境

- Node.js 18以上
- npm または bun

### インストール

```bash
npm install
```

### ローカル起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く。

**注意**: Supabase未設定の場合はlocalStorageで動作します。データはブラウザに保存されます。

### ビルド

```bash
npm run build
npm run preview
```

## Supabase設定 (オプション)

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. `supabase/schema.sql` をSQL Editorで実行
3. `.env` ファイルを作成:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## フォルダ構成

```
src/
├── types/          型定義
├── store/          Zustand状態管理
├── lib/
│   ├── canvas.ts   Canvas描画エンジン
│   ├── calculations.ts 距離計算ロジック
│   ├── pdf.ts      PDFエクスポート
│   └── supabase.ts Supabaseクライアント
├── components/
│   ├── canvas/     DrawingCanvas・CanvasToolbar
│   ├── course/     コース関連UI
│   ├── hole/       ホール関連UI
│   ├── green/      グリーン関連UI
│   ├── memo/       プレーヤーメモ
│   ├── layout/     ヘッダー等
│   └── ui/         汎用UIコンポーネント
└── pages/
    ├── Home.tsx    コース一覧
    ├── CourseDetail.tsx ホール一覧
    └── HoleDetail.tsx  ホール編集
```

## 技術スタック

| 役割 | ライブラリ |
|------|-----------|
| UI フレームワーク | React 18 |
| 型 | TypeScript |
| ビルド | Vite |
| スタイル | Tailwind CSS |
| 状態管理 | Zustand (localStorage永続化) |
| データベース | Supabase (オプション) |
| PDF生成 | jsPDF + html2canvas |
| アイコン | lucide-react |
| ルーティング | React Router v6 |

## 距離計算ロジック

1. キャンバス上にティー・中間ポイント・ピンを配置
2. 各マーカーの相対座標(0〜1)を取得
3. 連続するポイント間のピクセル距離を計算
4. `スケール = 実際の総距離 / 総ピクセル距離`
5. 各セグメント距離 = ピクセル距離 × スケール

## 将来の拡張案

- [ ] Supabase Auth によるマルチユーザー対応
- [ ] クラウド同期 (Supabase Realtime)
- [ ] スコアカード機能 (ラウンド記録)
- [ ] コース共有・エクスポート (JSON/CSV)
- [ ] GPSヤーデージ連携
- [ ] コース図の自動生成 (衛星写真API)
- [ ] Apple Watch / スマートウォッチ連携
- [ ] PWA オフライン対応強化
- [ ] AI による攻略アドバイス
- [ ] 過去ラウンドの統計・分析
# MyYardageBook
# MyYardageBook
