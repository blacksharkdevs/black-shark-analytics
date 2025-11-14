import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { isSameDay, format as dateFnsFormat } from "date-fns";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useTranslation } from "react-i18next";
import { useTranslatedDateRangeOptions } from "@/hooks/useTranslatedOptions";

import { cn } from "@/lib/utils";
import { Button } from "@/components/common/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/common/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";

interface DateRangePickerProps {
  className?: string;
  currentGlobalRange: { from: Date; to: Date };
  selectedGlobalRangeOptionId: string;
  onGlobalRangeOptionChange: (optionId: string) => void;
  onGlobalCustomDateApply: (newRange: { from: Date; to: Date }) => void;
}

export function DateRangePicker({
  className,
  currentGlobalRange,
  selectedGlobalRangeOptionId,
  onGlobalRangeOptionChange,
  onGlobalCustomDateApply,
}: DateRangePickerProps) {
  const { t } = useTranslation();
  const DATE_RANGE_OPTIONS = useTranslatedDateRangeOptions();
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [localDateRange, setLocalDateRange] = React.useState<
    DateRange | undefined
  >(currentGlobalRange);

  React.useEffect(() => {
    if (selectedGlobalRangeOptionId !== "custom") {
      setLocalDateRange(currentGlobalRange);
    }
  }, [currentGlobalRange, selectedGlobalRangeOptionId]);

  React.useEffect(() => {
    if (popoverOpen) {
      setLocalDateRange(currentGlobalRange);
    }
  }, [popoverOpen, currentGlobalRange]);

  const handlePresetChange = (optionId: string) => {
    onGlobalRangeOptionChange(optionId);
    setPopoverOpen(false);
  };

  const handleApplyCustomDate = () => {
    if (localDateRange?.from) {
      onGlobalCustomDateApply({
        from: localDateRange.from,
        to: localDateRange.to || localDateRange.from,
      });
    }
    setPopoverOpen(false);
  };

  const formatDateForDisplay = (date: Date | undefined): string => {
    if (!date) return t("dateRange.pickDate");
    return dateFnsFormat(date, "dd/MM/yy");
  };

  let buttonText: string;
  const selectedOptionDetails = DATE_RANGE_OPTIONS.find(
    (opt) => opt.id === selectedGlobalRangeOptionId
  );

  if (selectedGlobalRangeOptionId === "custom" && currentGlobalRange.from) {
    buttonText =
      currentGlobalRange.to &&
      !isSameDay(currentGlobalRange.from, currentGlobalRange.to)
        ? `${formatDateForDisplay(
            currentGlobalRange.from
          )} - ${formatDateForDisplay(currentGlobalRange.to)}`
        : formatDateForDisplay(currentGlobalRange.from);
  } else {
    buttonText = selectedOptionDetails?.name || t("dateRange.selectDateRange");
  }

  return (
    <div
      className={cn("flex flex-col sm:flex-row items-center gap-2", className)}
    >
      <Select
        value={selectedGlobalRangeOptionId}
        onValueChange={handlePresetChange}
      >
        <SelectTrigger className="w-full sm:w-[180px] h-10 bg-card text-foreground border border-input hover:bg-blue-500 hover:text-white transition-colors rounded-none">
          <SelectValue placeholder={t("dateRange.selectDateRange")} />
        </SelectTrigger>
        <SelectContent className="border rounded-none bg-card border-border">
          {DATE_RANGE_OPTIONS.map((option) => (
            <SelectItem
              key={option.id}
              value={option.id}
              className="rounded-none text-foreground hover:bg-accent/10 focus:bg-accent/10"
            >
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal h-10 bg-card text-foreground hover:bg-blue-500 hover:text-white border border-input transition-colors rounded-none",
              !currentGlobalRange.from && "text-muted-foreground",
              "sm:w-[260px]"
            )}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto bg-white border rounded-none border-border light"
          align="start"
        >
          <DayPicker
            initialFocus
            mode="range"
            defaultMonth={localDateRange?.from}
            selected={localDateRange}
            onSelect={setLocalDateRange}
            numberOfMonths={2}
            pagedNavigation
          />

          <div className="flex justify-end p-3 border-t border-border">
            <Button
              onClick={handleApplyCustomDate}
              size="sm"
              className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("dateRange.apply")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
