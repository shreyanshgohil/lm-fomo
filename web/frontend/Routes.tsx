import { Routes as ReactRouterRoutes, Route } from "react-router-dom";
import type { ComponentType } from "react";

interface RouteModule {
  default?: ComponentType;
}

interface RoutesProps {
  pages: Record<string, RouteModule>;
}

export default function Routes({ pages }: RoutesProps) {
  const routes = useRoutes(pages);
  const routeComponents = routes.map(({ path, component: Component }) => (
    <Route key={path} path={path} element={<Component />} />
  ));

  const notFound = routes.find(({ path }) => path === "/notFound");
  const NotFound = notFound?.component;

  return (
    <ReactRouterRoutes>
      {routeComponents}
      {NotFound && <Route path="*" element={<NotFound />} />}
    </ReactRouterRoutes>
  );
}

function useRoutes(pages: Record<string, RouteModule>) {
  return Object.keys(pages)
    .map((key) => {
      let path = key
        .replace("./pages", "")
        .replace(/\.(t|j)sx?$/, "")
        .replace(/\/index$/i, "/")
        .replace(/\b[A-Z]/, (firstLetter) => firstLetter.toLowerCase())
        .replace(/\[(?:[.]{3})?(\w+?)\]/g, (_match, param) => `:${param}`);

      if (path.endsWith("/") && path !== "/") {
        path = path.substring(0, path.length - 1);
      }

      const component = pages[key].default;
      if (!component) {
        console.warn(`${key} doesn't export a default React component`);
      }

      return { path, component };
    })
    .filter((route): route is { path: string; component: ComponentType } =>
      Boolean(route.component),
    );
}
