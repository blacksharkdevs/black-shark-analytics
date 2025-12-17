import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Label } from "@/components/common/ui/label";
import { Input } from "@/components/common/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/common/ui/collapsible";

interface AffiliateFiltersProps {
  platforms: string[];
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;

  minSales: string;
  onMinSalesChange: (value: string) => void;
  maxSales: string;
  onMaxSalesChange: (value: string) => void;

  minRevenue: string;
  onMinRevenueChange: (value: string) => void;
  maxRevenue: string;
  onMaxRevenueChange: (value: string) => void;

  minCommission: string;
  onMinCommissionChange: (value: string) => void;
  maxCommission: string;
  onMaxCommissionChange: (value: string) => void;

  minProfit: string;
  onMinProfitChange: (value: string) => void;
  maxProfit: string;
  onMaxProfitChange: (value: string) => void;

  minCustomers: string;
  onMinCustomersChange: (value: string) => void;
  maxCustomers: string;
  onMaxCustomersChange: (value: string) => void;

  minAov: string;
  onMinAovChange: (value: string) => void;
  maxAov: string;
  onMaxAovChange: (value: string) => void;

  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;

  onClearFilters: () => void;
}

export function AffiliateFilters({
  platforms,
  selectedPlatforms,
  onPlatformsChange,
  minSales,
  onMinSalesChange,
  maxSales,
  onMaxSalesChange,
  minRevenue,
  onMinRevenueChange,
  maxRevenue,
  onMaxRevenueChange,
  minCommission,
  onMinCommissionChange,
  maxCommission,
  onMaxCommissionChange,
  minProfit,
  onMinProfitChange,
  maxProfit,
  onMaxProfitChange,
  minCustomers,
  onMinCustomersChange,
  maxCustomers,
  onMaxCustomersChange,
  minAov,
  onMinAovChange,
  maxAov,
  onMaxAovChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
}: AffiliateFiltersProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      onPlatformsChange(selectedPlatforms.filter((p) => p !== platform));
    } else {
      onPlatformsChange([...selectedPlatforms, platform]);
    }
  };

  const hasActiveFilters =
    selectedPlatforms.length > 0 ||
    minSales ||
    maxSales ||
    minRevenue ||
    maxRevenue ||
    minCommission ||
    maxCommission ||
    minProfit ||
    maxProfit ||
    minCustomers ||
    maxCustomers ||
    minAov ||
    maxAov;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="shark-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-cyan-400" />
              <CardTitle className="text-lg">
                {t("affiliates.filters.title")}
              </CardTitle>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {t("affiliates.filters.active")}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  {t("affiliates.filters.clear")}
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Plataformas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {t("affiliates.filters.platforms")}
              </Label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <Badge
                    key={platform}
                    variant={
                      selectedPlatforms.includes(platform)
                        ? "default"
                        : "outline"
                    }
                    className="transition-all cursor-pointer hover:scale-105"
                    onClick={() => togglePlatform(platform)}
                  >
                    {platform}
                    {selectedPlatforms.includes(platform) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Vendas */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("affiliates.filters.sales")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t("affiliates.filters.min")}
                    value={minSales}
                    onChange={(e) => onMinSalesChange(e.target.value)}
                    className="shark-input"
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder={t("affiliates.filters.max")}
                    value={maxSales}
                    onChange={(e) => onMaxSalesChange(e.target.value)}
                    className="shark-input"
                    min="0"
                  />
                </div>
              </div>

              {/* Receita */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("affiliates.filters.revenue")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t("affiliates.filters.min")}
                    value={minRevenue}
                    onChange={(e) => onMinRevenueChange(e.target.value)}
                    className="shark-input"
                    min="0"
                    step="0.01"
                  />
                  <Input
                    type="number"
                    placeholder={t("affiliates.filters.max")}
                    value={maxRevenue}
                    onChange={(e) => onMaxRevenueChange(e.target.value)}
                    className="shark-input"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Comissão */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("affiliates.filters.commission")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t("affiliates.filters.min")}
                    value={minCommission}
                    onChange={(e) => onMinCommissionChange(e.target.value)}
                    className="shark-input"
                    min="0"
                    step="0.01"
                  />
                  <Input
                    type="number"
                    placeholder={t("affiliates.filters.max")}
                    value={maxCommission}
                    onChange={(e) => onMaxCommissionChange(e.target.value)}
                    className="shark-input"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Profit */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("affiliates.filters.profit")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t("affiliates.filters.min")}
                    value={minProfit}
                    onChange={(e) => onMinProfitChange(e.target.value)}
                    className="shark-input"
                    step="0.01"
                  />
                  <Input
                    type="number"
                    placeholder={t("affiliates.filters.max")}
                    value={maxProfit}
                    onChange={(e) => onMaxProfitChange(e.target.value)}
                    className="shark-input"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Clientes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("affiliates.filters.customers")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t("affiliates.filters.min")}
                    value={minCustomers}
                    onChange={(e) => onMinCustomersChange(e.target.value)}
                    className="shark-input"
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder={t("affiliates.filters.max")}
                    value={maxCustomers}
                    onChange={(e) => onMaxCustomersChange(e.target.value)}
                    className="shark-input"
                    min="0"
                  />
                </div>
              </div>

              {/* AOV */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("affiliates.filters.aov")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t("affiliates.filters.min")}
                    value={minAov}
                    onChange={(e) => onMinAovChange(e.target.value)}
                    className="shark-input"
                    min="0"
                    step="0.01"
                  />
                  <Input
                    type="number"
                    placeholder={t("affiliates.filters.max")}
                    value={maxAov}
                    onChange={(e) => onMaxAovChange(e.target.value)}
                    className="shark-input"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Ordenação */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("affiliates.filters.sortBy")}
                </Label>
                <Select value={sortBy} onValueChange={onSortByChange}>
                  <SelectTrigger className="shark-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">
                      {t("affiliates.table.sales")}
                    </SelectItem>
                    <SelectItem value="revenue">
                      {t("affiliates.table.totalRevenue")}
                    </SelectItem>
                    <SelectItem value="grossSales">
                      {t("affiliates.table.grossSales")}
                    </SelectItem>
                    <SelectItem value="commission">
                      {t("affiliates.table.commission")}
                    </SelectItem>
                    <SelectItem value="profit">
                      {t("affiliates.table.profit")}
                    </SelectItem>
                    <SelectItem value="cashFlow">
                      {t("affiliates.table.cashFlow")}
                    </SelectItem>
                    <SelectItem value="customers">
                      {t("affiliates.table.customers")}
                    </SelectItem>
                    <SelectItem value="aov">
                      {t("affiliates.table.aov")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("affiliates.filters.sortOrder")}
                </Label>
                <Select value={sortOrder} onValueChange={onSortOrderChange}>
                  <SelectTrigger className="shark-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">
                      {t("affiliates.filters.desc")}
                    </SelectItem>
                    <SelectItem value="asc">
                      {t("affiliates.filters.asc")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
