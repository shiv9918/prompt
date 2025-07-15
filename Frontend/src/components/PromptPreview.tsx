import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Copy, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import geminiService from '@/services/geminiService';
import Markdown from 'react-markdown';

interface PromptPreviewProps {
  prompt: {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

const PromptPreview: React.FC<PromptPreviewProps> = ({ prompt, isOpen, onClose }) => {
  // Change preview to support text/imageBase64
  const [preview, setPreview] = useState<{ text?: string; imageBase64?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [apiKey, setApiKey] = useState(geminiService.hasApiKey() ? '••••••••••••••••' : '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!geminiService.hasApiKey());
  const { toast } = useToast();

  const handleGeneratePreview = async () => {
    if (!geminiService.hasApiKey()) {
      setShowApiKeyInput(true);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await geminiService.generatePromptPreview({
        prompt: prompt.content,
        context: `This is a ${prompt.category} prompt with tags: ${(prompt.tags ?? []).join(', ')}`
      });
      setPreview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey && !apiKey.startsWith('••••')) {
      geminiService.setApiKey(apiKey);
      setShowApiKeyInput(false);
      setApiKey('••••••••••••••••');
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved securely.",
      });
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt.content);
    toast({
      title: "Copied to clipboard",
      description: "Prompt content copied successfully",
    });
  };

  const handleCopyPreview = () => {
    if (preview) {
      const value = preview.text || '';
      navigator.clipboard.writeText(value);
    toast({
      title: "Copied to clipboard",
      description: "Preview content copied successfully",
    });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="ai-preview-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            AI Preview: {prompt.title}
          </DialogTitle>
        </DialogHeader>
        <div id="ai-preview-description" className="hidden">AI-generated preview of the prompt.</div>
        <div className="space-y-6">
          {/* API Key Configuration */}
          {showApiKeyInput && (
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Configure Gemini API Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  To use AI preview functionality, please enter your Google Gemini API key. 
                  Get one for free at <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter your Gemini API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <Button onClick={handleSaveApiKey} disabled={!apiKey || apiKey.startsWith('••••')}>
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Original Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Original Prompt</span>
                <div className="flex gap-2">
                  <Badge variant="outline">{prompt.category}</Badge>
                  <Button variant="ghost" size="sm" onClick={handleCopyPrompt}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{prompt.content}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {(prompt.tags ?? []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI-Generated Preview
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="ai" 
                    size="sm" 
                    onClick={handleGeneratePreview}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    {isLoading ? 'Generating...' : 'Generate Preview'}
                  </Button>
                  {preview && preview.text && (
                    <Button variant="ghost" size="sm" onClick={handleCopyPreview}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              ) : preview ? (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex flex-col items-center justify-center">
                  {preview.imageBase64 ? (
                    <img
                      src={`data:image/png;base64,${preview.imageBase64}`}
                      alt="AI generated preview"
                      className="max-h-96 max-w-full object-contain rounded mb-4"
                    />
                  ) : null}
                  {preview.text ? (
                    <div className="w-full text-center">
                      <div className="prose prose-invert mx-auto text-left">
                        <Markdown>{preview.text}</Markdown>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="bg-muted/30 border-2 border-dashed border-muted-foreground/30 p-8 rounded-lg text-center">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Click "Generate Preview" to see how this prompt performs with AI
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromptPreview;