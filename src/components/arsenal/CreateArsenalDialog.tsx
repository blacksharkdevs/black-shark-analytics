import { useState, useEffect } from "react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Textarea } from "@/components/common/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/common/ui/dialog";
import { Badge } from "@/components/common/ui/badge";
import { Plus, Trash2, X } from "lucide-react";
import type {
  CustomProductGroup,
  ProductGroupingArsenal,
} from "@/types/arsenal";
import { Card } from "@/components/common/ui/card";

interface CreateArsenalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    description: string;
    customGroups: CustomProductGroup[];
  }) => void;
  editingArsenal?: ProductGroupingArsenal | null;
}

interface GroupFormData {
  id: string;
  name: string;
  description: string;
  frontendMatchValue: string;
  icon: string;
  color: string;
  offers: OfferFormData[];
}

interface OfferFormData {
  id: string;
  name: string;
  matchValue: string;
  offerType: "UPSELL" | "DOWNSELL" | "ORDER_BUMP";
}

const COLORS = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#f59e0b", label: "Laranja" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#ec4899", label: "Rosa" },
];

const ICONS = ["💪", "🍬", "⚡", "🎯", "🔥", "💊", "🧪", "⭐"];

export function CreateArsenalDialog({
  open,
  onOpenChange,
  onSubmit,
  editingArsenal,
}: CreateArsenalDialogProps) {
  const [arsenalName, setArsenalName] = useState("");
  const [arsenalDescription, setArsenalDescription] = useState("");
  const [groups, setGroups] = useState<GroupFormData[]>([]);

  const isEditing = !!editingArsenal;

  // Preenche o form quando está editando
  useEffect(() => {
    if (editingArsenal && open) {
      setArsenalName(editingArsenal.name);
      setArsenalDescription(editingArsenal.description || "");

      // Converte grupos do arsenal para formato do form
      const formGroups: GroupFormData[] = editingArsenal.customGroups.map(
        (group) => ({
          id: group.id,
          name: group.name,
          description: group.description || "",
          frontendMatchValue: group.matchRules[0]?.value?.toString() || "",
          icon: group.icon || ICONS[0],
          color: group.color || COLORS[0].value,
          offers: group.offers.map((offer) => ({
            id: offer.id,
            name: offer.name,
            matchValue: offer.matchRules[0]?.value?.toString() || "",
            offerType: offer.offerType,
          })),
        })
      );
      setGroups(formGroups);
    } else if (!open) {
      // Limpa o form quando fecha
      setArsenalName("");
      setArsenalDescription("");
      setGroups([]);
    }
  }, [editingArsenal, open]);

  const handleAddGroup = () => {
    const newGroup: GroupFormData = {
      id: `group-${Date.now()}`,
      name: "",
      description: "",
      frontendMatchValue: "",
      icon: ICONS[0],
      color: COLORS[0].value,
      offers: [],
    };
    setGroups([...groups, newGroup]);
  };

  const handleRemoveGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId));
  };

  const handleUpdateGroup = (
    groupId: string,
    field: keyof GroupFormData,
    value: string
  ) => {
    setGroups(
      groups.map((g) => (g.id === groupId ? { ...g, [field]: value } : g))
    );
  };

  const handleAddOffer = (groupId: string) => {
    const newOffer: OfferFormData = {
      id: `offer-${Date.now()}`,
      name: "",
      matchValue: "",
      offerType: "UPSELL",
    };

    setGroups(
      groups.map((g) =>
        g.id === groupId ? { ...g, offers: [...g.offers, newOffer] } : g
      )
    );
  };

  const handleRemoveOffer = (groupId: string, offerId: string) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, offers: g.offers.filter((o) => o.id !== offerId) }
          : g
      )
    );
  };

  const handleUpdateOffer = (
    groupId: string,
    offerId: string,
    field: keyof OfferFormData,
    value: string
  ) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              offers: g.offers.map((o) =>
                o.id === offerId ? { ...o, [field]: value } : o
              ),
            }
          : g
      )
    );
  };

  const handleSubmit = () => {
    // Validação básica
    if (!arsenalName.trim()) {
      alert("Nome do arsenal é obrigatório");
      return;
    }

    if (groups.length === 0) {
      alert("Adicione pelo menos um grupo");
      return;
    }

    // Validar grupos
    for (const group of groups) {
      if (!group.name.trim() || !group.frontendMatchValue.trim()) {
        alert("Todos os grupos devem ter nome e termo de busca");
        return;
      }
    }

    // Converter para formato final
    const customGroups: CustomProductGroup[] = groups.map((group, idx) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      matchRules: [
        {
          type: "contains" as const,
          value: group.frontendMatchValue.toLowerCase(),
          caseSensitive: false,
        },
      ],
      offers: group.offers.map((offer, offerIdx) => ({
        id: offer.id,
        name: offer.name,
        offerType: offer.offerType,
        matchRules: [
          {
            type: "contains" as const,
            value: offer.matchValue.toLowerCase(),
            caseSensitive: false,
          },
        ],
        order: offerIdx + 1,
      })),
      color: group.color,
      icon: group.icon,
      order: idx + 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    onSubmit({
      name: arsenalName,
      description: arsenalDescription,
      customGroups,
    });

    // Reset form apenas se não estiver editando (o useEffect vai limpar)
    if (!isEditing) {
      setArsenalName("");
      setArsenalDescription("");
      setGroups([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Agrupamento" : "Criar Novo Agrupamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite seu arsenal personalizado"
              : "Crie um arsenal personalizado com grupos de produtos e seus upsells"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Arsenal */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="arsenal-name">Nome do Arsenal *</Label>
              <Input
                id="arsenal-name"
                placeholder="Ex: Black Friday Setup"
                value={arsenalName}
                onChange={(e) => setArsenalName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="arsenal-description">Descrição (opcional)</Label>
              <Textarea
                id="arsenal-description"
                placeholder="Descreva o propósito deste arsenal..."
                value={arsenalDescription}
                onChange={(e) => setArsenalDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Grupos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Grupos de Produtos</h3>
                <p className="text-sm text-muted-foreground">
                  Cada grupo representa um produto principal e seus upsells
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddGroup}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Grupo
              </Button>
            </div>

            {/* Lista de Grupos */}
            {groups.map((group, groupIdx) => (
              <Card key={group.id} className="p-4 space-y-4">
                {/* Header do Grupo */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Grupo {groupIdx + 1}</Badge>
                    {group.name && (
                      <span className="font-medium">{group.name}</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveGroup(group.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                {/* Campos do Grupo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Produto Principal *</Label>
                    <Input
                      placeholder="Ex: Men Balance"
                      value={group.name}
                      onChange={(e) =>
                        handleUpdateGroup(group.id, "name", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label>Termo de Busca (Frontend) *</Label>
                    <Input
                      placeholder="Ex: men balance"
                      value={group.frontendMatchValue}
                      onChange={(e) =>
                        handleUpdateGroup(
                          group.id,
                          "frontendMatchValue",
                          e.target.value
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Produtos que contém este termo serão agrupados
                    </p>
                  </div>

                  <div>
                    <Label>Descrição (opcional)</Label>
                    <Input
                      placeholder="Descreva este grupo..."
                      value={group.description}
                      onChange={(e) =>
                        handleUpdateGroup(
                          group.id,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>Ícone</Label>
                      <div className="flex gap-2 flex-wrap mt-1">
                        {ICONS.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() =>
                              handleUpdateGroup(group.id, "icon", icon)
                            }
                            className={`w-8 h-8 rounded flex items-center justify-center text-lg hover:bg-accent ${
                              group.icon === icon
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1">
                      <Label>Cor</Label>
                      <div className="flex gap-2 flex-wrap mt-1">
                        {COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() =>
                              handleUpdateGroup(group.id, "color", color.value)
                            }
                            className={`w-8 h-8 rounded border-2 ${
                              group.color === color.value
                                ? "border-primary scale-110"
                                : "border-transparent"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upsells */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Upsells / Downsells</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddOffer(group.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar Upsell
                    </Button>
                  </div>

                  {group.offers.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum upsell adicionado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {group.offers.map((offer, offerIdx) => (
                        <div
                          key={offer.id}
                          className="flex items-center gap-2 p-2 rounded bg-muted/50"
                        >
                          <Badge variant="secondary" className="text-xs">
                            {offerIdx + 1}
                          </Badge>
                          <Input
                            placeholder="Nome do upsell"
                            value={offer.name}
                            onChange={(e) =>
                              handleUpdateOffer(
                                group.id,
                                offer.id,
                                "name",
                                e.target.value
                              )
                            }
                            className="flex-1"
                          />
                          <Input
                            placeholder="Termo de busca"
                            value={offer.matchValue}
                            onChange={(e) =>
                              handleUpdateOffer(
                                group.id,
                                offer.id,
                                "matchValue",
                                e.target.value
                              )
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveOffer(group.id, offer.id)
                            }
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {groups.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">
                  Nenhum grupo adicionado ainda
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddGroup}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Grupo
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {isEditing ? "Salvar Alterações" : "Criar Arsenal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
