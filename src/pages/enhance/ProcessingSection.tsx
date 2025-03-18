
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProcessingSectionProps {
  stage: string;
}

export const ProcessingSection: React.FC<ProcessingSectionProps> = ({ stage }) => {
  return (
    <Card className="w-full mt-8">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-gray-200 border-solid rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-solid rounded-full animate-spin" style={{ borderTopColor: 'transparent', animationDuration: '1.5s' }}></div>
          </div>
          
          <h3 className="text-xl font-medium">{stage || 'Processing image...'}</h3>
          
          <div className="w-full max-w-md">
            <Progress value={65} className="h-2" />
          </div>
          
          <p className="text-gray-500 text-center">
            Applying AI-powered enhancements to your image. This may take a moment as we analyze and optimize your photo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
