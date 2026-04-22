const fs = require('fs');

const content = `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/survey.service';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ nom: '', email: '', password: '' });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const data = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.nom, form.email, form.password);
      localStorage.setItem('yira_token', data.access_token);
      localStorage.setItem('yira_cabinet', JSON.stringify(data.cabinet));
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Erreur de connexion');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f4f0', fontFamily: 'DM Sans, sans-serif', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 40, width: '100%', maxWidth: 420, border: '0.5px solid #e8e5de' }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 8px' }}>YIRA Etudes</p>
        <h1 style={{ fontSize: 28, color: '#1a1a18', margin: '0 0 32px', fontWeight: 400 }}>
          {mode === 'login' ? 'Connexion cabinet' : 'Creer un compte'}
        </h1>

        {status === 'error' && (
          <div style={{ background: '#FCEBEB', color: '#A32D2D', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Nom du cabinet</label>
              <input
                style={{ width: '100%', fontSize: 14, border: '1px solid #e0ddd6', borderRadius: 10, padding: '10px 14px', color: '#1a1a18', outline: 'none', boxSizing: 'border-box', background: '#faf9f7', fontFamily: 'DM Sans, sans-serif' }}
                placeholder="Ex : Cabinet Alpha Etudes"
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                required
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Adresse email</label>
            <input
              style={{ width: '100%', fontSize: 14, border: '1px solid #e0ddd6', borderRadius: 10, padding: '10px 14px', color: '#1a1a18', outline: 'none', boxSizing: 'border-box', background: '#faf9f7', fontFamily: 'DM Sans, sans-serif' }}
              type="email"
              placeholder="contact@cabinet.ci"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Mot de passe</label>
            <input
              style={{ width: '100%', fontSize: 14, border: '1px solid #e0ddd6', borderRadius: 10, padding: '10px 14px', color: '#1a1a18', outline: 'none', boxSizing: 'border-box', background: '#faf9f7', fontFamily: 'DM Sans, sans-serif' }}
              type="password"
              placeholder="Minimum 8 caracteres"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{ width: '100%', fontSize: 15, fontWeight: 500, border: 'none', borderRadius: 10, padding: 12, background: '#1a1a18', color: '#f5f4f0', cursor: 'pointer', marginTop: 8, opacity: status === 'loading' ? 0.5 : 1, fontFamily: 'DM Sans, sans-serif' }}
          >
            {status === 'loading' ? 'Connexion...' : mode === 'login' ? 'Se connecter' : 'Creer le compte'}
          </button>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid #e8e5de', margin: '24px 0' }} />

        <div style={{ textAlign: 'center', fontSize: 13, color: '#888' }}>
          {mode === 'login' ? (
            <span>Pas encore de compte ?{' '}
              <button onClick={() => { setMode('register'); setStatus('idle'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a18', fontWeight: 500, fontSize: 13, textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif' }}>
                Creer un compte
              </button>
            </span>
          ) : (
            <span>Deja un compte ?{' '}
              <button onClick={() => { setMode('login'); setStatus('idle'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a18', fontWeight: 500, fontSize: 13, textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif' }}>
                Se connecter
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/Login.tsx', content, 'utf8');
console.log('Login.tsx ecrit avec succes');