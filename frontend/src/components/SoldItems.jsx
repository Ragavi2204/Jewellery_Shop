import React from 'react'

const SoldItems = ({ soldItems = [] }) => {
  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '8px' }}>விற்றவை</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        விற்கப்பட்ட நகைகளின் முழுமையான அறிக்கை.
      </p>

      {/* Table Card */}
      <div className="premium-card">
        {soldItems.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: '#888', fontSize: '16px', fontWeight: 'bold' }}>
            விற்பனை இல்லை
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  {['வகை', 'துணை வகை', 'விவரம்', 'அளவு', 'விலை (₹)', 'தேதி'].map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(soldItems || []).map((s, idx) => (
                  <tr
                    key={idx}
                    className="table-row"
                  >
                    <td>{s?.category ?? '—'}</td>
                    <td>{s?.subcategory ?? '—'}</td>
                    <td>{s?.variant ?? '—'}</td>
                    <td style={{ fontWeight: 'bold', color: '#2ECC71' }}>{s?.quantity ?? '—'}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--gold)' }}>
                      ₹ {(s?.price ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s?.date ?? '—'}</td>
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

export default SoldItems
