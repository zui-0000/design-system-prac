import { RouterProvider, createRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { FC } from "react";
import { useState } from "react";
import { routeTree } from "./routeTree.gen";

/** Link と useNavigate の `to` を、実在する経路だけに絞る */
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}

const createAppRouter = () =>
  createRouter({
    routeTree,
    // リンクにマウスを乗せた時点で、遷移先のページを読み込み始める
    defaultPreload: "intent",
    // 戻る・進むで、前に見ていたスクロール位置に戻す
    scrollRestoration: true,
  });

export const App: FC = () => {
  // モジュールスコープではなく useState で作り、マウントごとに独立したルーターにする
  const [router] = useState(createAppRouter);

  return (
    <>
      <RouterProvider router={router} />
      {/* 本番ビルドでは何も描かないため、環境分岐を書く必要はない */}
      <TanStackRouterDevtools router={router} position="bottom-right" />
    </>
  );
};
