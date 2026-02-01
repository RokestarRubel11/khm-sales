
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Printer, 
  Trash2, 
  UserPlus,
  XCircle,
  BrainCircuit,
  Upload,
  Truck,
  UserCheck,
  TrendingUp,
  Download,
  FileText,
  Layers,
  DollarSign,
  PlusCircle,
  History,
  Store,
  MapPin,
  Phone,
  Mail,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Database,
  RefreshCcw,
  ShieldCheck,
  ArrowUpRight,
  CreditCard,
  Wallet
} from 'lucide-react';

import { User, Product, Customer, Sale, Purchase, AppSettings, UserRole, UserStatus, SaleItem, SalesmanStock } from './types';
import { getBusinessInsights } from './services/geminiService';

// --- INITIAL DATA ---
const ADMIN_EMAIL = 'roki255190@gmail.com';

const initialSettings: AppSettings = {
  companyName: 'QUEEN FOOD PRODUCT LTD',
  companyNameArabic: 'شركة كوين للمنتجات الغذائية المحدودة',
  logoUrl: 'https://seeklogo.com/images/P/pran-logo-4B3A8B1A2A-seeklogo.com.png',
  vatNumber: '35252630700003',
  exciseTrn: '35252630700003',
  address: 'Dammam, Eastern Province, Saudi Arabia',
  phone: '0560659793',
  email: 'contact@queenfood.com',
  vatPercent: 15,
  warehouseDetails: 'Dammam Central Store'
};

const initialProducts: Product[] = [
  { id: '1', name: 'Drinko Float Pineapple 250ml X 24pcs', sku: '58064', category: 'Beverage', purchasePrice: 20, salePrice: 28, stock: 100, uom: '24' },
  { id: '2', name: 'Drinko Float Strawberry 250ml X 24pcs', sku: '58065', category: 'Beverage', purchasePrice: 20, salePrice: 28, stock: 50, uom: '24' },
  { id: '3', name: 'Mughal Dry Whole Chili 40gm X 60pcs', sku: '59701', category: 'Spices', purchasePrice: 60, salePrice: 80, stock: 30, uom: '60' },
];

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('khm_users');
    return saved ? JSON.parse(saved) : [{ id: 'admin', email: ADMIN_EMAIL, role: 'ADMIN', status: 'APPROVED', name: 'Admin Roki' }];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('khm_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [salesmanStocks, setSalesmanStocks] = useState<SalesmanStock[]>(() => {
    const saved = localStorage.getItem('khm_salesman_stocks');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('khm_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('khm_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('khm_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('khm_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);

  useEffect(() => {
    localStorage.setItem('khm_users', JSON.stringify(allUsers));
    localStorage.setItem('khm_products', JSON.stringify(products));
    localStorage.setItem('khm_salesman_stocks', JSON.stringify(salesmanStocks));
    localStorage.setItem('khm_customers', JSON.stringify(customers));
    localStorage.setItem('khm_sales', JSON.stringify(sales));
    localStorage.setItem('khm_purchases', JSON.stringify(purchases));
    localStorage.setItem('khm_settings', JSON.stringify(settings));
  }, [allUsers, products, salesmanStocks, customers, sales, purchases, settings]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') setInstallPrompt(null);
    });
  };

  const handleLogin = (email: string) => {
    const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return alert("User not found.");
    if (found.status === 'PENDING') return alert("Account pending admin approval.");
    setUser(found);
  };

  const handleSignup = (name: string, email: string) => {
    if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) return alert("User already exists.");
    const newUser: User = { id: Date.now().toString(), name, email, role: 'SALESMAN', status: 'PENDING' };
    setAllUsers([...allUsers, newUser]);
    alert("Signup successful! Admin will approve your account soon.");
  };

  const handleLogout = () => setUser(null);

  // --- Backup Functions ---
  const handleBackup = () => {
    const data = { allUsers, products, salesmanStocks, customers, sales, purchases, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KHM_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (confirm("This will overwrite current data. Continue?")) {
            setAllUsers(data.allUsers || []);
            setProducts(data.products || []);
            setSalesmanStocks(data.salesmanStocks || []);
            setCustomers(data.customers || []);
            setSales(data.sales || []);
            setPurchases(data.purchases || []);
            setSettings(data.settings || initialSettings);
            alert("Database restored successfully!");
          }
        } catch (err) {
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    }
  };

  if (!user) return <Login onLogin={handleLogin} onSignup={handleSignup} logo={settings.logoUrl} />;

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50 no-print overflow-hidden flex-col md:flex-row font-sans text-gray-900">
        <Sidebar role={user.role} onInstall={handleInstallClick} showInstall={!!installPrompt} companyName={settings.companyName} logo={settings.logoUrl} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="bg-white/80 backdrop-blur-md border-b h-16 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
            <div className="flex items-center gap-3">
               <div className="md:hidden w-10 h-10 rounded-xl overflow-hidden border bg-white p-1">
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
               </div>
               <div>
                  <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight truncate max-w-[200px] md:max-w-none">KHM SALES</h1>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest hidden md:block">{settings.companyName}</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black truncate max-w-[150px]">{user.name}</p>
                <div className="flex items-center justify-end gap-1">
                   <ShieldCheck size={10} className="text-green-500" />
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{user.role}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-2xl text-gray-400 transition-all shadow-sm bg-white border border-gray-100 active:scale-95">
                <LogOut size={18} />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            <Routes>
              <Route path="/" element={<Dashboard sales={sales} products={products} purchases={purchases} customers={customers} isAdmin={user.role === 'ADMIN'} user={user} salesmanStocks={salesmanStocks} />} />
              <Route path="/sales" element={<SalesModule products={products} setProducts={setProducts} salesmanStocks={salesmanStocks} setSalesmanStocks={setSalesmanStocks} customers={customers} settings={settings} sales={sales} setSales={setSales} user={user} onPrint={setActiveInvoice} />} />
              <Route path="/purchases" element={<PurchaseModule products={products} setProducts={setProducts} purchases={purchases} setPurchases={setPurchases} isAdmin={user.role === 'ADMIN'} />} />
              <Route path="/inventory" element={<InventoryModule products={products} salesmanStocks={salesmanStocks} user={user} isAdmin={user.role === 'ADMIN'} />} />
              <Route path="/salesman" element={user.role === 'ADMIN' ? <SalesmanModule allUsers={allUsers} setAllUsers={setAllUsers} /> : <Navigate to="/" />} />
              <Route path="/wholesale" element={user.role === 'ADMIN' ? <WholesaleModule products={products} setProducts={setProducts} allUsers={allUsers} salesmanStocks={salesmanStocks} setSalesmanStocks={setSalesmanStocks} /> : <Navigate to="/" />} />
              <Route path="/reports" element={<ReportModule sales={sales} onPrint={setActiveInvoice} user={user} />} />
              <Route path="/customers" element={<CustomerModule customers={customers} setCustomers={setCustomers} />} />
              <Route path="/settings" element={user.role === 'ADMIN' ? <SettingsModule settings={settings} setSettings={setSettings} onBackup={handleBackup} onRestore={handleRestore} /> : <Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>

      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 no-print flex items-center justify-center p-2 md:p-6 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl relative flex flex-col w-full max-w-[1000px] my-auto border-8 border-gray-100">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl sticky top-0 z-10">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white"><FileText size={20} /></div>
                 <div>
                    <h3 className="font-black text-gray-800">TAX INVOICE PREVIEW</h3>
                    <p className="text-[10px] font-bold text-gray-400">Review before finalizing print</p>
                 </div>
               </div>
               <div className="flex gap-3">
                 <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 font-black active:scale-95 transition-all shadow-xl shadow-blue-200 uppercase text-xs tracking-widest"><Printer size={16} /> Print Invoice</button>
                 <button onClick={() => setActiveInvoice(null)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><XCircle size={24} /></button>
               </div>
            </div>
            <div className="p-6 flex justify-center bg-gray-200/50 overflow-x-auto">
               <div className="bg-white shadow-2xl p-4 md:p-8 rounded-lg transform scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 origin-top">
                  <InvoicePrint sale={activeInvoice} settings={settings} />
               </div>
            </div>
          </div>
        </div>
      )}
      <div className="print-only">
        {activeInvoice && <InvoicePrint sale={activeInvoice} settings={settings} />}
      </div>
    </Router>
  );
}

