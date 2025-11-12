// import React, { useMemo } from 'react';
// import { Users, Crown, ArrowUpDown } from 'lucide-react';
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
// } from '@/components/common/ui/table';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/ui/card';
// import { Button } from '@/components/common/ui/button';
// import { Skeleton } from '@/components/common/ui/skeleton';
// import { Input } from '@/components/common/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/ui/select';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/common/ui/tooltip';
// import { cn } from '@/lib/utils';

// import { AFFILIATE_ACTION_TYPES } from '@/lib/config';
// import { useAffiliates } from '@/hooks/useAffiliates';
// import { formatCurrency } from '@/utils/index';

// // 🚨 Estrutura do Tooltip (reprodução da lógica do getRefundTooltipContent do Provider)
// const renderTooltipRow = (label: string, value: number, isSubtracted = false, formatCurrency: (value: number) => string) => (
//     <div className="grid grid-cols-2 gap-x-2">
//         <span>{label}:</span>
//         <span className={cn("text-right", isSubtracted && value < 0 && "text-destructive")}>
//             {isSubtracted ? '-' : ''}{formatCurrency(Math.abs(value))}
//         </span>
//     </div>
// );

// // Mapeamento dos Headers da Tabela
// const tableHeaders: { key: string, label: string, className?: string, isNumeric?: boolean, tooltip?: string }[] = [
//     { key: 'aff_name', label: 'Affiliate Name', className: "w-[200px]" },
//     { key: 'platform', label: 'Platform', className: "w-[150px]" },
//     { key: 'customers', label: 'Customers', className: "text-right", isNumeric: true },
//     { key: 'total_sales', label: 'Sales', className: "text-right", isNumeric: true },
//     { key: 'front_sales', label: 'Front', className: "text-right", isNumeric: true },
//     { key: 'back_sales', label: 'Back', className: "text-right", isNumeric: true },
//     { key: 'total_revenue', label: 'Total Revenue', className: "text-right", isNumeric: true },
//     { key: 'gross_sales', label: 'Gross Sales', className: "text-right", isNumeric: true, tooltip: "Total Revenue - Platform Fees - Taxes" },
//     { key: 'refunds_and_chargebacks', label: 'R+CB', className: "text-right", isNumeric: true, tooltip: "Total cost of all Refunds and Chargebacks. See tooltip for details on the calculation." },
//     { key: 'commission_paid', label: 'Commission', className: "text-right", isNumeric: true },
//     { key: 'taxes', label: 'Taxes', className: "text-right", isNumeric: true },
//     { key: 'platform_fee_percentage_amount', label: 'Platform Fee (%)', className: "text-right", isNumeric: true },
//     { key: 'platform_fee_transaction_amount', label: 'Platform Fee ($)', className: "text-right", isNumeric: true },
//     { key: 'aov', label: 'AOV', className: "text-right", isNumeric: true, tooltip: "Gross Sales / Front Sales" },
//     { key: 'net_sales', label: 'Net Sales', className: "text-right", isNumeric: true, tooltip: "Gross Sales - Commission" },
//     { key: 'net_final', label: 'Net', className: "text-right", isNumeric: true, tooltip: "Net Sales + R+CB" },
//     { key: 'total_cogs', label: 'COGS', className: "text-right", isNumeric: true, tooltip: "Cost of Goods Sold (only for front-end sales)" },
//     { key: 'profit', label: 'Profit', className: "text-right", isNumeric: true, tooltip: "Net - COGS" },
//     { key: 'cash_flow', label: 'Cash Flow', className: "text-right font-bold text-primary", isNumeric: true, tooltip: "Profit - (Gross Sales * 10%)" },
// ];

// export function AffiliatesTable() {
//     const {
//         affiliateData: paginatedData, isLoading, showContentSkeleton, showNoDataMessage,
//         filterState, handleFilterChange, handleSearch, sortState, pagination,
//         getRefundTooltipContent, topAffiliatesIndices
//     } = useAffiliates();

