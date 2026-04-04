import React, { useState } from 'react'
import { MASTER_DATA } from '../data/masterData'
import { ShoppingCart, User, CreditCard, Trash2, Eye, Layers } from 'lucide-react'
import BillModal from './BillModal'

const CATEGORIES = Object.keys(MASTER_DATA)

const SellDashboard = ({ products = [], processSale }) => {
  const [formData, setFormData] = useState({
    category: '', subcategory: '', variant: '', detail: '', weight: '', quantity: '', rate: '', 
    discountType: 'PERCENT', discountValue: '', gstType: 'percent', gstValue: '3'
  })
  const [customer, setCustomer] = useState({ name: '', mobile: '' })
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [showBill, setShowBill] = useState(null)
  const [lastBill, setLastBill] = useState(null)
  const [selectedStockId, setSelectedStockId] = useState('')

  const hasSubcategory = () => {
    if (!formData.category) return false;
    if (formData.category === 'கொலுசு') return true;
    if (formData.category === 'பாம்பே கொலுசு வகைகள்') return false;

    const catData = MASTER_DATA[formData.category];
    if (!catData) return false;
    
    const keys = Object.keys(catData);
    if (keys.length === 1 && (keys[0] === 'வகைகள்' || keys[0] === 'பொருட்கள்')) return false;
    return keys.length > 0;
  }

  const getSubs = () => {
    if (!formData.category) return []
    const catData = MASTER_DATA[formData.category]
    if (!catData) return [];

    if (formData.category === 'கொலுசு') {
      return catData['அளவு'] || [];
    }
    const keys = Object.keys(catData);
    if (keys.length === 1 && (keys[0] === 'வகைகள்' || keys[0] === 'பொருட்கள்')) return [];
    return keys;
  }

  const getVariants = () => {
    if (!formData.category) return []
    const catData = MASTER_DATA[formData.category]
    if (!catData) return [];
    
    if (formData.category === 'பாம்பே கொலுசு வகைகள்') {
      return catData['பொருட்கள்'] || [];
    }

    const subs = getSubs();
    if (subs.length === 0) {
      const firstKey = Object.keys(catData)[0];
      return Array.isArray(catData[firstKey]) ? catData[firstKey] : [];
    }
    if (!formData.subcategory) return [];
    if (formData.category === 'கொலுசு') {
      return catData['விவரம்']?.[formData.subcategory] || [];
    }
    return Array.isArray(catData[formData.subcategory]) ? catData[formData.subcategory] : [];
  }

  const cleanLabel = (text) => (text || '').replace("வகைகள்", "").replace("பொருட்கள்", "").trim();

  // Derived: All stock entries matching chosen variant
  const matchingStocks = (products || []).filter(p =>
    p?.category === formData?.category &&
    p?.subcategory === formData?.subcategory &&
    p?.variant === formData?.variant &&
    ((p?.weight || 0) > 0 || (p?.quantity || 0) > 0)
  )

  // Expand to individual PIECES: each piece gets its own virtual entry key = "id_pieceIndex"
  // Per-piece weight = total_weight / total_quantity (avoids weight collapse)
  const expandedPieces = matchingStocks.flatMap(s => {
    const qty = s?.quantity || 0
    const totalWeight = s?.weight || 0
    const perPieceWeight = qty > 0 ? totalWeight / qty : totalWeight
    return Array.from({ length: qty > 0 ? qty : 1 }, (_, i) => ({
      stockId: s.id,
      pieceIndex: i + 1,
      key: `${s.id}_${i}`,
      detail: s.detail || '',
      perPieceWeight,
      totalQtyInStock: qty,
      category: s.category,
      subcategory: s.subcategory,
      variant: s.variant,
    }))
  })

  // Find the selected expanded piece
  const selectedPiece = expandedPieces.find(p => p.key === selectedStockId)
  // Also find the raw DB product for the selected piece
  const availableStock = selectedPiece
    ? (products || []).find(p => p?.id === selectedPiece.stockId)
    : null

  // Combined state for Discount & GST
  const [billing, setBilling] = useState({
    discountAmount: '',
    gstAmount: ''
  })

  // Each piece always has qty=1; weight comes from the stored formData.weight (per-piece)
  const safeSubtotal = parseFloat(formData?.weight || 0) * parseFloat(formData?.rate || 0)
  const safeFinalTotal = Math.max(0, safeSubtotal - parseFloat(billing?.discountAmount || 0) + parseFloat(billing?.gstAmount || 0))

  const addToCart = () => {
    // Always exactly 1 piece per cart add
    const w = parseFloat(formData?.weight || 0)
    const q = 1  // enforce single quantity
    const r = parseFloat(formData?.rate || 0)

    if (!selectedStockId || !selectedPiece || !availableStock) {
      alert('⚠️ இருப்புப் பொருளைத் தேர்ந்தெடுக்கவும்!')
      return
    }
    if (w <= 0) {
      alert('⚠️ Weight is required!')
      return
    }
    if (r <= 0) {
      alert('⚠️ Rate is required!')
      return
    }

    // Each piece gets a unique cart key so the same stock can have multiple pieces
    const cartKey = selectedPiece.key
    const existingIndex = cart.findIndex(i => i.cartKey === cartKey)
    if (existingIndex > -1) {
      alert('⚠️ This specific piece is already in the cart!')
      return
    }

    const subtotal = w * r
    const total = Math.max(0, subtotal - parseFloat(billing?.discountAmount || 0) + parseFloat(billing?.gstAmount || 0))

    setCart([...cart, {
      ...formData,
      cartKey,
      productId: availableStock?.id,
      pieceIndex: selectedPiece.pieceIndex,
      weight: w,
      quantity: q,
      pricePerGram: r,
      subtotal,
      discountAmount: parseFloat(billing?.discountAmount || 0),
      gstAmount: parseFloat(billing?.gstAmount || 0),
      total,
    }])

    setFormData({ ...formData, weight: '', quantity: '1', rate: '', detail: '' })
    setBilling({ discountAmount: '', gstAmount: '' })
    setSelectedStockId('')
  }

  const handleSale = async () => {
    if (!(cart || []).length) return
    setLoading(true)
    try {
      const bill = await processSale(customer?.name || 'Walk-in', customer?.mobile || '', cart)
      if (bill) {
        setShowBill(bill)
        setLastBill(bill)
        setCart([])
        setCustomer({ name: '', mobile: '' })
      }
    } catch (err) {
      alert('Sale Error: ' + (err?.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const cartTotal = (cart || []).reduce((s, i) => s + (i?.total || 0), 0)

  // SAFE RENDER FALLBACK
  if (!(products || []).length) {
    return (
      <div className="flex-center p-80 flex-column" style={{ color: 'var(--text-sub)', textAlign: 'center' }}>
        <Layers size={64} style={{ opacity: 0.1, marginBottom: '16px' }} />
        <h2 style={{ color: 'var(--gold)', fontWeight: 800 }}>⚠️ No Stock Available</h2>
        <p>Please add stock before attempting a sale.</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in dashboard-sell-container">
      <div className="flex-between mb-16">
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--gold)' }}>விற்பனை & பில்</h2>
          <p className="text-sub">வணிக விற்பனை மற்றும் பில் மேலாண்மை</p>
        </div>
        <div className="flex" style={{ gap: '12px' }}>
          {lastBill && (
            <button className="btn" onClick={() => setShowBill(lastBill)}>
              <Eye size={16} /> பில் வியூ (View)
            </button>
          )}
          <div className="stat-icon-large">
            <ShoppingCart size={32} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Sale Form */}
        <div className="card shadow-lg" style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: 0, overflow: 'hidden' }}>
          <div className="card-header-gold" style={{ textAlign: 'center' }}>பொருள் தேர்வு (Select Item)</div>
          
          {/* ── FORM BODY ── */}
          <div style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>

            {/* ── ROW 1: Category | Size | Product ── */}
            <div className="form-row" style={{
              display: 'grid',
              gridTemplateColumns: hasSubcategory() ? '1fr 1fr 1fr' : '1fr 1fr',
              gap: '10px',
            }}>
              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-sub)', margin: 0 }}>
                  பிரிவு <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={formData?.category || ''}
                  onChange={e => {
                    setFormData({ ...formData, category: e.target.value, subcategory: '', variant: '', detail: '' })
                    setSelectedStockId('')
                  }}
                  style={{ height: '40px', width: '100%', padding: '0 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)', fontSize: '12px', boxSizing: 'border-box' }}
                >
                  <option value="">— Category —</option>
                  {(CATEGORIES || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Size (conditional) */}
              {hasSubcategory() && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-sub)', margin: 0 }}>
                    {formData?.category === 'கொலுசு' ? 'அளவு' : 'துணை பிரிவு'} <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    value={formData?.subcategory || ''}
                    onChange={e => {
                      setFormData({ ...formData, subcategory: e.target.value, variant: '', detail: '' })
                      setSelectedStockId('')
                    }}
                    disabled={!formData?.category}
                    style={{ height: '40px', width: '100%', padding: '0 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)', fontSize: '12px', boxSizing: 'border-box' }}
                  >
                    <option value="">— Size —</option>
                    {(getSubs() || []).map(s => <option key={s} value={s}>{cleanLabel(s || '')}</option>)}
                  </select>
                </div>
              )}

              {/* Product / Variant */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-sub)', margin: 0 }}>
                  {formData?.category === 'கொலுசு' ? 'விவரம்' : 'மாடல்'} <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={formData?.variant || ''}
                  onChange={e => {
                    setFormData({ ...formData, variant: e.target.value, detail: '' })
                    setSelectedStockId('')
                  }}
                  disabled={!formData?.category || (hasSubcategory() && !formData?.subcategory)}
                  style={{ height: '40px', width: '100%', padding: '0 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)', fontSize: '12px', boxSizing: 'border-box' }}
                >
                  <option value="">— Product —</option>
                  {(getVariants() || []).map(v => <option key={v} value={v}>{cleanLabel(v || '')}</option>)}
                </select>
              </div>
            </div>

            {/* ── ROW 2: Stock Piece Select (full width) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', margin: 0 }}>
                இருப்புத் தெரிவு — Select Piece <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                value={selectedStockId || ''}
                onChange={e => {
                  const key = e.target.value
                  setSelectedStockId(key)
                  const piece = expandedPieces.find(p => p.key === key)
                  if (piece) {
                    setFormData({
                      ...formData,
                      detail: piece.detail,
                      weight: piece.perPieceWeight.toFixed(3),
                      quantity: '1'
                    })
                  }
                }}
                disabled={!formData?.variant || expandedPieces.length === 0}
                style={{
                  height: '44px', width: '100%', padding: '0 10px',
                  borderRadius: '8px', border: '2px solid var(--gold)',
                  background: 'rgba(255,215,0,0.06)', color: 'var(--text-main)',
                  fontWeight: 700, fontSize: '13px', boxSizing: 'border-box'
                }}
              >
                {!formData?.variant ? (
                  <option value="">— மேலே பொருளைத் தேர்ந்தெடுக்கவும் —</option>
                ) : expandedPieces.length > 0 ? (
                  <option value="">— {expandedPieces.length} பிஸ் கிடைக்கிறது — தேர்வு செய்யவும் —</option>
                ) : (
                  <option value="">⚠️ இருப்பு இல்லை</option>
                )}
                {expandedPieces.map(piece => (
                  <option key={piece.key} value={piece.key}>
                    பிஸ் {piece.pieceIndex}{piece.detail ? ` [${piece.detail}]` : ''} — {piece.perPieceWeight.toFixed(3)}g
                  </option>
                ))}
              </select>

              {/* No stock warning */}
              {formData?.variant && expandedPieces.length === 0 && (
                <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', fontWeight: 700, fontSize: '12px' }}>
                  ❌ இந்த பொருளில் இருப்பு இல்லை
                </div>
              )}

              {/* Selected piece info */}
              {selectedPiece && (
                <div style={{ display: 'flex', gap: '12px', padding: '8px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid var(--success)', borderRadius: '8px', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '12px' }}>பிஸ்: {selectedPiece.pieceIndex}</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '12px' }}>எடை: {selectedPiece.perPieceWeight.toFixed(3)}g</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '12px' }}>அளவு: 1 pcs</span>
                </div>
              )}
            </div>

            {/* ── ROW 3: Rate | Discount | GST ── */}
            <div className="form-row" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px',
            }}>
              {/* Rate */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', margin: 0 }}>
                  Rate ₹/g <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={e => setFormData({ ...formData, rate: e.target.value })}
                  placeholder="6500"
                  style={{
                    height: '40px', width: '100%', padding: '0 10px',
                    borderRadius: '8px', border: '1px solid var(--gold)',
                    background: 'var(--bg)', color: 'var(--gold)',
                    fontWeight: 700, fontSize: '14px', boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Discount */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--danger)', margin: 0 }}>
                  Discount ₹
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={billing.discountAmount}
                  onChange={e => setBilling({ ...billing, discountAmount: e.target.value })}
                  style={{
                    height: '40px', width: '100%', padding: '0 10px',
                    borderRadius: '8px', border: '1px solid var(--border)',
                    background: 'var(--bg)', color: 'var(--text-main)',
                    fontSize: '14px', boxSizing: 'border-box', outline: 'none'
                  }}
                />
              </div>

              {/* GST */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)', margin: 0 }}>
                  GST ₹
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={billing.gstAmount}
                  onChange={e => setBilling({ ...billing, gstAmount: e.target.value })}
                  style={{
                    height: '40px', width: '100%', padding: '0 10px',
                    borderRadius: '8px', border: '1px solid var(--border)',
                    background: 'var(--bg)', color: 'var(--text-main)',
                    fontSize: '14px', boxSizing: 'border-box', outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* ── Bill Summary: clean vertical grid ── */}
            <div style={{
              padding: '12px 14px',
              background: 'rgba(255,215,0,0.06)',
              borderRadius: '10px',
              border: '1px solid var(--gold)',
              marginBottom: '4px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', marginBottom: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: 600, marginBottom: '2px' }}>பொருள் மதிப்பு</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>₹{(safeSubtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: 600, marginBottom: '2px' }}>தள்ளுபடி</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--danger)' }}>−₹{parseFloat(billing?.discountAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 600, marginBottom: '2px' }}>GST</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--success)' }}>+₹{parseFloat(billing?.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,215,0,0.3)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)' }}>மொத்தம்</span>
                <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--gold)' }}>₹{(safeFinalTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

          </div>{/* end form body */}



          <button 
            className="btn btn-full" 
            onClick={addToCart}
            style={{ height: '60px', fontSize: '18px', fontWeight: 800, borderRadius: '0' }}
            disabled={!selectedStockId || !formData?.rate || parseFloat(formData?.rate || 0) <= 0}
          >
            + பட்டியலில் சேர் (Add to Cart)
          </button>
        </div>{/* end card */}



        <div className="card shadow-lg" style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '900px', margin: '0 auto', padding: 0, overflow: 'hidden' }}>
          <div className="card-header-gold" style={{ textAlign: 'center' }}>பட்டியல் (Cart)</div>
          
          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="form-grid mb-24" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <label style={{ fontWeight: 700 }}><User size={14} style={{ marginRight: '6px' }} /> வாடிக்கையாளர் பெயர் (Customer Name)</label>
                <input type="text" placeholder="பெயர்" value={customer?.name || ''} onChange={e => setCustomer({ ...customer, name: e.target.value })} style={{ fontWeight: 600 }} />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 700 }}>மொபைல் எண் (Mobile No)</label>
                <input type="text" placeholder="மொபைல் எண்" value={customer?.mobile || ''} onChange={e => setCustomer({ ...customer, mobile: e.target.value })} style={{ fontWeight: 600 }} />
              </div>
            </div>

            <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--card)', overflow: 'hidden', marginBottom: '20px', color: 'var(--text-main)' }}>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="cart-table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ background: 'var(--card)', borderBottom: '2px solid var(--border)', position: 'sticky', top: 0, zIndex: 2 }}>
                    <tr style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-sub)', letterSpacing: '0.5px' }}>
                      <th style={{ textAlign: 'left', padding: '15px 12px' }}>பொருள் (Product)</th>
                      <th style={{ textAlign: 'center', padding: '15px 12px' }}>எண்ணிக்கை (Qty)</th>
                      <th style={{ textAlign: 'center', padding: '15px 12px' }}>எடை (Weight)</th>
                      <th style={{ textAlign: 'right', padding: '15px 12px' }}>விலை (Rate)</th>
                      <th style={{ textAlign: 'right', padding: '15px 12px' }}>மொத்தம் (Amount)</th>
                      <th style={{ padding: '15px 12px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '15px 12px' }}>
                          <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)' }}>{cleanLabel(item.variant)}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{item.detail}{item.pieceIndex ? ` · Pc #${item.pieceIndex}` : ''}</div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '15px 12px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.quantity ? `${item.quantity} pcs` : '-'}
                        </td>
                        <td style={{ textAlign: 'center', padding: '15px 12px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.weight ? `${item.weight.toFixed(3)}g` : '-'}
                        </td>
                        <td style={{ textAlign: 'right', padding: '15px 12px', fontWeight: 600, color: 'var(--gold)' }}>
                          ₹{item.pricePerGram ? item.pricePerGram.toLocaleString('en-IN') : '-'}
                        </td>
                        <td style={{ textAlign: 'right', padding: '15px 12px', fontWeight: 900, color: 'var(--gold)' }}>
                          ₹{item.total ? item.total.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'}
                        </td>
                        <td style={{ textAlign: 'right', padding: '15px 12px' }}>
                          <button className="btn btn-danger-ghost" onClick={() => setCart(cart.filter((_, i) => i !== idx))}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!(cart || []).length && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-sub)' }}>
                          <Layers size={40} style={{ opacity: 0.1, marginBottom: '10px' }} /><br />
                          பட்டியல் காலியாக உள்ளது
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 215, 0, 0.05)', padding: '20px', borderRadius: '12px', border: '2px dashed var(--gold)' }}>
              <div className="flex-between" style={{ marginBottom: '15px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700 }}>மொத்த பில் தொகை</span>
                <span style={{ fontSize: '32px', fontWeight: 900, color: 'var(--gold)' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <button 
                className="btn btn-full" 
                disabled={!(cart || []).length || loading} 
                onClick={handleSale}
                style={{ height: '60px', fontSize: '20px', fontWeight: 900 }}
              >
                {loading ? 'தயாரிக்கப்படுகிறது...' : <><CreditCard size={22} style={{ marginRight: '10px' }} /> 💳 விற்பனை & பில்</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBill && <BillModal bill={showBill} onClose={() => setShowBill(null)} />}
    </div>
  )
}

export default SellDashboard
