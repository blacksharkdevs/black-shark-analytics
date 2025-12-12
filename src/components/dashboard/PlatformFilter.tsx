import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Network } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PlatformConfig {
  id: string;
  name: string;
}

interface PlatformFilterProps {
  platforms: PlatformConfig[];
  selectedPlatform: string;
  onPlatformChange: (platformId: string) => void;
}

export function PlatformFilter({
  platforms,
  selectedPlatform,
  onPlatformChange,
}: PlatformFilterProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <Network className="hidden text-blue-600 dark:text-white sm:block" />
      <Select
        value={selectedPlatform}
        onValueChange={onPlatformChange}
        disabled={platforms.length <= 1}
      >
        <SelectTrigger className="w-full transition-colors border rounded-none bg-card hover:bg-accent/20 border-input text-foreground">
          <SelectValue placeholder={t("filters.platform")} />
        </SelectTrigger>
        <SelectContent className="border rounded-none bg-card border-border">
          {platforms.map((platform) => (
            <SelectItem
              key={platform.id}
              value={platform.id}
              className="rounded-none text-foreground"
            >
              {platform.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
