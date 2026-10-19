// 単体テスト（unit のプロジェクト）の前に 1 回だけ読む。vite.config.ts の setupFiles から指している

// toBeInTheDocument()・toHaveAttribute() などの、DOM を確かめる expect を足す
import "@testing-library/jest-dom/vitest";
