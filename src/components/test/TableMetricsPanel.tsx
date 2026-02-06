import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { TableMetrics } from '@/lib/ruleEngine/tableDetector';

interface TableMetricsPanelProps {
  metrics: TableMetrics[];
}

function getColumnTypeBadgeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'date': return 'default';
    case 'description': return 'secondary';
    case 'debit': return 'destructive';
    case 'credit': return 'default';
    case 'balance': return 'secondary';
    case 'amount': return 'outline';
    default: return 'outline';
  }
}

export function TableMetricsPanel({ metrics }: TableMetricsPanelProps) {
  const [openTables, setOpenTables] = useState<Record<number, boolean>>({ 0: true });
  
  const toggleTable = (index: number) => {
    setOpenTables(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (metrics.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Per-Table Analysis
          <Badge variant="outline">{metrics.length} table(s)</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((table, idx) => (
          <Collapsible key={idx} open={openTables[idx]} onOpenChange={() => toggleTable(idx)}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  {openTables[idx] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-medium">Table {idx + 1}</span>
                  <Badge variant="outline" className="text-xs">
                    Page {table.pageNumbers.join(', ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{table.lineCount} lines</span>
                  <span>•</span>
                  <span>{table.rowsExtracted} rows</span>
                  <span>•</span>
                  <span>{table.columns.length} cols</span>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-3 bg-secondary/10 rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Column Classification:</p>
                  <div className="flex flex-wrap gap-2">
                    {table.columns.map((col, colIdx) => (
                      <div key={colIdx} className="flex flex-col items-center gap-1">
                        <Badge variant={getColumnTypeBadgeVariant(col.inferredType || 'unknown')}>
                          {col.inferredType || 'unknown'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {(col.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  X-positions: {table.columns.map(c => `${c.x0.toFixed(0)}-${c.x1.toFixed(0)}`).join(' | ')}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
