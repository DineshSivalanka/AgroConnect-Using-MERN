import { Link } from 'react-router-dom';
import { Card, CardBody } from '../components/ui/Card';
import { ShieldCheck, TrendingUp, Users, ArrowRight, Sprout, ShoppingCart, Leaf } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow bg-white">
      {/* Hero Section */}
      <section className="w-full px-4 py-20 lg:py-32 relative overflow-hidden flex flex-col items-center text-center">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-green-100/50 blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-100/40 blur-3xl animate-pulse-slow delay-700"></div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 font-semibold text-sm mb-8 border border-green-100 shadow-sm">
          <Leaf className="w-4 h-4" /> Empowering the Agricultural Supply Chain
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight max-w-5xl leading-tight">
          Connecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Farmers</span>
          <br className="hidden sm:block" /> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Buyers</span> Directly
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl leading-relaxed">
          AgroConnect is a smart digital marketplace eliminating middlemen. Farmers get better prices, buyers get fresher produce.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 mb-16 w-full sm:w-auto z-10">
          <Link to="/register?role=FARMER" className="group px-8 py-4 bg-green-600 text-white rounded-2xl shadow-[0_10px_30px_-10px_rgba(22,163,74,0.5)] hover:bg-green-700 hover:shadow-[0_10px_30px_-10px_rgba(22,163,74,0.7)] transition-all transform hover:-translate-y-1 text-lg font-bold flex items-center justify-center gap-3 w-full sm:w-auto">
            <span className="text-2xl group-hover:rotate-12 transition-transform">👨‍🌾</span> I am a Farmer
          </Link>
          <Link to="/register?role=BUYER" className="group px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:border-emerald-200 hover:bg-emerald-50 transition-all transform hover:-translate-y-1 text-lg font-bold flex items-center justify-center gap-3 w-full sm:w-auto">
            <span className="text-2xl group-hover:scale-110 transition-transform">🛒</span> I am a Buyer
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-7xl px-4 py-24 border-t border-gray-100">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How AgroConnect Works</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Three simple steps to revolutionize your agricultural trading.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Users, title: '1. Register & Verify', desc: 'Create your profile as a farmer or buyer and get verified instantly on our secure platform.', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Sprout, title: '2. List or Browse', desc: 'Farmers list their fresh harvest with details. Buyers browse categories and find local produce.', color: 'text-green-600', bg: 'bg-green-50' },
            { icon: ShoppingCart, title: '3. Connect & Trade', desc: 'Send purchase requests, chat directly, and complete orders with secure OTP delivery confirmation.', color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((step, idx) => (
            <Card key={idx} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 group">
              <CardBody className="p-10 text-center flex flex-col items-center">
                <div className={`w-20 h-20 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-lg leading-relaxed">{step.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular Categories */}
      <section className="w-full bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900">Popular Categories</h2>
              <p className="text-xl text-gray-500 mt-3">Explore fresh produce sourced directly from local farms</p>
            </div>
            <Link to="/register?role=BUYER" className="text-green-600 font-bold hover:text-green-700 flex items-center gap-1 group">
              View All <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Vegetables', emoji: '🥦', color: 'bg-emerald-100 text-emerald-700' },
              { name: 'Fruits', emoji: '🍎', color: 'bg-rose-100 text-rose-700' },
              { name: 'Grains', emoji: '🌾', color: 'bg-amber-100 text-amber-700' },
              { name: 'Spices', emoji: '🌶️', color: 'bg-orange-100 text-orange-700' }
            ].map((item) => (
              <Card key={item.name} className="group cursor-pointer border-transparent shadow-sm hover:shadow-xl hover:border-green-100 transition-all duration-300 bg-white">
                <CardBody className="p-10 text-center flex flex-col items-center gap-5">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-inner transition-transform duration-300 group-hover:scale-110 ${item.color}`}>
                    {item.emoji}
                  </div>
                  <span className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {item.name}
                  </span>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-7xl px-4 py-24">
        <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-[2.5rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 relative z-10">Ready to transform your agricultural business?</h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto relative z-10">
            Join thousands of farmers and buyers already trading directly, fairly, and securely on AgroConnect.
          </p>
          <div className="flex justify-center relative z-10">
            <Link to="/register" className="px-10 py-5 bg-white text-green-700 rounded-2xl shadow-xl hover:bg-gray-50 transition-all transform hover:scale-105 text-xl font-extrabold flex items-center gap-2">
              Get Started for Free <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
