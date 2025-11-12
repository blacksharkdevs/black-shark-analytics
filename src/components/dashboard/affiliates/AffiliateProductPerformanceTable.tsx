import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/common/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import { useAffiliateDetail } from "@/hooks/useAffiliateDetail";
import { formatCurrency } from "@/utils/index";

export function AffiliateProductPerformanceTable() {
  const { productPerformance, isLoading } = useAffiliateDetail();

  const showContentSkeleton = isLoading && productPerformance.length === 0;
  const showNoDataMessage = !isLoading && productPerformance.length === 0;

  // Calculate totals for footer
  const totals = productPerformance.reduce(
    (acc, product) => ({
      sales_count: acc.sales_count + product.sales_count,
      gross_sales: acc.gross_sales + product.gross_sales,
      refunds: acc.refunds + product.refunds,
      net_sales: acc.net_sales + product.net_sales,
      cogs: acc.cogs + product.cogs,
      profit: acc.profit + product.profit,
    }),
    {
      sales_count: 0,
      gross_sales: 0,
      refunds: 0,
      net_sales: 0,
      cogs: 0,
      profit: 0,
    }
  );

  const totalAOV =
    totals.sales_count > 0 ? totals.gross_sales / totals.sales_count : 0;

  return (
    <Card className="border-[1px] border-white/30 rounded-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-foreground">
          Product Performance Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showContentSkeleton ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className="w-full h-12 rounded-none bg-accent/20"
              />
            ))}
          </div>
        ) : showNoDataMessage ? (
          <div className="py-10 text-center text-muted-foreground">
            No product data available for this affiliate.
          </div>
        ) : (
          <div className="border rounded-md border-border">
            <Table>
              <TableHeader className="text-muted-foreground">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Gross Sales</TableHead>
                  <TableHead className="text-right">AOV</TableHead>
                  <TableHead className="text-right">Refunds (Cost)</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead className="text-right">COGS</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-foreground">
                {productPerformance.map((product, index) => (
                  <TableRow
                    key={`${product.product_name}-${index}`}
                    className="hover:bg-accent/10 border-border/50"
                  >
                    <TableCell className="font-medium max-w-[250px] truncate">
                      {product.product_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.sales_count}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.gross_sales)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.aov)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      -{formatCurrency(product.refunds)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(product.net_sales)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      -{formatCurrency(product.cogs)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatCurrency(product.profit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {productPerformance.length > 0 && (
                <TableFooter className="border-t bg-accent/10 border-border">
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="font-semibold text-foreground">
                      Total
                    </TableCell>
                    <TableCell className="font-bold text-right text-primary">
                      {totals.sales_count}
                    </TableCell>
                    <TableCell className="font-bold text-right text-primary">
                      {formatCurrency(totals.gross_sales)}
                    </TableCell>
                    <TableCell className="font-bold text-right text-primary">
                      {formatCurrency(totalAOV)}
                    </TableCell>
                    <TableCell className="font-bold text-right text-destructive">
                      -{formatCurrency(totals.refunds)}
                    </TableCell>
                    <TableCell className="font-bold text-right text-primary">
                      {formatCurrency(totals.net_sales)}
                    </TableCell>
                    <TableCell className="font-bold text-right text-destructive">
                      -{formatCurrency(totals.cogs)}
                    </TableCell>
                    <TableCell className="font-bold text-right text-primary">
                      {formatCurrency(totals.profit)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
