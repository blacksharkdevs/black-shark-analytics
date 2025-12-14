import { Search } from "lucide-react";
import { Input } from "@/components/common/ui/input";

interface SearchFilterProps {
  placeholder?: string;
  onSearchChange: (value: string) => void;
  defaultValue?: string;
}

export function SearchFilter({
  placeholder = "Search...",
  onSearchChange,
  defaultValue = "",
}: SearchFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Search className="hidden w-5 h-5 sm:block" />
      <Input
        type="text"
        placeholder={placeholder}
        className="w-full"
        onChange={(e) => onSearchChange(e.target.value)}
        defaultValue={defaultValue}
      />
    </div>
  );
}
