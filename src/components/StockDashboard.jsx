import React from 'react'

const StockDashboard = ({ products = [] }) => {
  const totalWeight = products.reduce((s, p) => s + (parseFloat(p.weight) || 0), 0)

  return (
    <div className="animate-fade-in">
      <div className="flex-between mb-16">
        <div>
          <h1 style={{ margin: 0 }}>இருப்பு விவரங்கள்</h1>
          <p className="text-sub" style={{ marginTop: '4px' }}>Live Stock · {products.length} வகைகள் · மொத்த எடை {totalWeight.toFixed(2)}g</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-sub)' }}>
          தகவல் இல்லை — Add stock to see it here.
        </div>
      ) : (
        <div className="stock-cards-grid">
          {products.map(item => (
            <div key={item.id} className="stock-card">
              <div className="stock-card-name">{item.variant || item.subcategory}</div>
              <div className="stock-card-detail">
                {item.category}{item.detail ? ` · ${item.detail}` : ''}
              </div>
              <div>
                <span className="stock-card-weight">{parseFloat(item.weight || 0).toFixed(2)}</span>
                <span className="stock-card-unit"> g</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StockDashboard
