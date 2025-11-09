
'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { getWasteSegregationGuidance } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Upload,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type SegregationGuidance = {
  report?: string;
  error?: string;
};

// A simple markdown renderer
const MarkdownRenderer = ({ content }: { content: string }) => {
    const htmlContent = content
        .replace(/### (.*)/g, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
        .replace(/\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};


export default function WasteReportPage() {
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guidance, setGuidance] = useState<SegregationGuidance | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : 'No file chosen');
    setGuidance(null);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const analyzeImage = async () => {
    if (!previewUrl) {
      setGuidance({ error: 'Please select an image first.' });
      return;
    }

    setIsAnalyzing(true);
    setGuidance(null);
    try {
      const result = await getWasteSegregationGuidance(previewUrl);
      setGuidance(result as SegregationGuidance);
    } catch (error) {
      setGuidance({ error: 'An unexpected error occurred.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold font-headline">AI Waste Analyzer</h1>
                <p className="text-muted-foreground">Get instant guidance on waste segregation.</p>
            </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Photo</CardTitle>
                    <CardDescription>
                        Upload a photo of waste to get an instant, detailed segregation report.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnalyzing}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Choose File
                        </Button>
                        <span className="text-sm text-muted-foreground truncate max-w-xs">
                            {fileName || 'No file chosen'}
                        </span>
                        <Input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={isAnalyzing}
                        />
                        </div>
                    </div>
                    
                    {previewUrl && (
                        <div className="relative w-full aspect-video border rounded-md overflow-hidden bg-muted">
                            <Image src={previewUrl} alt="Image preview" layout="fill" objectFit="contain" />
                        </div>
                    )}

                    <Button onClick={analyzeImage} disabled={isAnalyzing || !previewUrl} className="w-full">
                        {isAnalyzing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Image...
                        </>
                        ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Report
                        </>
                        )}
                    </Button>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Analysis Report</CardTitle>
                    <CardDescription>
                        The AI-generated report will appear below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                        {isAnalyzing && (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {!isAnalyzing && !guidance && (
                            <div className="flex justify-center items-center h-full text-center text-muted-foreground">
                                <p>Upload an image and click "Generate Report" to see the results.</p>
                            </div>
                        )}
                        
                        {guidance?.report && (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                <MarkdownRenderer content={guidance.report} />
                            </div>
                        )}

                        {guidance?.error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Analysis Failed</AlertTitle>
                                <AlertDescription>{guidance.error}</AlertDescription>
                            </Alert>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
