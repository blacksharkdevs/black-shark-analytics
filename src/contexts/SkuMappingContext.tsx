import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { skuService } from "@/services/skuService";
import { mainProductService } from "@/services/mainProductService";
import type { SkuConfig, MainProduct } from "@/types/index";
import {
  SkuMappingContext,
  type SkuMappingContextType,
} from "./SkuMappingContextDefinition";

interface SkuMappingProviderProps {
  children: React.ReactNode;
}

export function SkuMappingProvider({ children }: SkuMappingProviderProps) {
  const [skuConfigs, setSkuConfigs] = useState<SkuConfig[]>([]);
  const [mainProducts, setMainProducts] = useState<MainProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingRow, setSavingRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();

  const fetchSkuData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [skus, products] = await Promise.all([
        skuService.fetchAllSkus(),
        mainProductService.fetchMainProducts(),
      ]);

      setSkuConfigs(skus);
      setMainProducts(products);
    } catch (error) {
      console.error("Error fetching SKU data:", error);
      toast({
        title: "Error",
        description: "Failed to load SKU data.",
        variant: "destructive",
      });
      setSkuConfigs([]);
      setMainProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSkuData();
  }, [fetchSkuData]);

  const handleInputChange = useCallback(
    (
      merchantId: string,
      originalName: string,
      field: keyof SkuConfig,
      value: unknown
    ) => {
      setSkuConfigs((prev) =>
        prev.map((sku) =>
          sku.merchant_id === merchantId && sku.original_name === originalName
            ? { ...sku, [field]: value }
            : sku
        )
      );
    },
    []
  );

  const handleSaveSku = useCallback(
    async (sku: SkuConfig) => {
      const rowKey = `${sku.merchant_id}-${sku.original_name}`;
      setSavingRow(rowKey);

      try {
        await skuService.saveSku(sku);
        toast({
          title: "Success",
          description: `SKU ${sku.merchant_id} saved successfully.`,
        });
      } catch (error) {
        console.error("Error saving SKU:", error);
        toast({
          title: "Error",
          description: `Failed to save SKU ${sku.merchant_id} - ${sku.original_name}`,
          variant: "destructive",
        });
      } finally {
        setSavingRow(null);
      }
    },
    [toast]
  );

  const filteredSkuConfigs = useMemo(() => {
    if (!searchTerm) return skuConfigs;
    const lowercasedTerm = searchTerm.toLowerCase();
    return skuConfigs.filter(
      (sku) =>
        (sku.merchant_id &&
          sku.merchant_id.toLowerCase().includes(lowercasedTerm)) ||
        (sku.original_name &&
          sku.original_name.toLowerCase().includes(lowercasedTerm)) ||
        (sku.display_name &&
          sku.display_name.toLowerCase().includes(lowercasedTerm))
    );
  }, [skuConfigs, searchTerm]);

  const contextValue: SkuMappingContextType = {
    skuConfigs,
    filteredSkuConfigs,
    isLoading,
    searchTerm,
    savingRow,
    mainProducts,
    setSearchTerm,
    handleInputChange,
    handleSaveSku,
    refreshSkuData: fetchSkuData,
  };

  return (
    <SkuMappingContext.Provider value={contextValue}>
      {children}
    </SkuMappingContext.Provider>
  );
}
