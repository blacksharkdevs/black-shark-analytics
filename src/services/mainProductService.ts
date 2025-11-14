import { supabase } from "@/lib/supabaseClient";
import type { MainProduct } from "@/types/index";

export const mainProductService = {
  /**
   * Fetch all main products
   */
  async fetchMainProducts(): Promise<MainProduct[]> {
    const { data, error } = await supabase
      .from("products_main")
      .select("id, name")
      .order("name");

    if (error) {
      console.error("Error fetching main products:", error);
      throw new Error(error.message || "Failed to fetch main products");
    }

    return data || [];
  },

  /**
   * Create a new main product
   */
  async createMainProduct(name: string): Promise<MainProduct> {
    const { data, error } = await supabase
      .from("products_main")
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error("Error creating main product:", error);
      throw new Error(error.message || "Failed to create main product");
    }

    return data;
  },

  /**
   * Update an existing main product
   */
  async updateMainProduct(id: number, name: string): Promise<MainProduct> {
    const { data, error } = await supabase
      .from("products_main")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating main product:", error);
      throw new Error(error.message || "Failed to update main product");
    }

    return data;
  },

  /**
   * Delete a main product
   */
  async deleteMainProduct(id: number): Promise<void> {
    const { error } = await supabase
      .from("products_main")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting main product:", error);
      throw new Error(error.message || "Failed to delete main product");
    }
  },
};
