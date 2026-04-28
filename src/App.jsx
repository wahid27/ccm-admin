import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  MessageCircle, 
  Clock, 
  Filter, 
  LogIn, 
  LogOut, 
  RefreshCcw, 
  Mail, 
  Menu, 
  X,
  CheckCircle2,
  Undo2,
  History,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// URL Google Sheets CSV Anda
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJmcJrLCCUEDxR-ZW6QtBOxGU0dU2OifiSdaDg2Pu9rVhms3uo0EVOBcnDwrj2gGi88KFofeRZ8WwU/pub?output=csv";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [data, setData] = useState([]);
  const [completedIds, setCompletedIds] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(false); 

  // Mengambil data ID yang sudah selesai dari memori browser
  useEffect(() => {
    const saved = localStorage.getItem('ccm_completed_orders');
    if (saved) setCompletedIds(JSON.parse(saved));
  }, []);

  const toggleComplete = (id) => {
    const updated = completedIds.includes(id) 
      ? completedIds.filter(item => item !== id)
      : [...completedIds, id];
    setCompletedIds(updated);
    localStorage.setItem('ccm_completed_orders', JSON.stringify(updated));
  };

  const getAdminPassword = () => {
    try {
      const env = (import.meta && import.meta.env) ? import.meta.env : {};
      return env.VITE_ADMIN_PASSWORD || "ccm-admin";
    } catch (e) {
      return "ccm-admin";
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === getAdminPassword()) {
      setIsLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const parseCSVLine = (line) => {
    const result = [];
    let curValue = "";
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') insideQuotes = !insideQuotes;
      else if (char === ',' && !insideQuotes) {
        result.push(curValue.trim());
        curValue = "";
      } else curValue += char;
    }
    result.push(curValue.trim());
    return result;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(SHEET_CSV_URL);
      const csvText = await response.text();
      const rows = csvText.split('\n').filter(row => row.trim() !== "");
      const jsonData = rows.slice(1).map((row, index) => {
        const cleanValues = parseCSVLine(row).map(v => v.replace(/^"|"$/g, ''));
        return {
          id: `order-${index}`, 
          tanggal: cleanValues[0] || "-",
          nama: cleanValues[1] || "Tanpa Nama",
          email: cleanValues[2] || "-",
          kontak: cleanValues[3] || "-",
          pesan: cleanValues[4] || "-",
          sumber: cleanValues[5] || "Website",
        };
      });
      // Membalik urutan agar yang terbaru muncul di atas
      setData(jsonData.reverse());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  const filteredData = data.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.pesan.toLowerCase().includes(searchTerm.toLowerCase());
    const isCompleted = completedIds.includes(item.id);
    return matchesSearch && (showCompleted ? isCompleted : !isCompleted);
  });

  const AppLogo = ({ size = "w-10 h-10" }) => (
    <div className={`${size} bg-white rounded-[1.5rem] overflow-hidden flex items-center justify-center shadow-md border border-slate-100 p-2`}>
      <img 
        src="/logo-ccm.png" 
        alt="Logo CCM" 
        className="w-full h-full object-contain" 
        onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span class="text-indigo-600 font-bold">C</span>'; }} 
      />
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, active, onClick, colorClass = "bg-[#4f46e5] shadow-indigo-100" }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] font-bold text-sm transition-all duration-300 ${
        active 
        ? `${colorClass} text-white shadow-xl` 
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  // --- HALAMAN LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f3f4f9] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 md:p-14 border border-white/50 text-center">
          <div className="flex flex-col items-center mb-12">
            <div className="w-24 h-24 bg-white rounded-[2.2rem] flex items-center justify-center mb-8 shadow-xl border border-slate-50 p-4 transition-transform hover:rotate-3">
              <img src="/logo-ccm.png" alt="Logo CCM" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3">Admin Area</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[240px] mx-auto">Selamat datang kembali di Chaerunisa Dashboard.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <input 
                type="password" 
                className={`w-full px-6 py-5 rounded-2xl border ${loginError ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50/50'} text-center text-xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono`} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {loginError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Password Salah!</p>}
            </div>
            
            <div className="pt-2 px-2">
              <button 
                type="submit" 
                className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white font-black text-base py-5 rounded-[1.25rem] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <LogIn className="w-5 h-5" /> Masuk Sekarang
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- HALAMAN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#f3f4f9] text-slate-900 font-sans text-left">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col z-30">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <AppLogo size="w-12 h-12" />
            <div className="text-left">
              <h1 className="text-xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">OrderFlow</h1>
              <span className="text-[10px] font-bold text-indigo-500 tracking-widest uppercase">Admin Panel</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          <SidebarItem 
            icon={Users} label="Pesanan Baru" 
            active={!showCompleted} 
            onClick={() => {setShowCompleted(false); setIsMobileMenuOpen(false);}} 
          />
          <SidebarItem 
            icon={History} label="Sudah Selesai" 
            active={showCompleted} 
            colorClass="bg-green-600 shadow-green-100"
            onClick={() => {setShowCompleted(true); setIsMobileMenuOpen(false);}} 
          />
        </nav>
        <div className="p-6 border-t border-slate-50">
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-4 px-6 py-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm text-left">
            <LogOut className="w-5 h-5" /> Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="absolute left-0 top-0 h-full w-4/5 bg-white shadow-2xl flex flex-col p-8 animate-in slide-in-from-left duration-300">
             <div className="flex items-center justify-between mb-10">
                <AppLogo />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X className="w-6 h-6"/></button>
             </div>
             <nav className="space-y-4">
                <SidebarItem icon={Users} label="Pesanan Baru" active={!showCompleted} onClick={() => {setShowCompleted(false); setIsMobileMenuOpen(false);}} />
                <SidebarItem icon={History} label="Sudah Selesai" active={showCompleted} colorClass="bg-green-600" onClick={() => {setShowCompleted(true); setIsMobileMenuOpen(false);}} />
             </nav>
             <div className="mt-auto">
                <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-4 px-6 py-4 text-red-500 bg-red-50 rounded-2xl font-bold">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
             </div>
          </aside>
        </div>
      )}

      <main className="lg:ml-72 min-h-screen">
        <header className="sticky top-0 z-20 bg-[#f3f4f9]/80 backdrop-blur-xl px-6 py-6 md:px-10 md:py-10">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-3 bg-white border border-slate-200 rounded-2xl lg:hidden shadow-sm active:scale-95 transition-all">
                <Menu className="w-6 h-6 text-slate-600" />
              </button>
              <div className="text-left">
                <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-none text-left">
                  {showCompleted ? 'Arsip Selesai' : 'Pesanan Masuk'}
                </h2>
                <p className="text-slate-400 mt-2 text-xs md:text-sm font-medium text-left">
                  {loading ? 'Sinkronisasi data...' : `Ada ${filteredData.length} klien dalam daftar ini.`}
                </p>
              </div>
            </div>
            <button 
              onClick={fetchData} 
              disabled={loading}
              className="p-4 bg-white border border-slate-200 rounded-2xl hover:text-indigo-600 transition-all shadow-sm active:scale-90"
            >
              <RefreshCcw className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="bg-white rounded-[2.5rem] p-4 md:p-5 shadow-sm border border-slate-100 mb-10">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input 
                type="text" placeholder="Cari nama atau isi pesan..." 
                className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500/20 outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* List Kartu Pesanan */}
          <div className="grid grid-cols-1 gap-8">
            {filteredData.map((item) => (
              <div 
                key={item.id} 
                className="bg-white p-7 md:p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden text-left"
              >
                {!showCompleted && <div className="absolute top-0 left-0 w-2 h-full bg-[#4f46e5] opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.75rem] flex items-center justify-center font-black text-xl md:text-3xl shadow-inner shrink-0 ${showCompleted ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {item.nama.charAt(0)}
                    </div>
                    <div className="text-left overflow-hidden">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-bold text-slate-800 text-2xl md:text-3xl tracking-tight text-left leading-tight">{item.nama}</h4>
                        <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">{item.sumber}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-8 mt-3 text-sm text-slate-400 font-medium text-left">
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-300" /> {item.tanggal}</span>
                        <span className="flex items-center gap-2 truncate"><Mail className="w-4 h-4 text-slate-300" /> {item.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <a 
                      href={`https://wa.me/${item.kontak.replace(/\D/g,'')}`} 
                      target="_blank" rel="noreferrer"
                      className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-5 bg-[#25D366] hover:bg-[#1ebd59] text-white rounded-[1.5rem] text-sm font-black shadow-xl shadow-green-100 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-5 h-5" /> WhatsApp
                    </a>
                    <button 
                      onClick={() => toggleComplete(item.id)}
                      className={`p-5 rounded-[1.5rem] border transition-all active:scale-90 shadow-sm ${
                        showCompleted 
                        ? 'text-orange-500 border-orange-100 bg-orange-50/30 hover:bg-orange-50' 
                        : 'text-indigo-600 border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50'
                      }`}
                      title={showCompleted ? "Buka kembali" : "Tandai Selesai"}
                    >
                      {showCompleted ? <Undo2 className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                <div className="mt-10 p-8 bg-[#fbfbfc] rounded-[2.5rem] border border-slate-50 relative text-left">
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-slate-100 rounded-full"></div>
                   <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-3 text-left">Isi Pesan / Project:</p>
                   <p className="text-lg md:text-xl text-slate-600 italic leading-relaxed font-medium text-left">"{item.pesan}"</p>
                </div>
              </div>
            ))}
          </div>

          {filteredData.length === 0 && (
            <div className="py-40 text-center flex flex-col items-center">
              <Search className="w-16 h-16 text-slate-100 mb-6" />
              <p className="text-slate-300 font-bold text-xl tracking-tight">Tidak ada data pesanan</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
