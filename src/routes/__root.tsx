import { createRootRoute } from "@tanstack/react-router";

// component を省くと <Outlet /> だけが描かれる。ヘッダーなどの枠は各ページが持つ
export const Route = createRootRoute();