//     const { sortColumn, sortDirection, handleSort } = sortState;
//     const { currentPage, totalPages, handleItemsPerPageChange, itemsPerPage } = pagination;
//     const { availablePlatforms, selectedPlatform, selectedActionType } = filterState;

//     // --- RENDERIZADORES DE UI ---

//     const renderSortIcon = (column: string) => {
//         if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4 ml-2 opacity-30" />;
//         return sortDirection === 'asc' ?
//             <ArrowUpDown className="w-4 h-4 ml-2 transform rotate-180 text-accent" /> :
//             <ArrowUpDown className="w-4 h-4 ml-2 text-accent" />;
//     };

//     const getFormattedValue = (key: string, value: number) => {
//         if (key.includes('revenue') || key.includes('sales') || key.includes('commission') || key.includes('taxes') || key.includes('fee') || key.includes('aov') || key.includes('profit') || key.includes('flow')) {
//             return formatCurrency(value);
//         }
//         return value.toLocaleString();
//     };

//     // --- TOOLTIP DE REEMBOLSO (Renderiza o corpo com a lógica do Provider) ---
//     const RefundTooltipRenderer = (item: any) => {
//         const tooltipData = getRefundTooltipContent(item);

//         if (tooltipData.isBuyGoods) {
//             return (
//                 <div className="p-2 text-sm w-[280px] space-y-1 text-foreground">
//                     <p className="font-bold">{tooltipData.title}</p>
//                     <p className="mb-2 text-xs italic">Formula: Revenue - Aff Comm - Taxes - Platform Fees</p>
//                     {renderTooltipRow("Total Refund Amount", tooltipData.refundAmount, false, formatCurrency)}
//                     <hr className="my-1 border-border/50" />
//                     {renderTooltipRow("Aff Commission", tooltipData.commission, true, formatCurrency)}
//                     {renderTooltipRow("Taxes", tooltipData.taxes, true, formatCurrency)}
//                     {renderTooltipRow("Platform Fees", tooltipData.platformFees, true, formatCurrency)}
//                     <hr className="my-1 border-border/50" />
//                     <div className="grid grid-cols-2 font-bold gap-x-2">
//                         <span>Final R+CB Cost:</span>
//                         <span className={cn("text-right", tooltipData.finalCost < 0 && "text-destructive")}>
//                             {formatCurrency(tooltipData.finalCost)}
//                         </span>
//                     </div>
//                 </div>
//             );
//         }

//         return (
//             <div className="p-2 space-y-1 text-sm text-foreground">
//                 <p className="font-bold">{tooltipData.title}</p>
//                 <p className="mb-2 text-xs italic">For each refund/chargeback, the cost is the absolute value of the original merchant commission.</p>
//                 <div className="grid grid-cols-2 font-bold gap-x-2">
//                     <span>Final R+CB Cost:</span>
//                     <span className={cn("text-right", tooltipData.finalCost < 0 && "text-destructive")}>
//                         {formatCurrency(tooltipData.finalCost)}
//                     </span>
//                 </div>
//             </div>
//         );
//     };

//     // --- RENDERIZAÇÃO PRINCIPAL ---
//     return (
//         <div className="container p-0 mx-auto space-y-6">
//             <Card className="border rounded-none shadow-lg bg-card">
//                 <CardHeader>
//                     <div className="flex items-center gap-2">
//                         <Users className="w-6 h-6 text-accent" />
//                         <CardTitle className='text-foreground'>Affiliate Performance</CardTitle>
//                     </div>
//                     <CardDescription className='text-muted-foreground'>Aggregated performance data for affiliates, calculated based on the filters selected below.</CardDescription>
//                 </CardHeader>
//                 <CardContent>

//                     {/* --- FILTROS DE CONTROLE --- */}
//                     <div className="grid grid-cols-1 gap-4 p-4 mb-6 border rounded-none md:grid-cols-3 bg-accent/10 border-accent/20">
//                         {/* Search Input */}
//                         <div className="flex items-center gap-2">
//                             <Search className="w-5 h-5 text-muted-foreground" />
//                             <Input type="text" placeholder="Search by Affiliate Name..." className="w-full border rounded-none bg-card border-input" onChange={(e) => handleSearch(e.target.value)} />
//                         </div>

