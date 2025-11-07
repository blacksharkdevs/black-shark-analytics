import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";

interface StatsCardProps {
  title: string;
  value: string; // Já formatado
  icon: React.ElementType; // Usamos ElementType para o Lucide icon
  description: string;
  isLoading: boolean;
  explanation?: string;
  formula?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
  explanation,
  formula,
}: StatsCardProps) {
  // --- RENDERIZAÇÃO DO SKELETON ---
  if (isLoading) {
    return (
      <Card className="transition-shadow duration-300 border rounded-none shadow-lg hover:shadow-xl bg-card/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <Skeleton className="w-3/4 h-4 rounded-none bg-accent/20" />
          <Skeleton className="w-6 h-6 rounded-none bg-accent/20" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-1/2 h-8 mb-1 rounded-none bg-accent/30" />
          <Skeleton className="w-full h-4 rounded-none bg-accent/20" />
        </CardContent>
      </Card>
    );
  }

  // --- CONTEÚDO FINAL DO CARD ---
  const cardContent = (
    <Card className="transition-shadow duration-300 border rounded-none shadow-lg hover:shadow-xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-accent">
          <Icon className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="pt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  // --- TOOLTIP ---
  if (formula || explanation) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
        <TooltipContent
          className="max-w-xs p-3 text-sm whitespace-pre-wrap border rounded-none shadow-md bg-card text-foreground border-border"
          side="top"
          align="center"
        >
          {explanation && (
            <p className="mb-1 text-base font-semibold">{explanation}</p>
          )}
          {formula && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Formula:</span> {formula}
            </p>
          )}
          {!explanation && !formula && (
            <p className="text-muted-foreground">No details available.</p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return cardContent;
}
