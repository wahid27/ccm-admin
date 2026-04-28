import React, { useState, useEffect } from 'react';
import { 
  Search, Users, MessageCircle, Clock, Filter, LogIn, LogOut, 
  RefreshCcw, Mail, Menu, X, CheckCircle2, Undo2, History, 
  ArrowUpRight, LayoutGrid
} from 'lucide-react';

// URL WEB APP GAS - PASTIKAN SUDAH DI-DEPLOY SEBAGAI 'ANYONE'
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbx96zFy6m7E76nrqsyQlhI8N7sftfv3ENjKJx9ubS2mfdzXO6qLoZ7KQWpgaPFaCbq97w/exec";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  const getAdminPassword = () => {
    try {
      const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
      return env.VITE_ADMIN_PASSWORD || "ccm-admin";
    } catch (e) { return "ccm-admin"; }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === getAdminPassword()) {
      setIsLoggedIn(true);
      setLoginError(false);
    } else { setLoginError(true); }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword("");
    setIsMobileMenuOpen(false);
  };

  const toggleComplete = async (item) => {
    const newStatus = item.status === "Selesai" ? "" : "Selesai";
    const updatedData = data.map(d => d.rowid === item.rowid ? {...d, status: newStatus} : d);
    setData(updatedData);

    try {
      await fetch(GAS_API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowid: item.rowid, status: newStatus })
      });
    } catch (error) {
      console.error("Gagal update ke Sheets:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(GAS_API_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const jsonData = await response.json();
      setData(Array.isArray(jsonData) ? jsonData.reverse() : []);
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
    const nama = (item.nama || "").toLowerCase();
    const pesan = (item.pesan || item.message || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = nama.includes(search) || pesan.includes(search);
    const isCompleted = item.status === "Selesai";
    return matchesSearch && (showCompleted ? isCompleted : !isCompleted);
  });

  // Komponen Logo dengan Fallback yang lebih baik agar tidak muncul icon "broken image"
  const AppLogo = ({ size = "w-12 h-12" }) => (
    <div className={`${size} bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-md border border-slate-100 p-2 transition-all hover:rotate-3`}>
      <img 
        src="/logo-ccm.png" 
        alt="Logo CCM" 
        className="w-full h-full object-contain" 
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = "https://ui-avatars.com/api/?name=CCM&background=4f46e5&color=fff";
        }}
      />
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] font-bold text-sm transition-all duration-300 ${active ? 'bg-[#4f46e5] text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1 text-left">{label}</span>
      {badge > 0 && !active && <span className="bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full text-[10px] font-black">{badge}</span>}
    </button>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f3f4f9] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl p-10 md:p-14 border border-white text-center">
          <div className="flex flex-col items-center mb-10">
            <AppLogo />
            <h2 className="text-3xl font-black text-slate-800 mt-8 tracking-tight text-center">Admin Area</h2>
            <p className="text-slate-400 text-sm mt-2 text-center">Sinkronisasi Cloud Aktif</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-8">
            <input 
              type="password" 
              className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-center text-xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white font-black py-5 rounded-[1.25rem] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
              <LogIn className="w-5 h-5" /> Masuk Sekarang
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900 font-sans text-left">
      <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col z-30 shadow-sm">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-4 text-left">
            <AppLogo />
            <div className="text-left">
              <h1 className="text-xl font-black text-slate-800 italic uppercase leading-none text-left">OrderFlow</h1>
              <span className="text-[10px] font-bold text-indigo-500 tracking-widest uppercase mt-1 block text-left text-left">Cloud Sync</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          <SidebarItem 
            icon={Users} label="Antrian Baru" 
            active={!showCompleted} 
            badge={data.filter(d => d.status !== "Selesai").length}
            onClick={() => {setShowCompleted(false); setIsMobileMenuOpen(false);}} 
          />
          <SidebarItem 
            icon={History} label="Sudah Selesai" 
            active={showCompleted} 
            onClick={() => {setShowCompleted(true); setIsMobileMenuOpen(false);}} 
          />
        </nav>
        <div className="p-6 border-t border-slate-50">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm text-left group">
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" /> Logout
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col p-8 animate-in slide-in-from-left duration-300 text-left">
             <div className="flex items-center justify-between mb-10 text-left">
                <AppLogo />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X className="w-6 h-6 text-slate-400"/></button>
             </div>
             <nav className="space-y-4 text-left">
                <SidebarItem icon={Users} label="Antrian Baru" active={!showCompleted} onClick={() => {setShowCompleted(false); setIsMobileMenuOpen(false);}} />
                <SidebarItem icon={History} label="Sudah Selesai" active={showCompleted} onClick={() => {setShowCompleted(true); setIsMobileMenuOpen(false);}} />
             </nav>
             <button onClick={handleLogout} className="mt-auto flex items-center gap-4 px-6 py-4 text-red-500 bg-red-50 rounded-2xl font-bold text-left">
               <LogOut className="w-5 h-5 text-left" /> Logout Admin
             </button>
          </aside>
        </div>
      )}

      <main className="lg:ml-72 min-h-screen">
        <header className="sticky top-0 z-20 bg-[#f8f9fc]/80 backdrop-blur-xl px-6 py-6 md:px-10 md:py-10 border-b border-slate-100/50">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full text-left">
            <div className="flex items-center gap-4 text-left">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-3 bg-white border border-slate-200 rounded-2xl lg:hidden shadow-sm active:scale-95 transition-all"><Menu className="w-6 h-6 text-slate-600" /></button>
              <div className="text-left">
                <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-none text-left">{showCompleted ? 'Sudah Selesai' : 'Pesanan Masuk'}</h2>
                <p className="text-slate-400 mt-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-left">{loading ? 'Sinkronisasi...' : `${filteredData.length} data ditemukan`}</p>
              </div>
            </div>
            <button onClick={fetchData} disabled={loading} className="p-4 bg-white border border-slate-200 rounded-[1.25rem] hover:text-indigo-600 transition-all shadow-sm active:scale-90"><RefreshCcw className={loading ? 'animate-spin' : ''} /></button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full text-left">
          <div className="bg-white rounded-[2rem] p-4 md:p-5 shadow-sm border border-slate-50 mb-10 transition-all focus-within:shadow-indigo-500/5 text-left">
            <div className="relative text-left">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input type="text" placeholder="Cari nama atau isi pesan..." className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500/20 outline-none transition-all font-medium text-slate-700 text-left" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 text-left">
            {filteredData.map((item) => (
              <div key={item.rowid} className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group overflow-hidden h-full text-left">
                <div className="p-6 pb-4 flex items-start justify-between text-left">
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${showCompleted ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>{ (item.nama || "C").charAt(0) }</div>
                    <div className="text-left overflow-hidden text-left">
                      <h4 className="font-bold text-slate-800 text-lg tracking-tight leading-none truncate w-[140px] text-left">{item.nama || "Tanpa Nama"}</h4>
                      <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-[10px] font-bold text-left">
                         <Clock className="w-3 h-3 text-left" /> {item.timestamp ? item.timestamp.toString().split('T')[0] : (item.tanggal || "-")}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100 text-left">{(item.sumber || "Website").toUpperCase()}</span>
                </div>

                <div className="px-6 flex-1 text-left text-left text-left">
                   <div className="p-5 bg-[#fbfbfc] rounded-2xl border border-slate-50 italic text-slate-600 text-sm leading-relaxed relative min-h-[100px] text-left text-left">
                      <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-100 rounded-full text-left"></div>
                      <p className="line-clamp-4 font-medium text-left">"{item.pesan || item.message || "-"}"</p>
                   </div>
                </div>

                <div className="p-6 pt-4 flex items-center gap-3 text-left">
                  <a href={`https://wa.me/${(item.kontak || item.whatsapp || "").toString().replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex-[4] relative group/btn flex items-center justify-between pl-5 pr-4 py-4 bg-gradient-to-r from-[#25D366] to-[#1ebd59] text-white rounded-[1.25rem] text-xs font-black shadow-lg shadow-green-100 active:scale-95 transition-all overflow-hidden text-left">
                    <div className="flex items-center gap-3 z-10 text-left"><MessageCircle className="w-5 h-5 fill-white/20 text-left" /><span className="text-left">WhatsApp</span></div>
                    <ArrowUpRight className="w-4 h-4 opacity-50 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform z-10 text-left text-left" />
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:left-[100%] transition-all duration-700 skew-x-12 text-left"></div>
                  </a>
                  <button onClick={() => toggleComplete(item)} className={`flex-1 flex items-center justify-center p-4 rounded-[1.25rem] border transition-all active:scale-90 text-left ${showCompleted ? 'text-orange-500 border-orange-100 bg-orange-50/50 hover:bg-orange-50' : 'text-green-600 border-green-100 bg-green-50/50 hover:bg-green-50'}`}>
                    {showCompleted ? <Undo2 className="w-5 h-5 text-left text-left" /> : <CheckCircle2 className="w-5 h-5 text-left text-left" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!loading && filteredData.length === 0 && (
            <div className="py-40 text-center flex flex-col items-center text-left">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-left"><Search className="w-10 h-10 text-slate-100 text-left" /></div>
              <p className="text-slate-300 font-bold text-xl tracking-tight text-left">Antrian kosong</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
