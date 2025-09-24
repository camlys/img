
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizeRotateTab } from '@/components/tabs/resize-rotate-tab';
import { RotateFlipTab } from '@/components/tabs/rotate-flip-tab';
import { CropTab } from '@/components/tabs/crop-tab';
import { TextTab } from '@/components/tabs/text-tab';
import { AdjustmentsTab } from '@/components/tabs/adjustments-tab';
import { SignatureTab } from '@/components/tabs/signature-tab';
import type { ImageSettings, OriginalImage, CropSettings } from '@/lib/types';
import { SlidersHorizontal, Crop, Type, Scan, RotateCcw, Pencil } from 'lucide-react';

interface ControlPanelProps {
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  originalImage: OriginalImage;
  activeTab: string;
  onTabChange: (tab: string) => void;
  processedSize: number | null;
  pendingCrop: CropSettings | null;
  setPendingCrop: (crop: CropSettings | null) => void;
  onApplyPerspectiveCrop: () => void;
  isFromMultiPagePdf: boolean;
  onViewPages: () => void;
  selectedTextId: string | null;
  setSelectedTextId: (id: string | null) => void;
  selectedSignatureId: string | null;
  setSelectedSignatureId: (id: string | null) => void;
}

export function ControlPanel({ 
  settings, 
  updateSettings, 
  originalImage, 
  activeTab, 
  onTabChange, 
  processedSize,
  pendingCrop,
  setPendingCrop,
  onApplyPerspectiveCrop,
  isFromMultiPagePdf,
  onViewPages,
  selectedTextId,
  setSelectedTextId,
  selectedSignatureId,
  setSelectedSignatureId,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-2 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="resize" className="flex-col h-auto gap-1 py-2">
              <Scan size={16}/>
              <span className="text-xs">Resize</span>
            </TabsTrigger>
            <TabsTrigger value="crop" className="flex-col h-auto gap-1 py-2">
                <Crop size={16}/>
                <span className="text-xs">Crop</span>
            </TabsTrigger>
             <TabsTrigger value="rotate" className="flex-col h-auto gap-1 py-2">
              <RotateCcw size={16}/>
              <span className="text-xs">Rotate</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex-col h-auto gap-1 py-2">
                <Type size={16}/>
                <span className="text-xs">Text</span>
            </TabsTrigger>
             <TabsTrigger value="signature" className="flex-col h-auto gap-1 py-2">
                <Pencil size={16}/>
                <span className="text-xs">Sign</span>
            </TabsTrigger>
            <TabsTrigger value="adjustments" className="flex-col h-auto gap-1 py-2">
                <SlidersHorizontal size={16}/>
                <span className="text-xs">Adjust</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="resize">
            <ResizeRotateTab 
              settings={settings} 
              updateSettings={updateSettings} 
              originalImage={originalImage} 
              processedSize={processedSize}
              isFromMultiPagePdf={isFromMultiPagePdf}
              onViewPages={onViewPages}
            />
          </TabsContent>
          <TabsContent value="crop">
            <CropTab 
              settings={settings} 
              updateSettings={updateSettings} 
              originalImage={originalImage}
              pendingCrop={pendingCrop}
              setPendingCrop={setPendingCrop}
              onTabChange={onTabChange}
              onApplyPerspectiveCrop={onApplyPerspectiveCrop}
            />
          </TabsContent>
           <TabsContent value="rotate">
            <RotateFlipTab settings={settings} updateSettings={updateSettings} />
          </TabsContent>
          <TabsContent value="text">
            <TextTab 
              settings={settings} 
              updateSettings={updateSettings}
              selectedTextId={selectedTextId}
              setSelectedTextId={setSelectedTextId}
            />
          </TabsContent>
          <TabsContent value="signature">
            <SignatureTab
              settings={settings}
              updateSettings={updateSettings}
              selectedSignatureId={selectedSignatureId}
              setSelectedSignatureId={setSelectedSignatureId}
            />
          </TabsContent>
          <TabsContent value="adjustments">
            <AdjustmentsTab settings={settings} updateSettings={updateSettings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
