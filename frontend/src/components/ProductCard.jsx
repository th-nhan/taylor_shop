import React from 'react';
import { Sparkles, Tag, Layers, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ProductCard({ product, onSelectForConsult }) {
  const { name, categories, target_gender, price_estimate, description, design_details, fabric_recommendations, image_urls, is_pinned } = product;

  const imageUrl = image_urls && image_urls.length > 0
    ? image_urls[0]
    : 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80';

  return (
    <div 
      onClick={() => onSelectForConsult(product)}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1 cursor-pointer"
    >

      {/* Product Image Section */}
      <div className="relative h-48 sm:h-64 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />

        {is_pinned && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase rounded-full shadow-lg border border-amber-400 z-10">
            <Sparkles className="w-3 h-3 fill-current" />
            <span>Nổi bật</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-row flex-nowrap items-center gap-1.5 max-w-[90%] overflow-hidden">
          {categories && categories.slice(0, 2).map((cat, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-luxury-navy/90 backdrop-blur-md text-white text-[11px] font-semibold rounded-full shadow whitespace-nowrap">
              {cat}
            </span>
          ))}
          <span className="px-2 py-1 bg-amber-500/90 backdrop-blur-md text-slate-950 text-[11px] font-bold rounded-full shadow whitespace-nowrap">
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
        {/* Footer: Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Báo giá may từ</span>
            <span className="text-base font-bold text-emerald-600">
              {price_estimate}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectForConsult(product);
            }}
            className="flex items-center space-x-1.5 bg-red-50 hover:bg-luxury-navy text-red-800 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group-hover:shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Xem chi tiết</span>
          </button>
        </div>

      </div>

    </div>
  );
}
