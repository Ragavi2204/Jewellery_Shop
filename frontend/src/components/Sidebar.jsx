import { PlusCircle, ShoppingBag, TrendingUp, Home, BarChart3 } from 'lucide-react'

const MENU = [
  { id: 'dashboard', label: 'முகப்பு', icon: <Home size={20} />, roles: ['admin', 'auditor'] },
  { id: 'add', label: 'சேர்க்கை', icon: <PlusCircle size={20} />, roles: ['admin'] },
  { id: 'sell', label: 'விற்பனை', icon: <ShoppingBag size={20} />, roles: ['admin'] },
  { id: 'reports', label: 'அறிக்கை', icon: <TrendingUp size={20} />, roles: ['admin', 'auditor'] },
  { id: 'inventory', label: 'இருப்பு', icon: <BarChart3 size={20} />, roles: ['admin', 'auditor'] },
]

const Sidebar = ({ activeTab, setActiveTab, role = 'admin', isOpen, closeSidebar }) => {
  const visible = MENU.filter(m => m.roles.includes(role))

  return (
    <div className={`sidebar ${isOpen ? 'active' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-dot" />
        <div>
          <div className="sidebar-brand-name">TAS Jewellers</div>
          <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '2px' }}>Professional Inventory</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visible.map(item => {
          const active = activeTab === item.id
          return (
            <div key={item.id} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-text">
                <div className="nav-label">{item.label}</div>
                <div className="nav-sub">{item.sub}</div>
              </div>
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="online-dot" />
        <div className="user-info">
          <div className="user-role">
            {role === 'admin' ? 'நிர்வாகி (Admin)' : 'Auditor'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
