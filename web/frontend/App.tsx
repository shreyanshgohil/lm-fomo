import type React from "react";
import { BrowserRouter } from "react-router-dom";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { PolarisProvider } from "./components/providers";
import { AppFrame } from "./app/components/layout";
import { NAV_ITEMS } from "./app/constants/navigation";

export default function App() {
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  }) as Record<string, { default: React.ComponentType }>;

  return (
    <PolarisProvider>
      <BrowserRouter>
        <NavMenu>
          <a href="/" rel="home">
            LM Fomo
          </a>
          {NAV_ITEMS.filter((item) => item.url !== "/").map((item) => (
            <a key={item.id} href={item.url}>
              {item.label}
            </a>
          ))}
        </NavMenu>
        <AppFrame>
          <Routes pages={pages} />
        </AppFrame>
      </BrowserRouter>
    </PolarisProvider>
  );
}
