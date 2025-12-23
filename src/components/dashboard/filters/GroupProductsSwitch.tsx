import { useTranslation } from "react-i18next";
import { Label } from "@/components/common/ui/label";
import { Switch } from "@/components/common/ui/switch";
import { Layers } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/common/ui/hover-card";

interface GroupProductsSwitchProps {
  isGrouped: boolean;
  onGroupChange: (grouped: boolean) => void;
}

export function GroupProductsSwitch({
  isGrouped,
  onGroupChange,
}: GroupProductsSwitchProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3">
      <Layers className="hidden w-5 h-5 sm:block" />
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div className="flex items-center space-x-2 cursor-pointer">
            <Switch
              id="group-products"
              checked={isGrouped}
              onCheckedChange={onGroupChange}
            />
            <Label
              htmlFor="group-products"
              className="text-sm font-medium cursor-pointer whitespace-nowrap"
            >
              {t("filters.groupProducts")}
            </Label>
          </div>
        </HoverCardTrigger>
        <HoverCardContent side="bottom" align="start" className="p-4 w-80">
          <p className="text-sm text-foreground">
            {t("filters.groupProductsDesc")}
          </p>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
