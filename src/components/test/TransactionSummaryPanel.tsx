import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { ProcessingResult } from '@/lib/ruleEngine/types';

interface TransactionSummaryPanelProps {
  result: ProcessingResult;
}

export function TransactionSummaryPanel({ result }: TransactionSummaryPanelProps) {
  const transactions = result.document?.transactions || [];
  
  // Calculate totals
  const totalDebit = transactions.reduce((sum, tx) => sum + (tx.debit || 0), 0);
  const totalCredit = transactions.reduce((sum, tx) => sum + (tx.credit || 0), 0);
  const debitCount = transactions.filter(tx => (tx.debit || 0) > 0).length;
  const creditCount = transactions.filter(tx => (tx.credit || 0) > 0).length;
  const missingAmountCount = transactions.filter(tx => !tx.debit && !tx.credit).length;
  
  // Opening/Closing balance check
  const openingBalance = transactions[0]?.balance;
  const closingBalance = transactions[transactions.length - 1]?.balance;
  const calculatedClosing = (openingBalance || 0) + totalCredit - totalDebit;
  const balanceMatches = closingBalance !== undefined && 
    Math.abs(calculatedClosing - closingBalance) < 1;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 Debit/Credit Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            <p className="text-xs text-muted-foreground mb-1">Total Debits</p>
            <p className="text-xl font-bold text-red-500">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground mt-1">{debitCount} transactions</p>
          </div>
          
          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
            <p className="text-xs text-muted-foreground mb-1">Total Credits</p>
            <p className="text-xl font-bold text-green-500">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground mt-1">{creditCount} transactions</p>
          </div>
          
          <div className="bg-secondary/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Net Change</p>
            <p className="text-xl font-bold">{(totalCredit - totalDebit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          
          <div className={`p-4 rounded-lg ${missingAmountCount > 0 ? 'bg-warning/10 border border-warning/20' : 'bg-secondary/50'}`}>
            <p className="text-xs text-muted-foreground mb-1">Missing Amount</p>
            <p className="text-xl font-bold">{missingAmountCount}</p>
            {missingAmountCount > 0 && (
              <Badge variant="outline" className="text-xs mt-1">Needs review</Badge>
            )}
          </div>
        </div>
        
        {/* Balance verification */}
        <div className={`p-4 rounded-lg flex items-center gap-3 ${balanceMatches ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          {balanceMatches ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <div className="flex-1">
            <p className="font-medium">Balance Verification</p>
            <p className="text-xs text-muted-foreground">
              Opening ({openingBalance?.toLocaleString()}) + Credits - Debits = {calculatedClosing.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              {closingBalance !== undefined && (
                <span className="ml-2">
                  (Actual closing: {closingBalance.toLocaleString()})
                </span>
              )}
            </p>
          </div>
          <Badge variant={balanceMatches ? 'default' : 'destructive'}>
            {balanceMatches ? 'Matches' : 'Mismatch'}
          </Badge>
        </div>
        
        {/* Warning for missing credits */}
        {creditCount === 0 && debitCount > 0 && (
          <div className="mt-4 p-3 bg-warning/10 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <p className="text-sm">
              <strong>Warning:</strong> No credit transactions detected. This may indicate a missing credit column detection issue.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
