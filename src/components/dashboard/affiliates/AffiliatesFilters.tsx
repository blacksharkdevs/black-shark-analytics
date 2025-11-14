import { Search, Network, ListFilter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/common/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { AFFILIATE_ACTION_TYPES } from "@/lib/config";

interface AffiliatesFiltersProps {
  selectedPlatform: string;
  selectedActionType: string;
  availablePlatforms: string[];
  isFetchingPlatforms: boolean;
  onSearchChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onActionTypeChange: (value: string) => void;
}

export function AffiliatesFilters({
  selectedPlatform,
  selectedActionType,
  availablePlatforms,
  isFetchingPlatforms,
  onSearchChange,
  onPlatformChange,
  onActionTypeChange,
}: AffiliatesFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 p-4 mb-6 rounded-lg md:grid-cols-3 bg-muted/30">
      {/* Filtro de Busca */}
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("affiliates.searchPlaceholder")}
          className="w-full bg-background"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filtro de Plataforma */}
      <div className="flex items-center gap-2">
        <Network className="w-5 h-5 text-muted-foreground" />
        <Select
          value={selectedPlatform}
          onValueChange={onPlatformChange}
          disabled={isFetchingPlatforms || availablePlatforms.length === 0}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder={t("filters.platform")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allPlatforms")}</SelectItem>
            {availablePlatforms.map((platform) => (
              <SelectItem key={platform} value={platform}>
                {platform}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro de Tipo de Ação */}
      <div className="flex items-center gap-2">
        <ListFilter className="w-5 h-5 text-muted-foreground" />
        <Select value={selectedActionType} onValueChange={onActionTypeChange}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder={t("filters.actionType")} />
          </SelectTrigger>
          <SelectContent>
            {AFFILIATE_ACTION_TYPES.map((action) => (
              <SelectItem key={action.id} value={action.id}>
                {action.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
