'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, ZoomIn, ZoomOut, RotateCcw, Download, Settings } from 'lucide-react';

export function MindMapViewer() {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Character Relationship Mind Map
            </CardTitle>
            <CardDescription>
              Interactive visualization of character connections and relationships
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.min(prev + 25, 200))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.max(prev - 25, 50))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoomLevel(100)}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative bg-muted/50 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
          {/* Placeholder for mind map visualization */}
          <div className="text-center text-muted-foreground">
            <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Mind Map Visualization</h3>
            <p className="text-sm mb-4">
              Interactive D3.js mind map will be rendered here showing character relationships
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">Zoom: {zoomLevel}%</Badge>
              {selectedNode && <Badge variant="default">Selected: {selectedNode}</Badge>}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>Click and drag to pan • Mouse wheel to zoom • Click nodes for details</div>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Layout Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}