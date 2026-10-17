import { createFileRoute, redirect } from "@tanstack/react-router";

import { PAGES } from "~/constants/pages";

// / に来たら練習ページへ送る
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: PAGES.PRACTICE });
  },
});
