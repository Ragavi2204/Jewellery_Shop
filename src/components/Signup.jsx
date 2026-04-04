import React, { useState } from 'react';
import axios from 'axios';
import { Gem, User, Phone, Mail, Lock, ArrowLeft } from 'lucide-react';

const Signup = ({ onBack, onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const resp = await axios.post('/api/auth/signup', { ...formData, role: 'admin' });
      if (resp.data.status === "error") {
        setError(resp.data.message);
      } else {
        alert('Registration Successful! Please login now.');
        onSignupSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          width: 420px;
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
        .back-btn {
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #9CA3AF;
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }
        .back-btn:hover { color: #D4AF37; }
        .gold-text {
          background: linear-gradient(135deg, #FFD700 0%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
      
      <div className="auth-card">
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }} className="gold-text">Create Account</h2>
        <p style={{ color: '#9CA3AF', fontSize: '15px', marginBottom: '32px' }}>Join the premium inventory network</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <User className="input-icon" size={18} />
            <input 
              type="text" className="auth-input" placeholder="Full Name" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
            />
          </div>
          <div className="input-group">
            <Phone className="input-icon" size={18} />
            <input 
              type="text" className="auth-input" placeholder="Phone Number" 
              value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} required 
            />
          </div>
          <div className="input-group">
            <Mail className="input-icon" size={18} />
            <input 
              type="email" className="auth-input" placeholder="Email Address" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required 
            />
          </div>
          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input 
              type="password" className="auth-input" placeholder="Strong Password" 
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required 
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
            {loading ? 'Creating Account...' : 'Sign Up Now'}
          </button>
        </form>
        
        <div className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Already have an account? Login</span>
        </div>
      </div>
    </div>
  );
}

export default Signup;
