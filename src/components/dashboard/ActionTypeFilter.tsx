import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { ListFilter } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ActionType as ActionTypeConfig } from "@/lib/config";

interface ActionTypeFilterProps {
  actionTypes: ActionTypeConfig[];
  selectedActionType: string;
  onActionTypeChange: (actionTypeId: string) => void;
}

export function ActionTypeFilter({
  actionTypes,
  selectedActionType,
  onActionTypeChange,
}: ActionTypeFilterProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <ListFilter className="hidden text-blue-600 dark:text-white sm:block" />
      <Select
        value={selectedActionType}
        onValueChange={onActionTypeChange}
        disabled={actionTypes.length <= 1}
      >
        {/* CORES DINÂMICAS E DESIGN RETO */}
        <SelectTrigger className="w-full transition-colors border rounded-none bg-card hover:bg-accent/20 border-input text-foreground">
          <SelectValue placeholder={t("filters.actionType")} />
        </SelectTrigger>
        <SelectContent className="border rounded-none bg-card border-border">
          {actionTypes.map((action) => (
            <SelectItem
              key={action.id}
              value={action.id}
              className="rounded-none text-foreground"
            >
              {action.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
