import { supabase } from "@/lib/supabaseClient";
import type { SkuConfig, UnconfiguredSkuFromRpc } from "@/types/index";

// Helper function to extract the first number from a string
const extractNumber = (str: string): number | null => {
  if (!str) return null;
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

export const skuService = {
  /**
   * Fetch all SKU configurations (both configured and unconfigured)
   * Merges data from products_skus table and get_unconfigured_skus RPC
   */
  async fetchAllSkus(): Promise<SkuConfig[]> {
    const [unconfiguredResponse, configuredResponse] = await Promise.all([
      supabase.rpc("get_unconfigured_skus"),
      supabase.from("products_skus").select("*"),
    ]);

    if (unconfiguredResponse.error) {
      console.error(
        "Error fetching unconfigured SKUs:",
        unconfiguredResponse.error
      );
      throw new Error(
        unconfiguredResponse.error.message ||
          "Failed to fetch unconfigured SKUs"
      );
    }

    if (configuredResponse.error) {
      console.error(
        "Error fetching configured SKUs:",
        configuredResponse.error
      );
      throw new Error(
        configuredResponse.error.message || "Failed to fetch configured SKUs"
      );
    }

    const unconfiguredData = (unconfiguredResponse.data ||
      []) as UnconfiguredSkuFromRpc[];
    const configuredData = (configuredResponse.data || []) as SkuConfig[];

    // Create a map of configured SKUs for quick lookup
    const configuredSkusMap = new Map(
      configuredData.map((item) => [
        `${item.merchant_id}-${item.original_name}`,
        item,
      ])
    );

    const combinedDataMap = new Map<string, SkuConfig>();

    // 1. Process all unconfigured SKUs, merging with existing config if available
    unconfiguredData.forEach((item) => {
      const originalName = item.original_product_name;
      const key = `${item.merchant_id}-${originalName}`;
      const existingConfig = configuredSkusMap.get(key);

      combinedDataMap.set(key, {
        merchant_id: item.merchant_id,
        original_name: originalName,
        upsell: item.upsell,
        display_name: existingConfig?.display_name || originalName,
        unit_count: existingConfig?.unit_count ?? extractNumber(originalName),
        item_type: existingConfig?.item_type ?? (item.upsell ? "up1" : "front"),
        main_product_id: existingConfig?.main_product_id ?? null,
      });
    });

    // 2. Add any configured SKUs that were not in the unconfigured list
    configuredSkusMap.forEach((config, key) => {
      if (!combinedDataMap.has(key)) {
        combinedDataMap.set(key, {
          ...config,
          upsell: undefined, // Not present in sales_data, so cannot determine
        });
      }
    });

    // Convert to array and sort
    const combinedSkus = Array.from(combinedDataMap.values());
    combinedSkus.sort((a, b) =>
      `${a.merchant_id}-${a.original_name}`.localeCompare(
        `${b.merchant_id}-${b.original_name}`
      )
    );

    return combinedSkus;
  },

  /**
   * Save or update a SKU configuration
   */
  async saveSku(sku: SkuConfig): Promise<void> {
    const dataToUpsert = {
      merchant_id: sku.merchant_id,
      original_name: sku.original_name,
      display_name: sku.display_name || null,
      main_product_id: sku.main_product_id ? Number(sku.main_product_id) : null,
      unit_count: sku.unit_count ? Number(sku.unit_count) : null,
      item_type: sku.item_type || null,
    };

    const { error } = await supabase
      .from("products_skus")
      .upsert(dataToUpsert, { onConflict: "merchant_id,original_name" });

    if (error) {
      console.error("Error saving SKU:", error);
      throw new Error(error.message || "Failed to save SKU");
    }
  },

  /**
   * Delete a SKU configuration
   */
  async deleteSku(merchantId: string, originalName: string): Promise<void> {
    const { error } = await supabase
      .from("products_skus")
      .delete()
      .eq("merchant_id", merchantId)
      .eq("original_name", originalName);

    if (error) {
      console.error("Error deleting SKU:", error);
      throw new Error(error.message || "Failed to delete SKU");
    }
  },
};
