import { useCallback } from "react";
import {
  BlockStack,
  Box,
  Button,
  ChoiceList,
  InlineStack,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { Product } from "@shopify/app-bridge-types";
import type { ProductScope, SelectedProduct } from "../../types";
import { productScopeOptions } from "../../data/mock/widgetSettings";

interface ProductScopePickerProps {
  productScope: ProductScope;
  selectedProducts: SelectedProduct[];
  onScopeChange: (scope: ProductScope) => void;
  onProductsChange: (products: SelectedProduct[]) => void;
}

function toSelectedProduct(product: Product): SelectedProduct {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    imageUrl: product.images[0]?.originalSrc,
  };
}

export function ProductScopePicker({
  productScope,
  selectedProducts,
  onScopeChange,
  onProductsChange,
}: ProductScopePickerProps) {
  const shopify = useAppBridge();

  const openResourcePicker = useCallback(async () => {
    try {
      const selected = await shopify.resourcePicker({
        type: "product",
        action: "select",
        multiple: true,
        filter: { variants: false },
        selectionIds: selectedProducts.map((product) => ({ id: product.id })),
      });

      if (selected) {
        onProductsChange(selected.map(toSelectedProduct));
      }
    } catch {
      shopify.toast.show("Could not open product picker", { isError: true });
    }
  }, [onProductsChange, selectedProducts, shopify]);

  const removeProduct = useCallback(
    (id: string) => {
      onProductsChange(selectedProducts.filter((product) => product.id !== id));
    },
    [onProductsChange, selectedProducts],
  );

  return (
    <BlockStack gap="400">
      <ChoiceList
        title="Product scope"
        titleHidden
        choices={productScopeOptions.map((opt) => ({
          label: opt.label,
          value: opt.value,
          helpText: opt.helpText,
        }))}
        selected={[productScope]}
        onChange={(selected) => onScopeChange(selected[0] as ProductScope)}
      />

      {productScope === "selected_products" && (
        <BlockStack gap="300">
          <InlineStack align="start" gap="200">
            <Button onClick={openResourcePicker}>
              {selectedProducts.length > 0
                ? "Edit selected products"
                : "Select products"}
            </Button>
          </InlineStack>

          {selectedProducts.length > 0 ? (
            <Box
              borderColor="border"
              borderWidth="025"
              borderRadius="200"
              padding="200"
            >
              <BlockStack gap="200">
                {selectedProducts.map(({ id, title, imageUrl }) => (
                  <InlineStack
                    key={id}
                    align="space-between"
                    blockAlign="center"
                    gap="200"
                  >
                    <InlineStack gap="200" blockAlign="center">
                      {imageUrl ? (
                        <Thumbnail source={imageUrl} alt={title} size="small" />
                      ) : null}
                      <Text as="span" variant="bodyMd">
                        {title}
                      </Text>
                    </InlineStack>
                    <Button
                      variant="plain"
                      tone="critical"
                      onClick={() => removeProduct(id)}
                    >
                      Remove
                    </Button>
                  </InlineStack>
                ))}
              </BlockStack>
            </Box>
          ) : (
            <Text as="p" variant="bodySm" tone="subdued">
              No products selected. Use the button above to choose products from
              your catalog.
            </Text>
          )}
        </BlockStack>
      )}
    </BlockStack>
  );
}
