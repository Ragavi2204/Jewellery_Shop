import React from 'react'

const BillModal = ({ bill, onClose }) => {
  if (!bill) return null
  const items = bill.items || []
  
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal-overlay print-modal-overlay">
      <div className="modal-content bill-modal-content" onClick={e => e.stopPropagation()} style={{ 
        width: '210mm', 
        background: '#fff', 
        padding: 0, 
        color: '#000',
        borderRadius: '0',
        boxShadow: '0 0 40px rgba(0,0,0,0.5)',
        margin: '20px auto'
      }}>
        
        <div id="printable-bill" className="bill" style={{ 
          padding: '20mm', 
          minHeight: '297mm', 
          background: '#fff', 
          color: '#000',
          position: 'relative',
          boxSizing: 'border-box'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '3px', color: '#000', margin: 0 }}>TAS JEWELLERS</h1>
            <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '6px', letterSpacing: '1px' }}>PREMIUM GOLD & SILVER ORNAMENTS</div>
            <div style={{ fontSize: '13px', marginTop: '6px' }}>123, Bazaar Street, Salem - 636001 | PH: 98765 43210</div>
            <div style={{ borderBottom: '3px double #000', margin: '25px 0' }} />
          </div>

          {/* Customer & Invoice Details */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px', fontSize: '14px' }}>
            <div>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '12px', marginBottom: '8px', color: '#555' }}>To Customer:</div>
              <div style={{ fontWeight: 800, fontSize: '20px', color: '#000' }}>{bill.customerName || 'Cash Customer'}</div>
              {bill.mobile && <div style={{ marginTop: '6px' }}>Contact: <strong>{bill.mobile}</strong></div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: '8px' }}>Invoice: <strong style={{ fontSize: '16px' }}>#{bill.id?.toString().padStart(5, '0') || 'N/A'}</strong></div>
              <div>Date: <strong>{bill.date || new Date().toLocaleDateString('en-IN')}</strong></div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginBottom: '40px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', borderTop: '2px solid #000' }}>
              <thead>
                <tr style={{ background: '#f8f8f8', borderBottom: '2px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Description of Ornaments</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Qty (Pcs)</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Weight (g)</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Rate/g</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #000' }}>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ fontWeight: 900, fontSize: '15px', color: '#000' }}>{item.variant}</div>
                      <div style={{ fontSize: '11px', color: '#000', marginTop: '4px' }}>{item.detail}</div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px', fontWeight: 600, color: '#000' }}>{item.quantity || 0}</td>
                    <td style={{ textAlign: 'center', padding: '12px', fontWeight: 600, color: '#000' }}>{item.weight?.toFixed(3)}g</td>
                    <td style={{ textAlign: 'center', padding: '12px', color: '#000' }}>{item.pricePerGram?.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', padding: '12px', fontWeight: 800, color: '#000' }}>₹{item.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <div style={{ width: '40%', fontSize: '12px' }}>
              <div style={{ border: '1px solid #000', padding: '10px' }}>
                <div style={{ fontWeight: 800, textDecoration: 'underline', marginBottom: '5px' }}>Transaction Summary:</div>
                <div>Total Pieces: <strong>{items.reduce((s, i) => s + (i.quantity || 0), 0)} Pcs</strong></div>
                <div>Total Weight: <strong>{items.reduce((s, i) => s + (i.weight || 0), 0).toFixed(3)} g</strong></div>
              </div>
            </div>
            
            <div style={{ width: '320px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ccc', color: '#000' }}>
                <span style={{ fontWeight: 600 }}>Gross Total Value:</span>
                <span style={{ fontWeight: 800 }}>₹{items.reduce((s, i) => s + (i.subtotal || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ccc', color: '#000' }}>
                <span style={{ fontWeight: 600 }}>Discount Allowed:</span>
                <span style={{ fontWeight: 800 }}>- ₹{items.reduce((s, i) => s + (i.discountAmount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ccc', color: '#000' }}>
                <span style={{ fontWeight: 600 }}>Add GST:</span>
                <span style={{ fontWeight: 800 }}>+ ₹{items.reduce((s, i) => s + (i.gstAmount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 15px', marginTop: '15px', background: '#000', color: '#fff', borderRadius: '4px' }}>
                <span style={{ fontWeight: 800, fontSize: '18px' }}>NET TOTAL:</span>
                <span style={{ fontWeight: 900, fontSize: '24px' }}>₹{items.reduce((s, i) => s + (i.total || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div style={{ position: 'absolute', bottom: '25mm', left: '20mm', right: '20mm' }}>
            <div style={{ borderTop: '2px solid #000', paddingTop: '25px', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '11px', color: '#000', width: '60%', lineHeight: '1.6' }}>
                <strong>INVOICE TERMS:</strong><br />
                - All ornaments are guaranteed pure BIS Hallmark gold/silver.<br />
                - No returns/exchanges after delivery.<br />
                - This is a digital tax invoice.<br />
                - Subject to local jurisdiction.
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ height: '60px' }}></div>
                <div style={{ borderTop: '2px solid #000', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', color: '#000', paddingTop: '5px' }}>Authorized Signature</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions - Hidden on Print */}
        <div className="print-hidden" style={{ 
          padding: '30px', 
          background: '#f1f5f9', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px',
          borderTop: '1px solid #cbd5e1'
        }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ width: '160px', height: '48px', color: '#1e293b', fontWeight: 700, border: '2px solid #cbd5e1' }}>❌ Close</button>
          <button className="btn btn-gold" onClick={handlePrint} style={{ width: '250px', height: '48px', fontWeight: 900, fontSize: '16px', boxShadow: '0 4px 15px rgba(245,158,11,0.4)', borderRadius: '8px' }}>🖨️ PRINT INVOICE (A4)</button>
        </div>
      </div>
      
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden; }
          #printable-bill, #printable-bill * { visibility: visible; }
          #printable-bill {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 20mm !important;
            background: #fff !important;
            color: #000 !important;
          }
          .modal-overlay { background: none !important; backdrop-filter: none !important; position: static !important; }
          .print-hidden { display: none !important; }
          .modal-content { box-shadow: none !important; border: none !important; position: static !important; margin: 0 !important; width: 100% !important; }
        }
      `}</style>
    </div>
  )
}

export default BillModal
