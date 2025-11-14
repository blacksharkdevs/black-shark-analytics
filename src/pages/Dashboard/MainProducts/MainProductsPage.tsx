import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Package,
  Plus,
  // Pencil,
  Trash2,
  ArrowLeft,
  Save,
  X,
  LinkIcon,
} from "lucide-react";
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
import { Skeleton } from "@/components/common/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { mainProductService } from "@/services/mainProductService";
import type { MainProduct } from "@/types/index";

export default function MainProductsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [mainProducts, setMainProducts] = useState<MainProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newProductName, setNewProductName] = useState("");

  const fetchMainProducts = async () => {
    setIsLoading(true);
    try {
      const products = await mainProductService.fetchMainProducts();
      setMainProducts(products);
    } catch (error) {
      console.error("Error fetching main products:", error);
      toast({
        title: t("common.error"),
        description: t("mainProducts.fetchError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMainProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!newProductName.trim()) {
      toast({
        title: t("common.error"),
        description: t("mainProducts.nameRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      await mainProductService.createMainProduct(newProductName.trim());
      toast({
        title: t("common.success"),
        description: t("mainProducts.createSuccess"),
      });
      setNewProductName("");
      setIsCreating(false);
      fetchMainProducts();
    } catch (error) {
      console.error("Error creating main product:", error);
      toast({
        title: t("common.error"),
        description: t("mainProducts.createError"),
        variant: "destructive",
      });
    }
  };

  // const handleStartEdit = (product: MainProduct) => {
  //   setEditingId(product.id);
  //   setEditingName(product.name);
  // };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingName.trim()) {
      toast({
        title: t("common.error"),
        description: t("mainProducts.nameRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      await mainProductService.updateMainProduct(id, editingName.trim());
      toast({
        title: t("common.success"),
        description: t("mainProducts.updateSuccess"),
      });
      setEditingId(null);
      setEditingName("");
      fetchMainProducts();
    } catch (error) {
      console.error("Error updating main product:", error);
      toast({
        title: t("common.error"),
        description: t("mainProducts.updateError"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(t("mainProducts.deleteConfirm", { name }))) {
      return;
    }

    try {
      await mainProductService.deleteMainProduct(id);
      toast({
        title: t("common.success"),
        description: t("mainProducts.deleteSuccess"),
      });
      fetchMainProducts();
    } catch (error) {
      console.error("Error deleting main product:", error);
      toast({
        title: t("common.error"),
        description: t("mainProducts.deleteError"),
        variant: "destructive",
      });
    }
  };

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
          <Package className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("mainProducts.title")}
            </h1>
            <p className="text-foreground">{t("mainProducts.description")}</p>
          </div>
        </div>
        <Link to="/dashboard/configurations/sku-mapping">
          <Button variant="outline" className="text-white">
            <LinkIcon className="w-4 h-4 mr-2" />
            {t("mainProducts.SkuMapping")}
          </Button>
        </Link>
      </div>

      <Card className="shadow-lg h-full border-[1px] border-white/30 rounded-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">
                {t("mainProducts.cardTitle")}
              </CardTitle>
              <CardDescription>
                {t("mainProducts.cardDescription")}
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              disabled={isCreating}
              className="rounded-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("mainProducts.addNew")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-md border-border">
            <Table>
              <TableHeader className="text-muted-foreground">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[100px]">
                    {t("mainProducts.table.id")}
                  </TableHead>
                  <TableHead>{t("mainProducts.table.name")}</TableHead>
                  <TableHead className="w-[200px] text-right">
                    {t("mainProducts.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-foreground">
                {isCreating && (
                  <TableRow className="bg-blue-500/10 hover:bg-blue-500/20 border-border/50">
                    <TableCell className="font-medium text-muted-foreground">
                      {t("mainProducts.new")}
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder={t("mainProducts.namePlaceholder")}
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreate();
                          if (e.key === "Escape") {
                            setIsCreating(false);
                            setNewProductName("");
                          }
                        }}
                        className="border rounded-none border-input"
                        autoFocus
                      />
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="sm"
                        onClick={handleCreate}
                        className="rounded-none"
                      >
                        <Save className="w-4 h-4" />
                        {t("common.save")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setIsCreating(false);
                          setNewProductName("");
                        }}
                        className="rounded-none"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow
                      key={i}
                      className="hover:bg-accent/10 border-border/50"
                    >
                      <TableCell colSpan={3}>
                        <Skeleton className="w-full h-10 rounded-none bg-accent/20" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : mainProducts.length > 0 ? (
                  mainProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className="hover:bg-accent/10 border-border/50"
                    >
                      <TableCell className="font-medium">
                        {product.id}
                      </TableCell>
                      <TableCell>
                        {editingId === product.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(product.id);
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            className="border rounded-none border-input"
                            autoFocus
                          />
                        ) : (
                          product.name
                        )}
                      </TableCell>
                      <TableCell className="space-x-2 text-right">
                        {editingId === product.id ? (
                          <div>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(product.id)}
                              className="rounded-none"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              {t("common.save")}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleCancelEdit}
                              className="rounded-none"
                            >
                              <X className="w-4 h-4 mr-1" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDelete(product.id, product.name)
                              }
                              className="rounded-none"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t("mainProducts.noProducts")}
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
