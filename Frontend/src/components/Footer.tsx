import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, Twitter, Github, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border/20 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold gradient-text">PromptHub</span>
              <Badge variant="secondary" className="text-xs">AI</Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              The premier marketplace for AI prompts. Discover, create, and share high-quality prompts for all major AI models.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Marketplace */}
          <div className="space-y-4">
            <h4 className="font-semibold">Marketplace</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Explore Prompts
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Top Creators
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                New Releases
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Free Prompts
              </a>
            </div>
          </div>

          {/* Creators */}
          <div className="space-y-4">
            <h4 className="font-semibold">For Creators</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Sell Your Prompts
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Creator Guidelines
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Analytics Dashboard
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Payout Information
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Help Center
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                API Documentation
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Bug Reports
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-sm text-muted-foreground">
            <p>© 2024 PromptHub. All rights reserved.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for the AI community</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;