//                         {/* Platform Filter */}
//                         <div className="flex items-center gap-2">
//                             <Network className="w-5 h-5 text-muted-foreground" />
//                             <Select value={selectedPlatform} onValueChange={handleFilterChange.platform} disabled={isLoading || availablePlatforms.length === 0}>
//                                 <SelectTrigger className="w-full border rounded-none bg-card border-input"> <SelectValue placeholder="Filter by Platform" /> </SelectTrigger>
//                                 <SelectContent className="rounded-none">
//                                     <SelectItem value="all">All Platforms</SelectItem>
//                                     {availablePlatforms.map(platform => (<SelectItem key={platform} value={platform}>{platform}</SelectItem>))}
//                                 </SelectContent>
//                             </Select>
//                         </div>

//                         {/* Action Type Filter */}
//                         <div className="flex items-center gap-2">
//                             <ListFilter className="w-5 h-5 text-muted-foreground" />
//                             <Select value={selectedActionType} onValueChange={handleFilterChange.actionType}>
//                                 <SelectTrigger className="w-full border rounded-none bg-card border-input"> <SelectValue placeholder="Select Action Type" /> </SelectTrigger>
//                                 <SelectContent className="rounded-none">
//                                     {AFFILIATE_ACTION_TYPES.map((action) => (<SelectItem key={action.id} value={action.id}>{action.name}</SelectItem>))}
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </div>

//                     {/* --- TABELA E SKELETON --- */}
//                     {showContentSkeleton ? (
//                         <div className="space-y-2">
//                             {[...Array(itemsPerPage)].map((_, i) => (<Skeleton key={i} className="w-full h-12 rounded-none bg-accent/20" />))}
//                         </div>
//                     ) : showNoDataMessage ? (
//                         <div className="py-10 text-center text-muted-foreground">No affiliate data found for the selected filters.</div>
//                     ) : (
//                         <>
//                         <div className="overflow-x-auto border rounded-none border-border">
//                             <Table>
//                                 <TableHeader className='text-muted-foreground'>
//                                     <TableRow className='hover:bg-transparent border-border/50'>
//                                         {tableHeaders.map(header => (
//                                             <TableHead
//                                                 key={header.key as string}
//                                                 className={cn("cursor-pointer hover:bg-accent/10 whitespace-nowrap", header.className, sortColumn === header.key ? "text-accent font-semibold" : "")}
//                                                 onClick={() => handleSort(header.key as SortableAffiliateKeys)}
//                                             >
//                                                 <div className={cn("flex items-center", header.isNumeric ? "justify-end" : "justify-start")}>
//                                                     {header.tooltip ? (
//                                                         <TooltipProvider>
//                                                             <Tooltip delayDuration={100}><TooltipTrigger asChild><span className="border-b border-dashed cursor-help border-muted-foreground">{header.label}</span></TooltipTrigger>
//                                                             <TooltipContent className='bg-card border-border text-foreground'>{header.tooltip}</TooltipContent></TooltipProvider>
//                                                         ) : (header.label)}
//                                                     {renderSortIcon(header.key as SortableAffiliateKeys)}
//                                                 </div>
//                                             </TableHead>
//                                         ))}
//                                     </TableRow>
//                                 </TableHeader>

//                                 <TableBody className='text-foreground'>
//                                     {paginatedData.map((item, index) => {
//                                         const isTopAffiliate = topAffiliatesIndices.has(index); // Verifica o índice na página
//                                         return (
//                                             <TableRow key={`${item.aff_name}-${item.platform}`} className={cn("hover:bg-accent/10 border-border/50", isTopAffiliate && "bg-primary/5 hover:bg-primary/10")}>

