
import React from 'react';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancementResult } from '@/lib/enhancementEngine';

interface ResultSectionProps {
  result: EnhancementResult;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ result }) => {
  const handleDownload = () => {
    // Create a link element
    const link = document.createElement('a');
    link.href = result.after;
    link.download = 'enhanced-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <BeforeAfterSlider
            before={result.before}
            after={result.after}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6 md:flex-row">
        <Card className="flex-1">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Enhancement Metrics</h3>
            {result.metrics ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Overall Improvement:</span>
                  <span className="font-medium">{Math.round(result.metrics.improvement)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Image Quality (PSNR):</span>
                  <span className="font-medium">{result.metrics.psnr.toFixed(2)} dB</span>
                </div>
                <div className="flex justify-between">
                  <span>Structural Similarity:</span>
                  <span className="font-medium">{result.metrics.ssim.toFixed(3)}</span>
                </div>
              </div>
            ) : (
              <p>No enhancement metrics available</p>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Applied Enhancements</h3>
            {result.appliedEnhancements.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {result.appliedEnhancements.map((enhancement, index) => (
                  <li key={index}>{enhancement}</li>
                ))}
              </ul>
            ) : (
              <p>No enhancements applied</p>
            )}
            <div className="mt-4">
              <Button onClick={handleDownload} className="w-full">
                Download Enhanced Image
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
