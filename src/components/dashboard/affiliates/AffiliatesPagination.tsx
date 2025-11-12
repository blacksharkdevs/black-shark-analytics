import { Button } from "@/components/common/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";

interface AffiliatesPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalAffiliatesCount: number;
  rowsPerPageOptions: number[];
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

export function AffiliatesPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalAffiliatesCount,
  rowsPerPageOptions,
  isLoading,
  onPageChange,
  onItemsPerPageChange,
}: AffiliatesPaginationProps) {
  return (
    <div className="flex items-center justify-between py-4 space-x-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Rows per page:
        </span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={onItemsPerPageChange}
        >
          <SelectTrigger className="w-auto sm:w-[80px] bg-card hover:bg-muted transition-colors">
            <SelectValue placeholder={itemsPerPage.toString()} />
          </SelectTrigger>
          <SelectContent>
            {rowsPerPageOptions.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="text-sm text-muted-foreground">
        Page {totalPages > 0 ? currentPage : 0} of {totalPages} (Total:{" "}
        {totalAffiliatesCount} records)
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading || totalPages === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
