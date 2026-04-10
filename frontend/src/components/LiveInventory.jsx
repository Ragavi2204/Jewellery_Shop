import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, Package, ShoppingBag, RefreshCw } from 'lucide-react'

const LiveInventory = ({ refreshKey }) => {
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSummary()
  }, [refreshKey])

  const fetchSummary = async () => {
    setLoading(true)
    try {
      // Fetch raw stock to override grouping completely
      const { data } = await axios.get('/api/reports/stock');
      if (data.status === 'success') {
        const stockData = data.data || [];
        const grouped = {};

        stockData.forEach(p => {
          if (!p.category) return; // Skip broken rows
          if (!p.weight && !p.quantity) return; // Skip completely empty

          const qty = parseInt(p.quantity || 0);
          const weight = parseFloat(p.weight || 0);

          if (qty === 0 && weight === 0) return; // Remove zero values

          let key = p.category.trim();

          // 🔴 2. GROUPING LOGIC FIX:
          if (key === 'கொலுசு') {
            key = 'கொலுசு'; // Combine ALL sizes
          } else if (key === 'வெள்ளி பொருட்கள்' || key === 'வெள்ளி') {
            key = (p.subcategory && p.subcategory.trim() !== '' && p.subcategory !== 'வகைகள்' && p.subcategory !== 'அளவு') ? p.subcategory : key;
          } else if (key === 'மற்றவை') {
            key = (p.variant && p.variant.trim() !== '') ? p.variant : key;
          } else {
            // For கொடி, மெட்டி, தண்டை, etc. (Direct category group)
            key = key; 
          }

          // Clean up stray words
          key = key.replace("வகைகள்", "").replace("பொருட்கள்", "").trim();
          
          // Safety skip — only skip truly broken keys (empty)
          if (!key) return;

          if (!grouped[key]) {
            grouped[key] = { categoryName: key, totalQuantity: 0, totalWeight: 0 };
          }
          grouped[key].totalQuantity += qty;
          grouped[key].totalWeight += weight;
        });

        const sorted = Object.values(grouped).sort((a, b) => a.categoryName.localeCompare(b.categoryName));
        setSummary(sorted);
      }
    } catch (e) {
      console.error('Summary fetch failed', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="flex-between mb-24">
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--gold)' }}>இருப்பு</h2>
          <p className="text-sub">அனைத்துப் பொருட்களின் நேரலை இருப்பு நிலவரம்</p>
        </div>
        <div className="flex" style={{ gap: '12px' }}>
          <button className="btn" onClick={fetchSummary} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync Stock
          </button>
          <div className="stat-icon-large">
            <BarChart3 size={32} />
          </div>
        </div>
      </div>

      <div className="card shadow-lg" style={{ border: '1px solid var(--border)' }}>
        <div className="card-header-gold">இருப்பு விவரங்கள்</div>
        
        <div className="table-wrap">
          <table className="flat-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.05)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '18px 24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>பெயர்</th>
                <th style={{ textAlign: 'center', padding: '18px 24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>எண்ணிக்கை</th>
                <th style={{ textAlign: 'right', padding: '18px 24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>எடை</th>
              </tr>
            </thead>
            <tbody>
              {summary
                .filter(item => item.categoryName && ((item.totalQuantity || 0) > 0 || (item.totalWeight || 0) > 0))
                .map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  <td style={{ padding: '20px 24px', fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>
                    {item.categoryName}
                  </td>
                  <td style={{ textAlign: 'center', padding: '20px 24px', fontWeight: 700, fontSize: '16px', color: 'var(--text-main)' }}>
                    {item.totalQuantity || 0} <span style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 600 }}>pcs</span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '20px 24px', fontWeight: 900, fontSize: '18px', color: 'var(--gold)' }}>
                    {(item.totalWeight || 0).toFixed(3)}<span style={{ fontSize: '11px', marginLeft: '4px', color: 'var(--text-sub)', fontWeight: 600 }}>g</span>
                  </td>
                </tr>
              ))}
              {summary.filter(item => item.categoryName && ((item.totalQuantity || 0) > 0 || (item.totalWeight || 0) > 0)).length === 0 && !loading && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-sub)' }}>
                    <Package size={48} style={{ opacity: 0.1, marginBottom: '16px' }} /><br />
                    இருப்பு தரவு எதுவும் இல்லை
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot style={{ background: 'rgba(255,215,0,0.1)', borderTop: '2px solid var(--gold)' }}>
              <tr>
                <td style={{ padding: '24px', fontWeight: 950, fontSize: '18px', color: 'var(--text-main)' }}>மொத்த இருப்பு</td>
                <td style={{ textAlign: 'center', padding: '24px', fontWeight: 950, fontSize: '20px', color: 'var(--text-main)' }}>
                  {summary.filter(i => i.categoryName && ((i.totalQuantity || 0) > 0 || (i.totalWeight || 0) > 0)).reduce((s, i) => s + (i.totalQuantity || 0), 0)} <span style={{ fontSize: '12px' }}>pcs</span>
                </td>
                <td style={{ textAlign: 'right', padding: '24px', fontWeight: 950, fontSize: '24px', color: 'var(--gold)' }}>
                  {summary.filter(i => i.categoryName && ((i.totalQuantity || 0) > 0 || (i.totalWeight || 0) > 0)).reduce((s, i) => s + (i.totalWeight || 0), 0).toFixed(3)}<span style={{ fontSize: '14px' }}>g</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LiveInventory
