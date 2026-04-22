import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardHome } from '../api/survey.service';
import type { DashboardHome } from '../types/survey';
import { Plus, LogOut, BarChart2, Users, TrendingUp, Clock } from 'lucide-react';
import './Dashboard.css';

// IMPORTS CRITIQUES (Disent à Vercel d'inclure les images)
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

  const colors = ['#185FA5', '#3B6D11', '#854F0B'];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'DM Sans, sans-serif' }}>
      <nav className="db-nav">
        <span className="db-logo">
          {/* On utilise la variable logoYira ici */}
        <img src={logoYira} alt="YIRA Etudes" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
        </span>
        <div className="db-nav-right">
          <span className="db-cabinet">{cabinet.nom ?? 'Cabinet'}</span>
          <button className="db-btn-new" onClick={() => navigate('/surveys/new')}>
            <Plus size={15} /> Nouvelle enquête
          </button>
          <button className="db-btn-logout" onClick={logout} title="Déconnexion">
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      <main className="db-main">
        <p className="db-eyebrow">Tableau de bord</p>
        <h1 className="db-heading">Vue d'ensemble</h1>

        {loading && <div className="db-loading">Chargement...</div>}
        {error && <div className="db-error">{error}</div>}

        {data && (
          <div>
            <div className="db-kpi-grid">
              <div className="db-kpi">
                <div className="db-kpi-icon" style={{ background: '#E6F1FB' }}>
                  {/* Icône personnalisée de psychométrie */}
                  <img src={iconPsychometry} alt="" style={{ width: '18px' }} />
                </div>
                <p className="db-kpi-label">Enquêtes actives</p>
                <p className="db-kpi-value">{data.kpis.total_enquetes}</p>
              </div>
              <div className="db-kpi">
                <div className="db-kpi-icon" style={{ background: '#EAF3DE' }}>
                  <Users size={16} color="#3B6D11" />
                </div>
                <p className="db-kpi-label">Total réponses</p>
                <p className="db-kpi-value">{data.kpis.total_reponses.toLocaleString()}</p>
              </div>
              <div className="db-kpi">
                <div className="db-kpi-icon" style={{ background: '#FAEEDA' }}>
                  <TrendingUp size={16} color="#854F0B" />
                </div>
                <p className="db-kpi-label">Réponses 7j</p>
                <p className="db-kpi-value">{data.kpis.reponses_7j}</p>
              </div>
              <div className="db-kpi">
                <div className="db-kpi-icon" style={{ background: '#F1EFE8' }}>
                  <Clock size={16} color="#5F5E5A" />
                </div>
                <p className="db-kpi-label">Réponses 30j</p>
                <p className="db-kpi-value">{data.kpis.reponses_30j}</p>
              </div>
            </div>

            <div className="db-row">
              <div className="db-card">
                <p className="db-card-title">Activité récente</p>
                {data.feed_recent.map((item) => (
                  <div key={item.id} className="feed-item">
                    <span className={'feed-canal canal-' + item.canal}>{item.canal.toUpperCase()}</span>
                    <span className="feed-titre">{item.enquete.titre}</span>
                  </div>
                ))}
              </div>
              <div className="db-card">
                <p className="db-card-title">Top enquêtes</p>
                {data.top_enquetes.map((e, i) => (
                  <div key={e.id} className="top-item">
                    <div className="top-dot" style={{ background: colors[i % colors.length] }} />
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