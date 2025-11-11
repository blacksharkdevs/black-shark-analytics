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
import { Crown, Users } from "lucide-react";
import { Skeleton } from "@/components/common/ui/skeleton";

import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { formatCurrency } from "@/utils/index";

interface AffiliateRevenue {
  affiliateName: string;
  totalRevenue: number;
}

export function TopAffiliatesTable() {
  const { filteredSalesData: data, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;
  const duration = 1.5;

  const topAffiliates = useMemo(() => {
    const affiliateRevenueMap = data.reduce((acc, record) => {
      if (record.revenue < 0) return acc;
      const affName = record.aff_name || "Direct";

      if (!acc[affName]) {
        acc[affName] = {
          affiliateName: affName,
          totalRevenue: 0,
        } as AffiliateRevenue;
      }
      acc[affName].totalRevenue += record.revenue;
      return acc;
    }, {} as Record<string, AffiliateRevenue>);

    return Object.values(affiliateRevenueMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
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
            <Users className="w-6 h-6 mr-2 text-accent" /> Top 5 Affiliates
          </CardTitle>
          <CardDescription>
            By total revenue in the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-center text-muted-foreground">
            No affiliate data available for the selected filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border rounded-none shadow-lg border-white/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Users className="w-6 h-6 mr-2 text-blue-600 dark:text-white" /> Top 5
          Affiliates
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          By total revenue in the selected period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="text-muted-foreground">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Affiliate</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topAffiliates.map((affiliate, index) => (
              <TableRow
                key={affiliate.affiliateName}
                className="transition-colors hover:bg-accent/10 border-border/50"
              >
                <TableCell className="font-medium text-foreground">
                  {index === 0 ? (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  ) : (
                    index + 1
                  )}
                </TableCell>
                <TableCell className="text-foreground">
                  {affiliate.affiliateName}
                </TableCell>
                <TableCell className="font-semibold text-right text-primary tabular-nums">
                  {/* 🚨 COUNTUP APLICADO AQUI */}
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
      </CardContent>
    </Card>
  );
}
