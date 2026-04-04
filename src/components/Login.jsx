import React, { useState } from 'react'
import axios from 'axios'
import { Gem, Mail, Lock, Phone } from 'lucide-react'

const Login = ({ onLogin, onShowSignup, onShowForgot }) => {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const resp = await axios.post('/api/auth/login', { loginId, password })
      if (resp.data.status === "error") {
        setError(resp.data.message)
      } else {
        onLogin(resp.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #0b0b0b 100%)',
    }}>
      <style>{`
        .auth-card {
          background: rgba(20, 20, 20, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          width: 400px;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
          color: white;
          text-align: center;
        }
        .input-group {
          position: relative;
          margin-bottom: 20px;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 14px;
          color: #D4AF37;
          opacity: 0.7;
        }
        .auth-input {
          width: 100%;
          padding: 14px 14px 14px 44px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white;
          font-size: 15px;
          transition: 0.3s;
        }
        .auth-input:focus {
          border-color: #D4AF37;
          background: rgba(255,255,255,0.08);
          outline: none;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
        }
        .auth-btn {
          margin-top: 10px;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%);
          color: #000;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: 0.3s;
        }
        .auth-btn:hover { 
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
        }
        .auth-btn:active { transform: translateY(0); }
        .auth-links {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .auth-link {
          color: #9CA3AF;
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }
        .auth-link:hover { color: #D4AF37; }
        .gold-text {
          background: linear-gradient(135deg, #FFD700 0%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div className="auth-card">
        <div style={{ 
          width: 70, height: 70, 
          borderRadius: '20px', 
          background: 'rgba(212, 175, 55, 0.1)', 
          border: '1px solid rgba(212, 175, 55, 0.3)', 
          margin: '0 auto 24px auto', 
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <Gem size={36} color="#D4AF37" />
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '8px' }} className="gold-text">TAS Jewellers</h1>
        <p style={{ color: '#9CA3AF', fontSize: '15px', marginBottom: '32px' }}>Inventory & Billing Management</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <Mail className="input-icon" size={18} />
            <input 
              type="text" className="auth-input" placeholder="Email or Phone Number" 
              value={loginId} onChange={e => setLoginId(e.target.value)} required 
            />
          </div>
          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input 
              type="password" className="auth-input" placeholder="Password" 
              value={password} onChange={e => setPassword(e.target.value)} required 
            />
          </div>
          
          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#FCA5A5', 
              padding: '12px', 
              borderRadius: '10px', 
              fontSize: '13px', 
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Please wait...' : 'Login to Account'}
          </button>
        </form>

        <div className="auth-links">
          <span className="auth-link" onClick={onShowForgot}>Forgot Password?</span>
          <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 auto' }}></div>
          <span className="auth-link" onClick={onShowSignup}>Don't have an account? <span style={{ color: '#D4AF37', fontWeight: '600' }}>Sign Up</span></span>
        </div>
      </div>
    </div>
  )
}

export default Login
