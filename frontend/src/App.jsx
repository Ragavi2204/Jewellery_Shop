import React, { useState, useEffect, Suspense, lazy } from 'react'
import axios          from 'axios'

const Login          = lazy(() => import('./components/Login'))
const Signup         = lazy(() => import('./components/Signup'))
const Sidebar        = lazy(() => import('./components/Sidebar'))
const Header         = lazy(() => import('./components/Header'))
const AddStock       = lazy(() => import('./components/AddStock'))
const SellDashboard  = lazy(() => import('./components/SellDashboard'))
const Reports        = lazy(() => import('./components/Reports'))
const Dashboard      = lazy(() => import('./components/Dashboard'))
const ForgotPassword = lazy(() => import('./components/ForgotPassword'))
const LiveSummaryPanel = lazy(() => import('./components/LiveSummaryPanel'))
const LiveInventory    = lazy(() => import('./components/LiveInventory'))
import { MASTER_DATA } from './data/masterData'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const CATEGORIES = Object.keys(MASTER_DATA)

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tas_user')
    return saved ? JSON.parse(saved) : null
  })
  const [showSignup, setShowSignup] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [theme, setTheme]         = useState(() => localStorage.getItem('tas_theme') || 'dark')
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [undoData, setUndoData]   = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem('tas_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('tas_user')
    }
  }, [user])

  const [products,  setProducts]  = useState([])
  const [soldItems, setSoldItems] = useState([])
  const [bills,     setBills]     = useState([])

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme'
    localStorage.setItem('tas_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark')

  useEffect(() => {
    if (user) { fetchProducts(); fetchSales() }
  }, [user])

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products')
      if (data.status === 'success') {
        setProducts(data.data)
        setLastUpdate(Date.now())
      }
    } catch (e) { console.error('Fetch products failed', e) }
  }

  const fetchSales = async () => {
    try {
      const { data } = await axios.get('/api/sales')
      if (data.status === 'success') {
        setSoldItems(data.data);
        setBills(data.data);
        setLastUpdate(Date.now())
      }
    } catch (e) { console.error('Fetch sales failed', e) }
  }

  const addProduct = async (newProduct) => {
    try {
      const { data } = await axios.post('/api/products', newProduct)
      if (data.status === 'error') throw new Error(data.message)
      await fetchProducts()
    } catch (e) {
      throw new Error(e.response?.data?.message || e.message)
    }
  }

  const deleteProduct = async (id, productObj) => {
    if (!window.confirm("Are you sure you want to completely delete this product?")) return;
    await axios.delete(`/api/products/${id}`)
    await fetchProducts()
    setUndoData({ type: 'product', data: productObj, message: "Item deleted" })
    setTimeout(() => setUndoData(null), 7000)
  }

  const deleteSale = async (id, saleObj) => {
    if (!window.confirm("Are you sure you want to delete this sale? Stock will be restored.")) return;
    await axios.delete(`/api/sales/${id}`)
    await fetchSales()
    await fetchProducts()
    setUndoData({ type: 'sale', data: saleObj, message: "Sale deleted and stock restored" })
    setTimeout(() => setUndoData(null), 7000)
  }

  const handleUndo = async () => {
    if (!undoData) return;
    try {
      if (undoData.type === 'product') {
        const p = { ...undoData.data };
        delete p.id;
        await addProduct(p);
      } else if (undoData.type === 'sale') {
        const s = { ...undoData.data };
        delete s.id;
        await axios.post('/api/sales', s);
        await fetchSales();
        await fetchProducts();
      }
      setUndoData(null);
    } catch (e) {
      alert("Undo failed. The stock ID might have been altered.");
    }
  }

  const processSale = async (customerName, mobile, cartItems) => {
    try {
      for (const item of cartItems) {
        const { data } = await axios.post('/api/sales', {
          ...item,
          customerName,
          date: new Date().toISOString().split('T')[0]
        })
        if (data.status === 'error') throw new Error(data.message || 'Sale failed')
      }
      await fetchProducts()
      await fetchSales()
      return { id: `TAS-${Date.now()}`, customerName, mobile, items: cartItems, date: new Date().toLocaleDateString('en-IN') }
    } catch (e) {
      throw new Error(e.response?.data?.message || e.message)
    }
  }

  if (!user) {
    return (
      <Suspense fallback={<div className="loading-screen">Loading Auth...</div>}>
        {showSignup ? (
          <Signup onBack={() => setShowSignup(false)} onSignupSuccess={() => setShowSignup(false)} />
        ) : showForgot ? (
          <ForgotPassword onBack={() => setShowForgot(false)} />
        ) : (
          <Login onLogin={setUser} onShowSignup={() => setShowSignup(true)} onShowForgot={() => setShowForgot(true)} />
        )}
      </Suspense>
    )
  }

  const pages = {
    dashboard: <Dashboard      products={products}  sales={soldItems} />,
    add:       <AddStock       products={products}  onAddProduct={addProduct} />,
    sell:      <SellDashboard  products={products}  processSale={processSale} bills={bills} />,
    reports:   <Reports        products={products}  soldItems={soldItems} bills={bills} role={user?.role} deleteProduct={deleteProduct} deleteSale={deleteSale} />,
    inventory: <LiveInventory   refreshKey={lastUpdate} />
  }

  const currentPage = pages[activeTab] || pages.dashboard

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} role={user?.role || 'admin'} isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />}
      <div className="app-content">
        <Suspense fallback={<div className="loading-screen">Loading...</div>}>
          <Header username={user?.name || 'User'} theme={theme} toggleTheme={toggleTheme} onLogout={() => setUser(null)} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="main-scroll-area animate-fade-in" style={{ position: 'relative' }}>
            {currentPage || <div className="p-24">Page not found</div>}
            {undoData && (
              <div className="toast-success shadow-lg" style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, background: 'var(--card)', color: 'var(--text-main)', border: '1px solid var(--gold)', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Item deleted – Undo?</span>
                <button className="btn btn-gold" onClick={handleUndo} style={{ height: '32px', padding: '0 14px', fontSize: '13px' }}>UNDO</button>
              </div>
            )}
          </main>
        </Suspense>
      </div>
    </div>
  )
}
