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
      <Search className="hidden w-5 h-5 text-blue-600 dark:text-white sm:block" />
      <Input
        type="text"
        placeholder={placeholder}
        className="w-full transition-colors border rounded-none bg-card hover:bg-accent/20 border-input text-foreground"
        onChange={(e) => onSearchChange(e.target.value)}
        defaultValue={defaultValue}
      />
    </div>
  );
}
