// Importamos todos os componentes de UI que consomem o contexto
import { Filters } from "@/components/dashboard/Filters";
import { StatsCard } from "@/components/dashboard/StatsCard";
// import { SalesTrendChart } from "@/components/dashboard/SalesTrendChart";
// import { TopProductsTable } from "@/components/dashboard/TopProductsTable";
// import { TopAffiliatesTable } from "@/components/dashboard/TopAffiliatesTable";
// import { TopSellingItemsTable } from "@/components/dashboard/TopSellingItemsTable";

// 🔑 Consumo: Este hook será usado nos componentes filhos, não aqui!
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";

import { ACTION_TYPES } from "@/lib/config";
import {
  DollarSign,
  BarChart3,
  Users,
  Package,
  BadgePercent,
} from "lucide-react";
import { DashboardDataProvider } from "@/contexts/DashboardDataContext";
import { StatsCards } from "@/components/dashboard/StatsCards";

/**
 * Componente Wrapper: Contém a organização visual da página.
 * Ele consome o estado de carregamento do ConfigContext para mostrar os esqueletos
 */
function DashboardPageContent() {
  // 🔑 CONSUMO: Apenas para puxar os filtros e o loading para o Filters component
  const {
    availableProducts,
    selectedProduct,
    setSelectedProduct,
    selectedActionType,
    setSelectedActionType,
    isFetchingProducts,
  } = useDashboardData();

  // 🔑 CONSUMO: Apenas para saber o loading do Data Range
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isCombinedLoading = isFetchingProducts || isDateRangeLoading;

  return (
    <div className="container p-0 mx-auto space-y-6">
      <div className="p-4 border rounded-none shadow bg-card/50 border-border">
        <Filters
          products={availableProducts}
          selectedProduct={selectedProduct}
          onProductChange={setSelectedProduct}
          actionTypes={ACTION_TYPES}
          selectedActionType={selectedActionType}
          onActionTypeChange={setSelectedActionType}
          isLoading={isCombinedLoading}
        />
      </div>

      {/* --- 2. Cartões de Estatísticas (COMPONENTES CONSUMINDO O CONTEXTO) --- */}
      <div className="container p-0 mx-auto space-y-6">
        <StatsCards />
      </div>

      {/* --- 3. Charts e Tabelas --- */}
      {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesTrendChart />
        </div>
        <div className="lg:col-span-1">
          <TopAffiliatesTable />
        </div>
        <div className="lg:col-span-2">
          <TopSellingItemsTable />
        </div>
        <div className="lg:col-span-1">
          <TopProductsTable />
        </div>
      </div> */}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardDataProvider>
      <DashboardPageContent />
    </DashboardDataProvider>
  );
}
