import React from 'react';
import { Scissors, User, LogOut, PhoneCall } from 'lucide-react';

export default function Header({ currentUser, onOpenAuth, onLogout }) {
  return (
    <header className="sticky top-0 z-40 bg-luxury-navy text-white shadow-lg border-b border-indigo-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="p-2.5 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-xl shadow-md text-slate-950">
              <Scissors className="w-6 h-6 transform -rotate-45" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                NHÀ MAY THÚY DIỄM
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium tracking-wider border border-amber-500/30">
                  Haute Couture
                </span>
              </h1>
              <p className="text-xs text-slate-300 font-light">
                May Đo Chuẩn Phom • May Thủ Công Cao Cấp • Tư Vấn AI
              </p>
            </div>
          </div>

          {/* Contact & User Action */}
          <div className="flex items-center space-x-4">
            <a 
              href="tel:0909123456" 
              className="hidden md:flex items-center space-x-2 text-sm text-slate-300 hover:text-amber-400 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Hotline: 0909.123.456</span>
            </a>

            <div className="h-6 w-px bg-indigo-800/80 hidden md:block"></div>

            {currentUser ? (
              <div className="flex items-center space-x-3 bg-indigo-900/60 px-3 py-1.5 rounded-lg border border-indigo-700/50">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow">
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs text-slate-400">Khách hàng</p>
                  <p className="text-sm font-semibold text-white leading-tight">{currentUser.full_name}</p>
                </div>
                <button
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-amber-500/20 transition-all duration-200"
              >
                <User className="w-4 h-4" />
                <span>Đăng Nhập / Đăng Ký</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
