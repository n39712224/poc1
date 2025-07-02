import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Search, MessageCircle, Shield, Users, Star } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">MarketPlace</span>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Buy & Sell Anything,{" "}
              <span className="text-primary">Anywhere</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of users buying and selling unique items in our trusted marketplace. 
              Find great deals, connect with sellers, and discover amazing products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-primary/90">
                Get Started Today
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose MarketPlace?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Experience the easiest way to buy and sell with confidence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Easy Discovery
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Find exactly what you're looking for with powerful search and filtering options
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Direct Messaging
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect directly with buyers and sellers through our secure messaging platform
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Secure & Trusted
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Shop with confidence knowing all users are verified and transactions are protected
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Active Community
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Join a vibrant community of buyers and sellers from around the world
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Quality Listings
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Discover curated, high-quality listings from trusted sellers
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Store className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Easy Selling
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  List your items in minutes with our simple, intuitive listing process
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-0 shadow-xl bg-primary text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Trading?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join our marketplace today and discover amazing deals or start selling your items to a global audience
              </p>
              <Button 
                onClick={handleLogin} 
                size="lg" 
                variant="secondary" 
                className="bg-white text-primary hover:bg-gray-100"
              >
                Join MarketPlace Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Store className="h-6 w-6 text-primary mr-2" />
            <span className="text-lg font-semibold">MarketPlace</span>
          </div>
          <p className="text-gray-400">
            © 2024 MarketPlace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
