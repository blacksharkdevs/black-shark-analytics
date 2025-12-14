/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import CountUp from "react-countup";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/common/ui/skeleton";
import { formatCurrency } from "@/utils/index";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";

interface ProductRevenue {
  productName: string;
  totalRevenue: number;
}

export function TopProductsTable() {
  const { t } = useTranslation();
  const { filteredSalesData: data, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;
  const duration = 1.5;

  const topProducts = useMemo(() => {
    const productRevenueMap = data.reduce((acc, record) => {
      // Filtrar apenas vendas completadas
      if (record.type !== "SALE" || record.status !== "COMPLETED") return acc;

      const productName = record.product?.name || "Unknown Product";

      if (!acc[productName]) {
        acc[productName] = {
          productName: productName,
          totalRevenue: 0,
        } as ProductRevenue;
      }
      acc[productName].totalRevenue += Number(record.grossAmount);
      return acc;
    }, {} as Record<string, ProductRevenue>);

    return Object.values(productRevenueMap)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [data]);

  // --- RENDERIZAÇÃO CONDICIONAL ---

  if (isLoading) {
    return (
      <Card className="h-full border rounded-none shadow-lg border-white/30">
        <CardHeader>
          <Skeleton className="w-40 mb-1 rounded-none h-7 bg-accent/20" />
          <Skeleton className="w-56 h-4 rounded-none bg-accent/20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 border-b border-border/50"
              >
                <Skeleton className="w-24 h-5 bg-accent/20" />
                <Skeleton className="w-16 h-5 bg-accent/20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topProducts.length === 0 && !isLoading) {
    return (
      <Card className="h-full border rounded-none shadow-lg border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            {/* Mantido o seu estilo de ícone original */}
            <Package className="w-6 h-6 mr-2 text-blue-700 dark:text-white" />{" "}
            {t("dashboard.charts.topProducts")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.charts.topProductsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-center text-muted-foreground">
            {t("dashboard.charts.noProductData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="h-full border rounded-none shadow-lg border-white/30 backdrop-blur-sm relative"
      style={{ zIndex: 1 }}
    >
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          {/* Mantido o seu estilo de ícone original */}
          <Package className="w-6 h-6 mr-2 text-blue-600 dark:text-white" />{" "}
          {t("dashboard.charts.topProducts")}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t("dashboard.charts.topProductsDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="text-muted-foreground">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>{t("dashboard.charts.product")}</TableHead>
              <TableHead className="text-right">
                {t("dashboard.charts.totalRevenue")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((product: any) => (
              <TableRow
                key={product.productName}
                className="transition-colors hover:bg-accent/10 border-border/50"
              >
                <TableCell className="text-foreground">
                  {product.productName}
                </TableCell>
                <TableCell className="font-semibold text-right text-primary tabular-nums">
                  <CountUp
                    start={0}
                    end={product.totalRevenue}
                    duration={duration}
                    decimals={2}
                    prefix="$"
                    separator=","
                    decimal="."
                    formattingFn={formatCurrency}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
