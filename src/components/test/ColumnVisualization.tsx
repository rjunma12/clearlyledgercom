import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ColumnBoundary } from '@/lib/ruleEngine/tableDetector';

interface ColumnVisualizationProps {
  boundaries: ColumnBoundary[];
}

function getColumnColor(type: string | null): string {
  switch (type) {
    case 'date': return 'bg-blue-500';
    case 'description': return 'bg-purple-500';
    case 'debit': return 'bg-red-500';
    case 'credit': return 'bg-green-500';
    case 'balance': return 'bg-yellow-500';
    case 'amount': return 'bg-orange-500';
    case 'reference': return 'bg-cyan-500';
    case 'value_date': return 'bg-indigo-500';
    default: return 'bg-gray-400';
  }
}

export function ColumnVisualization({ boundaries }: ColumnVisualizationProps) {
  if (boundaries.length === 0) return null;
  
  // Calculate the total width for scaling
  const minX = Math.min(...boundaries.map(b => b.x0));
  const maxX = Math.max(...boundaries.map(b => b.x1));
  const totalWidth = maxX - minX;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📐 Column Layout
          <Badge variant="outline">{boundaries.length} columns</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Visual column representation */}
        <div className="relative h-16 bg-secondary/30 rounded-lg overflow-hidden mb-4">
          {boundaries.map((boundary, idx) => {
            const leftPercent = ((boundary.x0 - minX) / totalWidth) * 100;
            const widthPercent = ((boundary.x1 - boundary.x0) / totalWidth) * 100;
            
            return (
              <div
                key={idx}
                className={`absolute h-full ${getColumnColor(boundary.inferredType)} opacity-70 border-r border-background flex items-center justify-center`}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
              >
                <span className="text-xs font-medium text-white drop-shadow-md truncate px-1">
                  {boundary.inferredType || '?'}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {boundaries.map((boundary, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-sm">
              <div className={`w-3 h-3 rounded ${getColumnColor(boundary.inferredType)}`} />
              <span className="capitalize">{boundary.inferredType || 'unknown'}</span>
              <span className="text-xs text-muted-foreground">
                ({(boundary.confidence * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
        
        {/* Table with details */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Column</th>
                <th className="text-left p-2">Type</th>
                <th className="text-right p-2">X-Range</th>
                <th className="text-right p-2">Width</th>
                <th className="text-right p-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {boundaries.map((boundary, idx) => (
                <tr key={idx} className="border-b border-secondary/50">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">
                    <Badge variant="outline" className="capitalize">
                      {boundary.inferredType || 'unknown'}
                    </Badge>
                  </td>
                  <td className="p-2 text-right font-mono text-xs">
                    {boundary.x0.toFixed(0)} - {boundary.x1.toFixed(0)}
                  </td>
                  <td className="p-2 text-right font-mono text-xs">
                    {(boundary.x1 - boundary.x0).toFixed(0)}px
                  </td>
                  <td className="p-2 text-right">
                    <span className={boundary.confidence >= 0.7 ? 'text-green-500' : boundary.confidence >= 0.5 ? 'text-yellow-500' : 'text-red-500'}>
                      {(boundary.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
