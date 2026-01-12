import { useState } from "react";
import { useArsenal } from "@/contexts/ArsenalContext";
import { Card } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/common/ui/dropdown-menu";
import { Checkbox } from "@/components/common/ui/checkbox";
import { CreateArsenalDialog } from "@/components/arsenal/CreateArsenalDialog";
import type {
  CustomProductGroup,
  ProductGroupingArsenal,
} from "@/types/arsenal";

export default function ArsenalPage() {
  const {
    arsenals,
    activeArsenal,
    setActiveArsenal,
    createArsenal,
    updateArsenal,
    deleteArsenal,
  } = useArsenal();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingArsenal, setEditingArsenal] =
    useState<ProductGroupingArsenal | null>(null);
  const [expandedArsenal, setExpandedArsenal] = useState<string | null>(null);

  const toggleExpand = (arsenalId: string) => {
    setExpandedArsenal(expandedArsenal === arsenalId ? null : arsenalId);
  };

  const handleCreateArsenal = (data: {
    name: string;
    description: string;
    customGroups: CustomProductGroup[];
  }) => {
    if (editingArsenal) {
      // Modo edição
      updateArsenal(editingArsenal.id, {
        name: data.name,
        description: data.description,
        customGroups: data.customGroups,
      });
      setEditingArsenal(null);
    } else {
      // Modo criação
      createArsenal({
        name: data.name,
        description: data.description,
        isDefault: false,
        customGroups: data.customGroups,
        config: {
          autoGroupUngrouped: false,
          showIndividualProducts: true,
          sortBy: "name",
        },
      });
    }

    setShowCreateModal(false);
  };

  const handleEditArsenal = (arsenal: ProductGroupingArsenal) => {
    setEditingArsenal(arsenal);
    setShowCreateModal(true);
  };

  const handleDeleteArsenal = (arsenalId: string) => {
    if (confirm("Tem certeza que deseja excluir este agrupamento?")) {
      deleteArsenal(arsenalId);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingArsenal(null);
  };

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">⚡ Arsenal</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie agrupamentos de produtos e configurações personalizadas
          </p>
        </div>
      </div>

      {/* Seção: Agrupamentos */}
      <Card className="shark-card">
        <div className="p-6 space-y-6">
          {/* Header da Seção */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                📦 Agrupamentos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Selecione ou crie agrupamentos personalizados de produtos
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Agrupamento
            </Button>
          </div>

          {/* Lista de Agrupamentos */}
          <div className="grid grid-cols-1 gap-4">
            {arsenals.map((arsenal) => {
              const isActive = activeArsenal?.id === arsenal.id;
              const isExpanded = expandedArsenal === arsenal.id;
              const hasGroups = arsenal.customGroups.length > 0;

              return (
                <Card
                  key={arsenal.id}
                  className="transition-all hover:shadow-md"
                >
                  {/* Header do Arsenal */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Checkbox e Nome */}
                      <div
                        className="flex items-start gap-3 flex-1 cursor-pointer"
                        onClick={() => setActiveArsenal(arsenal.id)}
                      >
                        {/* Checkbox */}
                        <div className="pt-1">
                          <Checkbox
                            checked={isActive}
                            onCheckedChange={() => setActiveArsenal(arsenal.id)}
                            className="w-5 h-5"
                          />
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">
                              {arsenal.name}
                            </h3>
                            {arsenal.isDefault && (
                              <Badge
                                variant="default"
                                className="text-xs bg-blue-500"
                              >
                                ⚙️ Sistema
                              </Badge>
                            )}
                          </div>
                          {arsenal.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {arsenal.description}
                            </p>
                          )}

                          {/* Badges de Config */}
                          {arsenal.config.autoGroupUngrouped && (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                🤖 Agrupamento automático
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações no topo direito */}
                      <div className="flex items-center gap-2">
                        {/* Grupos count + expand */}
                        {hasGroups && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(arsenal.id);
                            }}
                            className="flex items-center gap-1"
                          >
                            <span className="text-xs font-medium">
                              {arsenal.customGroups.length}{" "}
                              {arsenal.customGroups.length === 1
                                ? "grupo"
                                : "grupos"}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        )}

                        {/* Menu de ações */}
                        {!arsenal.isDefault && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditArsenal(arsenal);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar agrupamento
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteArsenal(arsenal.id);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir agrupamento
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lista de Grupos (Expansível) */}
                  {isExpanded && hasGroups && (
                    <div className="border-t border-border px-4 py-3 bg-muted/20">
                      <div className="space-y-3">
                        {arsenal.customGroups.map((group) => (
                          <div
                            key={group.id}
                            className="p-3 rounded-lg bg-background border border-border"
                          >
                            <div className="flex items-start gap-3">
                              {/* Ícone/Cor */}
                              {group.icon && (
                                <div className="text-2xl">{group.icon}</div>
                              )}

                              {/* Conteúdo */}
                              <div className="flex-1 space-y-2">
                                {/* Nome */}
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{group.name}</h4>
                                  {group.color && (
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: group.color }}
                                    />
                                  )}
                                </div>

                                {/* Descrição */}
                                {group.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {group.description}
                                  </p>
                                )}

                                {/* Regras de Match */}
                                <div className="text-xs">
                                  <span className="text-muted-foreground">
                                    Frontend:
                                  </span>{" "}
                                  {group.matchRules.map((rule, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="ml-1 text-xs"
                                    >
                                      contém "{rule.value}"
                                    </Badge>
                                  ))}
                                </div>

                                {/* Upsells */}
                                {group.offers.length > 0 && (
                                  <div className="pl-4 border-l-2 border-primary/30 space-y-1">
                                    {group.offers.map((offer) => (
                                      <div
                                        key={offer.id}
                                        className="text-xs space-y-1"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            📈 {offer.offerType}
                                          </Badge>
                                          <span className="font-medium">
                                            {offer.name}
                                          </span>
                                        </div>
                                        <div className="text-muted-foreground pl-4">
                                          {offer.matchRules
                                            .map((r) => `"${r.value}"`)
                                            .join(" ou ")}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Estado Vazio */}
          {arsenals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum agrupamento encontrado
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                Criar Primeiro Agrupamento
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Dialog de Criação/Edição */}
      <CreateArsenalDialog
        open={showCreateModal}
        onOpenChange={handleCloseModal}
        onSubmit={handleCreateArsenal}
        editingArsenal={editingArsenal}
      />
    </div>
  );
}
