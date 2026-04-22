const fs = require('fs');

const content = `import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Type, Hash, MapPin, Camera, List, Trash2, Eye, GripVertical, ChevronDown, Send, CheckCircle, AlertCircle, X } from 'lucide-react';
import { createTemplate } from '../api/survey.service';

const QUESTION_TYPES = [
  { type: 'TEXT',   label: 'Texte',  color: '#1D9E75', placeholder: 'Ex : Quel est votre nom ?' },
  { type: 'NUMBER', label: 'Nombre', color: '#185FA5', placeholder: 'Ex : Quel est votre age ?' },
  { type: 'GPS',    label: 'GPS',    color: '#BA7517', placeholder: 'Ex : Localisation' },
  { type: 'PHOTO',  label: 'Photo',  color: '#993556', placeholder: 'Ex : Photo facade' },
  { type: 'SELECT', label: 'Choix',  color: '#534AB7', placeholder: 'Ex : Niveau satisfaction' },
];

const uid = () => Math.random().toString(36).slice(2, 9);

function TypeBadge({ type }) {
  const def = QUESTION_TYPES.find((t) => t.type === type);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: def.color + '18', color: def.color }}>
      {def.label}
    </span>
  );
}

function QuestionCard({ q, index, onChange, onDelete }) {
  const [optionInput, setOptionInput] = useState('');
  const def = QUESTION_TYPES.find((t) => t.type === q.type);

  const addOption = () => {
    const val = optionInput.trim();
    if (!val) return;
    onChange({ ...q, options: [...(q.options || []), val] });
    setOptionInput('');
  };

  return (
    <div style={{ border: '1px solid #e8e5de', borderRadius: 12, padding: '18px 20px', marginBottom: 12, background: '#faf9f7' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: '#bbb', fontWeight: 500 }}>{String(index + 1).padStart(2, '0')}</span>
        <TypeBadge type={q.type} />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#888', cursor: 'pointer' }}>
            <input type="checkbox" checked={q.is_required} onChange={(e) => onChange({ ...q, is_required: e.target.checked })} />
            Obligatoire
          </label>
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#aaa', fontSize: 14 }}>X</button>
        </div>
      </div>
      <input
        value={q.label}
        placeholder={def.placeholder}
        onChange={(e) => onChange({ ...q, label: e.target.value })}
        style={{ width: '100%', fontFamily: 'DM Sans, sans-serif', fontSize: 15, border: 'none', borderBottom: '1.5px solid ' + (q.label ? def.color : '#e0ddd6'), background: 'transparent', padding: '6px 0', color: '#1a1a18', outline: 'none', boxSizing: 'border-box' }}
      />
      {q.type === 'SELECT' && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#aaa', margin: '0 0 10px' }}>Options</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
            {(q.options || []).map((opt, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e0ddd6', borderRadius: 20, padding: '4px 12px', fontSize: 13 }}>
                <span>{opt}</span>
                <button onClick={() => onChange({ ...q, options: q.options.filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 11 }}>x</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={optionInput} placeholder="Ajouter une option..." onChange={(e) => setOptionInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addOption()} style={{ flex: 1, fontFamily: 'DM Sans, sans-serif', fontSize: 13, border: '1px solid #e0ddd6', borderRadius: 8, padding: '6px 12px', outline: 'none' }} />
            <button onClick={addOption} style={{ background: '#1a1a18', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: 14 }}>+</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SurveyBuilder() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState({ titre: '', description: '', country_code: 'CI', questions: [] });
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const addQuestion = (type) => {
    setDraft((d) => ({ ...d, questions: [...d.questions, { id: uid(), type, label: '', is_required: true, options: type === 'SELECT' ? [] : undefined }] }));
    setMenuOpen(false);
  };

  const updateQuestion = (id, q) => setDraft((d) => ({ ...d, questions: d.questions.map((x) => x.id === id ? q : x) }));
  const deleteQuestion = (id) => setDraft((d) => ({ ...d, questions: d.questions.filter((x) => x.id !== id) }));

  const handleSubmit = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const payload = {
        titre: draft.titre,
        description: draft.description || undefined,
        country_code: draft.country_code,
        questions: draft.questions.map((q, i) => ({ ordre: i, label: q.label, type: q.type, is_required: q.is_required, options: q.options && q.options.length ? q.options : undefined })),
      };
      await createTemplate(payload);
      setStatus('success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Erreur');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'DM Sans, sans-serif' }}>
      <nav style={{ background: '#fff', borderBottom: '0.5px solid #e8e5de', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', fontFamily: 'DM Sans, sans-serif' }}>
          ← Dashboard
        </button>
        <span style={{ fontSize: 13, color: '#aaa' }}>Nouvelle enquete</span>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 8px' }}>YIRA Etudes</p>
        <h1 style={{ fontSize: 30, fontWeight: 400, color: '#1a1a18', margin: '0 0 32px' }}>Creer une enquete</h1>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Titre</label>
          <input value={draft.titre} placeholder="Ex : Etude de niveau de vie Abidjan 2025" onChange={(e) => setDraft((d) => ({ ...d, titre: e.target.value }))} style={{ width: '100%', fontSize: 22, border: 'none', borderBottom: '1.5px solid #e0ddd6', background: 'transparent', padding: '6px 0', color: '#1a1a18', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Description (optionnelle)</label>
          <textarea value={draft.description} placeholder="Contexte, objectifs..." onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={2} style={{ width: '100%', fontSize: 14, border: 'none', borderBottom: '1px solid #e0ddd6', background: 'transparent', padding: '6px 0', color: '#444', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif' }} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e8e5de', margin: '24px 0' }} />
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#aaa', margin: '0 0 16px' }}>Questions · {draft.questions.length}</p>

        {draft.questions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: '#bbb', fontSize: 14, border: '1.5px dashed #e8e5de', borderRadius: 12, marginBottom: 12 }}>
            Aucune question pour l instant.
          </div>
        )}

        {draft.questions.map((q, i) => (
          <QuestionCard key={q.id} q={q} index={i} onChange={(updated) => updateQuestion(q.id, updated)} onDelete={() => deleteQuestion(q.id)} />
        ))}

        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 500, border: '1.5px dashed #d0cdc5', borderRadius: 10, padding: '10px 18px', background: 'transparent', color: '#666', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            + Ajouter une question
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #e0ddd6', borderRadius: 12, padding: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', zIndex: 50, minWidth: 200 }}>
              {QUESTION_TYPES.map((t) => (
                <button key={t.type} onClick={() => addQuestion(t.type)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', borderRadius: 8, padding: '9px 12px', fontSize: 14, color: '#1a1a18', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}>
                  <span style={{ width: 26, height: 26, borderRadius: 6, background: t.color + '18', color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{t.label[0]}</span>
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36, paddingTop: 24, borderTop: '1px solid #e8e5de' }}>
          <span style={{ fontSize: 13, color: '#aaa' }}>{draft.questions.length} question{draft.questions.length !== 1 ? 's' : ''}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setPreview(true)} disabled={!draft.titre} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, border: '1px solid #d0cdc5', borderRadius: 10, padding: '10px 18px', background: 'transparent', color: '#444', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Previsualiser
            </button>
            <button onClick={handleSubmit} disabled={!draft.titre || draft.questions.length === 0 || status === 'loading' || status === 'success'} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 10, padding: '10px 22px', background: '#1a1a18', color: '#f5f4f0', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: (!draft.titre || draft.questions.length === 0) ? 0.4 : 1 }}>
              {status === 'loading' ? 'Publication...' : status === 'success' ? 'Publie !' : 'Publier'}
            </button>
          </div>
        </div>

        {status === 'error' && <div style={{ marginTop: 12, background: '#FCEBEB', color: '#A32D2D', fontSize: 13, padding: '10px 14px', borderRadius: 8 }}>{errorMsg}</div>}
        {status === 'success' && <div style={{ marginTop: 12, background: '#EAF3DE', color: '#3B6D11', fontSize: 13, padding: '10px 14px', borderRadius: 8 }}>Enquete publiee ! Redirection...</div>}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/SurveyBuilder.tsx', content, 'utf8');
console.log('SurveyBuilder.tsx ecrit avec succes');