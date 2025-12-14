import { useTranslation } from "react-i18next";
import { Switch } from "@/components/common/ui/switch";
import { Label } from "@/components/common/ui/label";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/common/ui/hover-card";
import { Layers, Info } from "lucide-react";
import { Skeleton } from "@/components/common/ui/skeleton";

interface PerformanceFiltersProps {
  isProductsGrouped: boolean;
  onProductsGroupChange: (grouped: boolean) => void;
  isLoading?: boolean;
}

export function PerformanceFilters({
  isProductsGrouped,
  onProductsGroupChange,
  isLoading = false,
}: PerformanceFiltersProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="shark-card">
        <div className="p-4 md:p-6">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="shark-card">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Título da seção */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <h3 className="text-sm md:text-base font-semibold text-foreground">
              {t("performance.filters.title")}
            </h3>
          </div>

          {/* Switch de agrupamento */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="performance-group-products"
                checked={isProductsGrouped}
                onCheckedChange={onProductsGroupChange}
              />
              <Label
                htmlFor="performance-group-products"
                className="text-xs md:text-sm font-medium text-foreground cursor-pointer"
              >
                {t("filters.groupProducts")}
              </Label>
            </div>

            {/* Info Hover */}
            <HoverCard openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent
                side="bottom"
                align="end"
                className="w-72 md:w-80 p-3 md:p-4 shark-card"
              >
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Layers className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-foreground mb-1">
                        {t("filters.groupProducts")}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t("filters.groupProductsDesc")}
                      </p>
                    </div>
                  </div>

                  {/* Exemplo */}
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-[10px] md:text-xs text-muted-foreground font-medium mb-2">
                      {t("performance.filters.example")}:
                    </p>
                    <div className="space-y-1 text-[10px] md:text-xs">
                      <p className="text-muted-foreground">
                        • Free Sugar Pro 3 bottles
                      </p>
                      <p className="text-muted-foreground">
                        • Free Sugar Pro 6 bottles
                      </p>
                      <p className="text-muted-foreground">
                        • Free Sugar Pro + 3 free
                      </p>
                      <p className="text-primary mt-2 flex items-center gap-1">
                        <span>→</span> Free Sugar
                      </p>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        {/* Status de agrupamento */}
        {isProductsGrouped && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>{t("performance.filters.groupingActive")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
