import React, { useState } from 'react'
import { RotateCcw, CheckCircle } from 'lucide-react'

const Returns = ({ products=[], sales=[], returns=[], onAddReturn }) => {
  const [form, setForm] = useState({ saleId:'', productCode:'', qty:'1', reason:'', refund:'' })
  const [success, setSuccess] = useState('')

  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.productCode || !form.reason) return
    const id = `RET-${String(returns.length+1).padStart(3,'0')}`
    const ret = {
      id, date: new Date().toISOString().slice(0,10),
      saleId: form.saleId.trim(),
      productCode: form.productCode.trim(),
      qty: parseInt(form.qty)||1,
      reason: form.reason.trim(),
      refund: parseFloat(form.refund)||0,
    }
    onAddReturn(ret)
    setSuccess(`${form.productCode} திரும்பப்பெறப்பட்டது (${id})`)
    setForm({ saleId:'', productCode:'', qty:'1', reason:'', refund:'' })
    setTimeout(()=>setSuccess(''), 5000)
  }

  const labelSt = { display:'block', fontWeight:'bold', color:'#444', marginBottom:'6px', fontSize:'15px' }

  return (
    <div className="fade-in" style={{ padding:'30px' }}>
      <h2 style={{ fontSize:'28px', color:'#E74C3C', marginBottom:'6px' }}>திரும்பவும் பொருட்கள்</h2>
      <p style={{ color:'#888', marginBottom:'24px', fontSize:'15px' }}>விற்கப்பட்ட பொருளை திரும்பப் பெற இங்கே பதிவு செய்யவும்.</p>

      {success && (
        <div className="fade-in" style={{ backgroundColor:'#D4EDDA', color:'#155724', padding:'14px 20px', borderRadius:'8px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px', border:'1px solid #C3E6CB' }}>
          <CheckCircle size={20}/> {success}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'28px', alignItems:'start' }}>
        {/* Form */}
        <div style={{ backgroundColor:'#fff', borderRadius:'12px', boxShadow:'0 4px 16px rgba(0,0,0,0.08)', padding:'28px', borderTop:'5px solid #E74C3C' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
            <div>
              <label style={labelSt}>விற்பனை குறியீடு (விரும்பினால்)</label>
              <input type="text" value={form.saleId} onChange={e=>set('saleId',e.target.value)} placeholder="SALE-001" list="sale-ids"/>
              <datalist id="sale-ids">
                {sales.map(s=><option key={s.id} value={s.id}>{s.productName}</option>)}
              </datalist>
            </div>
            <div>
              <label style={labelSt}>பொருள் குறியீடு <span style={{color:'#E74C3C'}}>*</span></label>
              <input type="text" value={form.productCode} onChange={e=>set('productCode',e.target.value)} placeholder="KOL-PEN-001" list="product-codes-ret" required/>
              <datalist id="product-codes-ret">
                {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </datalist>
            </div>
            <div>
              <label style={labelSt}>திரும்பும் அளவு</label>
              <input type="number" min="1" value={form.qty} onChange={e=>set('qty',e.target.value)}/>
            </div>
            <div>
              <label style={labelSt}>திரும்பிய காரணம் <span style={{color:'#E74C3C'}}>*</span></label>
              <select value={form.reason} onChange={e=>set('reason',e.target.value)} required>
                <option value="">தேர்வு செய்யவும்</option>
                {['குறைபாடு','சேதம்','அளவு பொருந்தவில்லை','வேறு காரணம்'].map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>திரும்ப வழங்கும் தொகை (₹)</label>
              <div style={{ display:'flex', alignItems:'center' }}>
                <span style={{ padding:'12px 14px', background:'#F5F6F8', border:'1px solid #C0C0C0', borderRight:'none', borderRadius:'8px 0 0 8px', color:'#555' }}>₹</span>
                <input type="number" min="0" value={form.refund} onChange={e=>set('refund',e.target.value)} style={{ borderRadius:'0 8px 8px 0' }} placeholder="0.00"/>
              </div>
            </div>
            <button type="submit" style={{ backgroundColor:'#E74C3C', color:'white', padding:'14px', fontSize:'17px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 4px 12px rgba(231,76,60,0.3)' }}>
              <RotateCcw size={18}/> திரும்பவும் பதிவு
            </button>
          </form>
        </div>

        {/* Returns Table */}
        <div>
          <h3 style={{ fontSize:'20px', color:'#333', marginBottom:'16px' }}>திரும்பப்பெற்ச வரலாறு</h3>
          <div style={{ backgroundColor:'#fff', borderRadius:'12px', boxShadow:'0 4px 16px rgba(0,0,0,0.07)', overflow:'hidden', borderTop:'4px solid #E74C3C' }}>
            {returns.length===0 ? (
              <div style={{ padding:'50px', textAlign:'center', color:'#ccc', fontSize:'17px' }}>திரும்பப்பெற்ற பொருட்கள் இல்லை</div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr>
                      {['குறியீடு','பொருள்','அளவு','காரணம்','தொகை','தேதி'].map((h,i)=>(
                        <th key={i} style={{ padding:'12px 16px', textAlign:'left', color:'#444', fontWeight:'bold', fontSize:'14px', borderBottom:'2px solid #EEE', backgroundColor:'#F5F6F8', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map(r=>(
                      <tr key={r.id}
                        style={{ borderBottom:'1px solid #EEE', transition:'background-color 0.18s' }}
                        onMouseEnter={e=>e.currentTarget.style.backgroundColor='#FFF5F5'}
                        onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}
                      >
                        <td style={{ padding:'12px 16px', fontWeight:'bold', fontSize:'13px', color:'#0B1F3A' }}>{r.id}</td>
                        <td style={{ padding:'12px 16px', fontSize:'14px' }}>{r.productCode}</td>
                        <td style={{ padding:'12px 16px', fontSize:'14px', textAlign:'center' }}>{r.qty}</td>
                        <td style={{ padding:'12px 16px', fontSize:'14px', color:'#E74C3C' }}>{r.reason}</td>
                        <td style={{ padding:'12px 16px', fontSize:'14px', fontWeight:'bold', color:'#D4AF37' }}>₹ {(r.refund||0).toLocaleString('en-IN')}</td>
                        <td style={{ padding:'12px 16px', fontSize:'13px', color:'#aaa' }}>{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Returns
