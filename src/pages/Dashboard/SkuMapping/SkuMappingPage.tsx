import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LinkIcon, Package, Loader2, Save, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Skeleton } from "@/components/common/ui/skeleton";
import { useSkuMapping } from "@/hooks/useSkuMapping";
import { cn } from "@/lib/utils";
import { ITEM_TYPE_OPTIONS } from "@/lib/config";

export default function SkuMappingPage() {
  const { t } = useTranslation();
  const {
    filteredSkuConfigs,
    isLoading,
    searchTerm,
    savingRow,
    mainProducts,
    setSearchTerm,
    handleInputChange,
    handleSaveSku,
  } = useSkuMapping();

  return (
    <div className="container p-4 mx-auto space-y-8 md:p-8">
      <Link to="/dashboard/configurations">
        <Button
          variant="outline"
          className="mb-4 border rounded-none border-border text-foreground hover:bg-accent/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("common.backToConfigurations")}
        </Button>
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <LinkIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("skuMapping.title")}
            </h1>
            <p className="text-foreground">{t("skuMapping.description")}</p>
          </div>
        </div>
        <Link to="/dashboard/configurations/main-products">
          <Button variant="outline" className="text-white">
            <Package className="w-4 h-4 mr-2" />
            {t("skuMapping.manageMainProducts")}
          </Button>
        </Link>
      </div>

      <Card className="shadow-lg h-full border-[1px] border-white/30 rounded-none">
        <CardHeader>
          <CardTitle className="text-foreground">
            {t("skuMapping.cardTitle")}
          </CardTitle>
          <CardDescription>{t("skuMapping.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              type="text"
              placeholder={t("skuMapping.searchPlaceholder")}
              className="w-full border rounded-none md:max-w-lg bg-background border-input"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto border rounded-md border-border">
            <Table>
              <TableHeader className="text-muted-foreground">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[150px] whitespace-nowrap">
                    {t("skuMapping.table.merchantId")}
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    {t("skuMapping.table.originalName")}
                  </TableHead>
                  <TableHead>{t("skuMapping.table.displayName")}</TableHead>
                  <TableHead>{t("skuMapping.table.mainProduct")}</TableHead>
                  <TableHead className="w-[100px]">
                    {t("skuMapping.table.units")}
                  </TableHead>
                  <TableHead>{t("skuMapping.table.itemType")}</TableHead>
                  <TableHead className="w-[100px] text-center">
                    {t("skuMapping.table.action")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-foreground">
                {isLoading ? (
                  [...Array(10)].map((_, i) => (
                    <TableRow
                      key={i}
                      className="hover:bg-accent/10 border-border/50"
                    >
                      <TableCell colSpan={7}>
                        <Skeleton className="w-full h-10 rounded-none bg-accent/20" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredSkuConfigs.length > 0 ? (
                  filteredSkuConfigs.map((sku) => {
                    const rowKey = `${sku.merchant_id}-${sku.original_name}`;
                    const isUnconfigured = !sku.main_product_id;

                    return (
                      <TableRow
                        key={rowKey}
                        className={cn(
                          "hover:bg-accent/10 border-border/50",
                          isUnconfigured && "bg-yellow-500/10"
                        )}
                      >
                        <TableCell className="font-mono text-xs">
                          {sku.merchant_id}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {sku.original_name}
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder={t(
                              "skuMapping.table.standardNamePlaceholder"
                            )}
                            value={sku.display_name || ""}
                            onChange={(e) =>
                              handleInputChange(
                                sku.merchant_id,
                                sku.original_name,
                                "display_name",
                                e.target.value
                              )
                            }
                            className="h-9 min-w-[200px] border border-input rounded-none"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={
                              sku.main_product_id
                                ? String(sku.main_product_id)
                                : ""
                            }
                            onValueChange={(value) =>
                              handleInputChange(
                                sku.merchant_id,
                                sku.original_name,
                                "main_product_id",
                                value ? Number(value) : null
                              )
                            }
                          >
                            <SelectTrigger className="h-9 min-w-[180px] border border-input rounded-none">
                              <SelectValue
                                placeholder={t(
                                  "skuMapping.table.selectPlaceholder"
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-white/40">
                              {mainProducts.map((p) => (
                                <SelectItem
                                  key={p.id}
                                  value={String(p.id)}
                                  className="rounded-none cursor-pointer dark:bg-blue-900 dark:text-white/60 hover:dark:text-white"
                                >
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="e.g., 6"
                            value={sku.unit_count || ""}
                            onChange={(e) =>
                              handleInputChange(
                                sku.merchant_id,
                                sku.original_name,
                                "unit_count",
                                e.target.value
                              )
                            }
                            className="border rounded-none h-9 border-input"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={sku.item_type || ""}
                            onValueChange={(value) =>
                              handleInputChange(
                                sku.merchant_id,
                                sku.original_name,
                                "item_type",
                                value || null
                              )
                            }
                          >
                            <SelectTrigger className="h-9 min-w-[150px] border border-input rounded-none">
                              <SelectValue
                                placeholder={t(
                                  "skuMapping.table.selectPlaceholder"
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-white/40">
                              {ITEM_TYPE_OPTIONS.map((type) => (
                                <SelectItem
                                  key={type.id}
                                  value={type.id}
                                  className="rounded-none cursor-pointer dark:bg-blue-900 dark:text-white/60 hover:dark:text-white"
                                >
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSaveSku(sku)}
                            disabled={savingRow === rowKey}
                            className="rounded-none"
                          >
                            {savingRow === rowKey ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span className="sr-only">{t("common.save")}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {searchTerm
                        ? t("skuMapping.noSearchResults")
                        : t("skuMapping.noUnconfigured")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
