
"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, Settings, Loader2, Share2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { ImageSettings } from '@/lib/types';
import { formatBytes } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import Link from 'next/link';
import { UploadTypeDialog } from './upload-type-dialog';
import { LogoIcon } from './logo';
import { useToast } from "@/hooks/use-toast"

interface AppHeaderProps {
  onUpload: (file: File) => void;
  onDownload: (filename: string) => void;
  isImageLoaded: boolean;
  settings: ImageSettings;
  updateSettings: (newSettings: Partial<ImageSettings>) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  processedSize: number | null;
  onUpdateProcessedSize: () => void;
}

export function AppHeader({ 
  onUpload, 
  onDownload, 
  isImageLoaded,
  settings,
  updateSettings,
  canvasRef,
  processedSize,
  onUpdateProcessedSize,
}: AppHeaderProps) {
  const uploadInputRef = React.useRef<HTMLInputElement>(null);
  const [targetSize, setTargetSize] = useState('');
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('KB');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [filename, setFilename] = useState('camly-export');
  const [isUploadTypeDialogOpen, setIsUploadTypeDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isPopoverOpen && isImageLoaded) {
      onUpdateProcessedSize();
    }
  }, [isPopoverOpen, isImageLoaded, onUpdateProcessedSize, settings]);


  const handleUploadClick = () => {
    setIsUploadTypeDialogOpen(true);
  };

  const handleSelectUploadType = (type: 'image' | 'pdf') => {
    if (uploadInputRef.current) {
      uploadInputRef.current.accept = type === 'image' ? 'image/*' : 'application/pdf';
      uploadInputRef.current.click();
    }
    setIsUploadTypeDialogOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const getBlobFromCanvas = (quality: number): Promise<Blob | null> => {
      return new Promise((resolve) => {
          if (!canvasRef.current) {
              resolve(null);
              return;
          }
          canvasRef.current.toBlob((blob) => resolve(blob), settings.format, quality);
      });
  };

  const handleTargetSize = async () => {
    const numericSize = parseFloat(targetSize);
    if (!numericSize || numericSize <= 0 || !canvasRef.current) return;

    setIsOptimizing(true);
    const targetBytes = targetUnit === 'KB' ? numericSize * 1024 : numericSize * 1024 * 1024;
    
    let high = 1, low = 0, mid = 0.5, bestQuality = 0.5;
    
    for(let i = 0; i < 10; i++) {
      mid = (low + high) / 2;
      const blob = await getBlobFromCanvas(mid);
      if (!blob) break;
      
      if(blob.size > targetBytes) {
        high = mid;
      } else {
        low = mid;
      }
      bestQuality = mid;
    }
    
    updateSettings({ quality: parseFloat(bestQuality.toFixed(2)) });
    setTimeout(() => {
        onUpdateProcessedSize();
        setIsOptimizing(false);
    }, 100);
  };

  const handleShare = async () => {
    if (!canvasRef.current) {
        toast({ title: "Error", description: "Cannot share, canvas not ready.", variant: "destructive" });
        return;
    }

    const fallbackShare = async () => {
        const url = 'https://img-resizers.vercel.app/';
        await navigator.clipboard.writeText(url);
        toast({
            title: "Link Copied!",
            description: "The website URL has been copied to your clipboard.",
        });
    };

    try {
        canvasRef.current.toBlob(async (blob) => {
            if (!blob) {
                toast({ title: "Error", description: "Could not generate image for sharing.", variant: "destructive" });
                return;
            }

            const extension = settings.format.split('/')[1].split('+')[0] || 'png';
            const filename = `camly-edited-image.${extension}`;
            const file = new File([blob], filename, { type: settings.format });

            const shareData: ShareData = {
                title: 'Camly Image Editor',
                text: 'Check out this image I edited with Camly!',
                url: 'https://img-resizers.vercel.app/',
            };

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                shareData.files = [file];
                await navigator.share(shareData);
            } else if (navigator.share) {
                await navigator.share(shareData); // Share without file if not supported
            } else {
                await fallbackShare();
            }
        }, settings.format, settings.quality);
    } catch (error) {
        console.error("Share error:", error);
        await fallbackShare();
    }
  };


  return (
    <header className="flex items-center justify-between p-4 border-b bg-card overflow-hidden">
      <Link href="/" className="flex items-center gap-3">
        <LogoIcon />
        <div className="sun-rays">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[size:200%_auto] animate-gradient-shift font-headline tracking-tight">
                Camly
            </h1>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={uploadInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button variant="outline" onClick={handleUploadClick}>
          <Upload />
        </Button>
         <UploadTypeDialog
          isOpen={isUploadTypeDialogOpen}
          onOpenChange={setIsUploadTypeDialogOpen}
          onSelectType={handleSelectUploadType}
        />
        {isImageLoaded && (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="default">
                <Download className="mr-2" />
                Download
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none flex items-center gap-2"><Settings size={18}/> Export Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Adjust filename, format, and quality before downloading.
                  </p>
                </div>
                <Separator />
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="filename">Filename</Label>
                        <Input
                            id="filename"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            placeholder="camly-export"
                        />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="format">Format</Label>
                      <Select
                        value={settings.format}
                        onValueChange={(value) => {
                          const newSettings: Partial<ImageSettings> = { format: value as ImageSettings['format'] };
                          if (value === 'application/pdf' || value === 'image/svg+xml') {
                            newSettings.quality = 1.0;
                          }
                          updateSettings(newSettings);
                          setTimeout(onUpdateProcessedSize, 100);
                        }}
                      >
                        <SelectTrigger id="format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image/png">PNG</SelectItem>
                          <SelectItem value="image/jpeg">JPEG</SelectItem>
                          <SelectItem value="image/webp">WEBP</SelectItem>
                          <SelectItem value="image/gif">GIF</SelectItem>
                          <SelectItem value="image/bmp">BMP</SelectItem>
                          <SelectItem value="image/svg+xml">SVG</SelectItem>
                          <SelectItem value="application/pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(settings.format === 'image/jpeg' || settings.format === 'image/webp') && (
                      <>
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="quality">Quality</Label>
                            <span className="text-sm text-muted-foreground">{Math.round(settings.quality * 100)}%</span>
                          </div>
                          <Slider
                            id="quality"
                            min={0} max={1} step={0.01}
                            value={[settings.quality]}
                            onValueChange={(value) => updateSettings({ quality: value[0] })}
                            onValueCommit={() => onUpdateProcessedSize()}
                          />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Target File Size (Optional)</Label>
                            <div className="flex items-center gap-2">
                            <Input 
                                type="number"
                                placeholder="e.g. 500"
                                value={targetSize}
                                onChange={(e) => setTargetSize(e.target.value)}
                                disabled={isOptimizing}
                            />
                            <Select value={targetUnit} onValueChange={(val: 'KB' | 'MB') => setTargetUnit(val)} disabled={isOptimizing}>
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="KB">KB</SelectItem>
                                    <SelectItem value="MB">MB</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={handleTargetSize} disabled={isOptimizing || !targetSize} className="px-4">
                                {isOptimizing ? <Loader2 className="animate-spin"/> : 'Set'}
                            </Button>
                            </div>
                        </div>
                      </>
                    )}
                    <div className="text-sm text-muted-foreground">
                        Est. size: <span className="font-medium text-foreground">
                          {settings.format === 'image/svg+xml' || settings.format === 'application/pdf' ? 'N/A' : processedSize !== null ? formatBytes(processedSize) : 'Calculating...'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => onDownload(filename)} className="w-full">
                          <Download className="mr-2"/>
                          Download
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleShare} className="shrink-0">
                          <Share2 />
                      </Button>
                    </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}

    