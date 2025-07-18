import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Download, Eye, Star, Zap, Copy, Edit3, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe('pk_test_51RbFDrGOotJ8IN2vF8mTbTnCVOg8SDofraR6r8qhjQVmYgTrFqXaEQTUlApbnxrwlwbuFDQv4dAxsA2KaXkks9q200frt0mBhA');

interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    content: string;
    tags: string[];
    category: string;
    creator: string;
    username: string; // Make this required
    isPremium?: boolean;
    is_premium?: boolean;
    price?: number;
    likes: number;
    downloads: number;
    rating: number;
    preview?: string;
    user_id: string; // Added user_id to the prompt interface
  };
  onPreview: (promptId: string) => void;
  onDeleted?: (id: string) => void;
  onUpdated?: (updatedPrompt: any) => void;
  onEdit?: (prompt: any) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onPreview, onDeleted, onUpdated, onEdit }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Prompt removed from your favorites" : "Prompt added to your favorites",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    toast({
      title: "Copied to clipboard",
      description: "Prompt content copied successfully",
    });
  };

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      await onPreview(prompt.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    try {
      const token = localStorage.getItem('jwt_token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/prompts/${prompt.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast({ title: 'Prompt deleted', description: 'Your prompt has been deleted.' });
      if (typeof onDeleted === 'function') onDeleted(prompt.id);
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err?.response?.data?.message || 'Could not delete prompt', variant: 'destructive' });
    }
  };

  const isOwner = user && (user.username === prompt.creator || user.id === prompt.user_id);
  const isPremiumPrompt = ("is_premium" in prompt ? prompt.is_premium : undefined) ?? prompt.isPremium;
  const price = ("price" in prompt ? prompt.price : undefined) ?? prompt.price;
  const isUserPremium = user?.plan === 'pro' || user?.plan === 'enterprise'; // Adjust as needed

  const categories = [
    'Business', 'Creative', 'Development', 'Marketing', 'Education', 'Design', 'Research', 'Social Media', 'E-commerce', 'Healthcare'
  ];

  const handleAIPreview = async () => {
    if (isPremiumPrompt && !isUserPremium) {
      navigate('/pricing');
      return;
    }
    setIsLoading(true);
    try {
      await onPreview(prompt.id);
    } finally {
      setIsLoading(false);
    }
  };

  // Add Stripe payment handler
  const handleBuyWithStripe = async () => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to purchase this prompt.', variant: 'destructive' });
      navigate('/login');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_id: prompt.id,
          prompt_title: prompt.title,
          price: price,
          user_id: user.id,
          success_url: window.location.origin + '/success',
          cancel_url: window.location.origin + '/cancel',
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId: data.id });
    } catch (err: any) {
      toast({ title: 'Payment failed', description: err.message || 'Could not start payment', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="prompt-card group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{prompt.title}</h3>
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {prompt.category}
              </Badge>
              {isPremiumPrompt && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={`shrink-0 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              disabled={false}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            {isOwner && (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate(`/create?edit=${prompt.id}`)}>
                  <Edit3 className="h-5 w-5 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                  <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
              </>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {prompt.content}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {(prompt.tags ?? []).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {(prompt.tags ?? []).length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{(prompt.tags ?? []).length - 3}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {prompt.likes}
            </div>
            <div className="flex items-center">
              <Download className="w-4 h-4 mr-1" />
              {prompt.downloads}
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              {prompt.rating}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">by {prompt.username}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIPreview}
            className="flex-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            AI Preview
          </Button>
          {/* Copy or Buy button logic */}
          {prompt.content ? (
            <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy prompt">
              <Copy className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="sm" className="btn-ai" onClick={handleBuyWithStripe} disabled={isLoading}>
              {isLoading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
              ) : null}
              Purchase for ₹{price}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptCard;