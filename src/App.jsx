import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Layout, 
  MessageCircle, 
  Clock, 
  Filter, 
  Download, 
  Lock, 
  LogIn, 
  LogOut, 
  RefreshCcw, 
  Mail, 
  ExternalLink, 
  Menu, 
  X, 
  ChevronRight 
} from 'lucide-react';

// LINK CSV ASLI
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJmcJrLCCUEDxR-ZW6QtBOxGU0dU2OifiSdaDg2Pu9rVhms3uo0EVOBcnDwrj2gGi88KFofeRZ8WwU/pub?output=csv";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("Semua");

  const getAdminPassword = () => {
    try {
      const env = (import.meta && import.meta.env) ? import.meta.env : {};
      const envPass = env.VITE_ADMIN_PASSWORD;
      return envPass || "ccm-admin";
    } catch (e) {
      return "ccm-admin";
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const ADMIN_PASSWORD = getAdminPassword();
    
    if (password === ADMIN_PASSWORD) {
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
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(curValue.trim());
        curValue = "";
      } else {
        curValue += char;
      }
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
          id: index,
          tanggal: cleanValues[0] || "-",
          nama: cleanValues[1] || "Tanpa Nama",
          email: cleanValues[2] || "-",
          kontak: cleanValues[3] || "-",
          pesan: cleanValues[4] || "-",
          sumber: cleanValues[5] || "Website",
        };
      });
      setData(jsonData);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const filteredData = data.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.pesan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSource === "Semua" || item.sumber === filterSource;
    return matchesSearch && matchesFilter;
  });

  const uniqueSources = ["Semua", ...new Set(data.map(item => item.sumber))];

  // Komponen Logo yang mengambil dari folder public: logo-ccm.png
  const AppLogo = ({ className = "w-8 h-8" }) => (
    <div className={`${className} bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-sm border border-slate-200 p-1`}>
      <img 
        src="/logo-ccm.png" 
        alt="Logo CCM" 
        className="w-full h-full object-contain"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentNode.innerHTML = '<span class="text-indigo-600 font-bold">C</span>';
        }}
      />
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-left">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-left">
          <AppLogo className="w-10 h-10 md:w-11 md:h-11" />
          <h1 className="text-lg font-black text-slate-800 tracking-tighter italic uppercase text-left">OrderFlow</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm text-left">
          <Users className="w-5 h-5" /> Semua Pesanan
        </button>
      </nav>
      <div className="p-4 border-t border-slate-100">
        <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium text-sm text-left">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="flex flex-col items-center mb-10 text-center">
            {/* Logo Utama Login: logo-ccm.png */}
            <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl border border-slate-100 overflow-hidden p-4">
              <img 
                src="/logo-ccm.png" 
                alt="Admin Logo CCM" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
                }}
              />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Admin Area</h2>
            <p className="text-slate-500 mt-2 text-sm max-w-[240px]">Selamat datang kembali di Chaerunisa Dashboard.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <input 
                type="password" 
                className={`w-full px-5 py-4 rounded-2xl border ${loginError ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500'} outline-none transition-all text-center font-mono text-lg`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {loginError && (
                <p className="text-red-500 text-[11px] text-center font-bold uppercase mt-2 text-left">Password Salah!</p>
              )}
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95">
              <LogIn className="w-5 h-5" /> Masuk Sekarang
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-30 text-left">
        <SidebarContent />
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </aside>
        </div>
      )}

      <main className="lg:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md px-4 py-4 md:px-8 md:py-8 border-b border-slate-200/50 lg:border-none">
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full text-left">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white rounded-xl border border-slate-200 lg:hidden shadow-sm active:bg-slate-100">
                <Menu className="w-6 h-6 text-slate-600" />
              </button>
              <div className="text-left">
                <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-none text-left">Database Order</h2>
                <p className="hidden sm:flex text-slate-500 items-center gap-1.5 mt-1 text-xs md:text-sm text-left text-left">
                  <Clock className="w-3.5 h-3.5 md:w-4 h-4" /> Real-time Sync
                </p>
              </div>
            </div>
            <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm font-bold text-xs md:text-sm disabled:opacity-50 active:scale-95">
              <RefreshCcw className={`w-3.5 h-3.5 md:w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
              <span className="hidden xs:inline">{loading ? 'Loading...' : 'Segarkan'}</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Cari nama atau isi pesan..." className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500/30 transition-all outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                <select className="bg-slate-50 border border-transparent rounded-2xl px-4 py-3.5 outline-none focus:bg-white focus:border-indigo-500/30 text-sm font-bold text-slate-600 w-full md:w-auto flex-1 md:flex-none cursor-pointer" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
                  {uniqueSources.map(src => <option key={src} value={src}>{src}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                      <th className="px-8 py-5 font-black text-left">Informasi Klien</th>
                      <th className="px-8 py-5 font-black text-left text-left">Isi Pesanan</th>
                      <th className="px-8 py-5 font-black text-left text-left text-left text-left">Sumber</th>
                      <th className="px-8 py-5 font-black text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!loading && filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/30 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg shadow-sm">
                              {item.nama.charAt(0)}
                            </div>
                            <div className="text-left text-left">
                              <p className="font-bold text-slate-800 text-base leading-tight text-left">{item.nama}</p>
                              <div className="flex flex-col gap-0.5 mt-0.5 text-left text-left">
                                <span className="text-[11px] text-slate-400 flex items-center gap-1 whitespace-nowrap text-left"><Mail className="w-3 h-3 text-left" /> {item.email}</span>
                                <span className="text-[11px] text-slate-400 flex items-center gap-1 whitespace-nowrap text-left text-left text-left text-left"><Clock className="w-3 h-3 text-left text-left text-left" /> {item.tanggal}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 max-w-md text-left text-left text-left">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors text-left text-left text-left text-left">
                            <p className="text-sm text-slate-600 leading-relaxed italic text-left text-left text-left">"{item.pesan}"</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-left text-left text-left text-left text-left">
                          <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200 text-left text-left text-left text-left text-left text-left text-left text-left">
                            {item.sumber}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right text-left text-left text-left text-left text-left text-left text-left text-left text-left">
                          <a href={`https://wa.me/${item.kontak.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all text-xs font-bold shadow-lg shadow-green-100 active:scale-95 text-left text-left text-left text-left text-left text-left text-left">
                            <MessageCircle className="w-4 h-4 text-left text-left text-left text-left text-left" /> Balas WA
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {!loading && filteredData.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-4 text-left">
                  <div className="flex items-start justify-between text-left">
                    <div className="flex items-center gap-3 text-left text-left text-left">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg text-left text-left text-left text-left">
                        {item.nama.charAt(0)}
                      </div>
                      <div className="text-left text-left text-left text-left">
                        <h4 className="font-bold text-slate-800 leading-tight text-left text-left text-left">{item.nama}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 text-left text-left text-left">{item.tanggal}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tight bg-slate-100 text-slate-500 border border-slate-200 text-left text-left text-left">
                      {item.sumber}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-left text-left text-left text-left">
                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider text-left text-left text-left">Isi Pesan:</p>
                    <p className="text-sm text-slate-700 italic leading-relaxed font-medium text-left text-left text-left text-left">"{item.pesan}"</p>
                  </div>
                  <div className="flex flex-col gap-2 text-left text-left text-left text-left">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] px-1 text-left text-left text-left">
                      <Mail className="w-3 h-3 text-left text-left" /> {item.email}
                    </div>
                    <a href={`https://wa.me/${item.kontak.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-3 py-4 bg-green-500 text-white rounded-2xl font-bold shadow-xl shadow-green-100 active:scale-95 text-left text-left text-left text-left">
                      <MessageCircle className="w-5 h-5 text-left text-left text-left" /> Balas di WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;