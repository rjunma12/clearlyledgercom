import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import type { TableMetrics, ColumnBoundary } from '@/lib/ruleEngine/tableDetector';

interface ColumnConflictsPanelProps {
  perTableMetrics: TableMetrics[];
  reconciledBoundaries: ColumnBoundary[];
}

interface ColumnConflict {
  columnX: number;
  conflictingTypes: string[];
  tables: number[];
}

export function ColumnConflictsPanel({ 
  perTableMetrics, 
  reconciledBoundaries 
}: ColumnConflictsPanelProps) {
  // Detect conflicts by comparing column types across tables
  const conflicts: ColumnConflict[] = [];
  const positionTolerance = 20;
  
  // Group columns by approximate X position across tables
  const columnGroups = new Map<number, { tableIndex: number; type: string; x: number }[]>();
  
  for (const metrics of perTableMetrics) {
    for (const col of metrics.columns) {
      // Find or create group for this X position
      let foundGroup = false;
      for (const [groupX, members] of columnGroups) {
        if (Math.abs(col.centerX - groupX) < positionTolerance) {
          members.push({ 
            tableIndex: metrics.tableIndex, 
            type: col.inferredType || 'unknown',
            x: col.centerX
          });
          foundGroup = true;
          break;
        }
      }
      if (!foundGroup) {
        columnGroups.set(col.centerX, [{
          tableIndex: metrics.tableIndex,
          type: col.inferredType || 'unknown',
          x: col.centerX
        }]);
      }
    }
  }
  
  // Find groups with conflicting types
  for (const [groupX, members] of columnGroups) {
    const uniqueTypes = [...new Set(members.map(m => m.type))];
    if (uniqueTypes.length > 1 && members.length > 1) {
      conflicts.push({
        columnX: groupX,
        conflictingTypes: uniqueTypes,
        tables: members.map(m => m.tableIndex)
      });
    }
  }
  
  // Check for missing required columns  
  const requiredColumns: Array<'date' | 'debit' | 'credit' | 'balance'> = ['date', 'debit', 'credit', 'balance'];
  const missingColumns: string[] = [];
  const presentTypes = new Set(reconciledBoundaries.map(b => b.inferredType));
  
  for (const required of requiredColumns) {
    // 'amount' can substitute for debit+credit
    if (required === 'debit' || required === 'credit') {
      if (!presentTypes.has(required) && !presentTypes.has('amount')) {
        missingColumns.push(required);
      }
    } else if (!presentTypes.has(required)) {
      missingColumns.push(required);
    }
  }
  
  // Check for fragmentation warning
  const isFragmented = perTableMetrics.length > 5;
  
  // All good check
  const hasNoIssues = conflicts.length === 0 && missingColumns.length === 0 && !isFragmented;
  
  if (hasNoIssues) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Column Detection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All required columns detected with consistent mappings across {perTableMetrics.length} table region(s).
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-yellow-200 dark:border-yellow-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Column Detection Issues
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fragmentation Warning */}
        {isFragmented && (
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-sm">Fragmented Table Detection</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {perTableMetrics.length} table regions detected (expected 1-3). 
                  This may cause inconsistent column mappings. The document may have unusual formatting.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Missing Columns */}
        {missingColumns.length > 0 && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium text-sm">Missing Required Columns</p>
                <div className="flex gap-2 mt-2">
                  {missingColumns.map(col => (
                    <Badge key={col} variant="destructive" className="text-xs">
                      {col.toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  These columns could not be detected. Transactions may have incomplete data.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Column Conflicts */}
        {conflicts.length > 0 && (
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="font-medium text-sm">Column Type Conflicts</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Different table regions classified the same column position with different types:
                </p>
                <div className="mt-2 space-y-2">
                  {conflicts.map((conflict, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-muted-foreground">
                        x≈{conflict.columnX.toFixed(0)}:
                      </span>
                      {conflict.conflictingTypes.map((type, i) => (
                        <span key={type}>
                          <Badge variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                          {i < conflict.conflictingTypes.length - 1 && ' vs '}
                        </span>
                      ))}
                      <span className="text-muted-foreground">
                        (tables: {conflict.tables.join(', ')})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Resolution info */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          <strong>Resolution:</strong> The engine uses consensus voting to reconcile conflicts. 
          High-confidence mappings from the most reliable table are applied to others.
        </div>
      </CardContent>
    </Card>
  );
}
