import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Zap, Sparkles, Save, Eye, Upload, AlertCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import geminiService from '@/services/geminiService';
import Markdown from 'react-markdown';
import axios from 'axios';

const categories = [
  'Business',
  'Creative',
  'Development',
  'Marketing',
  'Education',
  'Design',
  'Research',
  'Social Media',
  'E-commerce',
  'Healthcare',
];

const CreatePrompt = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const editId = query.get('edit');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    description: '',
    isPremium: false,
    price: 0,
  });
  
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityScore, setQualityScore] = useState<{ rating: number; feedback: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<{ text?: string; imageBase64?: string } | null>(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch prompt for edit mode
  useEffect(() => {
    if (editId) {
      axios.get(`${import.meta.env.VITE_API_URL}/prompts/${editId}`)
        .then(res => {
          setFormData({
            title: res.data.title,
            content: res.data.content,
            category: res.data.category,
            tags: '',
            description: '',
            isPremium: false,
            price: 0,
          });
        });
    }
  }, [editId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isPremium: checked,
      price: checked ? 5 : 0,
    }));
  };

  const generateTags = async () => {
    if (!formData.content.trim()) {
      toast({
        title: "No content to analyze",
        description: "Please enter your prompt content first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTags(true);
    try {
      const tags = await geminiService.generateTags(formData.content);
      setFormData(prev => ({
        ...prev,
        tags: tags.join(', '),
      }));
      toast({
        title: "Tags generated!",
        description: "AI-generated tags have been added to your prompt.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate tags",
        description: "Please add tags manually or check your API configuration.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const analyzeQuality = async () => {
    if (!formData.content.trim()) {
      toast({
        title: "No content to analyze",
        description: "Please enter your prompt content first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await geminiService.ratePromptQuality(formData.content);
      setQualityScore(analysis);
      toast({
        title: "Quality analysis complete!",
        description: `Your prompt scored ${analysis.rating}/5 stars.`,
      });
    } catch (error) {
      toast({
        title: "Failed to analyze quality",
        description: "Please check your API configuration.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePreviewPrompt = async () => {
    if (!formData.content.trim()) {
      toast({
        title: "No content to preview",
        description: "Please enter your prompt content first.",
        variant: "destructive",
      });
      return;
    }
    setIsPreviewing(true);
    setPreviewResult(null);
    try {
      const result = await geminiService.generatePromptPreview({ prompt: formData.content });
      setPreviewResult(result);
    } catch (error: any) {
      setPreviewResult(null);
      toast({
        title: "Failed to generate preview",
        description: error?.message || "Please check your API configuration.",
        variant: "destructive",
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title, content, and category.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (editId) {
        // Edit mode: update existing prompt
        await axios.put(
          `${import.meta.env.VITE_API_URL}/prompts/${editId}`,
          {
            title: formData.title,
            content: formData.content,
            category: formData.category,
            isPremium: formData.isPremium,
            price: formData.price,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        toast({ title: 'Prompt updated!', description: 'Your prompt has been updated.' });
      } else {
        // Create mode: create new prompt
        await axios.post(
          `${import.meta.env.VITE_API_URL}/prompts`,
          {
            title: formData.title,
            content: formData.content,
            category: formData.category,
            isPremium: formData.isPremium,
            price: formData.price,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        toast({ title: 'Prompt saved successfully!', description: 'Your prompt has been published to the marketplace.' });
      }
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: '',
        tags: '',
        description: '',
        isPremium: false,
        price: 0,
      });
      setQualityScore(null);
      // Navigate to explore page
      navigate('/explore');
    } catch (error: any) {
      const backendMsg = error?.response?.data?.msg;
      if (error?.response?.status === 403 && backendMsg?.includes("Free users can only create up to 4 prompts")) {
        toast({
          title: "Upgrade Required",
          description: backendMsg,
          variant: "destructive",
        });
        // Optionally, redirect to pricing page after a short delay
        // setTimeout(() => navigate('/pricing'), 2000);
      } else {
      toast({
        title: "Failed to save prompt",
          description: backendMsg || error?.message || "Please try again.",
        variant: "destructive",
      });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background py-8 w-full max-w-3xl mx-auto px-4 sm:px-6 box-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Create <span className="gradient-text">AI Prompt</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Share your creativity with the PromptHub community
          </p>
        </div>

        {/* Replace the grid layout with a single column flex stack for all main sections */}
        <div className="flex flex-col gap-8 w-full">
            {/* Basic Information */}
          <Card className="card-glow w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Prompt Title *</label>
                  <Input
                    name="title"
                    placeholder="Give your prompt a catchy title..."
                    value={formData.title}
                    onChange={handleInputChange}
                    className="text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category *</label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <div className="flex gap-2">
                      <Input
                        name="tags"
                        placeholder="AI, Marketing, Creative..."
                        value={formData.tags}
                        onChange={handleInputChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateTags}
                        disabled={isGeneratingTags}
                      >
                        {isGeneratingTags ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    name="description"
                    placeholder="Describe what your prompt does and how to use it..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Prompt Content */}
          <Card className="card-glow w-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Prompt Content
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeQuality}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                    ) : (
                      <Star className="w-4 h-4 mr-2" />
                    )}
                    Analyze Quality
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Prompt *</label>
                  <Textarea
                    name="content"
                    placeholder="Write your AI prompt here. Use placeholders like [TOPIC], [STYLE], [REQUIREMENTS] to make it reusable..."
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={8}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Tip: Use square brackets [PLACEHOLDER] for variables that users can customize
                  </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4"
                  onClick={handlePreviewPrompt}
                  disabled={isPreviewing}
                >
                  {isPreviewing ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {isPreviewing ? 'Generating Preview...' : 'Preview Prompt'}
                </Button>
                </div>

                {qualityScore && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= qualityScore.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">Quality Score: {qualityScore.rating}/5</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{qualityScore.feedback}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

          {/* Pricing & Visibility */}
          <Card className="card-glow w-full mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Pricing & Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Premium Prompt</p>
                    <p className="text-sm text-muted-foreground">Charge for your prompt</p>
                  </div>
                  <Switch
                    checked={formData.isPremium}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>

                {formData.isPremium && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price (INR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        min="1"
                        max="999"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                        className="pl-8"
                      />
                    </div>
                  </div>
                )}

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {formData.isPremium 
                      ? `You'll earn ${Math.floor((formData.price || 0) * 0.7)}% after platform fees`
                      : 'Free prompts help build your reputation and followers'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

          {/* Preview section */}
          <Card className="card-glow w-full max-w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
              <div className="aspect-video min-h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-start justify-start p-4 w-full max-w-full overflow-x-auto box-border">
                <div className="w-full flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-foreground dark:text-white truncate">
                    {formData.title || 'Prompt Title'}
                  </h3>
                  {formData.category && (
                    <Badge variant="outline" className="ml-2 text-xs px-2 py-1">
                      {formData.category}
                    </Badge>
                  )}
                </div>
                <div className="flex-1 w-full flex items-center justify-center">
                  {isPreviewing ? (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Generating preview...
                    </div>
                  ) : previewResult ? (
                    previewResult.imageBase64 ? (
                      <img
                        src={`data:image/png;base64,${previewResult.imageBase64}`}
                        alt="AI generated preview"
                        className="max-h-full max-w-full object-contain rounded"
                        style={{ width: '100%', height: 'auto' }}
                      />
                    ) : previewResult.text ? (
                      <div className="prose prose-invert text-base break-words overflow-auto w-full p-4 bg-background/80 rounded max-w-full overflow-x-auto box-border">
                        {previewResult.text && <Markdown>{previewResult.text}</Markdown>}
                      </div>
                    ) : null
                  ) : (
                  <p className="text-sm text-muted-foreground">Prompt card preview</p>
                  )}
                </div>
              </div>
                <div className="space-y-2">
                  <h4 className="font-medium truncate">
                    {formData.title || 'Your Prompt Title'}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formData.category || 'Category'}
                    </Badge>
                    {formData.isPremium && (
                      <Badge variant="premium" className="text-xs">
                        ₹{formData.price}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {formData.description || 'Add a description to see it here...'}
                  </p>
                </div>
              <div className="flex flex-col gap-3 mt-6 w-full">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full btn-ai"
              >
                {isSaving ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Publishing...' : 'Publish Prompt'}
              </Button>
              <Button variant="outline" className="w-full">
                Save as Draft
              </Button>
                  </div>
                </CardContent>
              </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatePrompt;