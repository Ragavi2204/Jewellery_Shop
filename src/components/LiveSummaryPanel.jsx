import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, Package, Layers } from 'lucide-react'

const LiveSummaryPanel = ({ refreshKey }) => {
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSummary()
  }, [refreshKey])

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/reports/category-summary')
      if (data.status === 'success') {
        setSummary(data.data)
      }
    } catch (e) {
      console.error('Summary fetch failed', e)
    } finally {
      setLoading(false)
    }
  }

  const totalQty = summary.reduce((s, i) => s + (i.totalQuantity || 0), 0)
  const totalWeight = summary.reduce((s, i) => s + (i.totalWeight || 0), 0)

  return (
    <div className="live-summary-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gold)', marginBottom: '4px' }}>
          <BarChart3 size={20} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Live Inventory</h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-sub)', margin: 0 }}>Category-wise real-time summary</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <thead>
            <tr style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-sub)', letterSpacing: '0.5px' }}>
              <th style={{ textAlign: 'left', padding: '0 8px' }}>Product Name</th>
              <th style={{ textAlign: 'center', padding: '0 8px' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '0 8px' }}>Weight</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, idx) => (
              <tr key={idx} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 10px', fontWeight: 800, borderRadius: '8px 0 0 8px', fontSize: '14px', color: 'var(--text-main)', width: '60%' }}>
                  {item.categoryName.replace("வகைகள்", "").replace("பொருட்கள்", "").trim()}
                </td>
                <td style={{ textAlign: 'center', padding: '14px 10px', fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>
                  {item.totalQuantity} <span style={{ fontSize: '10px', color: 'var(--text-sub)' }}>pcs</span>
                </td>
                <td style={{ textAlign: 'right', padding: '14px 10px', fontWeight: 900, borderRadius: '0 8px 8px 0', color: 'var(--gold)', fontSize: '15px' }}>
                  {item.totalWeight.toFixed(2)}<span style={{ fontSize: '10px', marginLeft: '2px' }}>g</span>
                </td>
              </tr>
            ))}
            {summary.length === 0 && !loading && (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-sub)' }}>No data available</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '20px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border)' }}>
        <div className="flex-between" style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Total Items:</span>
          <span style={{ fontWeight: 700 }}>{totalQty} Pcs</span>
        </div>
        <div className="flex-between">
          <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Total Weight:</span>
          <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: '18px' }}>{totalWeight.toFixed(3)}g</span>
        </div>
      </div>
    </div>
  )
}

export default LiveSummaryPanel
