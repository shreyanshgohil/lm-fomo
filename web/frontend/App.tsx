import type React from "react";
import { BrowserRouter } from "react-router-dom";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { PolarisProvider } from "./components/providers";
import { AppFrame } from "./app/components/layout";
import { APP_NAME } from "./app/constants/navigation";

export default function App() {
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  }) as Record<string, { default: React.ComponentType }>;

  return (
    <PolarisProvider>
      <BrowserRouter>
        <NavMenu>
          <a href="/" rel="home">
            {APP_NAME}
          </a>
        </NavMenu>
        <AppFrame>
          <Routes pages={pages} />
        </AppFrame>
      </BrowserRouter>
    </PolarisProvider>
  );
}
