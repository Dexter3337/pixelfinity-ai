
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface EnhancementCounterProps {
  count: number;
}

export const EnhancementCounter: React.FC<EnhancementCounterProps> = ({ count }) => {
  return (
    <Card className="w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-medium">Images Enhanced</h3>
            <p className="text-blue-100">Total number of image enhancements</p>
          </div>
          <div className="text-4xl font-bold">{count}</div>
        </div>
      </CardContent>
    </Card>
  );
};
