<nav className="db-nav">
        <div className="db-logo-container">
          <img src={logoYira} alt="YIRA Etudes" className="db-logo-img" />
        </div>
        
        <div className="db-nav-right">
          <span className="db-cabinet">{cabinet.nom ?? 'Cabinet'}</span>
          <button className="db-btn-new" onClick={() => navigate('/surveys/new')}>
            <Plus size={16} /> <span>Nouvelle enquête</span>
          </button>
          <button className="db-btn-logout" onClick={logout}>
            <LogOut size={16} />
          </button>
        </div>
      </nav>