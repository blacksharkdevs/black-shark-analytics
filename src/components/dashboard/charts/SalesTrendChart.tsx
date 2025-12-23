import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import { ChartNoAxesColumnIncreasing, ArrowRight } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Switch } from "@/components/common/ui/switch";
import { Label } from "@/components/common/ui/label";
import { Link } from "react-router-dom";
import { GroupedSalesChart } from "./GroupedSalesChart";
import { UngroupedSalesChart } from "./UngroupedSalesChart";

export function SalesTrendChart() {
  const { t } = useTranslation();
  const { filteredSalesData: data, isLoadingData } = useDashboardData();
  const { currentDateRange: dateRange, isLoading: isDateRangeLoading } =
    useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;
  const [groupPlatforms, setGroupPlatforms] = useState(true);

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <Skeleton className="w-48 mb-1 h-7" />
          <Skeleton className="w-64 h-4" />
        </CardHeader>
        <CardContent className="pb-6 pl-2 pr-6">
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>{t("dashboard.charts.salesTrend")}</CardTitle>
          <CardDescription>
            {t("dashboard.charts.salesTrendDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">
            {t("dashboard.charts.noSalesData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="relative h-full col-span-1 lg:col-span-2 shark-card"
      style={{ zIndex: 1 }}
    >
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <CardTitle className="flex items-center text-base md:text-lg text-foreground">
          <ChartNoAxesColumnIncreasing className="w-4 h-4 mr-2 md:w-6 md:h-6" />
          {t("dashboard.charts.salesTrend")}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t("dashboard.charts.topAffiliatesDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full pb-4 pl-1 pr-2 md:pb-6 md:pl-2 md:pr-6">
        {groupPlatforms ? (
          <GroupedSalesChart data={data} dateRange={dateRange} />
        ) : (
          <UngroupedSalesChart data={data} dateRange={dateRange} />
        )}
        <div className="flex flex-col items-center justify-center gap-3 mt-2 md:flex-row md:mt-4">
          <div className="flex items-center gap-2">
            <Switch
              id="group-platforms"
              checked={groupPlatforms}
              onCheckedChange={setGroupPlatforms}
            />
            <Label
              htmlFor="group-platforms"
              className="text-xs cursor-pointer md:text-sm text-muted-foreground"
            >
              Agrupar Plataformas
            </Label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs md:text-sm text-foreground hover:text-primary hover:bg-[rgba(6,182,212,0.1)] transition-all h-8 md:h-9"
          >
            <Link
              to="/dashboard/performance"
              className="flex items-center gap-1 md:gap-2"
            >
              {t("filters.viewPerformanceInPeriod")}
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
