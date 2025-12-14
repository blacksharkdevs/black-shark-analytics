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
import { Crown, Users, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { Link } from "react-router-dom";

import { formatCurrency } from "@/utils/index";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";

interface AffiliateRevenue {
  affiliateName: string;
  totalRevenue: number;
}

export function TopAffiliatesTable() {
  const { t } = useTranslation();
  const { filteredSalesData: data, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;
  const duration = 1.5;

  const topAffiliates = useMemo(() => {
    const affiliateRevenueMap = data.reduce((acc, record) => {
      // Filtrar apenas vendas completadas
      if (record.type !== "SALE" || record.status !== "COMPLETED") return acc;
      if (Number(record.grossAmount) < 0) return acc;

      const affName =
        record.affiliate?.name || record.affiliate?.email || "Direct";

      if (!acc[affName]) {
        acc[affName] = {
          affiliateName: affName,
          totalRevenue: 0,
        } as AffiliateRevenue;
      }
      acc[affName].totalRevenue += Number(record.grossAmount);
      return acc;
    }, {} as Record<string, AffiliateRevenue>);

    return Object.values(affiliateRevenueMap)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [data]);

  // --- RENDERIZAÇÃO ---

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
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-5 h-5 rounded-full bg-accent/20" />
                  <Skeleton className="w-24 h-5 bg-accent/20" />
                </div>
                <Skeleton className="w-16 h-5 bg-accent/20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topAffiliates.length === 0 && !isLoading) {
    return (
      <Card className="h-full border rounded-none shadow-lg border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Users className="w-6 h-6 mr-2 text-accent" />{" "}
            {t("dashboard.charts.topAffiliates")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.charts.topAffiliatesDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-center text-muted-foreground">
            {t("dashboard.charts.noAffiliateData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="relative h-full border rounded-none shadow-lg border-white/30 backdrop-blur-sm"
      style={{ zIndex: 1 }}
    >
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <CardTitle className="flex items-center text-base md:text-lg text-foreground">
          <Users className="w-4 h-4 mr-2 text-blue-600 md:w-6 md:h-6 dark:text-white" />{" "}
          {t("dashboard.charts.topAffiliates")}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm text-muted-foreground">
          {t("dashboard.charts.topAffiliatesDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 md:px-6">
        <Table>
          <TableHeader className="text-muted-foreground">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[30px] md:w-[50px] text-xs md:text-sm py-2">
                {t("dashboard.charts.rank")}
              </TableHead>
              <TableHead className="py-2 text-xs md:text-sm">
                {t("dashboard.charts.affiliate")}
              </TableHead>
              <TableHead className="py-2 text-xs text-right md:text-sm">
                {t("dashboard.charts.totalRevenue")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topAffiliates.map((affiliate: any, index) => (
              <TableRow
                key={affiliate.affiliateName}
                className="transition-colors hover:bg-accent/10 border-border/50"
              >
                <TableCell className="px-2 py-2 font-medium text-foreground md:px-4">
                  {index === 0 ? (
                    <Crown className="w-4 h-4 text-yellow-500 md:w-5 md:h-5" />
                  ) : (
                    <span className="text-xs md:text-sm">{index + 1}</span>
                  )}
                </TableCell>
                <TableCell className="text-foreground text-xs md:text-sm py-2 px-2 md:px-4 truncate max-w-[120px] md:max-w-none">
                  {affiliate.affiliateName}
                </TableCell>
                <TableCell className="px-2 py-2 text-xs font-semibold text-right text-primary tabular-nums md:text-sm md:px-4">
                  <CountUp
                    start={0}
                    end={affiliate.totalRevenue}
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
        <div className="flex justify-center mt-2 md:mt-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs md:text-sm text-foreground hover:text-primary hover:bg-[rgba(6,182,212,0.1)] transition-all h-8 md:h-9"
          >
            <Link
              to="/dashboard/affiliates"
              className="flex items-center gap-1 md:gap-2"
            >
              {t("common.view")} {t("common.all")}
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
