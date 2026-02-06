import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import type { ParsedTransaction } from '@/lib/ruleEngine/types';

interface RawTransactionTableProps {
  transactions: ParsedTransaction[];
  pageSize?: number;
}

export function RawTransactionTable({ 
  transactions, 
  pageSize = 25 
}: RawTransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const totalPages = Math.ceil(transactions.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, transactions.length);
  const pageTransactions = transactions.slice(startIndex, endIndex);

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'F': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getValidationIcon = (status?: string) => {
    if (status === 'error') {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
    if (status === 'warning') {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    if (status === 'valid') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return null;
  };

  const hasIssues = (tx: ParsedTransaction) => {
    // Missing both debit and credit
    if (!tx.debit && !tx.credit) return true;
    // Missing balance
    if (!tx.balance) return true;
    // Low confidence
    if ((tx as any).confidenceScore && (tx as any).confidenceScore < 50) return true;
    return false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📋 Extracted Transactions ({transactions.length})</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-24">Date</TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead className="w-24 text-right">Debit</TableHead>
                <TableHead className="w-24 text-right">Credit</TableHead>
                <TableHead className="w-24 text-right">Balance</TableHead>
                <TableHead className="w-16 text-center">Grade</TableHead>
                <TableHead className="w-12">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageTransactions.map((tx, idx) => {
                const globalIdx = startIndex + idx;
                const extTx = tx as any;
                const isExpanded = expandedRow === globalIdx;
                const rowHasIssues = hasIssues(tx);
                
                return (
                  <>
                    <TableRow 
                      key={globalIdx}
                      className={`cursor-pointer ${rowHasIssues ? 'bg-destructive/10' : ''}`}
                      onClick={() => setExpandedRow(isExpanded ? null : globalIdx)}
                    >
                      <TableCell className="font-mono text-xs">{globalIdx + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{tx.date || '-'}</TableCell>
                      <TableCell className="text-sm max-w-[300px] truncate" title={tx.description}>
                        {tx.description || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-red-600 dark:text-red-400">
                        {tx.debit || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-green-600 dark:text-green-400">
                        {tx.credit || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {tx.balance || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {extTx.grade && (
                          <Badge className={getGradeColor(extTx.grade)} variant="secondary">
                            {extTx.grade}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getValidationIcon(tx.validationStatus)}</TableCell>
                    </TableRow>
                    
                    {isExpanded && (
                      <TableRow className="bg-secondary/30">
                        <TableCell colSpan={8}>
                          <div className="p-3 text-xs space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <strong>Transaction Details:</strong>
                                <pre className="bg-secondary p-2 rounded mt-1 overflow-auto max-h-32">
                                  {JSON.stringify({
                                    date: tx.date,
                                    description: tx.description,
                                    debit: tx.debit,
                                    credit: tx.credit,
                                    balance: tx.balance,
                                    reference: tx.reference,
                                    validationStatus: tx.validationStatus,
                                  }, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <strong>Confidence Details:</strong>
                                <ul className="mt-1 space-y-1">
                                  <li>Score: {extTx.confidenceScore ?? 'N/A'}%</li>
                                  <li>Grade: {extTx.grade || 'N/A'}</li>
                                  <li>Reference: {tx.reference || 'N/A'}</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary of issues */}
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive/20" />
            <span>Missing Debit/Credit: {transactions.filter(t => !t.debit && !t.credit).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
            <span>Missing Balance: {transactions.filter(t => !t.balance).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500/20" />
            <span>Complete Rows: {transactions.filter(t => (t.debit || t.credit) && t.balance).length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
