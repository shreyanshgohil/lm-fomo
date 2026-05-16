import { BlockStack, Page } from "@shopify/polaris";
import type { ReactNode } from "react";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  primaryAction?: ReactNode;
  children: ReactNode;
}

export function PageContainer({
  title,
  subtitle,
  primaryAction,
  children,
}: PageContainerProps) {
  return (
    <Page
      fullWidth
      title={title}
      subtitle={subtitle}
      primaryAction={primaryAction}
    >
      <BlockStack gap="600">{children}</BlockStack>
    </Page>
  );
}
