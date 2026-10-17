import { createFileRoute, redirect } from "@tanstack/react-router";

// / に来たら練習ページへ送る
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/practice" });
  },
});
