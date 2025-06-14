
import { useState, useEffect } from "react";
import AuthModal from "@/components/auth/AuthModal";
import MainLayout from "@/components/layout/MainLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = () => {
      const storedAuth = localStorage.getItem('docmate_auth');
      if (storedAuth) {
        setIsAuthenticated(true);
      } else {
        // Show auth modal after a brief delay for better UX
        setTimeout(() => setShowAuthModal(true), 1000);
      }
    };
    checkAuth();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Blurred Dashboard Preview */}
        <div 
          className="absolute inset-0 blur-[25px] opacity-30"
          style={{
            background: 'linear-gradient(135deg, #000000 0%, #001122 50%, #002244 100%)'
          }}
        >
          <div className="p-8">
            <div className="h-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl"></div>
              <div className="h-96 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Security Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-85 flex items-center justify-center">
          <div className="text-center">
            {/* Animated Lock Icon */}
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto relative">
                <svg 
                  className="w-20 h-20 text-cyan-400 animate-pulse" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <div className="absolute inset-0 w-20 h-20 bg-cyan-400 opacity-20 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Security Message */}
            <h1 className="text-4xl font-bold text-white mb-4">
              Secure Medical Portal
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Authentication Required
            </p>
            <p className="text-sm text-gray-400 mb-8">
              HIPAA Compliant • End-to-End Encrypted • Medical Professional Access Only
            </p>
          </div>
        </div>

        {/* Authentication Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthenticate={() => {
            setIsAuthenticated(true);
            setShowAuthModal(false);
          }}
        />
      </div>
    );
  }

  return (
    <MainLayout>
      <DashboardOverview />
    </MainLayout>
  );
};

export default Index;
