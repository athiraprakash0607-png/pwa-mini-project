'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Trash2, Edit3, X, Save, Package, LayoutDashboard, Settings, 
  LogOut, DollarSign, List, BarChart, ShoppingBag, ShieldCheck, Image as ImageIcon
} from 'lucide-react';

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', image_url: '', description: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [session, setSession] = useState(null);

  useEffect(() => {
    const isAuth = localStorage.getItem('shoppify_admin_auth') === 'true';
    if (isAuth) setIsAdminAuthenticated(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (isAuth) fetchProducts();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAdminAuth = (e) => {
    e.preventDefault();
    setAuthError('');
    const PREDEFINED_ADMIN_EMAIL = 'admin@shoppify.com';
    const PREDEFINED_ADMIN_PASS = 'admin123';

    if (adminEmail === PREDEFINED_ADMIN_EMAIL && adminPassword === PREDEFINED_ADMIN_PASS) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('shoppify_admin_auth', 'true');
      fetchProducts();
    } else {
      setAuthError('INVALID_CREDENTIALS: Access Denied.');
    }
  };

  const handleAdminLogout = async () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('shoppify_admin_auth');
    await supabase.auth.signOut();
  };

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error) setProducts(data || []);
    setLoading(false);
  }

  async function handleImageUpload(e, isEditing = false) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      const fallbackUrl = prompt('UPLOAD_ERROR: ' + uploadError.message + '\n\nPaste a public image URL here:', '🛍️');
      if (fallbackUrl) {
         if (isEditing) setEditingProduct({ ...editingProduct, image_url: fallbackUrl });
         else setNewProduct({ ...newProduct, image_url: fallbackUrl });
      }
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
    if (isEditing) setEditingProduct({ ...editingProduct, image_url: publicUrl });
    else setNewProduct({ ...newProduct, image_url: publicUrl });
    setLoading(false);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    if (!newProduct.image_url) { alert('ERROR: IMAGE_REQUIRED'); return; }

    const { error } = await supabase.from('products').insert([
      { ...newProduct, price: parseFloat(newProduct.price) }
    ]);
    if (!error) {
      setNewProduct({ name: '', price: '', category: '', image_url: '', description: '' });
      fetchProducts();
    } else alert(error.message);
  }

  async function handleUpdateProduct(e) {
    e.preventDefault();
    const { error } = await supabase.from('products')
      .update({ 
        name: editingProduct.name,
        price: parseFloat(editingProduct.price),
        category: editingProduct.category,
        description: editingProduct.description,
        image_url: editingProduct.image_url
      })
      .eq('id', editingProduct.id);

    if (!error) {
      setEditingProduct(null);
      fetchProducts();
    } else alert(error.message);
  }

  async function handleDelete(id) {
    if (!confirm('CONFIRM_PERMANENT_DELETION?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchProducts();
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-md w-full bg-white p-10 border border-gray-100 shadow-2xl rounded-[2.5rem] text-gray-900">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Admin Terminal</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Restricted Access Required</p>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Login_Terminal</label>
              <input required type="email" placeholder="admin@shoppify.com" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:ring-2 focus:ring-red-500 outline-none transition-all uppercase font-bold" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Access_Key</label>
              <input required type="password" placeholder="••••••••" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:ring-2 focus:ring-red-500 outline-none transition-all" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
            </div>
            {authError && <div className="p-4 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-xl text-center italic">{authError}</div>}
            <button className="w-full py-5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all">Connect_Terminal</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="flex flex-col lg:flex-row gap-16 md:gap-24">
          
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0 space-y-12">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center">
                      <ShieldCheck size={20} />
                   </div>
                   <div>
                      <h1 className="text-2xl font-black tracking-tighter italic uppercase leading-none">Admin_Panel</h1>
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em] mt-1">Level_04_Privilege</p>
                   </div>
                </div>
             </div>
             
             <nav className="space-y-1">
                {[
                   { icon: LayoutDashboard, label: 'Overview' },
                   { icon: Package, label: 'Live Inventory', active: true },
                   { icon: ShoppingBag, label: 'Transactions' },
                   { icon: BarChart, label: 'Analytics' },
                   { icon: Settings, label: 'Node Settings' }
                ].map((item, idx) => (
                   <button key={idx} className={`w-full flex items-center gap-4 p-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${item.active ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
                      <item.icon size={16} /> {item.label}
                   </button>
                ))}
             </nav>

             <button onClick={handleAdminLogout} className="w-full flex items-center justify-center gap-3 p-5 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 bg-red-50 rounded-2xl hover:bg-red-100 transition-all">
                <LogOut size={16} /> Termination
             </button>
          </div>

          {/* Main Dashboard */}
          <div className="flex-1 space-y-20">
             {/* Stats Header */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Inventory_Total</p>
                   <p className="text-5xl font-black italic tracking-tighter leading-none">{products.length}<span className="text-blue-600 text-xl ml-2">Units</span></p>
                </div>
                <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Stock_Value</p>
                   <p className="text-5xl font-black italic tracking-tighter leading-none">${products.reduce((acc, p) => acc + p.price, 0).toFixed(0)}</p>
                </div>
                <div className="p-8 bg-gray-900 text-white rounded-[2rem] shadow-2xl shadow-gray-900/10 animate-fade-in">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Live_Traffic</p>
                   <p className="text-5xl font-black italic tracking-tighter leading-none">ACTIVE</p>
                </div>
             </div>

             {/* Functional Area: Add / Edit */}
             <div className="bg-white p-6 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                <div className="flex items-center gap-4 mb-12">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
                      <Plus size={24} />
                   </div>
                   <div>
                      <h2 className="text-xl font-black italic uppercase tracking-tighter underline decoration-blue-500 decoration-4 underline-offset-4">{editingProduct ? 'EDIT_INVENTORY_RECORD' : 'NEW_INVENTORY_REGISTRATION'}</h2>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">Database Commit Required</p>
                   </div>
                   {editingProduct && (
                     <button onClick={() => setEditingProduct(null)} className="ml-auto p-2 text-gray-400 hover:text-red-500"><X size={20}/></button>
                   )}
                </div>

                <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Archive_Title</label>
                      <input required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold uppercase outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-600 transition-all" value={editingProduct ? editingProduct.name : newProduct.name} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Market_Value (USD)</label>
                      <input required type="number" step="0.01" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold uppercase outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-600 transition-all font-mono" value={editingProduct ? editingProduct.price : newProduct.price} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Category_Node</label>
                      <select required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black uppercase outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer appearance-none" value={editingProduct ? editingProduct.category : newProduct.category} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}>
                         <option value="">SELECT_NODE</option>
                         <option value="Men&apos;s Clothing">MEN&apos;S_CLOTHING</option>
                         <option value="Women&apos;s Clothing">WOMEN&apos;S_CLOTHING</option>
                         <option value="Electronics">ELECTRONICS_ARCHIVE</option>
                         <option value="Other">OTHER_SELECTIONS</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Visual_Asset (Image)</label>
                      <div className="relative h-16 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden flex items-center px-6">
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleImageUpload(e, !!editingProduct)} />
                         <span className="text-[10px] font-black uppercase text-blue-600 truncate mr-auto">{(editingProduct ? editingProduct.image_url : newProduct.image_url) ? 'ASSET_READY' : 'Click_to_Upload'}</span>
                         <ImageIcon size={18} className="text-gray-300" />
                      </div>
                   </div>
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Detailed_Specifications</label>
                      <textarea required rows="4" className="w-full p-6 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold uppercase outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-600 transition-all resize-none leading-relaxed" value={editingProduct ? editingProduct.description : newProduct.description} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} />
                   </div>
                   <button className={`md:col-span-2 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl ${editingProduct ? 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-black' : 'bg-gray-900 text-white shadow-gray-900/20 hover:bg-blue-600'}`}>
                      {editingProduct ? <><Save size={18} /> Update_Database_Entry</> : <><Package size={18} /> Commit_New_Inventory</>}
                   </button>
                </form>
             </div>

             {/* Inventory List Table */}
             <div className="space-y-8 pb-32">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <List size={18} />
                   </div>
                   <h2 className="text-xl font-black italic uppercase tracking-tighter">Live_Archive</h2>
                </div>
                <div className="overflow-x-auto rounded-[2.5rem] border border-gray-100 bg-white">
                   <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                         <tr>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Archival_Reference</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Product_Title</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Value (USD)</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Category_Node</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Ops</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {products.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                               <td className="p-8"><span className="px-3 py-1 bg-gray-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500">#{p.id.slice(0, 8)}</span></td>
                               <td className="p-8">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
                                       {p.image_url?.startsWith('http') ? <Image src={p.image_url} alt={p.name} fill className="object-cover" /> : <span className="text-xl grayscale opacity-10">{p.image_url || '📦'}</span>}
                                     </div>
                                     <span className="text-xs font-black uppercase tracking-widest text-gray-900 line-clamp-1">{p.name}</span>
                                  </div>
                               </td>
                               <td className="p-8 text-sm font-black italic tracking-tighter">${p.price.toFixed(2)}</td>
                               <td className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{p.category}</td>
                               <td className="p-8 text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button onClick={() => setEditingProduct(p)} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                                        <Edit3 size={16} />
                                     </button>
                                     <button onClick={() => handleDelete(p.id)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                        <Trash2 size={16} />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
