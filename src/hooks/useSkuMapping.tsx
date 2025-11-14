import { useContext } from "react";
import {
  SkuMappingContext,
  type SkuMappingContextType,
} from "@/contexts/SkuMappingContextDefinition";

export function useSkuMapping(): SkuMappingContextType {
  const context = useContext(SkuMappingContext);
  if (!context) {
    throw new Error("useSkuMapping must be used within a SkuMappingProvider");
  }
  return context;
}
