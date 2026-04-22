import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTemplate } from '../api/survey.service';

const QUESTION_TYPES = [
  { type: 'TEXT',     label: 'Texte libre',     color: '#1D9E75' },
  { type: 'NUMBER',   label: 'Nombre',           color: '#185FA5' },
  { type: 'GPS',      label: 'Localisation GPS', color: '#BA7517' },
  { type: 'PHOTO',    label: 'Photo',            color: '#993556' },
  { type: 'SELECT',   label: 'Choix unique',     color: '#534AB7' },
  { type: 'MULTIPLE', label: 'Choix multiple',   color: '#0F6E56' },
];

const uid = () => Math.random().toString(36).slice(2, 9);

function Badge({ type }) {
  const def = QUESTION_TYPES.find((t) => t.type === type) || QUESTION_TYPES[0];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: def.color + '18', color: def.color }}>
      {def.label}
    </span>
  );
}

function QuestionCard({ q, index, onChange, onDelete }) {
  const [optionInput, setOptionInput] = useState('');
  const def = QUESTION_TYPES.find((t) => t.type === q.type) || QUESTION_TYPES[0];
  const hasOptions = q.type === 'SELECT' || q.type === 'MULTIPLE';

  const addOption = () => {
    const val = optionInput.trim();
    if (!val) return;
    onChange({ ...q, options: [...(q.options || []), val] });
    setOptionInput('');
  };

  return (
    <div style={{ border: '1px solid #e8e5de', borderRadius: 12, padding: '16px 20px', marginBottom: 12, background: '#faf9f7' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: '#bbb', fontWeight: 500, minWidth: 24 }}>{String(index + 1).padStart(2, '0')}</span>
        <Badge type={q.type} />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#888', cursor: 'pointer' }}>
            <input type="checkbox" checked={q.is_required} onChange={(e) => onChange({ ...q, is_required: e.target.checked })} />
            Obligatoire
          </label>
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 16, padding: 4, borderRadius: 6 }} title="Supprimer">✕</button>
        </div>
      </div>

      <input
        value={q.label}
        placeholder="Libelle de la question..."
        onChange={(e) => onChange({ ...q, label: e.target.value })}
        style={{ width: '100%', fontFamily: 'DM Sans, sans-serif', fontSize: 14, border: 'none', borderBottom: '1.5px solid ' + (q.label ? def.color : '#e0ddd6'), background: 'transparent', padding: '6px 0', color: '#1a1a18', outline: 'none', boxSizing: 'border-box', marginBottom: hasOptions ? 14 : 0 }}
      />

      {hasOptions && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#aaa', margin: '0 0 8px', letterSpacing: '0.06em' }}>
            Options {q.type === 'MULTIPLE' ? '(choix multiple)' : '(choix unique)'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {(q.options || []).map((opt, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e0ddd6', borderRadius: 20, padding: '4px 12px', fontSize: 13 }}>
                <span>{opt}</span>
                <button onClick={() => onChange({ ...q, options: q.options.filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 12, padding: 0 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={optionInput}
              placeholder="Nouvelle option..."
              onChange={(e) => setOptionInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addOption()}
              style={{ flex: 1, fontFamily: 'DM Sans, sans-serif', fontSize: 13, border: '1px solid #e0ddd6', borderRadius: 8, padding: '6px 12px', outline: 'none', background: '#fff' }}
            />
            <button onClick={addOption} style={{ background: '#1a1a18', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>+</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewModal({ draft, onClose, onSubmit, status, errorMsg }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,12,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#aaa', margin: '0 0 4px', letterSpacing: '0.1em' }}>Previsualisation</p>
            <h2 style={{ fontSize: 22, fontWeight: 400, color: '#1a1a18', margin: 0 }}>{draft.titre || 'Enquete sans titre'}</h2>
            {draft.description && <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>{draft.description}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#aaa', padding: 4 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {draft.questions.length === 0 && <p style={{ fontSize: 13, color: '#bbb', fontStyle: 'italic' }}>Aucune question ajoutee.</p>}
          {draft.questions.map((q, i) => {
            const def = QUESTION_TYPES.find((t) => t.type === q.type) || QUESTION_TYPES[0];
            const hasOptions = q.type === 'SELECT' || q.type === 'MULTIPLE';
            return (
              <div key={q.id} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0ede8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#bbb', fontWeight: 500 }}>{i + 1}</span>
                  <Badge type={q.type} />
                  {q.is_required && <span style={{ color: '#c0392b', fontSize: 16 }}>*</span>}
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18', margin: '0 0 12px' }}>{q.label || 'Question sans libelle'}</p>
                {q.type === 'TEXT' && <div style={{ border: '1px solid #e0ddd6', borderRadius: 8, height: 38, background: '#faf9f7' }} />}
                {q.type === 'NUMBER' && <div style={{ border: '1px solid #e0ddd6', borderRadius: 8, height: 38, background: '#faf9f7', width: 120 }} />}
                {q.type === 'GPS' && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#BA7517', background: '#FAEEDA40', border: '1px solid #BA751730', borderRadius: 8, padding: '10px 14px' }}>📍 Localisation automatique</div>}
                {q.type === 'PHOTO' && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 13, color: '#993556', background: '#FBEAF040', border: '1.5px dashed #99355640', borderRadius: 10, padding: 20 }}>📷 Prendre une photo</div>}
                {hasOptions && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(q.options || []).length === 0 && <span style={{ fontSize: 13, color: '#bbb', fontStyle: 'italic' }}>Aucune option definie</span>}
                    {(q.options || []).map((opt, j) => (
                      <label key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#333', cursor: 'pointer' }}>
                        <input type={q.type === 'MULTIPLE' ? 'checkbox' : 'radio'} name={"q-" + q.id} readOnly />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '14px 28px 24px', borderTop: '1px solid #e8e5de' }}>
          {status === 'success' && <div style={{ background: '#EAF3DE', color: '#3B6D11', fontSize: 13, padding: '8px 12px', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>✓ Enquete publiee avec succes !</div>}
          {status === 'error' && <div style={{ background: '#FCEBEB', color: '#A32D2D', fontSize: 13, padding: '8px 12px', borderRadius: 8, marginBottom: 8 }}>{errorMsg}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={onClose} style={{ flex: 1, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, border: '1px solid #d0cdc5', borderRadius: 10, padding: '10px 0', background: 'transparent', color: '#444', cursor: 'pointer' }}>Modifier</button>
            <button onClick={onSubmit} disabled={status === 'loading' || status === 'success'} style={{ flex: 2, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 10, padding: '10px 0', background: '#1a1a18', color: '#f5f4f0', cursor: 'pointer', opacity: (status === 'loading' || status === 'success') ? 0.5 : 1 }}>
              {status === 'loading' ? 'Publication...' : status === 'success' ? 'Publie !' : 'Publier l enquete'}
            </button>
          </div>
        </div>
      </div>
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
    const hasOptions = type === 'SELECT' || type === 'MULTIPLE';
    setDraft((d) => ({ ...d, questions: [...d.questions, { id: uid(), type, label: '', is_required: true, options: hasOptions ? [] : undefined }] }));
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
        questions: draft.questions.map((q, i) => ({
          ordre: i,
          label: q.label,
          type: q.type,
          is_required: q.is_required,
          options: q.options && q.options.length ? q.options : undefined,
        })),
      };
      await createTemplate(payload);
      setStatus('success');
      setTimeout(() => { setPreview(false); navigate('/dashboard'); }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de la publication');
      setStatus('error');
    }
  };

  const canPublish = draft.titre.trim() && draft.questions.length > 0 && draft.questions.every((q) => q.label.trim());

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'DM Sans, sans-serif' }}>
      <nav style={{ background: '#fff', borderBottom: '0.5px solid #e8e5de', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', fontFamily: 'DM Sans, sans-serif' }}>← Dashboard</button>
        <span style={{ fontSize: 13, color: '#aaa' }}>Nouvelle enquete</span>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 8px' }}>YIRA Etudes</p>
        <h1 style={{ fontSize: 28, fontWeight: 400, color: '#1a1a18', margin: '0 0 32px' }}>Creer une enquete</h1>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Titre *</label>
          <input value={draft.titre} placeholder="Ex : Etude niveau de vie Abidjan 2025" onChange={(e) => setDraft((d) => ({ ...d, titre: e.target.value }))} style={{ width: '100%', fontSize: 20, border: 'none', borderBottom: '1.5px solid ' + (draft.titre ? '#1a1a18' : '#e0ddd6'), background: 'transparent', padding: '6px 0', color: '#1a1a18', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif' }} />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Description (optionnelle)</label>
          <textarea value={draft.description} placeholder="Contexte, objectifs, instructions..." onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={2} style={{ width: '100%', fontSize: 14, border: 'none', borderBottom: '1px solid #e0ddd6', background: 'transparent', padding: '6px 0', color: '#444', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif' }} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e8e5de', margin: '0 0 20px' }} />
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#aaa', margin: '0 0 16px' }}>Questions · {draft.questions.length}</p>

        {draft.questions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: '#bbb', fontSize: 14, border: '1.5px dashed #e8e5de', borderRadius: 12, marginBottom: 12 }}>
            Aucune question pour l instant. Cliquez sur le bouton ci-dessous.
          </div>
        )}

        {draft.questions.map((q, i) => (
          <QuestionCard key={q.id} q={q} index={i} onChange={(updated) => updateQuestion(q.id, updated)} onDelete={() => deleteQuestion(q.id)} />
        ))}

        <div style={{ position: 'relative', marginBottom: 32 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 500, border: '1.5px dashed #d0cdc5', borderRadius: 10, padding: '10px 18px', background: 'transparent', color: '#666', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}>
            + Ajouter une question
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #e0ddd6', borderRadius: 12, padding: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', zIndex: 50, minWidth: 220 }}>
              {QUESTION_TYPES.map((t) => (
                <button key={t.type} onClick={() => addQuestion(t.type)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', borderRadius: 8, padding: '9px 12px', fontSize: 14, color: '#1a1a18', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}>
                  <span style={{ width: 28, height: 28, borderRadius: 7, background: t.color + '18', color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{t.label[0]}</span>
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '1px solid #e8e5de' }}>
          <span style={{ fontSize: 13, color: '#aaa' }}>
            {draft.questions.length} question{draft.questions.length !== 1 ? 's' : ''} · {draft.questions.filter((q) => q.is_required).length} obligatoire{draft.questions.filter((q) => q.is_required).length !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setStatus('idle'); setErrorMsg(''); setPreview(true); }} disabled={!draft.titre} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, border: '1px solid #d0cdc5', borderRadius: 10, padding: '10px 18px', background: 'transparent', color: '#444', cursor: draft.titre ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans, sans-serif', opacity: draft.titre ? 1 : 0.4 }}>
              Previsualiser
            </button>
            <button onClick={() => { setStatus('idle'); setErrorMsg(''); setPreview(true); }} disabled={!canPublish} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 10, padding: '10px 22px', background: '#1a1a18', color: '#f5f4f0', cursor: canPublish ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans, sans-serif', opacity: canPublish ? 1 : 0.4 }}>
              Publier
            </button>
          </div>
        </div>
      </div>

      {preview && (
        <PreviewModal
          draft={draft}
          onClose={() => { setPreview(false); if (status !== 'success') setStatus('idle'); }}
          onSubmit={handleSubmit}
          status={status}
          errorMsg={errorMsg}
        />
      )}
    </div>
  );
}
