import { supabase } from "@/lib/supabaseClient";
import { type ProductConfig } from "@/types/index";

/**
 * Busca a lista de produtos configurados no Supabase para uso em filtros.
 * @returns {Promise<ProductConfig[]>} Lista de produtos, incluindo a opção "All Products".
 */
export async function fetchProductsForFilter(): Promise<ProductConfig[]> {
  // 1. Busca os dados brutos
  const { data, error } = await supabase
    .from("config_products")
    .select("merchant_id, product_name")
    .order("product_name");

  if (error) {
    console.error("ERRO ao buscar produtos:", error);
    // Retorna apenas a opção 'All Products' em caso de erro
    return [{ id: "all", name: "All Products" }];
  }

  // 2. Transforma o dado bruto no formato ProductConfig
  const productsForFilter: ProductConfig[] = data.map((p) => ({
    id: p.merchant_id,
    name: p.product_name,
  }));

  // 3. Adiciona a opção padrão
  return [{ id: "all", name: "All Products" }, ...productsForFilter];
}

/**
 * Busca a lista de plataformas distintas a partir dos dados de vendas.
 * @returns {Promise<string[]>} Lista de nomes de plataformas.
 */
export async function fetchDistinctSalesPlatforms(): Promise<string[]> {
  const { data, error } = await supabase.rpc(
    "get_distinct_sales_platforms" // Assumindo que este RPC retorna [{ platform: string }]
  );

  if (error) {
    console.error("ERRO ao buscar plataformas:", error);
    return [];
  }

  // Transforma o array de objetos em um array de strings
  const distinctPlatforms = (data as Array<{ platform: string }>)
    .map((item) => item.platform)
    .sort();

  return distinctPlatforms;
}
