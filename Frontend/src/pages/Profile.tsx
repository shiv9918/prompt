import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Calendar, 
  Star, 
  Heart, 
  Download, 
  Settings, 
  Edit3, 
  Save,
  Mail,
  MapPin,
  Link as LinkIcon,
  TrendingUp,
  Award,
  Zap,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const Profile = () => {
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: '',
    location: '',
    website: '',
  });

  // Fetch user prompts from backend
  const [userPrompts, setUserPrompts] = useState<any[]>([]);
  useEffect(() => {
    if (user) {
      axios.get('http://localhost:5000/prompts')
        .then(res => {
          setUserPrompts(res.data.filter((prompt: any) => prompt.user_id === user.id));
        })
        .catch(() => setUserPrompts([]));
    }
  }, [user]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSave = () => {
    updateProfile(editForm);
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // Add delete handler
  const handleDeletePrompt = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    try {
      const token = localStorage.getItem('jwt_token');
      await axios.delete(`http://localhost:5000/prompts/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast({ title: 'Prompt deleted', description: 'Your prompt has been deleted.' });
      setUserPrompts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err?.response?.data?.message || 'Could not delete prompt', variant: 'destructive' });
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  const userInitials = user.username.slice(0, 2).toUpperCase();
  let joinDate = 'Unknown';
  if (user.joinedAt) {
    const date = new Date(user.joinedAt);
    if (!isNaN(date.getTime())) {
      joinDate = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }
  }

  const stats = {
    prompts: userPrompts.length,
    likes: userPrompts.reduce((sum: number, prompt: any) => sum + (prompt.likes || 0), 0),
    downloads: userPrompts.reduce((sum: number, prompt: any) => sum + (prompt.downloads || 0), 0),
    rating: userPrompts.length > 0 
      ? (userPrompts.reduce((sum: number, prompt: any) => sum + (prompt.rating || 0), 0) / userPrompts.length).toFixed(1)
      : '0.0'
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="card-glow mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-primary/20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xl font-bold bg-primary/10">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editForm.username}
                        onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                        className="text-2xl font-bold"
                      />
                      <Input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold">{user.username}</h1>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </p>
                    </>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {joinDate}
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Creator
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="ml-auto flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="btn-ai">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={handleLogout}>
                      <Settings className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Bio and Links */}
            {isEditing && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Bio</label>
                  <Textarea
                    placeholder="Tell us about yourself..."
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input
                      placeholder="City, Country"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Website</label>
                    <Input
                      placeholder="https://your-website.com"
                      value={editForm.website}
                      onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-glow text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{stats.prompts}</div>
              <div className="text-sm text-muted-foreground">Prompts</div>
            </CardContent>
          </Card>
          
          <Card className="card-glow text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-secondary">{stats.likes}</div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </CardContent>
          </Card>
          
          <Card className="card-glow text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent">{stats.downloads}</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </CardContent>
          </Card>
          
          <Card className="card-glow text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-500">{stats.rating}</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Card className="card-glow">
          <CardContent className="p-0">
            <Tabs defaultValue="prompts" className="w-full">
              <div className="border-b border-border/20 px-6">
                <TabsList className="grid w-full grid-cols-3 bg-transparent">
                  <TabsTrigger value="prompts" className="data-[state=active]:bg-primary/10">
                    My Prompts ({stats.prompts})
                  </TabsTrigger>
                  <TabsTrigger value="liked" className="data-[state=active]:bg-primary/10">
                    Liked
                  </TabsTrigger>
                  <TabsTrigger value="purchased" className="data-[state=active]:bg-primary/10">
                    Purchased
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="prompts" className="mt-0">
                  {userPrompts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userPrompts.map((prompt: any) => (
                        <Card key={prompt.id} className="prompt-card">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold line-clamp-2">{prompt.title}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {prompt.category}
                                  </Badge>
                                  {prompt.isPremium && (
                                    <Badge variant="premium" className="text-xs">
                                      ${prompt.price}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 items-center">
                                <Button variant="ghost" size="icon" onClick={() => navigate(`/create?edit=${prompt.id}`)}>
                                  <Edit3 className="h-5 w-5 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeletePrompt(prompt.id)}>
                                  <Trash2 className="h-5 w-5 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {prompt.content}
                            </p>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center">
                                  <Heart className="w-4 h-4 mr-1" />
                                  {prompt.likes || 0}
                                </div>
                                <div className="flex items-center">
                                  <Download className="w-4 h-4 mr-1" />
                                  {prompt.downloads || 0}
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                                {prompt.rating || 0}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No prompts yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start creating amazing AI prompts to share with the community
                      </p>
                      <Button onClick={() => navigate('/create')} className="btn-ai">
                        Create Your First Prompt
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="liked" className="mt-0">
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No liked prompts</h3>
                    <p className="text-muted-foreground">
                      Start exploring and liking prompts you find interesting
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="purchased" className="mt-0">
                  <div className="text-center py-12">
                    <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No purchased prompts</h3>
                    <p className="text-muted-foreground">
                      Premium prompts you purchase will appear here
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;