import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Package, ShoppingBag, Layers, AlertTriangle, TrendingUp, Table as TableIcon } from 'lucide-react'

const Dashboard = ({ products = [], sales = [] }) => {
  const [categorySummary, setCategorySummary] = useState([])

  useEffect(() => {
    fetchCategorySummary()
  }, [products])

  const fetchCategorySummary = async () => {
    try {
      const { data } = await axios.get('/api/reports/category-summary')
      if (data.status === 'success') {
        setCategorySummary(data.data)
      }
    } catch (e) {
      console.error('Fetch category summary failed', e)
    }
  }

  // Aggregate Stats
  const productGroups = {};
  products.forEach(p => {
    const key = `${p.category}-${p.subcategory}-${p.variant}`;
    if (!productGroups[key]) {
      productGroups[key] = { ...p, totalQuantity: 0, totalWeight: 0 };
    }
    productGroups[key].totalQuantity += (p.quantity || 0);
    productGroups[key].totalWeight += (p.weight || 0);
  });
  
  const lowStock = Object.values(productGroups).filter(g => g.totalQuantity < 3);
  
  const totalStockWeight = products.reduce((s, p) => s + (p.weight || 0), 0)
  const totalStockQty    = products.reduce((s, p) => s + (p.quantity || 0), 0)
  const totalSalesCount  = sales.reduce((s, i) => s + (i.quantity || 0), 0) // Total items across all time
  const totalIncome      = sales.reduce((s, i) => s + (i.total || 0), 0)

  const cards = [
    { label: 'மொத்த இருப்பு எடை', sub: 'இருப்பு கிராம்', value: `${totalStockWeight.toFixed(2)}g`, icon: <Package />, color: 'var(--gold)' },
    { label: 'மொத்த இருப்பு அளவு', sub: 'இருப்பில் உள்ளவை', value: `${totalStockQty} pcs`, icon: <Layers />, color: '#60A5FA' },
    { label: 'மொத்த விற்பனை அளவு', sub: 'விற்கப்பட்ட எண்ணிக்கை', value: `${totalSalesCount} pcs`, icon: <ShoppingBag />, color: '#F59E0B' },
    { label: 'மொத்த வருவாய்', sub: "நிகர வருமானம்", value: `₹${totalIncome.toLocaleString('en-IN')}`, icon: <TrendingUp />, color: 'var(--success)' },
  ]

  return (
    <div className="animate-fade-in dashboard-container" style={{ paddingBottom: '40px' }}>
      <div className="flex-between mb-16">
        <div>
          <h2 className="dashboard-title" style={{ fontSize: '26px', fontWeight: 800 }}>வணிக முகப்பு</h2>
          <p className="text-sub">நேரலை புள்ளிவிவரங்கள் மற்றும் மேலாண்மை</p>
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {cards.map((c, i) => (
          <div key={i} className="stat-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div className="stat-icon" style={{ background: `${c.color}12`, color: c.color, width: '48px', height: '48px', borderRadius: '14px' }}>
              {c.icon}
            </div>
            <div className="stat-value" style={{ fontSize: '28px', margin: '12px 0 4px' }}>{c.value}</div>
            <div className="stat-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-sub)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom Sections: Low Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

        {/* Low Stock */}
        <div className="card shadow-md">
          <div className="card-header-gold">Low Stock Alerts</div>
          <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '15px' }}>
            {Object.values(productGroups)
              .filter(g => g.variant && (g.totalQuantity > 0 || g.totalWeight > 0) && g.totalQuantity < 3)
              .length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-sub)' }}>
                <TrendingUp size={40} style={{ opacity: 0.1, marginBottom: '10px' }} /><br />
                Stock Levels are Healthy
              </div>
            ) : (
              Object.values(productGroups)
                .filter(g => g.variant && (g.totalQuantity > 0 || g.totalWeight > 0) && g.totalQuantity < 3)
                .map((p, idx) => (
                <div key={idx} className="flex-between" style={{ padding: '14px', borderRadius: '12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', marginBottom: '10px' }}>
                  <div>
                    <div className="fw-800" style={{ fontSize: 14, color: 'var(--text-main)' }}>{p.variant.replace("வகைகள்", "").replace("பொருட்கள்", "").trim()}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600 }}>{p.category.replace("வெள்ளி ", "").replace("வகைகள்", "").replace("பொருட்கள்", "").trim()}</div>
                  </div>
                  <div style={{ color: 'var(--danger)', fontWeight: 900, fontSize: '15px' }}>{p.totalQuantity} pcs</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
