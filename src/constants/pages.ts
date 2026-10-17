import type { FileRoutesByTo } from "~/routeTree.gen";

/**
 * ページの URL。Link の `to` や redirect の `to` はここから参照する。
 * satisfies で、src/routes/ に実在する URL だけを書けるようにしている。
 */
export const PAGES = {
  HOME: "/",
  PRACTICE: "/practice",
} as const satisfies Record<string, keyof FileRoutesByTo>;
