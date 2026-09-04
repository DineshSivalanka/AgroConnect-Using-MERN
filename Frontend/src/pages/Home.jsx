import { Link } from 'react-router-dom';
import { Card, CardBody, CardTitle } from '../components/ui/Card';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow text-center px-4 py-16 lg:py-24 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-green-100/50 blur-3xl"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[30%] h-[30%] rounded-full bg-emerald-100/40 blur-3xl"></div>
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
        Connecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Farmers</span>
        <br /> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Buyers</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl leading-relaxed">
        AgroConnect is a smart digital marketplace that helps farmers find buyers and buyers source fresh agricultural products directly.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-6 mb-20 w-full sm:w-auto">
        <Link to="/register?role=FARMER" className="px-8 py-4 bg-green-600 text-white rounded-xl shadow-[0_10px_20px_-10px_rgba(22,163,74,0.5)] hover:bg-green-700 hover:shadow-[0_10px_20px_-10px_rgba(22,163,74,0.6)] transition-all transform hover:-translate-y-1 text-lg font-semibold flex items-center justify-center gap-3 w-full sm:w-auto">
          <span className="text-2xl">👨‍🌾</span> I am a Farmer
        </Link>
        <Link to="/register?role=BUYER" className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-xl shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] hover:border-emerald-200 hover:bg-emerald-50 transition-all transform hover:-translate-y-1 text-lg font-semibold flex items-center justify-center gap-3 w-full sm:w-auto">
          <span className="text-2xl">🛒</span> I am a Buyer
        </Link>
      </div>

      <div className="w-full max-w-5xl">
        <div className="text-left mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Popular Categories</h2>
          <p className="text-gray-500 mt-2">Explore fresh produce sourced directly from local farms</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Tomato', emoji: '🍅', color: 'bg-red-50 hover:bg-red-100 text-red-600' },
            { name: 'Mango', emoji: '🥭', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600' },
            { name: 'Potato', emoji: '🥔', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700' },
            { name: 'Banana', emoji: '🍌', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-500' }
          ].map((item) => (
            <Card key={item.name} className="group cursor-pointer border-transparent shadow-sm hover:shadow-lg transition-all duration-300">
              <CardBody className="p-8 text-center flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-colors duration-300 ${item.color}`}>
                  {item.emoji}
                </div>
                <span className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                  {item.name}
                </span>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
