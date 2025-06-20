const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-600 mt-auto dark:from-gray-800 dark:to-gray-900 dark:border-gray-600 light:from-cream-100 light:to-cream-200 light:border-cream-300">
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 mr-3">
                <img 
                  src="/src/components/logo/docmate_logo.png" 
                  alt="DocMate Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white dark:text-white light:text-gray-800">DocMate</span>
            </div>
            <p className="text-gray-400 text-sm dark:text-gray-400 light:text-gray-600">
              Advanced AI-powered medical practice management system for modern healthcare professionals.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
  <h3 className="text-white font-semibold dark:text-white light:text-gray-800">Quick Links</h3>
  <div className="space-y-2">
    <a href="/patients" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors dark:text-gray-400 dark:hover:text-cyan-400 light:text-gray-600 light:hover:text-blue-600">
      Patient Management
    </a>
    <a href="/prescriptions" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors dark:text-gray-400 dark:hover:text-cyan-400 light:text-gray-600 light:hover:text-blue-600">
      AI Prescriptions
    </a>
    <a href="/analytics" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors dark:text-gray-400 dark:hover:text-cyan-400 light:text-gray-600 light:hover:text-blue-600">
      Analytics
    </a>
    <a href="/settings" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors dark:text-gray-400 dark:hover:text-cyan-400 light:text-gray-600 light:hover:text-blue-600">
      Settings
    </a>
  </div>
</div>

          {/* Compliance */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold dark:text-white light:text-gray-800">Compliance</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-400 text-sm dark:text-gray-400 light:text-gray-600">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-400 text-sm dark:text-gray-400 light:text-gray-600">ISO 27001 Certified</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-400 text-sm dark:text-gray-400 light:text-gray-600">FDA Guidelines</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-400 text-sm dark:text-gray-400 light:text-gray-600">SOC 2 Type II</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold dark:text-white light:text-gray-800">Support</h3>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm dark:text-gray-400 light:text-gray-600">24/7 Technical Support</p>
              <p className="text-gray-400 text-sm dark:text-gray-400 light:text-gray-600">support@docmate.healthcare</p>
              <p className="text-gray-400 text-sm dark:text-gray-400 light:text-gray-600">+1 (555) 123-4567</p>
              <div className="flex space-x-3 mt-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-cyan-500 transition-colors cursor-pointer dark:bg-gray-700 dark:hover:bg-cyan-500 light:bg-gray-300 light:hover:bg-blue-500">
                  <span className="text-white text-xs">🔒</span>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-cyan-500 transition-colors cursor-pointer dark:bg-gray-700 dark:hover:bg-cyan-500 light:bg-gray-300 light:hover:bg-blue-500">
                  <span className="text-white text-xs">📧</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center dark:border-gray-700 light:border-gray-300">
          <div className="text-gray-400 text-sm mb-4 md:mb-0 dark:text-gray-400 light:text-gray-600">
            © {currentYear} DocMate - The Doctor's Ally. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors dark:text-gray-400 dark:hover:text-cyan-400 light:text-gray-600 light:hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors dark:text-gray-400 dark:hover:text-cyan-400 light:text-gray-600 light:hover:text-blue-600">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors dark:text-gray-400 dark:hover:text-cyan-400 light:text-gray-600 light:hover:text-blue-600">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;