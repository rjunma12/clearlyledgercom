/**
 * DuplicateReviewPanel - UI for reviewing and dismissing duplicate transactions
 */

import { useState } from 'react';
import { 
  AlertTriangle, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  Trash2,
  Undo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { DuplicateGroup } from '@/lib/ruleEngine/documentMerger';
import type { ParsedTransaction } from '@/lib/ruleEngine/types';

export interface DuplicateReviewPanelProps {
  duplicateGroups: DuplicateGroup[];
  transactions: ParsedTransaction[];
  onDismissGroup: (groupIndex: number) => void;
  onDismissTransaction: (groupIndex: number, transactionIndex: number) => void;
  onRestoreGroup: (groupIndex: number) => void;
  onExcludeFromExport: (transactionIndices: number[]) => void;
  className?: string;
}

interface DismissedState {
  groups: Set<number>;
  transactions: Map<number, Set<number>>; // groupIndex -> Set of transaction indices
}

export function DuplicateReviewPanel({
  duplicateGroups,
  transactions,
  onDismissGroup,
  onDismissTransaction,
  onRestoreGroup,
  onExcludeFromExport,
  className,
}: DuplicateReviewPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([0]));
  const [dismissed, setDismissed] = useState<DismissedState>({
    groups: new Set(),
    transactions: new Map(),
  });
  const [excludedTransactions, setExcludedTransactions] = useState<Set<number>>(new Set());

  const toggleGroup = (index: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleDismissGroup = (groupIndex: number) => {
    setDismissed(prev => ({
      ...prev,
      groups: new Set([...prev.groups, groupIndex]),
    }));
    onDismissGroup(groupIndex);
  };

  const handleRestoreGroup = (groupIndex: number) => {
    setDismissed(prev => {
      const nextGroups = new Set(prev.groups);
      nextGroups.delete(groupIndex);
      const nextTransactions = new Map(prev.transactions);
      nextTransactions.delete(groupIndex);
      return { groups: nextGroups, transactions: nextTransactions };
    });
    onRestoreGroup(groupIndex);
  };

  const handleDismissTransaction = (groupIndex: number, txIndex: number) => {
    setDismissed(prev => {
      const nextTransactions = new Map(prev.transactions);
      const groupDismissed = nextTransactions.get(groupIndex) || new Set();
      groupDismissed.add(txIndex);
      nextTransactions.set(groupIndex, groupDismissed);
      return { ...prev, transactions: nextTransactions };
    });
    onDismissTransaction(groupIndex, txIndex);
  };

  const handleToggleExclude = (txIndex: number) => {
    setExcludedTransactions(prev => {
      const next = new Set(prev);
      if (next.has(txIndex)) {
        next.delete(txIndex);
      } else {
        next.add(txIndex);
      }
      onExcludeFromExport(Array.from(next));
      return next;
    });
  };

  const getTransaction = (index: number): ParsedTransaction | undefined => {
    return transactions[index];
  };

  const formatAmount = (tx: ParsedTransaction): string => {
    if (tx.debit !== null && tx.debit > 0) {
      return `-$${tx.debit.toFixed(2)}`;
    }
    if (tx.credit !== null && tx.credit > 0) {
      return `+$${tx.credit.toFixed(2)}`;
    }
    return '$0.00';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-destructive';
    if (confidence >= 0.7) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  const activeGroups = duplicateGroups.filter((_, i) => !dismissed.groups.has(i));
  const dismissedCount = dismissed.groups.size;

  if (duplicateGroups.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-foreground">
            Duplicate Review
          </h3>
          <Badge variant="secondary" className="text-xs">
            {activeGroups.length} group{activeGroups.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        {dismissedCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {dismissedCount} dismissed
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span>High confidence (90%+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Medium confidence (70-90%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <EyeOff className="w-3 h-3" />
          <span>Excluded from export</span>
        </div>
      </div>

      {/* Duplicate Groups */}
      <div className="space-y-3">
        {duplicateGroups.map((group, groupIndex) => {
          const isDismissed = dismissed.groups.has(groupIndex);
          const isExpanded = expandedGroups.has(groupIndex);
          const groupTransactions = group.transactionIndices.map(i => ({
            index: i,
            tx: getTransaction(i),
          })).filter(item => item.tx !== undefined);

          return (
            <Collapsible
              key={groupIndex}
              open={isExpanded && !isDismissed}
              onOpenChange={() => !isDismissed && toggleGroup(groupIndex)}
            >
              <div className={cn(
                "rounded-lg border transition-all",
                isDismissed 
                  ? "bg-muted/30 border-border opacity-60" 
                  : "bg-card border-amber-500/30"
              )}>
                {/* Group Header */}
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center justify-between p-4 text-left",
                      !isDismissed && "hover:bg-muted/50"
                    )}
                    disabled={isDismissed}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isDismissed ? "bg-muted" : "bg-amber-500/20"
                      )}>
                        <span className={cn(
                          "text-sm font-bold",
                          isDismissed ? "text-muted-foreground" : "text-amber-500"
                        )}>
                          {groupIndex + 1}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium",
                            isDismissed ? "text-muted-foreground line-through" : "text-foreground"
                          )}>
                            {group.transactionIndices.length} potential duplicates
                          </span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              getConfidenceColor(group.confidence)
                            )}
                          >
                            {Math.round(group.confidence * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {group.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isDismissed && (
                        <>
                          {group.sourceFiles.length > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              {group.sourceFiles.length} files
                            </Badge>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </>
                      )}
                    </div>
                  </button>
                </CollapsibleTrigger>

                {/* Dismissed State Actions */}
                {isDismissed && (
                  <div className="px-4 pb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestoreGroup(groupIndex)}
                      className="gap-1.5 text-xs"
                    >
                      <Undo className="w-3 h-3" />
                      Restore
                    </Button>
                  </div>
                )}

                {/* Expanded Content */}
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    {/* Transaction List */}
                    <div className="space-y-2">
                      {groupTransactions.map(({ index, tx }) => {
                        if (!tx) return null;
                        const isExcluded = excludedTransactions.has(index);
                        const isTxDismissed = dismissed.transactions.get(groupIndex)?.has(index);
                        const sourceFile = (tx as any).sourceFileName;

                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border transition-all",
                              isExcluded 
                                ? "bg-muted/50 border-border opacity-60" 
                                : isTxDismissed
                                  ? "bg-muted/30 border-border opacity-50"
                                  : "bg-muted/30 border-border"
                            )}
                          >
                            {/* Transaction Details */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm font-mono">{tx.date}</span>
                                <DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2" />
                                <span className={cn(
                                  "text-sm font-mono font-medium",
                                  tx.debit ? "text-destructive" : "text-primary"
                                )}>
                                  {formatAmount(tx)}
                                </span>
                              </div>
                              
                              <p className={cn(
                                "text-sm truncate",
                                isExcluded && "line-through"
                              )}>
                                {tx.description}
                              </p>
                              
                              {sourceFile && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <FileText className="w-3 h-3" />
                                  <span className="truncate">{sourceFile}</span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <TooltipProvider>
                              <div className="flex items-center gap-1 shrink-0">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleExclude(index);
                                      }}
                                    >
                                      {isExcluded ? (
                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                      ) : (
                                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isExcluded ? 'Include in export' : 'Exclude from export'}
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDismissTransaction(groupIndex, index);
                                      }}
                                      disabled={isTxDismissed}
                                    >
                                      <X className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Not a duplicate
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                          </div>
                        );
                      })}
                    </div>

                    {/* Group Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissGroup(groupIndex)}
                        className="gap-1.5 text-xs text-muted-foreground"
                      >
                        <Check className="w-3 h-3" />
                        Dismiss Group (Not Duplicates)
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Exclude all but the first transaction
                          const toExclude = group.transactionIndices.slice(1);
                          toExclude.forEach(idx => {
                            if (!excludedTransactions.has(idx)) {
                              handleToggleExclude(idx);
                            }
                          });
                        }}
                        className="gap-1.5 text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                        Keep First, Exclude Rest
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      {/* Summary */}
      {excludedTransactions.size > 0 && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">{excludedTransactions.size}</strong> transaction{excludedTransactions.size !== 1 ? 's' : ''} excluded from export
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setExcludedTransactions(new Set());
                onExcludeFromExport([]);
              }}
              className="text-xs"
            >
              Clear All Exclusions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DuplicateReviewPanel;
