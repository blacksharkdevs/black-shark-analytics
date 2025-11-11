import { useMemo } from "react";
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
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Badge } from "@/components/common/ui/badge";

import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { formatCurrency } from "@/utils/index";

interface ItemStats {
  productName: string;
  totalRevenue: number;
  totalSales: number;
  isUpsell: boolean;
}

export function TopSellingItemsTable() {
  const { filteredSalesData: data, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;
  const duration = 1.5;

  const topItems = useMemo(() => {
    const itemStatsMap = data.reduce((acc, record) => {
      const productName = record.product_name_from_sale || "Unknown Item";
      const isUpsell = record.action_type === "back_sale";
      const key = `${productName}-${isUpsell}`;

      if (!acc[key]) {
        acc[key] = {
          productName: productName,
          totalRevenue: 0,
          totalSales: 0,
          isUpsell: isUpsell,
        } as ItemStats;
      }
      acc[key].totalRevenue += record.revenue;
      acc[key].totalSales += 1;
      return acc;
    }, {} as Record<string, ItemStats>);

    return Object.values(itemStatsMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [data]);

  // --- RENDERIZAÇÃO CONDICIONAL ---

  if (isLoading) {
    return (
      <Card className="h-full border rounded-none shadow-lg border-white/30">
        <CardHeader>
          <Skeleton className="w-48 mb-1 rounded-none h-7 bg-accent/20" />
          <Skeleton className="w-64 h-4 rounded-none bg-accent/20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 border-b border-border/50"
              >
                <Skeleton className="w-3/4 h-5 bg-accent/20" />
                <Skeleton className="w-1/4 h-5 bg-accent/20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topItems.length === 0 && !isLoading) {
    return (
      <Card className="h-full border rounded-none shadow-lg border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <TrendingUp className="w-6 h-6 mr-2 text-accent" /> Top 5 Selling
            Items
          </CardTitle>
          <CardDescription>
            By total revenue, respecting all filters.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          <p className="text-center text-muted-foreground">
            No sales data available for the selected filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border rounded-none shadow-lg border-white/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600 dark:text-white" />{" "}
          Top 5 Selling Items
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          By total revenue, respecting all filters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="text-muted-foreground">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>Item Name (from Sale)</TableHead>
              <TableHead className="text-right">Total Sales</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topItems.map((item) => (
              <TableRow
                key={item.productName + (item.isUpsell ? "-upsell" : "")}
                className="transition-colors hover:bg-accent/10 border-border/50"
              >
                <TableCell>
                  <div className="flex items-center gap-2 text-foreground">
                    <span>{item.productName}</span>
                    {item.isUpsell && (
                      <Badge
                        variant="secondary"
                        className="bg-transparent border-accent text-accent"
                      >
                        Back-End
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* 🚨 COUNTUP: TOTAL SALES (Contagem) */}
                <TableCell className="font-medium text-right text-foreground tabular-nums">
                  <CountUp
                    start={0}
                    end={item.totalSales}
                    duration={duration}
                    separator=","
                    decimals={0}
                  />
                </TableCell>

                {/* 🚨 COUNTUP: TOTAL REVENUE (Moeda) */}
                <TableCell className="font-semibold text-right text-primary tabular-nums">
                  <CountUp
                    start={0}
                    end={item.totalRevenue}
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
