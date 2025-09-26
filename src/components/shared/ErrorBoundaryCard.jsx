import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBoundaryCard({ title, loading, error, onRetry, children, className = "" }) {
  return (
    <Card className={`border-none shadow-lg ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-slate-500">טוען...</span>
          </div>
        )}
        
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-sm text-red-600 mb-4">
              אירעה שגיאה בטעינת הנתונים
            </p>
            {onRetry && (
              <Button variant="outline" onClick={onRetry} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                נסה שוב
              </Button>
            )}
          </div>
        )}
        
        {!loading && !error && children}
      </CardContent>
    </Card>
  );
}