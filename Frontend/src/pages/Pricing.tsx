import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Zap } from 'lucide-react';
import Footer from '@/components/Footer';

const plans = [
  {
    name: 'Free',
    price: 0,
    features: [
      'Browse all public prompts',
      'Create up to 3 prompts',
      'Basic AI preview',
      'Community support',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 9,
    features: [
      'Unlimited prompt creation',
      'Premium prompt publishing',
      'Advanced AI preview',
      'Priority support',
      'Sell your prompts',
    ],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 49,
    features: [
      'Team management',
      'Bulk prompt uploads',
      'Custom integrations',
      'Dedicated support',
      'Analytics dashboard',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <div className="flex-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2 border-primary/30 bg-primary/10">
            <Zap className="w-4 h-4 mr-2" />
            Pricing
          </Badge>
          <h1 className="text-5xl font-bold mb-4 gradient-text">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees. Upgrade or downgrade anytime.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative card-glow p-0 ${plan.highlight ? 'border-2 border-primary shadow-lg scale-105 z-10' : ''}`}
            >
              {plan.highlight && (
                <Badge variant="premium" className="absolute top-4 right-4 text-xs px-3 py-1">
                  <Star className="w-4 h-4 mr-1" /> Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-0">
                <CardTitle className="text-3xl font-bold mb-2">
                  {plan.name}
                </CardTitle>
                <div className="text-4xl font-extrabold mb-2">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  {plan.price !== 0 && <span className="text-base font-normal text-muted-foreground">/mo</span>}
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-8 flex flex-col items-center">
                <ul className="mb-8 space-y-3 text-left w-full max-w-xs mx-auto">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-base">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full btn-ai ${plan.highlight ? '' : 'btn-outline'}`}>{plan.cta}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Pricing; 