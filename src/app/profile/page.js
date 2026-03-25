'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Mail, LogOut, Lock, UserPlus, LogIn, ShoppingBag, KeyRound, ShieldCheck } from 'lucide-react';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login'); // login | register | reset | update
  const [loginType, setLoginType] = useState('user'); // user | admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 1. URL Parameter Sync
  useEffect(() => {
    const v = searchParams.get('view');
    const t = searchParams.get('type');
    if (v) setView(v);
    if (t) setLoginType(t);
  }, [searchParams]);

  useEffect(() => {
    // 2. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserOrders(session.user.id);
      }
      setLoading(false);
      
      // 2. Check for manual reset hash in URL
      if (window.location.hash.includes('type=recovery')) {
        setView('update');
      }
    });

    // 3. Auth State Observer
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserOrders(session.user.id);
      if (_event === 'PASSWORD_RECOVERY') {
        setView('update');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (view === 'register') {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { 
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin 
          }
        });
        if (error) throw error;
        setMessage({ text: 'Registration Successful! You can now login.', type: 'success' });
        setView('login');
      } else if (view === 'login') {
        if (loginType === 'admin') {
          const ADMIN_EMAIL = 'admin@shoppify.com';
          const ADMIN_PASS = 'admin123';
          if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            localStorage.setItem('shoppify_admin_auth', 'true');
            router.push('/admin');
            return;
          } else {
            throw new Error('INVALID_ADMIN_CREDENTIALS: Access Denied.');
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        }
      } else if (view === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/profile`,
        });
        if (error) throw error;
        setMessage({ text: 'Success: Recovery link dispatched to your inbox.', type: 'success' });
      } else if (view === 'update') {
        if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (password !== confirmPassword) throw new Error('Verification Mismatch: Passwords do not match.');
        
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        
        setMessage({ text: 'Access Secret Updated. Authenticate with new credentials.', type: 'success' });
        setTimeout(() => setView('login'), 2000);
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchUserOrders = async (userId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error) setUserOrders(data || []);
  };

  if (loading && !message.text) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Dashboard View (only if not in update mode)
  if (session && view !== 'update') {
    const name = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
    return (
      <div className="max-w-4xl mx-auto py-8 md:py-12 px-4">
        <div className="bg-white border border-gray-200 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden text-gray-800">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 md:p-10 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User size={40} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black italic tracking-tighter">HI, {name.toUpperCase()}</h1>
                <p className="opacity-80 break-all text-[10px] font-black tracking-widest uppercase mt-1">{session.user.email}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-10">
            {showOrders ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em]">Purchase_History</h3>
                  <button onClick={() => setShowOrders(false)} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Back_to_Node</button>
                </div>
                
                <div className="space-y-4">
                  {userOrders.length > 0 ? (
                    userOrders.map((order) => (
                      <div key={order.id} className="p-5 border border-gray-100 rounded-2xl flex items-center justify-between group hover:bg-gray-50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <ShoppingBag size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest">{order.product_name}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">#{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black italic tracking-tighter">${order.product_price?.toFixed(2)}</p>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">No_Archives_Found</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div className="p-6 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer text-center group" onClick={() => setShowOrders(true)}>
                  <ShoppingBag className="text-blue-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest leading-none">Orders</h3>
                  <p className="text-[9px] text-gray-400 mt-1.5 uppercase font-bold tracking-widest">Purchase Status</p>
                </div>
                <div className="p-6 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer text-center group">
                  <User className="text-blue-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest leading-none">Profile</h3>
                  <p className="text-[9px] text-gray-400 mt-1.5 uppercase font-bold tracking-widest">Identity Config</p>
                </div>
                <div className="sm:col-span-2 md:col-span-1 p-6 border border-gray-100 rounded-2xl hover:bg-red-50 transition-colors cursor-pointer text-center group border-dashed" onClick={handleLogout}>
                  <LogOut className="text-red-500 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 leading-none">Sign_Out</h3>
                  <p className="text-[9px] text-gray-400 mt-1.5 uppercase font-bold tracking-widest">Secure Termination</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Auth Forms
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-gray-900">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
            {view === 'login' ? (loginType === 'user' ? 'SHOPPIFY_LOGIN' : 'ADMIN_TERMINAL') : 
             view === 'register' ? 'CREATE_ACCOUNT' : 
             view === 'reset' ? 'SECURE_RESET' : 'UPDATE_SECRET'}
          </h2>
          <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {view === 'login' ? (loginType === 'user' ? 'Customer Authentication Entry' : 'Encrypted Administrative Access') : 
             view === 'register' ? 'Join the Shoppify community' :
             view === 'reset' ? 'Request Recovery Link' : 'Set your new access secret'}
          </p>
        </div>

        {view === 'login' && (
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            <button onClick={() => setLoginType('user')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginType === 'user' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>User Login</button>
            <button onClick={() => setLoginType('admin')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginType === 'admin' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Admin Login</button>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {view === 'register' && (
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Full_Identity_Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input type="text" required className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm uppercase font-bold" placeholder="JOHN DOE" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            </div>
          )}
          
          {view !== 'update' && (
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Email_Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={16} />
                <input type="email" required className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm uppercase font-bold" placeholder="ADMIN@SHOPPIFY.COM" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          )}

          {view !== 'reset' && (
            <>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">{view === 'update' ? 'New_Access_Secret' : 'Access_Secret'}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input type="password" required className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm uppercase font-bold" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              {view === 'update' && (
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Confirm_New_Secret</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    <input type="password" required className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm uppercase font-bold" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
              )}
            </>
          )}

          {message.text && (
            <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border animate-pulse ${message.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={loading} className={`w-full py-5 px-4 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${loginType === 'admin' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 
              view === 'login' ? (loginType === 'user' ? 'Authenticate' : 'Override System') : 
              view === 'register' ? 'Initialize' : 
              view === 'reset' ? 'Request Secret' : 'Update Secret'
            }
          </button>
        </form>

        <div className="mt-8 space-y-4 text-center">
          {view === 'login' ? (
            <>
              {loginType === 'user' && (
                <button onClick={() => setView('reset')} className="text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest block mx-auto">Forgot Secret?</button>
              )}
              <button onClick={() => setView('register')} className="text-[11px] font-black text-blue-600 hover:underline transition-colors uppercase tracking-widest">Create New Identity</button>
            </>
          ) : (
            <button onClick={() => { setView('login'); setMessage({ text: '', type: '' }); }} className="text-[11px) font-black text-blue-600 hover:underline transition-colors uppercase tracking-widest">Back to Sign In</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