// --- SUB-COMPONENTS ---

function Dashboard({ sales, products, purchases, customers, isAdmin, user, salesmanStocks }: any) {
  const filteredSales = isAdmin ? sales : sales.filter((s:any) => s.salesMan === user.name);
  const totalSalesVal = filteredSales.reduce((a:any, s:any) => a + s.total, 0);
  const totalCount = filteredSales.length;
  
  const invCount = isAdmin 
    ? products.reduce((a:any, p:any) => a + p.stock, 0)
    : salesmanStocks.filter((s:any) => s.salesmanId === user.id).reduce((a:any, p:any) => a + p.stock, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-8">
         <div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Control Center</h2>
            <p className="text-gray-400 font-bold mt-1">Global business overview and real-time operations</p>
         </div>
         <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
               <RefreshCcw size={12} className="animate-spin" /> Live Updates
            </span>
            <div className="px-4 py-2 bg-white border rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
               {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Revenue (SR)" value={totalSalesVal.toLocaleString(undefined, {minimumFractionDigits: 2})} color="blue" icon={<DollarSign />} subtitle={`${totalCount} invoices generated`} />
        <StatCard title="Inventory" value={invCount.toString()} color="green" icon={<Package />} subtitle={isAdmin ? "Total central stock" : "Load in your van"} />
        <StatCard title="New Orders" value={totalCount.toString()} color="orange" icon={<ShoppingCart />} subtitle="Transactions recorded" />
        <StatCard title="Performance" value="98.2%" color="indigo" icon={<TrendingUp />} subtitle="Monthly growth rate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-black text-xl flex items-center gap-3"><ShoppingCart className="text-blue-600" /> Recent Sales</h3>
               <Link to="/reports" className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1">View Full Log <ArrowUpRight size={12}/></Link>
            </div>
            <div className="flex-1 space-y-4">
               {filteredSales.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 opacity-20"><Layers size={48} /><p className="font-black text-xs uppercase tracking-widest mt-4">No recent activity</p></div>
               ) : (
                  filteredSales.slice(-5).reverse().map((s:any) => (
                    <div key={s.id} className="flex justify-between items-center p-5 rounded-3xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border flex items-center justify-center text-blue-600 shadow-sm"><FileText size={20} /></div>
                          <div>
                             <p className="font-black text-sm text-gray-800 uppercase">{s.invoiceNo}</p>
                             <p className="text-[10px] font-bold text-gray-400">{s.customerName}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-blue-600">SR {s.total.toFixed(2)}</p>
                          <p className="text-[9px] font-black text-gray-300 uppercase">{new Date(s.date).toLocaleDateString()}</p>
                       </div>
                    </div>
                  ))
               )}
            </div>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
            <h3 className="font-black text-xl mb-8 flex items-center gap-3 text-red-600"><AlertTriangle /> Critical Stock</h3>
            <div className="space-y-4">
               {products.filter((p:any) => p.stock < 20).length === 0 ? (
                  <div className="text-center py-20 text-gray-400 font-medium italic">All items well stocked.</div>
               ) : (
                  products.filter((p:any) => p.stock < 20).slice(0, 6).map((p:any) => (
                     <div key={p.id} className="p-4 rounded-3xl border border-red-50 bg-red-50/20 flex justify-between items-center">
                        <div className="truncate pr-2">
                           <p className="font-black text-sm text-gray-800 truncate">{p.name}</p>
                           <p className="text-[9px] font-bold text-gray-400 uppercase">SKU: {p.sku}</p>
                        </div>
                        <div className="shrink-0 text-right">
                           <p className={`font-black text-lg ${p.stock <= 5 ? 'text-red-600 animate-pulse' : 'text-orange-500'}`}>{p.stock}</p>
                           <p className="text-[8px] uppercase font-black text-gray-400">PCS LEFT</p>
                        </div>
                     </div>
                  ))
               )}
            </div>
            {isAdmin && <Link to="/purchases" className="mt-auto pt-6 block text-center bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest">Restock Central Inventory</Link>}
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon, subtitle }: any) {
  const colors: any = { 
    blue: 'bg-blue-600 text-white shadow-blue-200', 
    green: 'bg-green-600 text-white shadow-green-200', 
    red: 'bg-red-600 text-white shadow-red-200', 
    orange: 'bg-orange-600 text-white shadow-orange-200',
    indigo: 'bg-indigo-600 text-white shadow-indigo-200'
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:translate-y-[-6px] transition-all cursor-default group hover:shadow-xl hover:shadow-gray-100">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[3px] group-hover:text-blue-600 transition-colors">{title}</p>
        <div className={`p-4 rounded-3xl ${colors[color]} shadow-xl group-hover:rotate-12 transition-transform`}>{React.cloneElement(icon, { size: 24 })}</div>
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900 group-hover:scale-105 transition-transform origin-left">{value}</p>
        <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-tighter">{subtitle}</p>
      </div>
    </div>
  );
}

