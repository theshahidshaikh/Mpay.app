import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Users, 
  IndianRupee, 
  Shield, 
  CheckCircle, 
  BarChart3, 
  Smartphone, 
  Clock, 
  Globe,
  ArrowRight,
  Star,
  Heart
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => navigate('/register');
  const handleLogin = () => navigate('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">mosqueCollect</span>
            </div>
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-green-600 transition-colors">How It Works</a>
              <a href="#roles" className="text-gray-600 hover:text-green-600 transition-colors">User Roles</a>
              <button onClick={handleLogin} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Login / Register
              </button>
            </div>
            {/* 🟢 Mobile Login Button */}
            <div className="md:hidden">
              <button onClick={handleLogin} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Streamline Your mosque
              <span className="text-green-600 block">Collection Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              A comprehensive digital solution for managing monthly household contributions across mosque communities. 
              From individual households to national oversight, manage collections with transparency and efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleGetStarted} className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl">
                Start Managing Collections
                <ArrowRight className="inline ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center"><div className="text-3xl font-bold text-green-600">5,000+</div><div className="text-gray-600">Active Households</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-green-600">250+</div><div className="text-gray-600">mosques Connected</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-green-600">₹2.5M+</div><div className="text-gray-600">Collections Managed</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-green-600">50+</div><div className="text-gray-600">Cities Covered</div></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Every Need</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">From household payments to administrative oversight, our platform provides comprehensive tools for transparent and efficient collection management.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow"><div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4"><Smartphone className="h-6 w-6 text-green-600" /></div><h3 className="text-xl font-bold text-gray-900 mb-3">Digital Payments</h3><p className="text-gray-600">Simple UPI integration with QR codes. Upload payment receipts for instant verification and tracking of all transactions.</p></div>
            <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow"><div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4"><BarChart3 className="h-6 w-6 text-blue-600" /></div><h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Dashboards</h3><p className="text-gray-600">Comprehensive analytics and reporting tools for mosque admins, city administrators, and super admins at every level.</p></div>
            <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow"><div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4"><Shield className="h-6 w-6 text-purple-600" /></div><h3 className="text-xl font-bold text-gray-900 mb-3">Role-Based Security</h3><p className="text-gray-600">Four-tier permission system ensuring data security and appropriate access levels for households, mosque admins, city admins, and super admins.</p></div>
            <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow"><div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4"><CheckCircle className="h-6 w-6 text-yellow-600" /></div><h3 className="text-xl font-bold text-gray-900 mb-3">Approval Workflows</h3><p className="text-gray-600">Structured approval processes for new registrations, payment verifications, and administrative changes across all levels.</p></div>
            <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow"><div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4"><Clock className="h-6 w-6 text-red-600" /></div><h3 className="text-xl font-bold text-gray-900 mb-3">Monthly Tracking</h3><p className="text-gray-600">Automated monthly collection cycles with clear payment status indicators and reminder systems for overdue contributions.</p></div>
            <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow"><div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4"><Globe className="h-6 w-6 text-indigo-600" /></div><h3 className="text-xl font-bold text-gray-900 mb-3">Multi-City Management</h3><p className="text-gray-600">Scalable architecture supporting mosque collections across multiple cities and states with centralized oversight capabilities.</p></div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section id="roles" className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Every Level of Administration</h2><p className="text-xl text-gray-600 max-w-3xl mx-auto">Our hierarchical system ensures appropriate access and functionality for each user type, from individual households to national oversight.</p></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"><div className="flex items-center mb-6"><div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mr-4"><Heart className="h-8 w-8 text-green-600" /></div><div><h3 className="text-2xl font-bold text-gray-900">Household Users</h3><p className="text-gray-600">Individual families contributing to their mosque</p></div></div><ul className="space-y-3 text-gray-700"><li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /> View payment status and history</li><li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /> Make digital payments with UPI</li><li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /> Upload payment receipts for verification</li><li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /> Export payment history as CSV</li></ul></div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"><div className="flex items-center mb-6"><div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mr-4"><Building className="h-8 w-8 text-blue-600" /></div><div><h3 className="text-2xl font-bold text-gray-900">mosque Admins</h3><p className="text-gray-600">Managing individual mosque operations</p></div></div><ul className="space-y-3 text-gray-700"><li className="flex items-center"><CheckCircle className="h-5 w-5 text-blue-500 mr-3" /> Approve household registrations</li><li className="flex items-center"><CheckCircle className="h-5 w-5 text-blue-500 mr-3" /> Verify and approve payments</li><li className="flex items-center"><CheckCircle className="h-5 w-5 text-blue-500 mr-3" /> View collection analytics</li><li className="flex items-center"><CheckCircle className="h-5 w-5 text-blue-500 mr-3" /> Manage mosque settings and UPI details</li></ul></div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"><div className="flex items-center mb-6"><div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mr-4"><Users className="h-8 w-8 text-purple-600" /></div><div><h3 className="text-2xl font-bold text-gray-900">City Admins</h3><p className="text-gray-600">Overseeing city-wide mosque operations</p></div></div><ul className="space-y-3 text-gray-700"><li className="flex items-center"><CheckCircle className="h-5 w-5 text-purple-500 mr-3" /> Approve new mosque registrations</li><li className="flex items-center"><CheckCircle className="h-5 w-5 text-purple-500 mr-3" /> Manage mosque admin assignments</li><li className="flex items-center"><CheckCircle className="h-5 w-5 text-purple-500 mr-3" /> City-wide collection analytics</li><li className="flex items-center"><CheckCircle className="h-5 w-5 text-purple-500 mr-3" /> Request location changes</li></ul></div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"><div className="flex items-center mb-6"><div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mr-4"><Globe className="h-8 w-8 text-yellow-600" /></div><div><h3 className="text-2xl font-bold text-gray-900">Super Admins</h3><p className="text-gray-600">National-level system oversight</p></div></div><ul className="space-y-3 text-gray-700"><li className="flex items-center"><CheckCircle className="h-5 w-5 text-yellow-600 mr-3" /> National dashboard and analytics</li><li className="flex items-center"><CheckCircle className="h-5 w-5 text-yellow-600 mr-3" /> Approve city admin registrations</li><li className="flex items-center"><CheckCircle className="h-5 w-5 text-yellow-600 mr-3" /> Handle location change requests</li><li className="flex items-center"><CheckCircle className="h-5 w-5 text-yellow-600 mr-3" /> State and city drill-down reports</li></ul></div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Process</h2><p className="text-xl text-gray-600 max-w-3xl mx-auto">Our streamlined workflow ensures accountability and transparency at every step of the collection process.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group"><div className="bg-gradient-to-br from-green-400 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg"><span className="text-2xl font-bold text-white">1</span></div><h3 className="text-xl font-bold text-gray-900 mb-3">Register & Get Approved</h3><p className="text-gray-600">Households register with their mosque details. mosque admins approve registrations after verification of community membership.</p></div>
            <div className="text-center group"><div className="bg-gradient-to-br from-blue-400 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg"><span className="text-2xl font-bold text-white">2</span></div><h3 className="text-xl font-bold text-gray-900 mb-3">Make Monthly Payments</h3><p className="text-gray-600">Use the integrated UPI system to make payments directly. Upload receipts through the app for quick processing and record-keeping.</p></div>
            <div className="text-center group"><div className="bg-gradient-to-br from-purple-400 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg"><span className="text-2xl font-bold text-white">3</span></div><h3 className="text-xl font-bold text-gray-900 mb-3">Track & Analyze</h3><p className="text-gray-600">Real-time dashboards provide insights into collection patterns, payment statuses, and financial summaries across all administrative levels.</p></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 mosqueCollect. All rights reserved. Built with dedication for the Muslim community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;