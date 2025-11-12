import { AffiliatesContext } from "@/contexts/AffiliatesContextDefinition";
import { useContext } from "react";

/**
 * Hook customizado para acessar o estado e os handlers do Contexto de Afiliados.
 * Deve ser usado dentro do AffiliatesProvider.
 */
export function useAffiliates() {
  const context = useContext(AffiliatesContext);

  if (context === undefined) {
    throw new Error(
      "useAffiliates deve ser usado dentro de um AffiliatesProvider"
    );
  }

  return context;
}
