import type {
  ProductGroupingArsenal,
  CustomProductGroup,
} from "@/types/arsenal";

const ARSENAL_STORAGE_KEY = "blackshark_arsenals";
const ACTIVE_ARSENAL_KEY = "blackshark_active_arsenal_id";

/**
 * Cria o arsenal padrão que toda conta começa usando
 * Usa a lógica de agrupamento atual (automática por nome)
 */
export function createDefaultArsenal(userId: string): ProductGroupingArsenal {
  return {
    id: "default",
    userId,
    name: "Agrupamento Automático",
    description:
      "🔷 Arsenal padrão do sistema. Agrupa automaticamente todos os produtos por nomes similares, sem separar Frontend de Upsells. Ideal para análise rápida e visão geral.",
    isDefault: true,
    customGroups: [], // Vazio porque usa auto-grouping
    config: {
      autoGroupUngrouped: true, // Agrupa automaticamente
      showIndividualProducts: false,
      sortBy: "name",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Cria arsenal com separação Frontend/Upsell
 * Agrupa produtos principais e seus upsells específicos
 */
export function createFrontendUpsellArsenal(
  userId: string
): ProductGroupingArsenal {
  const customGroups: CustomProductGroup[] = [
    // 1. Men Balance
    {
      id: "group-men-balance",
      name: "Men Balance",
      description: "Men Balance e seus upsells",
      matchRules: [
        { type: "contains", value: "men balance", caseSensitive: false },
      ],
      offers: [
        {
          id: "offer-tmax-1",
          name: "T-Max",
          offerType: "UPSELL",
          matchRules: [
            { type: "contains", value: "t-max", caseSensitive: false },
            { type: "contains", value: "tmax", caseSensitive: false },
          ],
          order: 1,
        },
        {
          id: "offer-vigor-1",
          name: "Vigor Boost",
          offerType: "UPSELL",
          matchRules: [
            { type: "contains", value: "vigor boost", caseSensitive: false },
          ],
          order: 2,
        },
      ],
      color: "#3b82f6",
      icon: "💪",
      order: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // 2. Free Sugar Pro
    {
      id: "group-free-sugar",
      name: "Free Sugar Pro",
      description: "Free Sugar Pro e seus upsells",
      matchRules: [
        { type: "contains", value: "free sugar", caseSensitive: false },
      ],
      offers: [],
      color: "#10b981",
      icon: "🍬",
      order: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // 3. GLPro
    {
      id: "group-glpro",
      name: "GLPro",
      description: "GLPro e seus upsells",
      matchRules: [
        { type: "contains", value: "glpro", caseSensitive: false },
        { type: "contains", value: "gl pro", caseSensitive: false },
      ],
      offers: [
        {
          id: "offer-vigor-2",
          name: "Vigor Boost",
          offerType: "UPSELL",
          matchRules: [
            { type: "contains", value: "vigor boost", caseSensitive: false },
          ],
          order: 1,
        },
        {
          id: "offer-tmax-2",
          name: "T-Max",
          offerType: "UPSELL",
          matchRules: [
            { type: "contains", value: "t-max", caseSensitive: false },
            { type: "contains", value: "tmax", caseSensitive: false },
          ],
          order: 2,
        },
      ],
      color: "#8b5cf6",
      icon: "⚡",
      order: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // 4. Glucose Reset Ritual (GRR)
    {
      id: "group-grr",
      name: "Glucose Reset Ritual",
      description: "GRR e seus upsells",
      matchRules: [
        {
          type: "contains",
          value: "glucose reset ritual",
          caseSensitive: false,
        },
        { type: "contains", value: "grr", caseSensitive: false },
      ],
      offers: [
        {
          id: "offer-metabolic",
          name: "Metabolic Defense Accelerator",
          offerType: "UPSELL",
          matchRules: [
            {
              type: "contains",
              value: "metabolic defense accelerator",
              caseSensitive: false,
            },
          ],
          order: 1,
        },
        {
          id: "offer-harmony",
          name: "Glucose Harmony Elixir",
          offerType: "UPSELL",
          matchRules: [
            {
              type: "contains",
              value: "glucose harmony elixir",
              caseSensitive: false,
            },
          ],
          order: 2,
        },
        {
          id: "offer-21day",
          name: "21-Day Wellness Reset",
          offerType: "UPSELL",
          matchRules: [
            {
              type: "contains",
              value: "21-day wellness reset",
              caseSensitive: false,
            },
            {
              type: "contains",
              value: "21 day wellness reset",
              caseSensitive: false,
            },
          ],
          order: 3,
        },
      ],
      color: "#f59e0b",
      icon: "🎯",
      order: 4,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return {
    id: "frontend-upsell",
    userId,
    name: "Frontend + Upsells",
    description:
      "🔷 Arsenal padrão do sistema. Separa produtos principais (Frontend) de seus Upsells. Contém Men Balance, Free Sugar Pro, GLPro e Glucose Reset Ritual com suas respectivas ofertas. Ideal para análise detalhada de conversão.",
    isDefault: true, // Marcado como padrão do sistema
    customGroups,
    config: {
      autoGroupUngrouped: false, // Não agrupa automaticamente
      showIndividualProducts: true, // Mostra produtos não matcheados
      sortBy: "name",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Migra arsenais existentes para garantir que os padrões estejam atualizados
 */
function migrateSystemArsenals(
  arsenals: ProductGroupingArsenal[]
): ProductGroupingArsenal[] {
  let needsUpdate = false;
  const migratedArsenals = arsenals.map((arsenal) => {
    // Atualiza arsenal padrão "default"
    if (arsenal.id === "default" && !arsenal.isDefault) {
      needsUpdate = true;
      return {
        ...arsenal,
        isDefault: true,
        name: "Agrupamento Automático",
        description:
          "🔷 Arsenal padrão do sistema. Agrupa automaticamente todos os produtos por nomes similares, sem separar Frontend de Upsells. Ideal para análise rápida e visão geral.",
        updatedAt: new Date(),
      };
    }

    // Atualiza arsenal "frontend-upsell"
    if (arsenal.id === "frontend-upsell" && !arsenal.isDefault) {
      needsUpdate = true;
      return {
        ...arsenal,
        isDefault: true,
        name: "Frontend + Upsells",
        description:
          "🔷 Arsenal padrão do sistema. Separa produtos principais (Frontend) de seus Upsells. Contém Men Balance, Free Sugar Pro, GLPro e Glucose Reset Ritual com suas respectivas ofertas. Ideal para análise detalhada de conversão.",
        updatedAt: new Date(),
      };
    }

    return arsenal;
  });

  if (needsUpdate) {
    console.log("✅ Arsenais do sistema foram atualizados automaticamente");
  }

  return migratedArsenals;
}

/**
 * Carrega arsenais do localStorage
 */
export function loadArsenalsFromStorage(
  userId: string
): ProductGroupingArsenal[] {
  try {
    const stored = localStorage.getItem(ARSENAL_STORAGE_KEY);
    if (!stored) {
      // Cria arsenais padrão se não existir
      const defaultArsenal = createDefaultArsenal(userId);
      const frontendUpsellArsenal = createFrontendUpsellArsenal(userId);
      const arsenals = [defaultArsenal, frontendUpsellArsenal];
      saveArsenalsToStorage(arsenals);
      return arsenals;
    }

    let allArsenals: ProductGroupingArsenal[] = JSON.parse(stored);

    // Migra arsenais do sistema para garantir que estão atualizados
    allArsenals = migrateSystemArsenals(allArsenals);
    saveArsenalsToStorage(allArsenals);

    // Filtra arsenais do usuário
    const userArsenals = allArsenals.filter((a) => a.userId === userId);

    // Se usuário não tem arsenais, cria os padrões
    if (userArsenals.length === 0) {
      const defaultArsenal = createDefaultArsenal(userId);
      const frontendUpsellArsenal = createFrontendUpsellArsenal(userId);
      const newArsenals = [defaultArsenal, frontendUpsellArsenal];
      saveArsenalsToStorage([...allArsenals, ...newArsenals]);
      return newArsenals;
    }

    // Verifica se precisa adicionar o arsenal Frontend+Upsell
    const hasFrontendUpsell = userArsenals.some(
      (a) => a.id === "frontend-upsell"
    );
    if (!hasFrontendUpsell) {
      const frontendUpsellArsenal = createFrontendUpsellArsenal(userId);
      const updatedArsenals = [...allArsenals, frontendUpsellArsenal];
      saveArsenalsToStorage(updatedArsenals);
      return [...userArsenals, frontendUpsellArsenal];
    }

    return userArsenals;
  } catch (error) {
    console.error("Erro ao carregar arsenais:", error);
    const defaultArsenal = createDefaultArsenal(userId);
    const frontendUpsellArsenal = createFrontendUpsellArsenal(userId);
    return [defaultArsenal, frontendUpsellArsenal];
  }
}

/**
 * Salva arsenais no localStorage
 */
export function saveArsenalsToStorage(
  arsenals: ProductGroupingArsenal[]
): void {
  try {
    localStorage.setItem(ARSENAL_STORAGE_KEY, JSON.stringify(arsenals));
  } catch (error) {
    console.error("Erro ao salvar arsenais:", error);
  }
}

/**
 * Carrega ID do arsenal ativo
 */
export function getActiveArsenalId(): string | null {
  return localStorage.getItem(ACTIVE_ARSENAL_KEY);
}

/**
 * Salva ID do arsenal ativo
 */
export function setActiveArsenalId(arsenalId: string): void {
  localStorage.setItem(ACTIVE_ARSENAL_KEY, arsenalId);
}

/**
 * Cria um novo arsenal
 */
export function createArsenal(
  userId: string,
  data: Omit<
    ProductGroupingArsenal,
    "id" | "userId" | "createdAt" | "updatedAt"
  >
): ProductGroupingArsenal {
  const newArsenal: ProductGroupingArsenal = {
    ...data,
    id: `arsenal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const allArsenals = loadArsenalsFromStorage(userId);
  saveArsenalsToStorage([...allArsenals, newArsenal]);

  return newArsenal;
}

/**
 * Atualiza um arsenal existente
 */
export function updateArsenal(
  userId: string,
  arsenalId: string,
  data: Partial<ProductGroupingArsenal>
): ProductGroupingArsenal | null {
  const allArsenals = loadArsenalsFromStorage(userId);
  const index = allArsenals.findIndex((a) => a.id === arsenalId);

  if (index === -1) return null;

  const updatedArsenal: ProductGroupingArsenal = {
    ...allArsenals[index],
    ...data,
    updatedAt: new Date(),
  };

  allArsenals[index] = updatedArsenal;
  saveArsenalsToStorage(allArsenals);

  return updatedArsenal;
}

/**
 * Deleta um arsenal
 */
export function deleteArsenal(userId: string, arsenalId: string): boolean {
  const allArsenals = loadArsenalsFromStorage(userId);
  const filtered = allArsenals.filter((a) => a.id !== arsenalId);

  if (filtered.length === allArsenals.length) return false;

  saveArsenalsToStorage(filtered);

  // Se deletou o arsenal ativo, limpa
  if (getActiveArsenalId() === arsenalId) {
    localStorage.removeItem(ACTIVE_ARSENAL_KEY);
  }

  return true;
}

/**
 * Adiciona grupo customizado a um arsenal
 */
export function addCustomGroupToArsenal(
  userId: string,
  arsenalId: string,
  group: Omit<CustomProductGroup, "id" | "createdAt" | "updatedAt">
): CustomProductGroup | null {
  const arsenal = loadArsenalsFromStorage(userId).find(
    (a) => a.id === arsenalId
  );
  if (!arsenal) return null;

  const newGroup: CustomProductGroup = {
    ...group,
    id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  updateArsenal(userId, arsenalId, {
    customGroups: [...arsenal.customGroups, newGroup],
  });

  return newGroup;
}

/**
 * Atualiza grupo customizado
 */
export function updateCustomGroup(
  userId: string,
  arsenalId: string,
  groupId: string,
  data: Partial<CustomProductGroup>
): CustomProductGroup | null {
  const arsenal = loadArsenalsFromStorage(userId).find(
    (a) => a.id === arsenalId
  );
  if (!arsenal) return null;

  const groupIndex = arsenal.customGroups.findIndex((g) => g.id === groupId);
  if (groupIndex === -1) return null;

  const updatedGroup: CustomProductGroup = {
    ...arsenal.customGroups[groupIndex],
    ...data,
    updatedAt: new Date(),
  };

  const updatedGroups = [...arsenal.customGroups];
  updatedGroups[groupIndex] = updatedGroup;

  updateArsenal(userId, arsenalId, { customGroups: updatedGroups });

  return updatedGroup;
}

/**
 * Remove grupo customizado
 */
export function deleteCustomGroup(
  userId: string,
  arsenalId: string,
  groupId: string
): boolean {
  const arsenal = loadArsenalsFromStorage(userId).find(
    (a) => a.id === arsenalId
  );
  if (!arsenal) return false;

  const updatedGroups = arsenal.customGroups.filter((g) => g.id !== groupId);

  if (updatedGroups.length === arsenal.customGroups.length) return false;

  updateArsenal(userId, arsenalId, { customGroups: updatedGroups });

  return true;
}
