import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { ListFilter } from "lucide-react";
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
  return (
    <div className="flex items-center gap-2">
      <ListFilter className="hidden w-5 h-5 text-muted-foreground sm:block" />
      <Select
        value={selectedActionType}
        onValueChange={onActionTypeChange}
        disabled={actionTypes.length <= 1}
      >
        {/* CORES DINÂMICAS E DESIGN RETO */}
        <SelectTrigger className="w-full transition-colors border rounded-none bg-card hover:bg-accent/20 border-input text-foreground">
          <SelectValue placeholder="Select Action Type" />
        </SelectTrigger>
        <SelectContent className="border rounded-none bg-card border-border">
          {actionTypes.map((action) => (
            <SelectItem
              key={action.id}
              value={action.id}
              className="rounded-none text-foreground hover:bg-accent/10 focus:bg-accent/10"
            >
              {action.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
