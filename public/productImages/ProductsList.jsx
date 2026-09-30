import React from 'react';
import productsData from './products_data.json';

export default function ProductsList() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Our Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productsData.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div className="relative w-full h-56 bg-blue-50 rounded-xl overflow-hidden flex items-center justify-center p-4">
              <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
              <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold text-white rounded-full" style={{ backgroundColor: p.tagBg }}>
                {p.tag}
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <span className="text-xs text-gray-500 font-medium">{p.category}</span>
              <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{p.spec}</p>
            </div>
            <button className="mt-4 w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl text-sm hover:bg-slate-800 transition-colors">
              Enquire Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
