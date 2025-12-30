import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Skeleton } from "@/components/common/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/common/ui/hover-card";
import { Info, Plus, Minus, Users } from "lucide-react";
import { formatCurrency } from "@/utils/index";
import { cn } from "@/lib/utils";

interface Affiliate {
  id: string;
  name: string;
  totalRevenue: number;
  totalCommission: number;
  salesCount?: number;
}

interface AffiliateSelectorProps {
  availableAffiliates: Affiliate[];
  selectedAffiliateIds: string[];
  onToggleAffiliate: (affiliateId: string) => void;
  isLoading: boolean;
}

const NEON_COLORS = ["#00ffff", "#ff00ff", "#00ff00", "#ffff00", "#ff6b00"];

export function AffiliateSelector({
  availableAffiliates,
  selectedAffiliateIds,
  onToggleAffiliate,
  isLoading,
}: AffiliateSelectorProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card className="shark-card">
        <CardHeader className="px-4 py-3 md:px-6 md:py-4">
          <Skeleton className="w-48 h-6 mb-1" />
          <Skeleton className="w-64 h-4" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-16" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-h-[600px] lg:max-h-[1200px] overflow-y-auto shark-card">
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Users className="w-5 h-5" />
              {t("performance.affiliateSelector.title")}
            </CardTitle>
            <CardDescription className="mt-1 text-xs md:text-sm">
              {t("performance.affiliateSelector.description")}
            </CardDescription>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 w-6 h-6"
              >
                <Info className="w-4 h-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-56 text-xs md:text-sm">
              {t("performance.affiliateSelector.hint")}
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3 md:px-6 md:pb-6">
        {availableAffiliates.length === 0 ? (
          <div className="py-8 text-sm text-center text-muted-foreground">
            {t("performance.noAffiliates")}
          </div>
        ) : (
          availableAffiliates.map((affiliate, index) => {
            const isSelected = selectedAffiliateIds.includes(affiliate.id);
            const color = NEON_COLORS[index % NEON_COLORS.length];
            const commissionRate =
              affiliate.totalRevenue > 0
                ? (affiliate.totalCommission / affiliate.totalRevenue) * 100
                : 0;

            return (
              <button
                key={affiliate.id}
                onClick={() => onToggleAffiliate(affiliate.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg border-2 p-3 transition-all duration-200",
                  "text-left cursor-pointer",
                  isSelected
                    ? "border-opacity-100 bg-slate-800/50"
                    : "border-transparent bg-slate-900/50 hover:bg-slate-800/30"
                )}
                style={{
                  borderColor: isSelected ? color : "transparent",
                }}
              >
                <div
                  className="flex-shrink-0 w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium truncate"
                    style={{
                      color: isSelected ? color : "#e2e8f0",
                    }}
                  >
                    {affiliate.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatCurrency(affiliate.totalRevenue)} •{" "}
                    {commissionRate.toFixed(1)}%{" "}
                    {t("performance.affiliateSelector.commission")}
                  </div>
                  {affiliate.salesCount !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      {affiliate.salesCount}{" "}
                      {t("performance.affiliateSelector.sales")}
                    </div>
                  )}
                </div>
                {isSelected ? (
                  <Minus className="flex-shrink-0 w-4 h-4 text-slate-400" />
                ) : (
                  <Plus className="flex-shrink-0 w-4 h-4 text-slate-500" />
                )}
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
