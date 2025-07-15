import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBackground from '@/assets/hero-bg.jpg';

const Hero = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 neural-bg" />
      
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <Badge variant="outline" className="mb-6 px-4 py-2 border-primary/30 bg-primary/10">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Prompt Marketplace
          </Badge>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Discover & Create
            <span className="gradient-text block">
              AI Prompts
            </span>
            That Actually Work
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of creators sharing premium prompts for ChatGPT, Gemini, DALL·E, and more. 
            Preview with AI before you buy.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="btn-ai text-lg px-8 py-4" asChild>
              <Link to="/explore">
                <Zap className="w-5 h-5 mr-2" />
                Explore Prompts
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-primary/30 hover:bg-primary/10" asChild>
              <Link to="/create">
                Start Creating
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-primary mr-2" />
                <span className="text-3xl font-bold gradient-text">50K+</span>
              </div>
              <p className="text-muted-foreground">Premium Prompts</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-secondary mr-2" />
                <span className="text-3xl font-bold gradient-text">10K+</span>
              </div>
              <p className="text-muted-foreground">Active Creators</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-accent mr-2" />
                <span className="text-3xl font-bold gradient-text">99%</span>
              </div>
              <p className="text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;