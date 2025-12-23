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
      <Network className="hidden sm:block" />
      <Select
        value={selectedPlatform}
        onValueChange={onPlatformChange}
        disabled={platforms.length <= 1}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("filters.platform")} />
        </SelectTrigger>
        <SelectContent>
          {platforms.map((platform) => (
            <SelectItem key={platform.id} value={platform.id}>
              {platform.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