function Sidebar({ role, onInstall, showInstall, companyName, logo }: any) {
  const location = useLocation();
  const menuItems = [
    { name: 'Control', icon: LayoutDashboard, path: '/' },
    { name: 'POS / Sales', icon: ShoppingCart, path: '/sales' },
    { name: 'Inventory', icon: BarChart3, path: '/inventory' },
    { name: 'Clients', icon: Users, path: '/customers' },
  ];
  if (role === 'ADMIN') {
    menuItems.splice(2, 0, { name: 'Purchases', icon: Package, path: '/purchases' });
    menuItems.push({ name: 'Personnel', icon: UserCheck, path: '/salesman' });
    menuItems.push({ name: 'Logistics', icon: Truck, path: '/wholesale' });
    menuItems.push({ name: 'Reports', icon: Printer, path: '/reports' });
    menuItems.push({ name: 'Settings', icon: Settings, path: '/settings' });
  }
  return (
    <div className="w-full md:w-72 bg-white border-b md:border-r flex flex-col shrink-0 no-print overflow-y-auto max-h-screen z-20 shadow-2xl md:shadow-none">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-14 h-14 bg-white border-2 border-blue-50 rounded-2xl flex items-center justify-center shadow-2xl p-2 rotate-[-4deg] group hover:rotate-0 transition-transform">
             <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-gray-900 tracking-tighter leading-none">KHM SALES</span>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Enterprise ERP</span>
          </div>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-black transition-all ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95'}`}>
              <item.icon size={20} /> {item.name}
            </Link>
          ))}
        </nav>
        {showInstall && (
           <button onClick={onInstall} className="w-full mt-10 bg-indigo-600 text-white p-6 rounded-[2rem] flex flex-col items-center gap-3 shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all group">
              <Download size={28} className="group-hover:bounce" />
              <div className="text-center">
                 <p className="font-black uppercase text-[10px] tracking-widest">Install ERP</p>
                 <p className="text-[9px] opacity-70">Native App Experience</p>
              </div>
           </button>
        )}
      </div>
      <div className="mt-auto p-8 border-t bg-gray-50/30">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-blue-600 font-black text-sm uppercase">RA</div>
            <div className="truncate flex-1">
               <p className="text-sm font-black text-gray-800 truncate">Roki Ahmed</p>
               <p className="text-[10px] font-black text-gray-400 truncate uppercase tracking-tighter">System Administrator</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Login({ onLogin, onSignup, logo }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '' });
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-gray-900">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-lg border border-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white border-2 border-blue-50 rounded-[2rem] mb-6 shadow-2xl p-4 rotate-3 hover:rotate-0 transition-transform">
             <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">KHM SALES</h2>
          <p className="text-gray-400 font-black text-xs uppercase tracking-widest mt-2">{isLogin ? 'Welcome Back' : 'Create Sales Account'}</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); isLogin ? onLogin(form.email) : onSignup(form.name, form.email); }} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase text-gray-400 ml-5">Official Full Name</label>
               <input required placeholder="Full Name" className="w-full px-6 py-5 bg-gray-50 border-0 focus:ring-4 focus:ring-blue-100 rounded-[2rem] font-black transition-all outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
          )}
          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-5">Gmail Identifier</label>
             <input required type="email" placeholder="Email Address" className="w-full px-6 py-5 bg-gray-50 border-0 focus:ring-4 focus:ring-blue-100 rounded-[2rem] font-black transition-all outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <button className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all uppercase tracking-widest mt-6 text-sm">
            {isLogin ? 'Access Management' : 'Request Onboarding'}
          </button>
        </form>
        <div className="mt-10 text-center border-t pt-8">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-gray-400 font-black hover:text-blue-600 transition-colors uppercase tracking-[2px]">
            {isLogin ? "Need a new account? Register" : 'Back to authentication'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SalesmanModule({ allUsers, setAllUsers }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [newS, setNewS] = useState({ name: '', email: '' });
  const save = (e: any) => { e.preventDefault(); setAllUsers([...allUsers, { id: Date.now().toString(), ...newS, role: 'SALESMAN', status: 'APPROVED' }]); setIsAdding(false); setNewS({name:'', email:''}); };
  const toggleStatus = (id: string) => setAllUsers(allUsers.map((u:any) => u.id === id ? {...u, status: u.status === 'APPROVED' ? 'PENDING' : 'APPROVED'} : u));
  const deleteUser = (id: string) => { if(confirm("Are you sure?")) setAllUsers(allUsers.filter((u:any)=>u.id!==id)); };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-gray-900">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-black tracking-tight">Personnel Database</h2>
            <p className="text-sm text-gray-400 font-black uppercase tracking-widest mt-1">Manage field workforce and van operators</p>
         </div>
         <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-10 py-4 rounded-[2rem] font-black shadow-2xl shadow-blue-200 flex items-center gap-3 hover:bg-blue-700 active:scale-95 transition-all uppercase text-xs tracking-widest">
           {isAdding ? <XCircle size={18} /> : <UserPlus size={18} />}
           {isAdding ? 'Cancel Registration' : 'Onboard New Agent'}
         </button>
      </div>

      {isAdding && (
         <form onSubmit={save} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Agent Legal Name</label>
               <input required placeholder="Enter full name" className="w-full px-6 py-5 border-0 bg-gray-50 rounded-3xl font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={newS.name} onChange={e => setNewS({...newS, name: e.target.value})} />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Corporate Email</label>
               <input required type="email" placeholder="Gmail only" className="w-full px-6 py-5 border-0 bg-gray-50 rounded-3xl font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={newS.email} onChange={e => setNewS({...newS, email: e.target.value})} />
            </div>
            <button className="bg-green-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-green-100 uppercase tracking-widest text-xs hover:bg-green-700 transition-all active:scale-95">Verify & Approve</button>
         </form>
      )}

      <div className="bg-white border-0 rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
              <th className="px-10 py-6">ID Profile</th>
              <th className="px-10 py-6">Credentials</th>
              <th className="px-10 py-6 text-center">Status</th>
              <th className="px-10 py-6 text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allUsers.filter((u:any)=>u.role==='SALESMAN').map((u:any)=>(
              <tr key={u.id} className="hover:bg-blue-50/30 transition-all group">
                <td className="px-10 py-8">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">{u.name.charAt(0)}</div>
                      <div>
                         <span className="font-black text-gray-800 text-lg">{u.name}</span>
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">ID: #{u.id.slice(-6)}</p>
                      </div>
                   </div>
                </td>
                <td className="px-10 py-8 font-black text-gray-500">{u.email}</td>
                <td className="px-10 py-8 text-center">
                   <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[2px] border ${u.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                      {u.status}
                   </span>
                </td>
                <td className="px-10 py-8 text-right">
                   <div className="flex justify-end gap-3">
                      <button onClick={() => toggleStatus(u.id)} className={`p-3 rounded-2xl border transition-all ${u.status === 'APPROVED' ? 'hover:bg-orange-50 text-orange-400' : 'hover:bg-green-50 text-green-400'}`} title={u.status === 'APPROVED' ? 'Suspend Access' : 'Authorize Access'}>
                         {u.status === 'APPROVED' ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="p-3 rounded-2xl border border-red-50 hover:bg-red-50 text-red-400 transition-all shadow-sm">
                         <Trash2 size={20} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WholesaleModule({ products, setProducts, allUsers, salesmanStocks, setSalesmanStocks }: any) {
  const [form, setForm] = useState({ salesmanId: '', productId: '', qty: 0, sellPrice: 0 });
  const handleTransfer = (e: any) => {
    e.preventDefault();
    const p = products.find((x: any) => x.id === form.productId);
    if (!p || p.stock < form.qty) return alert("Insufficient inventory in central warehouse.");
    setProducts(products.map((x: any) => x.id === form.productId ? { ...x, stock: x.stock - form.qty } : x));
    const existing = salesmanStocks.find((s: any) => s.salesmanId === form.salesmanId && s.productId === form.productId);
    if (existing) {
       setSalesmanStocks(salesmanStocks.map((s: any) => s.salesmanId === form.salesmanId && s.productId === form.productId ? { ...s, stock: s.stock + form.qty, assignedPrice: form.sellPrice } : s));
    } else {
       setSalesmanStocks([...salesmanStocks, { salesmanId: form.salesmanId, productId: form.productId, productName: p.name, sku: p.sku, uom: p.uom, stock: form.qty, assignedPrice: form.sellPrice }]);
    }
    setForm({ salesmanId: '', productId: '', qty: 0, sellPrice: 0 });
    alert("Van loading confirmed!");
  };
  return (
    <div className="max-w-6xl mx-auto space-y-10 text-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
           <div className="bg-white p-10 rounded-[3rem] border-0 shadow-2xl shadow-gray-100 sticky top-10">
              <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-blue-600"><Truck size={32} /> Van Loading</h3>
              <form onSubmit={handleTransfer} className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Target Salesman</label>
                    <select required className="w-full px-6 py-5 bg-gray-50 border-0 rounded-[2rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm" value={form.salesmanId} onChange={e => setForm({...form, salesmanId: e.target.value})}>
                       <option value="">-- Select Personnel --</option>
                       {allUsers.filter((u: any) => u.role === 'SALESMAN' && u.status === 'APPROVED').map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Central Store Product</label>
                    <select required className="w-full px-6 py-5 bg-gray-50 border-0 rounded-[2rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm" value={form.productId} onChange={e => {
                       const p = products.find((x:any)=>x.id===e.target.value);
                       setForm({...form, productId: e.target.value, sellPrice: p?.salePrice || 0});
                    }}>
                       <option value="">-- Choose Item --</option>
                       {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} (Available: {p.stock})</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Quantity</label>
                       <input type="number" required placeholder="0" className="w-full px-6 py-5 bg-gray-50 border-0 rounded-[2rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={form.qty || ''} onChange={e => setForm({...form, qty: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Load Price</label>
                       <input type="number" step="0.01" required placeholder="0.00" className="w-full px-6 py-5 bg-gray-50 border-0 rounded-[2rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={form.sellPrice || ''} onChange={e => setForm({...form, sellPrice: Number(e.target.value)})} />
                    </div>
                 </div>
                 <button className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-200 uppercase tracking-widest mt-6 text-sm hover:bg-blue-700 transition-all active:scale-95">Complete Distribution</button>
              </form>
           </div>
        </div>
        <div className="lg:col-span-2">
           <div className="bg-white rounded-[3rem] border-0 shadow-2xl shadow-gray-100 overflow-hidden">
              <div className="p-10 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center">
                 <h3 className="font-black uppercase text-xs tracking-[4px] text-gray-400">Inventory Allocation Log</h3>
                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-xl shadow-green-200"></div>
              </div>
              <table className="w-full text-left">
                 <thead className="bg-gray-50/50">
                    <tr className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
                       <th className="px-8 py-6">Salesman</th>
                       <th className="px-8 py-6">Product</th>
                       <th className="px-8 py-6 text-center">Load Qty</th>
                       <th className="px-8 py-6 text-right">Unit Price</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {salesmanStocks.length === 0 ? (
                       <tr><td colSpan={4} className="p-20 text-center text-gray-300 font-black uppercase tracking-widest opacity-40">No distributions recorded</td></tr>
                    ) : (
                       salesmanStocks.map((s: any, idx: number) => {
                          const salesman = allUsers.find((u:any)=>u.id===s.salesmanId);
                          return (
                             <tr key={idx} className="hover:bg-blue-50/30 transition-all group">
                                <td className="px-8 py-8 flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">{salesman?.name.charAt(0)}</div>
                                   <span className="font-black text-gray-800">{salesman?.name}</span>
                                </td>
                                <td className="px-8 py-8 font-black text-gray-500 text-xs">{s.productName}</td>
                                <td className="px-8 py-8 text-center font-black text-blue-600 text-lg">{s.stock}</td>
                                <td className="px-8 py-8 text-right font-black text-gray-400">SR {s.assignedPrice.toFixed(2)}</td>
                             </tr>
                          )
                       })
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}

function InventoryModule({ products, salesmanStocks, user, isAdmin }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const viewData = isAdmin ? products : salesmanStocks.filter((s:any)=>s.salesmanId===user.id);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-10">
         <div>
            <h2 className="text-3xl font-black">{isAdmin ? 'Enterprise Inventory' : 'My Field Stock'}</h2>
            <p className="text-gray-400 font-black uppercase tracking-widest mt-1 text-xs">Full transparency of current stock levels</p>
         </div>
         <div className="relative w-full md:w-96 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition-colors" size={24} />
            <input type="text" placeholder="Search by SKU, Category or Name..." className="w-full pl-16 pr-8 py-5 bg-white border-0 rounded-[2rem] font-black shadow-2xl shadow-gray-100 focus:ring-4 focus:ring-blue-100 outline-none transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border-0 shadow-2xl shadow-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
              <th className="px-10 py-8">Product Specifications</th>
              <th className="px-10 py-8 text-center">Batch SKU</th>
              <th className="px-10 py-8 text-center">Current Stock</th>
              <th className="px-10 py-8 text-right">Selling Value</th>
              {isAdmin && <th className="px-10 py-8 text-right">Acquisition Cost</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {viewData.filter((p:any) => (p.name || p.productName).toLowerCase().includes(searchTerm.toLowerCase())).map((p: any) => (
               <tr key={p.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-10 py-8">
                     <p className="font-black text-gray-800 text-lg leading-tight">{p.name || p.productName}</p>
                     <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">{p.category || 'Standard Goods'}</span>
                        <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-widest">UOM: {p.uom || 'PCS'}</span>
                     </div>
                  </td>
                  <td className="px-10 py-8 text-center font-black text-gray-400 text-xs tracking-[2px]">{p.sku}</td>
                  <td className="px-10 py-8 text-center">
                     <span className={`inline-flex px-6 py-2 rounded-full text-[11px] font-black tracking-widest border-2 ${p.stock < 15 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-green-50 text-green-600 border-green-100'}`}>
                        {p.stock} Units
                     </span>
                  </td>
                  <td className="px-10 py-8 text-right font-black text-gray-800 text-xl">SR {(p.salePrice || p.assignedPrice).toFixed(2)}</td>
                  {isAdmin && <td className="px-10 py-8 text-right font-black text-gray-300 italic text-sm">SR {p.purchasePrice?.toFixed(2) || '0.00'}</td>}
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PurchaseModule({ products, setProducts, purchases, setPurchases, isAdmin }: any) {
  const [activeTab, setActiveTab] = useState<'refill' | 'new' | 'history'>('refill');
  const [refillForm, setRefillForm] = useState({ productId: '', quantity: 0, cost: 0, salePrice: 0 });
  const [newForm, setNewForm] = useState({ name: '', sku: '', category: '', purchasePrice: 0, salePrice: 0, stock: 0, uom: '24' });

  const handleRefill = (e: React.FormEvent) => {
    e.preventDefault();
    const p = products.find((x: any) => x.id === refillForm.productId);
    if (!p) return;
    setProducts(products.map((x: any) => x.id === refillForm.productId ? { ...x, stock: x.stock + refillForm.quantity, purchasePrice: refillForm.cost, salePrice: refillForm.salePrice } : x));
    setPurchases([...purchases, { id: `PUR-${Date.now()}`, productId: p.id, productName: p.name, quantity: refillForm.quantity, cost: refillForm.cost, total: refillForm.quantity * refillForm.cost, date: new Date().toISOString() }]);
    setRefillForm({ productId: '', quantity: 0, cost: 0, salePrice: 0 });
    alert("Central inventory refilled.");
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Date.now().toString();
    const newProduct: Product = { id: newId, ...newForm };
    setProducts([...products, newProduct]);
    setPurchases([...purchases, { id: `PUR-NEW-${Date.now()}`, productId: newId, productName: newForm.name, quantity: newForm.stock, cost: newForm.purchasePrice, total: newForm.stock * newForm.purchasePrice, date: new Date().toISOString() }]);
    setNewForm({ name: '', sku: '', category: '', purchasePrice: 0, salePrice: 0, stock: 0, uom: '24' });
    setActiveTab('refill');
    alert("New product registered.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-10">
         <div>
            <h2 className="text-3xl font-black">Procurement & Sourcing</h2>
            <p className="text-gray-400 font-black uppercase tracking-widest mt-1 text-xs">Manage incoming stock from suppliers</p>
         </div>
         <div className="flex bg-white p-1.5 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100">
            <button onClick={() => setActiveTab('refill')} className={`px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'refill' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-gray-400 hover:text-blue-600'}`}>Refill</button>
            <button onClick={() => setActiveTab('new')} className={`px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-gray-400 hover:text-blue-600'}`}>New Item</button>
            <button onClick={() => setActiveTab('history')} className={`px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-gray-400 hover:text-blue-600'}`}>History</button>
         </div>
      </div>

      {activeTab === 'refill' && (
        <div className="bg-white p-12 rounded-[3.5rem] border-0 shadow-2xl shadow-gray-100">
          <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-blue-600"><ShoppingCart size={32} /> Restock Form</h3>
          <form onSubmit={handleRefill} className="space-y-8">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-gray-400 ml-6">Select Existing SKU</label>
               <select required className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm" value={refillForm.productId} onChange={e => setRefillForm({...refillForm, productId: e.target.value})}>
                 <option value="">-- Choose Product to Procurement --</option>
                 {products.map((p:any)=><option key={p.id} value={p.id}>{p.name} (Current: {p.stock})</option>)}
               </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 ml-6">Arrival Quantity</label>
                 <input type="number" required placeholder="0" className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={refillForm.quantity || ''} onChange={e => setRefillForm({...refillForm, quantity: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 ml-6">Supplier Cost (SR)</label>
                 <input type="number" step="0.01" required placeholder="0.00" className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={refillForm.cost || ''} onChange={e => setRefillForm({...refillForm, cost: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 ml-6">New List Price</label>
                 <input type="number" step="0.01" required placeholder="0.00" className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={refillForm.salePrice || ''} onChange={e => setRefillForm({...refillForm, salePrice: Number(e.target.value)})} />
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white font-black py-7 rounded-[2.5rem] shadow-2xl shadow-blue-200 uppercase tracking-widest mt-10 text-sm hover:bg-blue-700 active:scale-[0.98] transition-all">Authorize Procurement Load</button>
          </form>
        </div>
      )}

      {activeTab === 'new' && (
        <div className="bg-white p-12 rounded-[3.5rem] border-0 shadow-2xl shadow-gray-100">
          <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-green-600"><Package size={32} /> New Product Registration</h3>
          <form onSubmit={handleCreateProduct} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-6">Full Descriptive Name</label>
                  <input required placeholder="E.g. Juice Pineapple 250ml" className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-green-100 transition-all" value={newForm.name} onChange={e => setNewForm({...newForm, name: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-6">Master SKU Code</label>
                  <input required placeholder="Global Serial #" className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-green-100 transition-all" value={newForm.sku} onChange={e => setNewForm({...newForm, sku: e.target.value})} />
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-6">Category</label>
                  <input placeholder="Beverage, Dry Food..." className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-green-100 transition-all" value={newForm.category} onChange={e => setNewForm({...newForm, category: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-6">Initial Batch Qty</label>
                  <input type="number" required placeholder="0" className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-green-100 transition-all" value={newForm.stock || ''} onChange={e => setNewForm({...newForm, stock: Number(e.target.value)})} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-6">UOM Packing</label>
                  <input placeholder="24, 60, 100 etc." className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-green-100 transition-all" value={newForm.uom} onChange={e => setNewForm({...newForm, uom: e.target.value})} />
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-6">Import Cost (SR)</label>
                  <input type="number" step="0.01" required placeholder="0.00" className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-green-100 transition-all" value={newForm.purchasePrice || ''} onChange={e => setNewForm({...newForm, purchasePrice: Number(e.target.value)})} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-6">Listing Price (SR)</label>
                  <input type="number" step="0.01" required placeholder="0.00" className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-green-100 transition-all" value={newForm.salePrice || ''} onChange={e => setNewForm({...newForm, salePrice: Number(e.target.value)})} />
               </div>
            </div>
            <button className="w-full bg-green-600 text-white font-black py-7 rounded-[2.5rem] shadow-2xl shadow-green-200 uppercase tracking-widest mt-10 text-sm hover:bg-green-700 active:scale-[0.98] transition-all">Onboard New SKU</button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[3.5rem] border-0 shadow-2xl shadow-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-black uppercase text-gray-400 tracking-widest">
              <tr><th className="px-10 py-8">Procurement Date</th><th className="px-10 py-8">Stock Item</th><th className="px-10 py-8 text-center">Batch Size</th><th className="px-10 py-8 text-right">Unit Cost</th><th className="px-10 py-8 text-right">Total Outflow</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {purchases.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-gray-300 font-black uppercase tracking-widest opacity-40">Purchase records empty</td></tr>
              ) : (
                purchases.slice().reverse().map((p: any) => (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-10 py-8 text-gray-400 font-black text-xs">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-10 py-8 font-black text-gray-800 text-sm uppercase">{p.productName}</td>
                    <td className="px-10 py-8 text-center font-black">{p.quantity}</td>
                    <td className="px-10 py-8 text-right font-black">SR {p.cost.toFixed(2)}</td>
                    <td className="px-10 py-8 text-right font-black text-blue-600">SR {p.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReportModule({ sales, onPrint, user }: any) {
  const [aiI, setAiI] = useState('');
  const filteredSales = user.role === 'ADMIN' ? sales : sales.filter((s:any) => s.salesMan === user.name);
  const rev = filteredSales.reduce((a:any,s:any)=>a+s.total,0);
  
  const fetchAi = async () => {
     setAiI("Analyzing global sales trends and inventory churn rates...");
     const insights = await getBusinessInsights({ rev, count: filteredSales.length, user: user.name });
     setAiI(insights);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-10">
         <div>
            <h2 className="text-3xl font-black">Audit & Analytics</h2>
            <p className="text-gray-400 font-black uppercase tracking-widest mt-1 text-xs">Official transaction ledger and performance reports</p>
         </div>
         <button onClick={fetchAi} className="bg-indigo-600 text-white px-10 py-5 rounded-[2.5rem] font-black shadow-2xl shadow-indigo-100 flex items-center gap-4 hover:bg-indigo-700 active:scale-95 transition-all uppercase text-[11px] tracking-widest">
            <BrainCircuit size={24} /> Generate AI Performance Audit
         </button>
      </div>

      {aiI && (
        <div className="bg-indigo-600 text-white p-10 rounded-[3.5rem] shadow-2xl shadow-indigo-200 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md"><BrainCircuit size={28} /></div>
              <h4 className="font-black text-xl uppercase tracking-tighter">AI Business Insights</h4>
           </div>
           <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap italic opacity-90">{aiI}</p>
        </div>
      )}

      <div className="bg-white rounded-[3.5rem] border-0 shadow-2xl shadow-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-black uppercase text-gray-400 tracking-widest">
            <tr><th className="px-10 py-8">Invoice Token</th><th className="px-10 py-8">Target Customer</th><th className="px-10 py-8">Agent</th><th className="px-10 py-8 text-right">Gross Total</th><th className="px-10 py-8 text-center">Export</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredSales.slice().reverse().map((s:any)=>(
              <tr key={s.id} className="hover:bg-blue-50/20 transition-all group">
                <td className="px-10 py-8 font-black text-xs font-mono text-blue-500 tracking-widest">{s.invoiceNo}</td>
                <td className="px-10 py-8">
                   <p className="font-black text-gray-800 text-sm uppercase">{s.customerName}</p>
                   <p className="text-[10px] font-black text-gray-300">TRN: {s.customerTrn || 'N/A'}</p>
                </td>
                <td className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-tighter">{s.salesMan}</td>
                <td className="px-10 py-8 text-right font-black text-lg">SR {s.total.toFixed(2)}</td>
                <td className="px-10 py-8 text-center">
                  <button onClick={()=>onPrint(s)} className="p-4 text-blue-600 hover:bg-white rounded-2xl border border-blue-50 shadow-sm transition-all active:scale-90 group-hover:shadow-lg">
                    <Printer size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsModule({ settings, setSettings, onBackup, onRestore }: any) {
  const [localSettings, setLocalSettings] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLInputElement>(null);

  const save = (e: any) => { e.preventDefault(); setSettings(localSettings); alert("Enterprise configuration synced."); };
  const handleLogo = (e: any) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onloadend = () => setLocalSettings({ ...localSettings, logoUrl: reader.result as string });
      reader.readAsDataURL(f);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 text-gray-900 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-10">
         <div>
            <h2 className="text-3xl font-black">System Architecture</h2>
            <p className="text-gray-400 font-black uppercase tracking-widest mt-1 text-xs">Configure enterprise identity and data integrity</p>
         </div>
         <div className="flex gap-4">
            <button onClick={onBackup} className="px-8 py-4 bg-white border border-gray-100 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-gray-100 hover:bg-gray-50 active:scale-95 transition-all"><Database size={16} /> Data Export</button>
            <button onClick={() => restoreRef.current?.click()} className="px-8 py-4 bg-gray-900 text-white rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-gray-200 hover:bg-black active:scale-95 transition-all"><RefreshCcw size={16} /> Data Restore</button>
            <input type="file" ref={restoreRef} hidden accept=".json" onChange={onRestore} />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-12 rounded-[3.5rem] border-0 shadow-2xl shadow-gray-100 text-center">
               <div className="w-40 h-40 bg-white border-2 border-gray-50 rounded-[2.5rem] mx-auto mb-8 shadow-2xl p-4 relative group">
                  <img src={localSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-[2.5rem] flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                     <Upload className="text-white" />
                  </div>
               </div>
               <h4 className="text-xl font-black text-gray-800">Visual Identity</h4>
               <p className="text-xs text-gray-400 font-bold mt-2 leading-relaxed">High-resolution brand assets used for legal invoicing</p>
               <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleLogo} />
               <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Upload New Branding</button>
            </div>
         </div>

         <div className="lg:col-span-2">
            <div className="bg-white p-12 rounded-[3.5rem] border-0 shadow-2xl shadow-gray-100">
               <form onSubmit={save} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <h5 className="text-[11px] font-black uppercase tracking-[3px] text-blue-600 flex items-center gap-2"><Store size={16} /> Legal Entity</h5>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-300 ml-4">Corporate Name (EN)</label>
                           <input className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={localSettings.companyName} onChange={e => setLocalSettings({...localSettings, companyName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-300 ml-4">Corporate Name (AR)</label>
                           <input className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2rem] font-black text-right font-arabic outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={localSettings.companyNameArabic} onChange={e => setLocalSettings({...localSettings, companyNameArabic: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-300 ml-4">VAT Registration Number</label>
                           <input className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={localSettings.vatNumber} onChange={e => setLocalSettings({...localSettings, vatNumber: e.target.value})} />
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h5 className="text-[11px] font-black uppercase tracking-[3px] text-indigo-600 flex items-center gap-2"><MapPin size={16} /> Logistics & Comm</h5>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-300 ml-4">HQ Global Address</label>
                           <textarea className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2rem] font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all h-28" value={localSettings.address} onChange={e => setLocalSettings({...localSettings, address: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-300 ml-4">Official Phone</label>
                              <input className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2rem] font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all" value={localSettings.phone} onChange={e => setLocalSettings({...localSettings, phone: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-300 ml-4">Default VAT %</label>
                              <input type="number" className="w-full px-8 py-6 bg-gray-50 border-0 rounded-[2rem] font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all" value={localSettings.vatPercent} onChange={e => setLocalSettings({...localSettings, vatPercent: Number(e.target.value)})} />
                           </div>
                        </div>
                     </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white font-black py-7 rounded-[2.5rem] shadow-2xl shadow-blue-200 uppercase tracking-widest text-sm hover:bg-blue-700 active:scale-[0.98] transition-all">Synchronize Enterprise Core Settings</button>
               </form>
            </div>
         </div>
      </div>
    </div>
  );
}

/**
 * ZATCA Simplified Tax Invoice Component.
 */
function InvoicePrint({ sale, settings }: { sale: Sale; settings: AppSettings }) {
  const qrDataString = `Seller:${settings.companyName}|VAT:${settings.vatNumber}|Date:${sale.date}|Total:${sale.total.toFixed(2)}|VATTotal:${sale.vatAmount.toFixed(2)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrDataString)}`;

  return (
    <div className="bg-white p-8 text-[11px] font-sans leading-tight text-black border border-gray-400 w-[210mm] min-h-[297mm] mx-auto overflow-hidden relative">
      <div className="flex justify-between items-start mb-8">
        <div className="w-2/3">
          <p className="font-black text-[11px] uppercase text-gray-500 mb-2">Supplier Details (تفاصيل المورد):</p>
          <div className="flex justify-between items-start">
            <div className="flex-1">
               <p className="font-black text-lg uppercase tracking-tight leading-none">{settings.companyName}</p>
            </div>
            <div className="flex-1 text-right">
               <p className="font-bold text-lg font-arabic leading-none" dir="rtl">{settings.companyNameArabic}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mt-4 leading-relaxed uppercase font-black">{settings.address}</p>
          <div className="mt-4 space-y-1">
             <p className="text-[10px] font-black uppercase">VAT TRN (الرقم الضريبي): <span className="text-blue-600">{settings.vatNumber}</span></p>
             <p className="text-[10px] font-black uppercase">COMMERCIAL REG: {settings.exciseTrn || settings.vatNumber}</p>
             <p className="text-[10px] font-black uppercase">CONTACT: {settings.phone} | {settings.email}</p>
          </div>
        </div>
        <div className="w-1/3 flex flex-col items-end">
          <img src={settings.logoUrl} alt="Logo" className="w-28 object-contain mb-6" />
          <div className="border-[3px] border-black p-1.5 bg-white shadow-xl">
            <img src={qrUrl} alt="QR" className="w-24 h-24" />
          </div>
        </div>
      </div>

      <h2 className="text-center font-black border-y-4 border-black py-4 mb-8 text-sm uppercase bg-gray-100 tracking-[8px]">Tax Invoice (فاتورة ضريبية مبسطة)</h2>

      <div className="grid grid-cols-3 gap-0 border-2 border-black mb-6 text-center text-[10px] uppercase font-black">
        <div className="border-r-2 border-black p-3 bg-gray-50"><p className="text-gray-500 mb-2">Order Date:</p><p className="text-sm">{new Date(sale.orderDate).toLocaleDateString()}</p></div>
        <div className="border-r-2 border-black p-3"><p className="text-gray-500 mb-2">Invoice Date:</p><p className="text-sm">{new Date(sale.date).toLocaleDateString()}</p></div>
        <div className="p-3 bg-gray-50"><p className="text-gray-500 mb-2">Delivery Date:</p><p className="text-sm">{new Date(sale.deliveryDate).toLocaleDateString()}</p></div>
      </div>

      <div className="grid grid-cols-2 gap-0 border-2 border-black mb-6">
        <div className="border-r-2 border-black">
          <div className="bg-gray-100 p-3 border-b-2 border-black font-black flex justify-between uppercase text-[9px] tracking-widest"><span>Ship To (توريد لـ)</span></div>
          <div className="p-4 min-h-[70px]">
            <p className="font-black uppercase text-sm mb-2">{sale.customerName}</p>
            <p className="text-[10px] text-gray-500 font-black uppercase">{sale.customerAddress || 'Local Client, KSA'}</p>
            <p className="text-[10px] font-black mt-3">CONTACT: {sale.mobile || sale.customerPhone || '-'}</p>
          </div>
        </div>
        <div>
          <div className="bg-gray-100 p-3 border-b-2 border-black font-black flex justify-between uppercase text-[9px] tracking-widest"><span>Bill To (فاتورة لـ)</span></div>
          <div className="p-4 min-h-[70px]">
            <p className="font-black uppercase text-sm mb-2">{sale.customerName}</p>
            <p className="text-[11px] font-black mt-3">TRN: {sale.customerTrn || '-'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0 border-2 border-black mb-6 text-[11px] font-black">
        <div className="border-r-2 border-black p-3 flex justify-between items-center bg-gray-50"><span className="uppercase text-gray-500">Invoice No:</span><span className="text-sm">{sale.invoiceNo}</span></div>
        <div className="p-3 flex justify-between items-center"><span className="uppercase text-gray-500">Payment Mode:</span><span className="text-sm uppercase">{sale.paymentType || 'CREDIT'}</span></div>
      </div>

      <div className="border-2 border-black mb-8 overflow-hidden rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-[8px] font-black uppercase tracking-tighter text-center divide-x-2 divide-black border-b-2 border-black">
              <th className="p-3 w-[15%]">SKU CODE</th>
              <th className="p-3 w-[8%]">UNIT</th>
              <th className="p-3 w-[15%]">QUANTITY<div className="flex justify-between px-1 border-t border-black mt-2"><span>CTN</span><span>PCS</span></div></th>
              <th className="p-3 w-[10%]">RATE</th>
              <th className="p-3 w-[10%]">DISCOUNT</th>
              <th className="p-3 w-[10%]">VAT %</th>
              <th className="p-3 w-[10%]">VAT AMT</th>
              <th className="p-3 w-[14%]">TOTAL DUE</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-100 text-[9px] font-black">
            {sale.items.map((item, idx) => {
              const uomVal = parseInt(item.uom || '24');
              const pcs = item.quantity % uomVal;
              return (
                <React.Fragment key={idx}>
                  <tr className="bg-gray-50/50">
                    <td colSpan={8} className="px-3 py-2 border-b border-gray-100 font-black text-gray-800 uppercase flex justify-between">
                       <span>{idx+1}. {item.productName}</span>
                       <span dir="rtl" className="font-arabic">(المنتج الغذائي الممتاز)</span>
                    </td>
                  </tr>
                  <tr className="divide-x-2 divide-black text-center h-10 items-center">
                    <td className="p-2 text-gray-400 font-bold">{item.productId.slice(-8)}</td>
                    <td className="p-2 uppercase">{item.uom}</td>
                    <td className="p-2"><div className="flex justify-between px-4 font-black"><span>{item.quantityCtn}</span><span>{pcs}</span></div></td>
                    <td className="p-2">{item.grossAmount.toFixed(2)}</td>
                    <td className="p-2">{item.discountVal?.toFixed(2) || '0.00'}</td>
                    <td className="p-2">{item.vatPercent}</td>
                    <td className="p-2">{item.vatAmount.toFixed(2)}</td>
                    <td className="p-2 bg-gray-100 font-black text-xs">SR {item.totalIncl.toFixed(2)}</td>
                  </tr>
                </React.Fragment>
              );
            })}
            {[...Array(Math.max(0, 10 - sale.items.length * 2))].map((_, i) => (
              <tr key={`empty-${i}`} className="h-10 divide-x-2 divide-black border-t-2 border-gray-100"><td colSpan={8}></td></tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-black text-sm text-center divide-x-2 divide-black border-t-4 border-black">
            <tr className="h-12">
              <td colSpan={2} className="p-2 text-right uppercase pr-6 text-gray-500">ORDER TOTAL (المجموع)</td>
              <td className="p-2">{sale.items.reduce((a,c)=>a+c.quantityCtn,0)} CTN</td>
              <td className="p-2" colSpan={3}></td>
              <td className="p-2 text-right pr-4">SR {sale.vatAmount.toFixed(2)}</td>
              <td className="p-2 text-right pr-4 bg-gray-300 text-blue-600">SR {sale.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-between mt-auto pt-24 border-t-4 border-gray-100">
        <div className="w-1/3 text-center border-t-2 border-black pt-4 uppercase font-black text-[9px]"><p>Customer Signature</p><p dir="rtl" className="font-arabic mt-1">توقيع العميل</p></div>
        <div className="w-1/3 text-center border-t-2 border-black pt-4 uppercase font-black text-[9px]"><p>Warehouse Manager</p><p dir="rtl" className="font-arabic mt-1">مدير المستودع</p></div>
        <div className="w-1/3 text-center border-t-2 border-black pt-4 uppercase font-black text-[9px]"><p>Authorized Seal</p><p dir="rtl" className="font-arabic mt-1">توقيع معتمد</p></div>
      </div>

      <div className="text-[9px] text-gray-300 mt-16 text-center font-black uppercase tracking-[8px]">
        KHM SALES ERP - SYSTEM GENERATED TAX INVOICE - NO SIGNATURE REQUIRED<br/>
        PRODUCED BY QUEEN FOOD PRODUCT LTD, DAMMAM, SAUDI ARABIA
      </div>
    </div>
  );
}

function CustomerModule({ customers, setCustomers }: any) {
  const [isA, setIsA] = useState(false);
  const [newC, setNewC] = useState({ name: '', phone: '', address: '', trn: '', email: '' });
  const save = (e: any) => { e.preventDefault(); setCustomers([...customers, { id: 'C' + Date.now().toString().slice(-4), ...newC }]); setIsA(false); setNewC({name:'', phone:'', address:'', trn:'', email:''}); };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-10">
         <div>
            <h2 className="text-3xl font-black">Client Portfolio</h2>
            <p className="text-gray-400 font-black uppercase tracking-widest mt-1 text-xs">Maintain global customer relationships</p>
         </div>
         <button onClick={() => setIsA(!isA)} className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-blue-100 flex items-center gap-4 hover:bg-blue-700 active:scale-95 transition-all uppercase text-[11px] tracking-widest">
           <Plus size={20} /> Register New Client
         </button>
      </div>

      {isA && (
         <form onSubmit={save} className="bg-white p-12 rounded-[3.5rem] border-0 shadow-2xl shadow-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in slide-in-from-top-4 duration-500">
            <div className="space-y-2 lg:col-span-2">
               <label className="text-[10px] font-black uppercase text-gray-300 ml-6">Corporate/Individual Name</label>
               <input required placeholder="Client Title" className="w-full px-8 py-6 border-0 bg-gray-50 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={newC.name} onChange={e => setNewC({...newC, name: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-gray-300 ml-6">Primary Phone</label>
               <input placeholder="+966" className="w-full px-8 py-6 border-0 bg-gray-50 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={newC.phone} onChange={e => setNewC({...newC, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-gray-300 ml-6">VAT/TRN Identifier</label>
               <input placeholder="15 Digit Number" className="w-full px-8 py-6 border-0 bg-gray-50 rounded-[2.5rem] font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={newC.trn} onChange={e => setNewC({...newC, trn: e.target.value})} />
            </div>
            <button className="lg:col-span-4 bg-blue-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-blue-200 uppercase tracking-widest text-sm hover:bg-blue-700 active:scale-95">Enroll Customer in System</button>
         </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {customers.map((c:any)=>(
          <div key={c.id} className="bg-white p-10 rounded-[3rem] border-0 shadow-2xl shadow-gray-100/50 hover:shadow-xl hover:translate-y-[-8px] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={80} /></div>
            <div className="flex justify-between items-start mb-6">
               <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.8rem] shadow-inner"><Users size={28} /></div>
               <span className="text-[11px] font-black text-gray-200 uppercase tracking-[4px]">{c.id}</span>
            </div>
            <h4 className="font-black text-gray-800 text-2xl group-hover:text-blue-600 transition-colors tracking-tight">{c.name}</h4>
            <div className="mt-8 space-y-4">
               <p className="text-sm font-bold text-gray-400 flex items-center gap-3"><Phone size={16} /> {c.phone || 'No direct line'}</p>
               <p className="text-sm font-bold text-gray-400 flex items-center gap-3"><MapPin size={16} /> {c.address || 'KSA Territory'}</p>
               <div className="pt-6 border-t border-gray-50">
                  <span className="text-[10px] font-black bg-gray-50 px-4 py-2 rounded-full text-blue-500 uppercase tracking-widest">VAT TRN: {c.trn||'PENDING'}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalesModule({ products, setProducts, salesmanStocks, setSalesmanStocks, customers, settings, sales, setSales, user, onPrint }: any) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CREDIT'>('CASH');

  const availableItems = useMemo(() => {
     if (user.role === 'ADMIN') return products;
     return salesmanStocks
        .filter((s: any) => s.salesmanId === user.id && s.stock > 0)
        .map((s: any) => ({ id: s.productId, name: s.productName, sku: s.sku, uom: s.uom, stock: s.stock, salePrice: s.assignedPrice }));
  }, [user, products, salesmanStocks]);

  const addToCart = (p: any) => {
    const existing = cart.find(i => i.productId === p.id);
    const currentQty = existing ? existing.quantity : 0;
    if (p.stock <= currentQty) return alert("Insufficient field stock.");
    if (existing) setCart(cart.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i));
    else setCart([...cart, { productId: p.id, productName: p.name, sku: p.sku, uom: p.uom || '24', quantity: 1, price: p.salePrice, discount: 0 }]);
  };

  const updateQty = (id: string, delta: number) => {
     setCart(cart.map(i => {
        if (i.productId === id) {
           const next = i.quantity + delta;
           if (next < 1) return i;
           const p = availableItems.find((x:any)=>x.id===id);
           if (next > p.stock) return i;
           return { ...i, quantity: next };
        }
        return i;
     }));
  };

  const updateDiscount = (id: string, val: number) => {
     setCart(cart.map(i => i.productId === id ? { ...i, discount: Math.max(0, val) } : i));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalVat = 0;
    
    cart.forEach(item => {
      const lineGross = item.price * item.quantity;
      const lineNet = lineGross - item.discount;
      const lineVat = (lineNet * settings.vatPercent) / 100;
      subtotal += lineNet;
      totalVat += lineVat;
    });

    return { subtotal, totalVat, total: subtotal + totalVat };
  };

  const { subtotal, totalVat, total } = calculateTotals();

  const processSale = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
       const customer = customers.find((c: any) => c.id === selectedCustomerId);
       const saleItems = cart.map(i => {
         const uomVal = parseInt(i.uom) || 24;
         const lineNet = (i.price * i.quantity) - i.discount;
         const lineVat = (lineNet * settings.vatPercent) / 100;
         
         return { 
           productId: i.productId, 
           productName: i.productName, 
           quantity: i.quantity, 
           quantityCtn: Math.floor(i.quantity / uomVal), 
           priceCtn: i.price * uomVal, 
           grossAmount: i.price, 
           exciseDuty: 0, 
           discountPercent: ((i.discount / (i.price * i.quantity)) * 100) || 0, 
           discountVal: i.discount, 
           vatPercent: settings.vatPercent, 
           vatAmount: lineVat, 
           totalIncl: lineNet + lineVat, 
           uom: i.uom 
         };
       });

       const nextInvoiceNo = `INV/${new Date().getFullYear()}/${(sales.length + 1).toString().padStart(5, '0')}`;
       const s: Sale = { 
          id: `SALE-${Date.now()}`, 
          invoiceNo: nextInvoiceNo, 
          customerId: selectedCustomerId, 
          customerName: customer?.name || 'WALK-IN CASH CUSTOMER', 
          customerAddress: customer?.address, 
          customerTrn: customer?.trn,
          customerPhone: customer?.phone,
          items: saleItems, 
          subtotal, 
          vatAmount: totalVat, 
          total, 
          date: new Date().toISOString(), 
          orderDate: new Date().toISOString(), 
          deliveryDate: new Date().toISOString(), 
          salesMan: user.name, 
          paymentType: paymentMode, 
          vehicleNo: 'QN-FIELD-01', 
          currency: 'SR', 
          custCode: customer?.id || 'WALK-01', 
          siteCode: 'CENTRAL', 
          dmId: 'DM' + Date.now().toString().slice(-4) 
       };
       
       if (user.role === 'ADMIN') {
         setProducts(products.map(p => {
           const ci = cart.find(item => item.productId === p.id);
           return ci ? { ...p, stock: p.stock - ci.quantity } : p;
         }));
       } else {
         setSalesmanStocks(salesmanStocks.map(s_stock => {
           const ci = cart.find(item => item.productId === s_stock.productId && s_stock.salesmanId === user.id);
           return ci ? { ...s_stock, stock: s_stock.stock - ci.quantity } : s_stock;
         }));
       }
       setSales([...sales, s]); setCart([]); setSelectedCustomerId(''); onPrint(s);
    } finally {
       setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full overflow-hidden animate-in fade-in duration-500">
      <div className="lg:col-span-3 flex flex-col gap-8 overflow-hidden">
        <div className="relative group">
           <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition-colors" size={24} />
           <input type="text" placeholder="Start typing SKU or Product Name..." className="w-full pl-20 pr-8 py-7 bg-white border-0 rounded-[2.5rem] font-black shadow-2xl shadow-gray-100 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 overflow-y-auto pr-4 pb-12">
          {availableItems.filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())).map((p: any) => (
            <div key={p.id} className="bg-white p-8 rounded-[3rem] border-0 shadow-2xl shadow-gray-100/50 hover:shadow-xl hover:translate-y-[-8px] transition-all flex flex-col justify-between group">
              <div>
                 <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[3px] text-blue-500 bg-blue-50 px-4 py-2 rounded-2xl">#{p.sku}</span>
                    <span className={`text-[10px] font-black px-4 py-2 rounded-2xl ${p.stock < 15 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>Stock: {p.stock}</span>
                 </div>
                 <h4 className="font-black text-gray-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">{p.name}</h4>
                 <p className="text-[10px] text-gray-400 font-black mt-2 uppercase tracking-widest italic">Standard Unit: {p.uom || '24'}</p>
              </div>
              <div className="mt-8 flex items-center justify-between">
                 <div>
                    <p className="text-2xl font-black text-gray-900">SR {p.salePrice.toFixed(2)}</p>
                    <p className="text-[8px] font-black text-gray-300 uppercase">Unit Price Inc Tax</p>
                 </div>
                 <button onClick={() => addToCart(p)} className="p-5 bg-blue-600 text-white rounded-[1.8rem] shadow-2xl shadow-blue-100 hover:bg-blue-700 active:scale-90 transition-all">
                    <Plus size={24} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1 bg-white rounded-[3.5rem] border-0 shadow-2xl shadow-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-500">
        <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
           <div>
              <h3 className="font-black uppercase text-sm tracking-[4px] text-gray-400">POS Order</h3>
              <p className="text-[9px] font-black text-blue-600 uppercase mt-1">Direct Field Sale</p>
           </div>
           <button onClick={() => setCart([])} className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={20}/></button>
        </div>
        
        <div className="p-6 border-b bg-white space-y-4">
           <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-2 block">Client Selection</label>
              <select className="w-full p-5 bg-gray-50 border-0 rounded-[2rem] font-black text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}>
                 <option value="">-- Generic Cash Customer --</option>
                 {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
           </div>
           <div className="flex gap-2 p-1 bg-gray-100 rounded-[2rem]">
              <button onClick={() => setPaymentMode('CASH')} className={`flex-1 py-3 rounded-[1.8rem] text-[10px] font-black flex items-center justify-center gap-2 transition-all ${paymentMode === 'CASH' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}><Wallet size={14}/> CASH</button>
              <button onClick={() => setPaymentMode('CREDIT')} className={`flex-1 py-3 rounded-[1.8rem] text-[10px] font-black flex items-center justify-center gap-2 transition-all ${paymentMode === 'CREDIT' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}><CreditCard size={14}/> CREDIT</button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-200 gap-6 py-20">
                <div className="p-10 bg-gray-50 rounded-full"><ShoppingCart size={64} className="opacity-20" /></div>
                <p className="font-black uppercase text-[10px] tracking-[5px]">Basket Empty</p>
             </div>
          ) : (
             cart.map(i => (
                <div key={i.productId} className="flex flex-col gap-3 p-5 bg-gray-50 rounded-3xl border-0 hover:bg-blue-50/50 transition-colors group">
                   <div className="flex justify-between items-start gap-4">
                      <p className="text-xs font-black text-gray-800 leading-tight flex-1">{i.productName}</p>
                      <button onClick={() => setCart(cart.filter(x => x.productId !== i.productId))} className="text-gray-300 hover:text-red-500 transition-colors"><XCircle size={16} /></button>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-2xl border border-gray-100">
                         <button onClick={() => updateQty(i.productId, -1)} className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center font-black active:scale-75 transition-transform">-</button>
                         <span className="text-sm font-black w-6 text-center">{i.quantity}</span>
                         <button onClick={() => updateQty(i.productId, 1)} className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center font-black active:scale-75 transition-transform">+</button>
                      </div>
                      <div className="flex flex-col items-end">
                         <input type="number" step="0.01" className="w-20 bg-white border border-gray-100 rounded-xl px-2 py-1 text-[10px] font-black outline-none text-right" placeholder="Disc" value={i.discount || ''} onChange={(e) => updateDiscount(i.productId, parseFloat(e.target.value) || 0)} />
                         <p className="text-[8px] font-black text-gray-400 uppercase mt-1">Discount Val</p>
                      </div>
                   </div>
                   <div className="flex justify-between border-t border-gray-100 pt-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Subtotal</span>
                      <p className="text-sm font-black text-blue-600">SR {((i.price * i.quantity) - (i.discount || 0)).toFixed(2)}</p>
                   </div>
                </div>
             ))
          )}
        </div>

        <div className="p-10 bg-gray-50/50 border-t border-gray-100 space-y-4">
          <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest"><span>Global Subtotal</span><span>SR {subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest"><span>VAT ({settings.vatPercent}%)</span><span>SR {totalVat.toFixed(2)}</span></div>
          <div className="flex justify-between items-center border-t border-gray-200 pt-6 mt-4">
             <span className="text-xs font-black uppercase text-gray-800 tracking-[3px]">Total Pay</span>
             <span className="text-3xl font-black text-blue-600">SR {total.toFixed(2)}</span>
          </div>
          <button onClick={processSale} disabled={cart.length === 0 || isProcessing} className="w-full bg-blue-600 text-white font-black py-7 rounded-[2.5rem] mt-6 shadow-2xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-all uppercase tracking-[4px] text-xs">
             {isProcessing ? 'SYNCHRONIZING...' : 'FINALIZE & PRINT'}
          </button>
        </div>
      </div>
    </div>
  );
}
