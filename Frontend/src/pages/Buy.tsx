import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react';

const Buy: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sales`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch sales');
        const data = await res.json();
        setSales(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching sales');
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const totalSold = sales.length;
  const totalEarned = sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
  const uniqueBuyers = new Set(sales.map(s => s.buyer)).size;

  return (
    <div className="min-h-screen bg-background flex flex-col relative neural-bg overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 z-10 relative">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 px-4 py-2 border-primary/30 bg-primary/10 animate-fade-in">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Sales Dashboard
          </Badge>
          <h1 className="text-5xl font-bold mb-4 gradient-text animate-fade-in">Your Prompt Sales</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Track your prompt sales, buyers, and earnings in real time.
          </p>
        </div>
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12 animate-fade-in-up">
          <Card className="card-glow flex flex-col items-center py-6">
            <CardHeader className="flex flex-col items-center">
              <CardTitle className="flex items-center gap-2 text-3xl font-bold gradient-text">
                <TrendingUp className="w-6 h-6 text-primary" />
                {loading ? '...' : totalSold}
              </CardTitle>
              <span className="text-muted-foreground mt-2">Prompts Sold</span>
            </CardHeader>
          </Card>
          <Card className="card-glow flex flex-col items-center py-6">
            <CardHeader className="flex flex-col items-center">
              <CardTitle className="flex items-center gap-2 text-3xl font-bold gradient-text">
                <Users className="w-6 h-6 text-secondary" />
                {loading ? '...' : uniqueBuyers}
              </CardTitle>
              <span className="text-muted-foreground mt-2">Unique Buyers</span>
            </CardHeader>
          </Card>
          <Card className="card-glow flex flex-col items-center py-6">
            <CardHeader className="flex flex-col items-center">
              <CardTitle className="flex items-center gap-2 text-3xl font-bold gradient-text">
                <DollarSign className="w-6 h-6 text-accent" />
                {loading ? '...' : `$${totalEarned}`}
              </CardTitle>
              <span className="text-muted-foreground mt-2">Total Earned</span>
            </CardHeader>
          </Card>
        </div>
        {/* Sales Table Section */}
        <Card className="card-glow max-w-3xl mx-auto animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading sales...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : sales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No sales yet.</div>
            ) : (
              <table className="w-full border text-left rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted-foreground/10">
                    <th className="p-3">Buyer</th>
                    <th className="p-3">Prompt</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, idx) => (
                    <tr key={idx} className="border-t hover:bg-accent/10 transition-colors duration-200">
                      <td className="p-3 font-medium">{sale.buyer}</td>
                      <td className="p-3">{sale.prompt}</td>
                      <td className="p-3 text-green-600 font-semibold">${sale.price}</td>
                      <td className="p-3">{sale.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Buy; 