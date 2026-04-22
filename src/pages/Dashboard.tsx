import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardHome } from '../api/survey.service';
import type { DashboardHome } from '../types/survey';
import { Plus, LogOut, Users, TrendingUp, Clock } from 'lucide-react';
import './Dashboard.css';

import logoYira from '../assets/logo-yira-etudes.png';
import iconPsychometry from '../assets/icon-psychometry.png';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cabinet = JSON.parse(localStorage.getItem('yira_cabinet') ?? '{}');

  useEffect(() => {
    getDashboardHome()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem('yira_token');
    localStorage.removeItem('yira_cabinet');
    navigate('/login');
  };

  return (
    <div className="db-container">
      <nav className="db-nav">
        <div className="db-logo-wrapper">
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

      <main className="db-main">
        <p className="db-eyebrow">TABLEAU DE BORD</p>
        <h1 className="db-heading">Vue d'ensemble</h1>

        {data && (
          <div className="db-content">
            <div className="db-kpi-grid">
              <div className="db-kpi">
                <div className="db-kpi-icon blue"><img src={iconPsychometry} alt="" width="18" /></div>
                <p className="db-kpi-label">Enquêtes actives</p>
                <p className="db-kpi-value">{data.kpis.total_enquetes}</p>
              </div>
              <div className="db-kpi">
                <div className="db-kpi-icon green"><Users size={18} /></div>
                <p className="db-kpi-label">Réponses totales</p>
                <p className="db-kpi-value">{data.kpis.total_reponses}</p>
              </div>
              <div className="db-kpi">
                <div className="db-kpi-icon orange"><TrendingUp size={18} /></div>
                <p className="db-kpi-label">Réponses 7j</p>
                <p className="db-kpi-value">{data.kpis.reponses_7j}</p>
              </div>
              <div className="db-kpi">
                <div className="db-kpi-icon gray"><Clock size={18} /></div>
                <p className="db-kpi-label">Réponses 30j</p>
                <p className="db-kpi-value">{data.kpis.reponses_30j}</p>
              </div>
            </div>

            <div className="db-row">
              <div className="db-card main-card">
                <p className="db-card-title">ACTIVITÉ RÉCENTE</p>
                <p className="db-empty">Aucune réponse reçue.</p>
              </div>
              <div className="db-card side-card">
                <p className="db-card-title">PRINCIPALES ENQUÊTES</p>
                {data.top_enquetes.map((e) => (
                  <div key={e.id} className="top-item">
                    <span className="top-dot" />
                    <span className="top-titre">{e.titre}</span>
                    <span className="top-count">{e.total_reponses}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}