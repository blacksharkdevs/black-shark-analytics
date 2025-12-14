import type { Product } from "@/types/index";

/**
 * Extrai o nome base do produto removendo variações comuns
 * Ex: "Free Sugar Pro 3 bottles" -> "Free Sugar"
 *     "Free Sugar Pro 6 bottles + 3 free" -> "Free Sugar"
 */
export function extractProductBaseName(productName: string): string {
  // Remove números e variações comuns
  const baseName = productName
    // Remove padrões de quantidade (3 bottles, 6 bottles, etc)
    .replace(/\d+\s*(bottle|bottles|unit|units|pack|packs)/gi, "")
    // Remove "+ X free" ou similar
    .replace(/\+\s*\d+\s*(free|bonus|extra).*/gi, "")
    // Remove "Pro", "Plus", "Premium" no final
    .replace(/\s+(pro|plus|premium)\s*$/gi, "")
    // Remove espaços extras e trim
    .replace(/\s+/g, " ")
    .trim();

  // Se ficou vazio, retorna o nome original
  return baseName || productName;
}

/**
 * Interface para produto agrupado
 */
export interface GroupedProduct extends Product {
  isGrouped: boolean;
  groupedProducts?: Product[]; // Produtos que foram agrupados
  originalName?: string; // Nome original antes do agrupamento
}

/**
 * Agrupa produtos com nomes semelhantes
 */
export function groupSimilarProducts(products: Product[]): GroupedProduct[] {
  // Mapa para agrupar produtos por nome base
  const groupMap = new Map<string, Product[]>();

  // Primeiro, agrupa produtos por nome base
  products.forEach((product) => {
    const baseName = extractProductBaseName(product.name);
    const existing = groupMap.get(baseName) || [];
    groupMap.set(baseName, [...existing, product]);
  });

  // Converte o mapa em array de produtos agrupados
  const groupedProducts: GroupedProduct[] = [];

  groupMap.forEach((productList, baseName) => {
    if (productList.length === 1) {
      // Produto único, não precisa agrupar
      groupedProducts.push({
        ...productList[0],
        isGrouped: false,
      });
    } else {
      // Múltiplos produtos com o mesmo nome base
      // Cria um produto "virtual" que representa o grupo
      const firstProduct = productList[0];

      groupedProducts.push({
        ...firstProduct,
        id: `grouped-${baseName}`,
        name: baseName,
        isGrouped: true,
        groupedProducts: productList,
        originalName: firstProduct.name,
      });
    }
  });

  // Ordena por nome
  return groupedProducts.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Retorna lista de nomes de produtos agrupados formatada
 */
export function getGroupedProductNames(groupedProduct: GroupedProduct): string {
  if (!groupedProduct.isGrouped || !groupedProduct.groupedProducts) {
    return groupedProduct.name;
  }

  return groupedProduct.groupedProducts.map((p) => `• ${p.name}`).join("\n");
}
