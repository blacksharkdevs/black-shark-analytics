import { Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/utils/index";
import { useTranslation } from "react-i18next";

interface ProductMetrics {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
  commission: number;
  refunds: number;
  refundRate: number;
}

interface Props {
  products: ProductMetrics[];
}

export function AffiliateProductBreakdown({ products }: Props) {
  const { t } = useTranslation();

  return (
    <Card className="shark-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-400" />
          {t("affiliate.productPerformance")}
        </CardTitle>
        <CardDescription>
          {t("affiliate.productPerformanceDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("affiliate.product")}</TableHead>
                <TableHead className="text-right">
                  {t("affiliate.sales")}
                </TableHead>
                <TableHead className="text-right">
                  {t("affiliate.revenue")}
                </TableHead>
                <TableHead className="text-right">
                  {t("affiliate.commission")}
                </TableHead>
                <TableHead className="text-right">
                  {t("affiliate.refundRate")}
                </TableHead>
                <TableHead className="text-right">
                  {t("affiliate.action")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell className="font-medium">
                    {product.productName}
                  </TableCell>
                  <TableCell className="text-right">{product.sales}</TableCell>
                  <TableCell className="text-right text-cyan-400">
                    {formatCurrency(product.revenue)}
                  </TableCell>
                  <TableCell className="text-right text-purple-400">
                    {formatCurrency(product.commission)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-semibold ${
                        product.refundRate > 5
                          ? "text-red-400"
                          : product.refundRate > 2
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {product.refundRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.refundRate < 3 && product.sales > 10 ? (
                      <span className="text-xs font-semibold text-green-400">
                        {t("affiliate.focusHere")}
                      </span>
                    ) : product.refundRate > 5 ? (
                      <span className="text-xs font-semibold text-red-400">
                        {t("affiliate.pause")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Gráfico de barras dos top produtos */}
        <div className="mt-12">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={products.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="productName"
                stroke="#888"
                fontSize={12}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar
                dataKey="revenue"
                fill="#00ffff"
                name={t("affiliate.revenue")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
