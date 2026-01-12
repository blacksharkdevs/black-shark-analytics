/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import type {
  ProductGroupingArsenal,
  CustomProductGroup,
} from "@/types/arsenal";
import * as ArsenalService from "@/services/arsenalService";

// ===================================================================
// CONTEXT TYPE
// ===================================================================

interface ArsenalContextType {
  // Estado
  arsenals: ProductGroupingArsenal[];
  activeArsenal: ProductGroupingArsenal | null;
  isLoading: boolean;

  // CRUD de Arsenais
  loadArsenals: () => void;
  createArsenal: (
    data: Omit<
      ProductGroupingArsenal,
      "id" | "userId" | "createdAt" | "updatedAt"
    >
  ) => void;
  updateArsenal: (id: string, data: Partial<ProductGroupingArsenal>) => void;
  deleteArsenal: (id: string) => void;

  // Ativação
  setActiveArsenal: (id: string) => void;

  // CRUD de Grupos Customizados
  addCustomGroup: (
    group: Omit<CustomProductGroup, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateCustomGroup: (
    groupId: string,
    data: Partial<CustomProductGroup>
  ) => void;
  deleteCustomGroup: (groupId: string) => void;
}

const ArsenalContext = createContext<ArsenalContextType | undefined>(undefined);

// ===================================================================
// PROVIDER
// ===================================================================

export const ArsenalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [arsenals, setArsenals] = useState<ProductGroupingArsenal[]>([]);
  const [activeArsenal, setActiveArsenalState] =
    useState<ProductGroupingArsenal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega arsenais do usuário
  const loadArsenals = useCallback(() => {
    if (!user?.email) {
      setArsenals([]);
      setActiveArsenalState(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const userArsenals = ArsenalService.loadArsenalsFromStorage(user.email);
      setArsenals(userArsenals);

      // Carrega arsenal ativo
      const activeId = ArsenalService.getActiveArsenalId();

      if (activeId) {
        const active = userArsenals.find((a) => a.id === activeId);
        if (active) {
          setActiveArsenalState(active);
        } else {
          // Arsenal ativo não existe mais, usa o default
          const defaultArsenal = userArsenals.find((a) => a.isDefault);
          setActiveArsenalState(defaultArsenal || userArsenals[0] || null);
          if (defaultArsenal) {
            ArsenalService.setActiveArsenalId(defaultArsenal.id);
          }
        }
      } else {
        // Nenhum arsenal ativo, usa o default
        const defaultArsenal = userArsenals.find((a) => a.isDefault);
        setActiveArsenalState(defaultArsenal || userArsenals[0] || null);
        if (defaultArsenal) {
          ArsenalService.setActiveArsenalId(defaultArsenal.id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar arsenais:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Carrega arsenais quando usuário muda
  useEffect(() => {
    loadArsenals();
  }, [loadArsenals]);

  // Cria novo arsenal
  const createArsenal = useCallback(
    (
      data: Omit<
        ProductGroupingArsenal,
        "id" | "userId" | "createdAt" | "updatedAt"
      >
    ) => {
      if (!user?.email) return;

      ArsenalService.createArsenal(user.email, data);
      loadArsenals();
    },
    [user, loadArsenals]
  );

  // Atualiza arsenal
  const updateArsenal = useCallback(
    (id: string, data: Partial<ProductGroupingArsenal>) => {
      if (!user?.email) return;

      // Não permite editar arsenais do sistema
      const arsenal = arsenals.find((a) => a.id === id);
      if (arsenal?.isDefault) {
        console.warn("Não é possível editar arsenais do sistema");
        return;
      }

      ArsenalService.updateArsenal(user.email, id, data);
      loadArsenals();
    },
    [user, arsenals, loadArsenals]
  );

  // Deleta arsenal
  const deleteArsenal = useCallback(
    (id: string) => {
      if (!user?.email) return;

      // Não permite deletar arsenais do sistema
      const arsenal = arsenals.find((a) => a.id === id);
      if (arsenal?.isDefault) {
        console.warn("Não é possível deletar arsenais do sistema");
        return;
      }

      ArsenalService.deleteArsenal(user.email, id);
      loadArsenals();
    },
    [user, arsenals, loadArsenals]
  );

  // Define arsenal ativo
  const setActiveArsenal = useCallback(
    (id: string) => {
      const arsenal = arsenals.find((a) => a.id === id);
      if (!arsenal) return;

      setActiveArsenalState(arsenal);
      ArsenalService.setActiveArsenalId(id);
    },
    [arsenals]
  );

  // Adiciona grupo customizado ao arsenal ativo
  const addCustomGroup = useCallback(
    (group: Omit<CustomProductGroup, "id" | "createdAt" | "updatedAt">) => {
      if (!user?.email || !activeArsenal) return;

      ArsenalService.addCustomGroupToArsenal(
        user.email,
        activeArsenal.id,
        group
      );
      loadArsenals();
    },
    [user, activeArsenal, loadArsenals]
  );

  // Atualiza grupo customizado
  const updateCustomGroup = useCallback(
    (groupId: string, data: Partial<CustomProductGroup>) => {
      if (!user?.email || !activeArsenal) return;

      ArsenalService.updateCustomGroup(
        user.email,
        activeArsenal.id,
        groupId,
        data
      );
      loadArsenals();
    },
    [user, activeArsenal, loadArsenals]
  );

  // Deleta grupo customizado
  const deleteCustomGroup = useCallback(
    (groupId: string) => {
      if (!user?.email || !activeArsenal) return;

      ArsenalService.deleteCustomGroup(user.email, activeArsenal.id, groupId);
      loadArsenals();
    },
    [user, activeArsenal, loadArsenals]
  );

  const value: ArsenalContextType = {
    arsenals,
    activeArsenal,
    isLoading,
    loadArsenals,
    createArsenal,
    updateArsenal,
    deleteArsenal,
    setActiveArsenal,
    addCustomGroup,
    updateCustomGroup,
    deleteCustomGroup,
  };

  return (
    <ArsenalContext.Provider value={value}>{children}</ArsenalContext.Provider>
  );
};

// ===================================================================
// HOOK
// ===================================================================

export function useArsenal() {
  const context = useContext(ArsenalContext);
  if (context === undefined) {
    throw new Error("useArsenal must be used within an ArsenalProvider");
  }
  return context;
}
