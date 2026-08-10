import React from 'react';
import { Sparkles, Tag, Layers, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ProductCard({ product, onSelectForConsult }) {
  const { name, category, target_gender, price_estimate, description, design_details, fabric_recommendations, image_urls } = product;

  const imageUrl = image_urls && image_urls.length > 0
    ? image_urls[0]
    : 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      
      {/* Product Image Section */}
      <div className="relative h-48 sm:h-64 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <span className="px-3 py-1 bg-luxury-navy/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow">
            {category}
          </span>
          <span className="px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-slate-950 text-xs font-bold rounded-full shadow">
            {target_gender}
          </span>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-base sm:text-lg font-bold drop-shadow-md leading-tight group-hover:text-amber-300 transition-colors">
            {name}
          </h3>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {description}
          </p>

          {/* Design Details Key-Values */}
          {design_details && Object.keys(design_details).length > 0 && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-700 font-semibold text-xs mb-1">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Chi tiết thiết kế may:</span>
              </div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {Object.entries(design_details).map(([key, val]) => (
                  <div key={key} className="flex items-start justify-between text-slate-600">
                    <span className="font-medium text-slate-500">• {key}:</span>
                    <span className="font-semibold text-slate-800 text-right ml-2">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Fabrics */}
          {fabric_recommendations && fabric_recommendations.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-700 font-semibold text-xs">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Chất liệu khuyên dùng:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {fabric_recommendations.map((fabric, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 text-[11px] font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1 text-amber-600" />
                    {fabric}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Báo giá may từ</span>
            <span className="text-base font-bold text-emerald-600">
              {price_estimate}
            </span>
          </div>

          <button
            onClick={() => onSelectForConsult(product)}
            className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group-hover:shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Tư vấn mẫu</span>
          </button>
        </div>

      </div>

    </div>
  );
}
