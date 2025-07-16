import React, { useState, useEffect } from 'react';
import PromptCard from './PromptCard';
import PromptPreview from './PromptPreview';
import CategoryFilter from './CategoryFilter';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const categories = [
  'Business', 'Creative', 'Development', 'Marketing', 'Education', 'Design', 'Research', 'Social Media', 'E-commerce', 'Healthcare'
];

interface PromptGridProps {
  selectedCategory?: string;
  searchTerm?: string;
  sortOption?: string;
}

const PromptGrid = ({ selectedCategory = 'All', searchTerm = '', sortOption = 'latest' }: PromptGridProps) => {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();
  const [editingPrompt, setEditingPrompt] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', category: '' });

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/prompts`)
      .then(res => setPrompts(res.data))
      .catch(() => setPrompts([]));
  }, []);

  const handlePreview = (promptId: string) => {
    const prompt = prompts.find((p: any) => p.id === promptId);
    if (prompt) {
      setSelectedPrompt(prompt);
      setIsPreviewOpen(true);
    }
  };

  const handlePromptDeleted = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  const handlePromptUpdated = (updatedPrompt: any) => {
    setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
  };

  const handleEdit = (prompt: any) => {
    setEditingPrompt(prompt);
    setEditForm({ title: prompt.title, content: prompt.content, category: prompt.category });
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/prompts/${editingPrompt.id}`,
        editForm,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast({ title: 'Prompt updated', description: 'Your prompt has been updated.' });
      setEditingPrompt(null);
      setPrompts(prev => prev.map(p => p.id === editingPrompt.id ? { ...p, ...editForm } : p));
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.response?.data?.message || 'Could not update prompt', variant: 'destructive' });
    }
  };

  // Filter prompts by category and search term
  let filteredPrompts = prompts;
  if (selectedCategory && selectedCategory !== 'All') {
    filteredPrompts = filteredPrompts.filter((p: any) => p.category === selectedCategory);
  }
  if (searchTerm && searchTerm.trim() !== "") {
    filteredPrompts = filteredPrompts.filter((p: any) =>
      p.title.toLowerCase().includes(searchTerm) ||
      (p.content && p.content.toLowerCase().includes(searchTerm))
    );
  }

  // Sort prompts according to sortOption
  filteredPrompts = [...filteredPrompts];
  switch (sortOption) {
    case 'popular':
      filteredPrompts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      break;
    case 'rating':
      filteredPrompts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'priceLow':
      filteredPrompts.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'priceHigh':
      filteredPrompts.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'latest':
    default:
      // If created_at exists, sort by it desc; else by id desc
      filteredPrompts.sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return (b.id || 0) - (a.id || 0);
      });
      break;
  }

  return (
    <>
      <section className="py-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-0 my-0">
          {filteredPrompts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No prompts found. Create a prompt to see it here!
          </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt: any) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onPreview={handlePreview}
              onDeleted={handlePromptDeleted}
              onUpdated={handlePromptUpdated}
              onEdit={handleEdit}
            />
          ))}
        </div>
          )}

        {selectedPrompt && (
          <PromptPreview
            prompt={selectedPrompt}
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}
        {editingPrompt && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[1000]">
            <Card className="w-full max-w-lg p-0">
              <CardHeader>
                <CardTitle>Edit Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    value={editForm.title}
                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Prompt Title"
                    className="text-lg"
                  />
                  <Select
                    value={editForm.category}
                    onValueChange={value => setEditForm(f => ({ ...f, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={editForm.content}
                    onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="Prompt Content"
                    rows={6}
                    className="font-mono"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditingPrompt(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditSave}>
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </section>
    </>
  );
};

export default PromptGrid;