import { useTranslation } from "react-i18next";
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
import { X } from "lucide-react";

interface TransactionFiltersProps {
  platforms: string[];
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;

  statuses: string[];
  selectedStatuses: string[];
  onStatusesChange: (statuses: string[]) => void;

  types: string[];
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;

  minGrossAmount: string;
  onMinGrossAmountChange: (value: string) => void;
  maxGrossAmount: string;
  onMaxGrossAmountChange: (value: string) => void;

  minNetAmount: string;
  onMinNetAmountChange: (value: string) => void;
  maxNetAmount: string;
  onMaxNetAmountChange: (value: string) => void;

  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;

  onClearFilters: () => void;
}

export function TransactionFilters({
  platforms,
  selectedPlatforms,
  onPlatformsChange,
  statuses,
  selectedStatuses,
  onStatusesChange,
  types,
  selectedTypes,
  onTypesChange,
  minGrossAmount,
  onMinGrossAmountChange,
  maxGrossAmount,
  onMaxGrossAmountChange,
  minNetAmount,
  onMinNetAmountChange,
  maxNetAmount,
  onMaxNetAmountChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
}: TransactionFiltersProps) {
  const { t } = useTranslation();

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      onPlatformsChange(selectedPlatforms.filter((p) => p !== platform));
    } else {
      onPlatformsChange([...selectedPlatforms, platform]);
    }
  };

  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  };

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const hasActiveFilters =
    selectedPlatforms.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedTypes.length > 0 ||
    minGrossAmount ||
    maxGrossAmount ||
    minNetAmount ||
    maxNetAmount;

  return (
    <div className="overflow-hidden transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2">
      <div className="p-5 space-y-6">
        <div className="flex flex-wrap items-start justify-between w-full gap-4">
          <div className="flex flex-wrap gap-6">
            {/* Plataformas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {t("transactions.filters.platforms")}
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

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {t("transactions.filters.status")}
              </Label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <Badge
                    key={status}
                    variant={
                      selectedStatuses.includes(status) ? "default" : "outline"
                    }
                    className="transition-all cursor-pointer hover:scale-105"
                    onClick={() => toggleStatus(status)}
                  >
                    {t(`transactions.statuses.${status}`)}
                    {selectedStatuses.includes(status) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tipos */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {t("transactions.filters.type")}
              </Label>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <Badge
                    key={type}
                    variant={
                      selectedTypes.includes(type) ? "default" : "outline"
                    }
                    className="transition-all cursor-pointer hover:scale-105"
                    onClick={() => toggleType(type)}
                  >
                    {t(`transactions.type.${type.toLowerCase()}`)}
                    {selectedTypes.includes(type) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Botão limpar no topo */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                {t("transactions.filters.clear")}
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Receita Bruta (Gross Amount) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {t("transactions.filters.grossAmount")}
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={t("transactions.filters.min")}
                value={minGrossAmount}
                onChange={(e) => onMinGrossAmountChange(e.target.value)}
                className="shark-input"
                min="0"
                step="0.01"
              />
              <Input
                type="number"
                placeholder={t("transactions.filters.max")}
                value={maxGrossAmount}
                onChange={(e) => onMaxGrossAmountChange(e.target.value)}
                className="shark-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Receita Líquida (Net Amount) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {t("transactions.filters.netAmount")}
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={t("transactions.filters.min")}
                value={minNetAmount}
                onChange={(e) => onMinNetAmountChange(e.target.value)}
                className="shark-input"
                step="0.01"
              />
              <Input
                type="number"
                placeholder={t("transactions.filters.max")}
                value={maxNetAmount}
                onChange={(e) => onMaxNetAmountChange(e.target.value)}
                className="shark-input"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Ordenação */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {t("transactions.filters.sortBy")}
            </Label>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="shark-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="occurredAt">
                  {t("transactions.filters.date")}
                </SelectItem>
                <SelectItem value="grossAmount">
                  {t("transactions.filters.grossAmount")}
                </SelectItem>
                <SelectItem value="netAmount">
                  {t("transactions.filters.netAmount")}
                </SelectItem>
                <SelectItem value="status">
                  {t("transactions.filters.status")}
                </SelectItem>
                <SelectItem value="platform">
                  {t("transactions.filters.platforms")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {t("transactions.filters.sortOrder")}
            </Label>
            <Select value={sortOrder} onValueChange={onSortOrderChange}>
              <SelectTrigger className="shark-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">
                  {t("transactions.filters.desc")}
                </SelectItem>
                <SelectItem value="asc">
                  {t("transactions.filters.asc")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