//                                                 {/* Células da Tabela */}
//                                                 <TableCell className="font-medium truncate"><Link to={`/dashboard/affiliates/${encodeURIComponent(item.aff_name)}`} className="text-primary hover:underline">{item.aff_name}</Link></TableCell>
//                                                 <TableCell>{item.platform}</TableCell>
//                                                 <TableCell className="text-right">{item.customers.toLocaleString()}</TableCell>
//                                                 <TableCell className="text-right">{item.total_sales.toLocaleString()}</TableCell>
//                                                 <TableCell className="text-right">{item.front_sales.toLocaleString()}</TableCell>
//                                                 <TableCell className="text-right">{item.back_sales.toLocaleString()}</TableCell>
//                                                 <TableCell className="text-right">{formatCurrency(item.total_revenue)}</TableCell>
//                                                 <TableCell className="text-right">{formatCurrency(item.gross_sales)}</TableCell>

//                                                 {/* R+CB (Refunds & Chargebacks) com Tooltip */}
//                                                 <TableCell className={cn("text-right text-destructive tabular-nums", item.refunds_and_chargebacks === 0 && "text-foreground")}>
//                                                     <TooltipProvider><Tooltip delayDuration={100}><TooltipTrigger asChild>
//                                                         <span className="border-b border-dashed cursor-help border-muted-foreground">{formatCurrency(item.refunds_and_chargebacks)}</span>
//                                                     </TooltipTrigger><TooltipContent className='bg-card border-border text-foreground'>
//                                                         {RefundTooltipRenderer(item)}
//                                                     </TooltipContent></Tooltip></TooltipProvider>
//                                                 </TableCell>

//                                                 {/* Colunas Finais (Commission, Taxes, Fees, Net, Profit, Cash Flow) */}
//                                                 <TableCell className="text-right">{formatCurrency(item.commission_paid)}</TableCell>
//                                                 <TableCell className="text-right">{formatCurrency(item.taxes)}</TableCell>
//                                                 <TableCell className="text-right">{formatCurrency(item.platform_fee_percentage_amount)}</TableCell>
//                                                 <TableCell className="text-right">{formatCurrency(item.platform_fee_transaction_amount)}</TableCell>
//                                                 <TableCell className="text-right">{formatCurrency(item.aov)}</TableCell>
//                                                 <TableCell className="text-right">{formatCurrency(item.net_sales)}</TableCell>
//                                                 <TableCell className="text-right">{formatCurrency(item.net_final)}</TableCell>
//                                                 <TableCell className="text-right text-destructive">-{formatCurrency(item.total_cogs)}</TableCell>
//                                                 <TableCell className={cn("text-right font-bold", item.profit > 0 ? "text-primary": "text-destructive")}>{formatCurrency(item.profit)}</TableCell>
//                                                 <TableCell className={cn("text-right font-bold", item.cash_flow > 0 ? "text-primary": "text-destructive")}>{formatCurrency(item.cash_flow)}</TableCell>
//                                             </TableRow>
//                                         );
//                                     })}
//                                 </TableBody>
//                             </Table>
//                         </div>

//                         {/* --- PAGINAÇÃO E RODAPÉ --- */}
//                         <div className="flex items-center justify-between py-4 space-x-2">
//                             <div className="flex items-center gap-2">
//                                 <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
//                                 <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
//                                     <SelectTrigger className="w-auto sm:w-[80px] bg-card border border-input rounded-none"><SelectValue placeholder={itemsPerPage.toString()} /></SelectTrigger>
//                                     <SelectContent>{ROWS_PER_PAGE_OPTIONS.map(option => (<SelectItem key={option} value={option.toString()} className='rounded-none'>{option}</SelectItem>))}</SelectContent>
//                                 </Select>
//                             </div>
//                             <span className="text-sm text-muted-foreground">
//                                 Page {totalPages > 0 ? currentPage : 0} of {totalPages} (Total: {totalRecords} records)
//                             </span>
//                             <div className="flex items-center gap-2">
//                                 <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading}>Previous</Button>
//                                 <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading || totalPages === 0}>Next</Button>
//                             </div>
//                         </div>
//                         </>
//                     )}
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
