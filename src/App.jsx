import React, { useState, useEffect } from 'react';
import { 
  Search, Users, MessageCircle, Clock, Filter, LogIn, LogOut, 
  RefreshCcw, Mail, Menu, X, CheckCircle2, Undo2, History, 
  ArrowUpRight, LayoutGrid
} from 'lucide-react';

// URL WEB APP GAS YANG SUDAH DIPERBARUI
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

  // FUNGSI: Update status langsung ke Google Sheets via GAS
  const toggleComplete = async (item) => {
    const newStatus = item.status === "Selesai" ? "" : "Selesai";
    
    // Update UI duluan (Optimistic Update)
    const updatedData = data.map(d => d.rowid === item.rowid ? {...d, status: newStatus} : d);
    setData(updatedData);

    try {
      // GAS POST memerlukan mode: 'no-cors' jika tidak menangani preflight CORS secara eksplisit
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
    // Hindari fetch jika URL masih menggunakan placeholder
    if (GAS_API_URL.includes("xxxxxxxx")) {
      console.error("Kesalahan: URL API GAS belum dikonfigurasi.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(GAS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      // Data dari GAS dibalik agar yang terbaru berada di atas
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

  const AppLogo = () => (
    <div className="w-12 h-12 bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-md border border-slate-100 p-2 transition-all hover:rotate-3">
      <img src="/logo-ccm.png" alt="Logo" className="w-full h-full object-contain" />
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f3f4f9] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl p-10 md:p-14 border border-white text-center">
          <div className="flex flex-col items-center mb-10">
            <AppLogo />
            <h2 className="text-3xl font-black text-slate-800 mt-6 tracking-tight text-center">Admin Area</h2>
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
            <button type="submit" className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white font-black py-5 rounded-[1.25rem] shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-3">
              <LogIn className="w-5 h-5" /> Masuk Sekarang
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900 font-sans text-left">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r hidden lg:flex flex-col z-30">
        <div className="p-8 border-b">
          <div className="flex items-center gap-4 text-left">
            <AppLogo />
            <div className="text-left">
              <h1 className="text-xl font-black text-slate-800 italic uppercase leading-none text-left">OrderFlow</h1>
              <span className="text-[10px] font-bold text-indigo-500 tracking-widest uppercase mt-1 block text-left">Cloud Sync</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          <button onClick={() => setShowCompleted(false)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${!showCompleted ? 'bg-[#4f46e5] text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Users className="w-5 h-5" /> Antrian Baru
          </button>
          <button onClick={() => setShowCompleted(true)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${showCompleted ? 'bg-green-600 text-white shadow-xl shadow-green-100' : 'text-slate-400 hover:bg-slate-50'}`}>
            <History className="w-5 h-5" /> Sudah Selesai
          </button>
        </nav>
        <div className="p-6 border-t">
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-4 px-6 py-4 text-slate-400 hover:text-red-500 font-bold text-sm text-left"><LogOut className="w-5 h-5" /> Logout</button>
        </div>
      </aside>

      <main className="lg:ml-72 min-h-screen">
        <header className="sticky top-0 z-20 bg-[#f8f9fc]/80 backdrop-blur-xl px-6 py-6 md:px-10 md:py-10 border-b border-slate-100/30">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full text-left">
            <div className="flex items-center gap-4 text-left">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-3 bg-white border rounded-2xl lg:hidden"><Menu /></button>
              <div className="text-left">
                <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-none text-left">{showCompleted ? 'Arsip Selesai' : 'Pesanan Masuk'}</h2>
                <p className="text-slate-400 mt-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-left">{loading ? 'Menyinkronkan data...' : 'Semua Perangkat Tersinkron'}</p>
              </div>
            </div>
            <button onClick={fetchData} disabled={loading} className="p-4 bg-white border rounded-2xl shadow-sm hover:text-indigo-600 active:scale-90 transition-all"><RefreshCcw className={loading ? 'animate-spin' : ''} /></button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full text-left">
          {/* Search */}
          <div className="bg-white rounded-[2rem] p-4 md:p-5 shadow-sm border mb-10 text-left">
            <div className="relative text-left">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 text-left" />
              <input type="text" placeholder="Cari klien..." className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl border-transparent outline-none transition-all font-medium text-slate-700 text-left" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {/* GRID GALLERY */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 text-left">
            {filteredData.map((item) => (
              <div key={item.rowid} className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group overflow-hidden h-full text-left">
                <div className="p-7 pb-4 flex items-start justify-between text-left">
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${showCompleted ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>{(item.nama || "C").charAt(0)}</div>
                    <div className="text-left overflow-hidden text-left">
                      <h4 className="font-bold text-slate-800 text-lg leading-none truncate w-[140px] text-left">{item.nama || "Tanpa Nama"}</h4>
                      <p className="text-[10px] text-slate-400 mt-2 font-bold flex items-center gap-1 text-left"><Clock className="w-3 h-3 text-left" /> {item.timestamp ? item.timestamp.toString().split('T')[0] : (item.tanggal || "-")}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest text-left">{(item.sumber || "Website").toUpperCase()}</span>
                </div>

                <div className="px-7 flex-1 text-left text-left">
                   <div className="p-5 bg-[#fbfbfc] rounded-2xl border italic text-slate-600 text-sm leading-relaxed relative min-h-[120px] text-left">
                      <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-100 rounded-full text-left"></div>
                      <p className="line-clamp-4 font-medium text-left">"{item.pesan || item.message || "-"}"</p>
                   </div>
                </div>

                <div className="p-7 pt-4 flex items-center gap-3 text-left">
                  <a href={`https://wa.me/${(item.kontak || item.whatsapp || "").toString().replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex-[4] relative group/btn flex items-center justify-between pl-5 pr-4 py-4 bg-gradient-to-r from-[#25D366] to-[#1ebd59] text-white rounded-[1.25rem] text-xs font-black shadow-lg shadow-green-100 active:scale-95 transition-all overflow-hidden text-left">
                    <div className="flex items-center gap-3 z-10 text-left"><MessageCircle className="w-5 h-5 fill-white/20 text-left" /><span className="text-left">Chat WhatsApp</span></div>
                    <ArrowUpRight className="w-4 h-4 opacity-50 z-10 text-left" />
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:left-[100%] transition-all duration-700 skew-x-12 text-left"></div>
                  </a>
                  <button onClick={() => toggleComplete(item)} className={`flex-1 flex items-center justify-center p-4 rounded-[1.25rem] border transition-all active:scale-90 text-left ${showCompleted ? 'text-orange-500 border-orange-100 bg-orange-50/50 hover:bg-orange-50' : 'text-green-600 border-green-100 bg-green-50/50 hover:bg-green-50'}`}>
                    {showCompleted ? <Undo2 className="w-5 h-5 text-left" /> : <CheckCircle2 className="w-5 h-5 text-left" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!loading && filteredData.length === 0 && (
            <div className="py-40 text-center flex flex-col items-center">
              <Search className="w-16 h-16 text-slate-100 mb-6" />
              <p className="text-slate-300 font-bold text-xl tracking-tight text-center">Tidak ada data ditemukan</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
