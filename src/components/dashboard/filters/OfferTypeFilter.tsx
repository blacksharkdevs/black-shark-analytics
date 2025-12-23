import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OfferTypeConfig {
  id: string;
  name: string;
}

interface OfferTypeFilterProps {
  offerTypes: OfferTypeConfig[];
  selectedOfferType: string;
  onOfferTypeChange: (offerTypeId: string) => void;
}

export function OfferTypeFilter({
  offerTypes,
  selectedOfferType,
  onOfferTypeChange,
}: OfferTypeFilterProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <Tag className="hidden sm:block" />
      <Select
        value={selectedOfferType}
        onValueChange={onOfferTypeChange}
        disabled={offerTypes.length <= 1}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("filters.offerType")} />
        </SelectTrigger>
        <SelectContent>
          {offerTypes.map((offer) => (
            <SelectItem key={offer.id} value={offer.id}>
              {offer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
