import React from 'react'
import { Package, Activity } from 'lucide-react'
import { CATEGORIES } from '../App'

const AuditPage = ({ products = [], soldItems = [] }) => {
  const totalQuantity = (products || []).reduce((sum, p) => sum + (parseInt(p.quantity, 10) || 0), 0)
  const totalSold = (soldItems || []).reduce((sum, s) => sum + (parseInt(s.quantity, 10) || 0), 0)

  const categoryStats = CATEGORIES.map(category => {
    const available = (products || []).filter(p => p.category === category).reduce((sum, p) => sum + (parseInt(p.quantity, 10) || 0), 0)
    const sold = (soldItems || []).filter(s => s.category === category).reduce((sum, s) => sum + (parseInt(s.quantity, 10) || 0), 0)
    return { category, available, sold }
  }).filter(stat => stat.available > 0 || stat.sold > 0) // Only show categories that have activity

  const cardStyle = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', gap: '12px'
  }

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '8px' }}>கணக்காய்வு அறிக்கை</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
        நிறுவனத்தின் மொத்த இருப்பு மற்றும் விற்பனை சுருக்கம்.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr)', gap: '24px', marginBottom: '30px' }}>
        
        <div className="premium-card" style={cardStyle}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(52,152,219,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={26} color="#3498DB" />
          </div>
          <h2 style={{ color: 'var(--text-secondary)', margin: 0 }}>மொத்த இருப்பு (அளவு)</h2>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: '1' }}>{totalQuantity}</div>
        </div>

        <div className="premium-card" style={cardStyle}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(46,204,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={26} color="#2ECC71" />
          </div>
          <h2 style={{ color: 'var(--text-secondary)', margin: 0 }}>மொத்த விற்பனை (அளவு)</h2>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2ECC71', lineHeight: '1' }}>{totalSold}</div>
        </div>

      </div>

      <div className="premium-card">
        <h2 style={{ marginBottom: '20px' }}>வகை வாரியான கணக்கு</h2>
        
        {categoryStats.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
            தகவல் இல்லை
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr>
                  {['வகை', 'இருப்பு அளவு', 'விற்ற அளவு'].map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categoryStats.map(stat => (
                  <tr key={stat.category} className="table-row">
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{stat.category}</td>
                    <td style={{ padding: '12px', color: '#3498DB', fontWeight: 'bold' }}>{stat.available}</td>
                    <td style={{ padding: '12px', color: '#2ECC71', fontWeight: 'bold' }}>{stat.sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditPage
