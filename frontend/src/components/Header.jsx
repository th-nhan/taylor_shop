import React from 'react';
import { Scissors, User, LogOut, PhoneCall } from 'lucide-react';

export default function Header({ currentUser, onOpenAuth, onLogout }) {
  return (
    <header className="sticky top-0 z-40 bg-luxury-navy text-white shadow-lg border-b border-indigo-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-xl shadow-md text-slate-950">
              <Scissors className="w-4 h-4 sm:w-6 h-6 transform -rotate-45" />
            </div>
            <div>
              <h1 className="text-base sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 leading-none sm:leading-tight">
                NHÀ MAY THÚY DIỄM
              </h1>
              <p className="text-[9px] sm:text-xs text-slate-300 font-light hidden xs:block sm:block mt-0.5">
                May Đo Chuẩn Phom • Thủ Công Cao Cấp • Tư Vấn AI
              </p>
            </div>
          </div>

          {/* Contact & User Action */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <a 
              href="tel:0901370622" 
              className="hidden md:flex items-center space-x-2 text-sm text-slate-300 hover:text-amber-400 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Hotline: 0901.370.622</span>
            </a>

            <div className="h-6 w-px bg-indigo-800/80 hidden md:block"></div>

            {currentUser ? (
              <div className="flex items-center space-x-2 sm:space-x-3 bg-indigo-900/60 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-indigo-700/50">
                <div className="w-7 h-7 sm:w-8 sm:w-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs sm:text-sm shadow">
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[10px] text-slate-400">Khách hàng</p>
                  <p className="text-xs sm:text-sm font-semibold text-white leading-tight">{currentUser.full_name}</p>
                </div>
                <button
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="p-1 sm:p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-md transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm shadow-md hover:shadow-amber-500/20 transition-all duration-200"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Đăng Nhập / Đăng Ký</span>
                <span className="inline sm:hidden">Đăng Nhập</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
