import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow text-center px-4 py-12">
      <h1 className="text-5xl md:text-6xl font-extrabold text-green-700 mb-6 drop-shadow-sm leading-tight">
        Connecting Farmers <br/> and Buyers
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl">
        AgroConnect is a smart digital marketplace that helps farmers find buyers and buyers source fresh agricultural products directly.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-6 mb-16">
        <Link to="/register?role=FARMER" className="px-8 py-4 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 hover:shadow-xl transition-all transform hover:-translate-y-1 text-lg font-semibold flex items-center justify-center gap-2">
          <span>👨‍🌾</span> I am a Farmer
        </Link>
        <Link to="/register?role=BUYER" className="px-8 py-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:-translate-y-1 text-lg font-semibold flex items-center justify-center gap-2">
          <span>🛒</span> I am a Buyer
        </Link>
      </div>

      <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Search Agricultural Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Tomato 🍅', 'Mango 🥭', 'Potato 🥔', 'Banana 🍌'].map((item) => (
            <div key={item} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer shadow-sm text-lg font-medium text-gray-700">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
