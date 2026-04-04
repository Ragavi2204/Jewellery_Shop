import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Package, ShoppingBag, Trash2, Search, TrendingUp, Table as TableIcon } from 'lucide-react'

const Reports = ({ products = [], soldItems = [], bills = [], role, deleteProduct, deleteSale }) => {
  const [filter, setFilter] = useState('')
  const [categorySummary, setCategorySummary] = useState([])

  useEffect(() => {
    fetchCategorySummary()
  }, [products]) // Refetch when products change

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

  const filtered = products.filter(p =>
    (p.category || '').toLowerCase().includes(filter.toLowerCase()) ||
    (p.variant   || '').toLowerCase().includes(filter.toLowerCase()) ||
    (p.subcategory || '').toLowerCase().includes(filter.toLowerCase())
  )

  const totalStockWeight = products.reduce((s, p) => s + (p.weight || 0), 0)
  const totalStockQty    = products.reduce((s, p) => s + (p.quantity || 0), 0)
  const totalItemsSold   = soldItems.reduce((s, i) => s + (i.quantity || 0), 0)
  const totalRevenue     = soldItems.reduce((s, i) => s + (i.total || 0), 0)

  return (
    <div className="animate-fade-in">
      <div className="flex-between mb-16">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Reports & Analytics</h2>
          <p className="text-sub">Full Inventory & Sales History</p>
        </div>
      </div>

      {/* Mini Stats Belt */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card flex" style={{ gap: 12, padding: '12px 20px' }}>
          <div className="stat-icon" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold)', marginBottom: 0 }}><Package size={18}/></div>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-sub)' }}>Stock Weight</div>
            <div className="fw-600" style={{ fontSize: '13px' }}>{totalStockWeight.toFixed(2)}g</div>
          </div>
        </div>
        <div className="card flex" style={{ gap: 12, padding: '12px 20px' }}>
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', marginBottom: 0 }}><ShoppingBag size={18}/></div>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-sub)' }}>Items Sold</div>
            <div className="fw-600">{totalItemsSold} pcs</div>
          </div>
        </div>
        <div className="card flex" style={{ gap: 12, padding: '12px 20px' }}>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', marginBottom: 0 }}><TrendingUp size={18}/></div>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-sub)' }}>Unique Customers</div>
            <div className="fw-600">{new Set(soldItems.map(s => s.customerName)).size} Persons</div>
          </div>
        </div>
        <div className="card flex" style={{ gap: 12, padding: '12px 20px' }}>
          <div className="stat-icon" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold)', marginBottom: 0 }}><TrendingUp size={18}/></div>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-sub)' }}>Net Revenue</div>
            <div className="fw-600">₹{totalRevenue.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Inventory Report */}
        <div className="card shadow-lg" style={{ border: '1px solid var(--border)' }}>
          <div className="card-header-gold">
            <div className="search-container">
              <span style={{ fontSize: '16px', fontWeight: 800 }}>இருப்பு அறிக்கை</span>
              <div className="search-input-wrapper">
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', zIndex: 1 }} />
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="தேடுக..." 
                  value={filter} 
                  onChange={e => setFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="table-wrap" style={{ maxHeight: '550px', overflowY: 'auto' }}>
            <table className="flat-table">
              <thead>
                <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--card)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '14px 16px' }}>Product / விவரம்</th>
                  <th style={{ padding: '14px 16px' }}>Size / அளவு</th>
                  <th style={{ padding: '14px 16px' }}>Category</th>
                  <th style={{ textAlign: 'right', padding: '14px 16px' }}>Stock Detail</th>
                  <th style={{ textAlign: 'center', padding: '14px 16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered
                  .filter(p => p.variant && ((p.quantity || 0) > 0 || (p.weight || 0) > 0))
                  .map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)' }}>
                        {p.variant.replace("வகைகள்", "").replace("பொருட்கள்", "").trim()}
                      </div>
                      {p.detail && p.detail.trim() !== '' && (
                        <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700, marginTop: '2px' }}>
                          {p.detail}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)' }}>
                      {p.subcategory && p.subcategory.trim() !== '' && p.subcategory !== 'அளவு' && p.subcategory !== 'வகைகள்'
                        ? p.subcategory
                        : '—'
                      }
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)' }}>
                      {p.category.replace("வெள்ளி ", "").replace("வகைகள்", "").replace("பொருட்கள்", "").trim()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '14px 16px' }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '14px' }}>
                        {p.quantity || 0} <span style={{fontSize: '10px'}}>pcs</span>
                        &nbsp;&bull;&nbsp;
                        {(p.weight || 0).toFixed(3)}<span style={{fontSize: '10px'}}>g</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                      <button 
                        onClick={() => deleteProduct(p.id, p)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--danger)' }}
                        title="Delete Product"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales Log */}
        <div className="card shadow-lg" style={{ border: '1px solid var(--border)' }}>
          <div className="card-header-gold">விற்பனை வரலாறு (Sales History)</div>
          <div className="table-wrap" style={{ maxHeight: '550px', overflowY: 'auto' }}>
            <table className="flat-table">
              <thead>
                <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--card)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px' }}>Date | Customer</th>
                  <th style={{ padding: '16px 20px' }}>Item sold</th>
                  <th style={{ textAlign: 'right', padding: '16px 20px' }}>Amount</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {soldItems.slice(-40).reverse().map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 800, fontSize: '14px' }}>{s.customerName || 'Walk-in'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 600 }}>{s.date?.split('T')[0]}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{s.variant.replace("வகைகள்", "").replace("பொருட்கள்", "").trim()}</div>
                      <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700 }}>{s.category.replace("வெள்ளி ", "").replace("வகைகள்", "").replace("பொருட்கள்", "").trim()}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '16px 20px' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 900, fontSize: '16px' }}>₹{s.total?.toLocaleString('en-IN')}</span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '16px 20px' }}>
                      <button 
                        onClick={() => deleteSale(s.id, s)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--danger)' }}
                        title="Delete Sale"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
