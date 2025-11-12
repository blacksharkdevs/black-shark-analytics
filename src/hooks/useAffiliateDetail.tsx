import { useContext } from "react";
import { AffiliateDetailContext } from "@/contexts/AffiliateDetailContextDefinition";

export function useAffiliateDetail() {
  const context = useContext(AffiliateDetailContext);
  if (!context) {
    throw new Error(
      "useAffiliateDetail must be used within AffiliateDetailProvider"
    );
  }
  return context;
}
