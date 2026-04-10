import React, { useState } from 'react'
import { MASTER_DATA } from '../data/masterData'
import { Plus, Package } from 'lucide-react'

const CATEGORIES = Object.keys(MASTER_DATA)

const AddStock = ({ onAddProduct }) => {
  const [formData, setFormData] = useState({
    category: '', subcategory: '', variant: '', detail: '', weight: '', quantity: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setLoadingSuccess] = useState(false)

  const hasSubcategory = () => {
    if (!formData.category) return false;
    // CASE: கொலுசு (Needs size/அளவு)
    if (formData.category === 'கொலுசு') return true;
    
    // CASE: பாம்பே கொலுசு (Direct products)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.category || (hasSubcategory() && !formData.subcategory) || !formData.variant) {
      alert('தயவுசெய்து கட்டாய புலங்களை நிரப்பவும்')
      return
    }

    setLoading(true)
    try {
      await onAddProduct({
        ...formData,
        detail: formData.detail || "",
        weight: parseFloat(formData.weight || 0),
        quantity: 1 // ALWAYS 1 piece
      })
      setFormData({ category: '', subcategory: '', variant: '', detail: '', weight: '', quantity: '1' })
      setLoadingSuccess(true)
      setTimeout(() => setLoadingSuccess(false), 3000)
    } catch (err) {
      alert('சேமிப்பதில் பிழை: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in add-stock-container">
      <div className="flex-between mb-16">
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--gold)' }}>சரக்கு சேர்த்தல்</h2>
          <p className="text-sub">புதிய இருப்புப் பொருட்களைச் சேர்த்தல் மற்றும் நிர்வகித்தல்</p>
        </div>
        <div className="stat-icon-large">
          <Plus size={32} />
        </div>
      </div>

      <div className="card shadow-lg">
        <div className="card-header-gold">பொருள் விவரங்கள்</div>
        
        {success && (
          <div className="toast-success" style={{ margin: '15px' }}>
            <Package size={18} /> இருப்பு வெற்றிகரமாக சேர்க்கப்பட்டது!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
            
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: hasSubcategory() ? '1.5fr 1fr 1.5fr' : '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>பிரிவு (Category) <span style={{color: 'red'}}>*</span></label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value, subcategory: '', variant: '', detail: '' })} 
                  required
                >
                  <option value="">— ஒரு பிரிவைத் தேர்ந்தெடுக்கவும் —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {hasSubcategory() && (
                <div className="form-group">
                  <label>{formData.category === 'கொலுசு' ? 'அளவு (Size)' : 'துணை பிரிவு'} <span style={{color: 'red'}}>*</span></label>
                  <select 
                    value={formData.subcategory} 
                    onChange={e => setFormData({ ...formData, subcategory: e.target.value, variant: '', detail: '' })} 
                    disabled={!formData.category}
                    required
                  >
                    <option value="">— தேர்ந்தெடுக்கவும் —</option>
                    {getSubs().map(s => <option key={s} value={s}>{cleanLabel(s)}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>{formData.category === 'கொலுசு' ? 'விவரம் (Product)' : 'மாடல் / விவரம்'} <span style={{color: 'red'}}>*</span></label>
                <select 
                  value={formData.variant} 
                  onChange={e => setFormData({ ...formData, variant: e.target.value, detail: '' })} 
                  disabled={!formData.category || (hasSubcategory() && !formData.subcategory)}
                  required
                >
                  <option value="">— தேர்ந்தெடுக்கவும் —</option>
                  {getVariants().map(v => (
                    <option key={v} value={v}>{cleanLabel(v)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', background: 'rgba(255,215,0,0.04)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div className="form-group">
                <label style={{ fontWeight: 800 }}>எடை (Weight g) <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="number" step="0.001" min="0" placeholder="0.000"
                  value={formData.weight}
                  style={{ fontSize: '18px', fontWeight: 900 }}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 800 }}>எண்ணிக்கை (Quantity pcs) <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="number"
                  value="1"
                  style={{ fontSize: '18px', fontWeight: 900, background: 'var(--bg)', color: 'var(--text-sub)', cursor: 'not-allowed' }}
                  readOnly 
                />
              </div>
            </div>

            <div className="form-group" style={{ paddingTop: '10px' }}>
              <button type="submit" className="btn btn-full" disabled={loading} style={{ height: '60px', fontSize: '18px', fontWeight: 800 }}>
                {loading ? 'சேமிக்கப்படுகிறது...' : '+ இருப்பில் சேர் (Add Stock)'}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="mt-16 card" style={{ background: 'rgba(255,215,0,0.03)', border: '1px dashed var(--gold)' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-sub)', textAlign: 'center' }}>
          <strong>குறிப்பு:</strong> ஒவ்வொரு முறை சரக்கு சேர்க்கும் போதும் அது ஒரு தனிப் பதிவாக சேமிக்கப்படும்.
        </p>
      </div>
    </div>
  )
}

export default AddStock
