// 単体テスト（unit のプロジェクト）の前に読むファイルの目次。vite.config.ts の setupFiles から指している。
// ここには、全部のテストに同じように効き、特定の機能を知らないものだけを、1 行ずつ説明を付けて並べる。
// 特定の機能のための偽物は mocks/ に置き、テストから呼ぶ（docs/16）

// DOM を確かめる expect（toBeInTheDocument()・toHaveAttribute() など）を足す
import "@testing-library/jest-dom/vitest";
// テストごとに、jsdom の環境を最初の状態に戻す（resets/）
import "./resets/html"; // <html> の属性を消す
import "./resets/localStorage"; // localStorage を空にする
