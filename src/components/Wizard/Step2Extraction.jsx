import React, { useState, useEffect } from 'react';
import { useWizard } from '../../context/WizardContext';
import { Contact, Files, CalendarDays, Banknote, BadgeCheck, Loader2 } from 'lucide-react';
import EditableField from './EditableField';
import '../../styles/wizard/Step2Extraction.css';

const Step2Extraction = () => {
  const { state, dispatch, ACTIONS } = useWizard();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      // Inyectar datos demo SOLO si no se cargó ningún PDF real en el paso anterior
      const alreadyHasData = state.policy?.data?.policyNumber && state.policy.data.policyNumber !== 'N/A';
      if (!alreadyHasData) {
        dispatch({
          type: ACTIONS.UPDATE_POLICY_DATA,
          payload: {
            clientData: { name: 'JOSE JOSE TORRES DE LA CRUZ', address: 'AV. DEL PRADO NO. 300' },
            policyData: {
              policyNumber: 'FW998873',
              concept: 'SEGURO DE AUTOMÓVIL',
              agentCode: '665534',
              startDate: '15 Feb 2025',
              endDate: '15 Feb 2026'
            },
            receipts: [
              { id: 1, prima: 24238.19, periodo: '15 Feb 2025 - 15 Ago 2025', status: 'PENDIENTE' },
              { id: 2, prima: 21154.23, periodo: '15 Ago 2025 - 15 Feb 2026', status: 'PENDIENTE' }
            ]
          }
        });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = () => {
    dispatch({ type: ACTIONS.ADD_LOG, payload: 'Datos extraídos confirmados por el usuario.' });
    dispatch({ type: ACTIONS.NEXT_STEP });
  };

  const updateClientName = (val) => {
    dispatch({ type: ACTIONS.UPDATE_CLIENT, payload: { name: val } });
  };

  const updateAgentCode = (val) => {
    dispatch({
      type: ACTIONS.UPDATE_POLICY_DATA,
      payload: {
        clientData: { name: state.client.name, address: state.client.address },
        policyData: { ...state.policy.data, agentCode: val },
        receipts: state.receipts,
      }
    });
  };

  const updateConcept = (val) => {
    dispatch({
      type: ACTIONS.UPDATE_POLICY_DATA,
      payload: {
        clientData: { name: state.client.name, address: state.client.address },
        policyData: { ...state.policy.data, concept: val },
        receipts: state.receipts,
      }
    });
  };

  if (loading) {
    return (
      <div className="extraction-loading">
        <div className="pulse-container">
          <Files size={48} color="var(--primary)" />
        </div>
        <h3>Analizando documento con IA...</h3>
        <p>Extrayendo datos de la póliza, cliente y recibos.</p>
        <Loader2 size={24} className="animate-spin" style={{ marginTop: '1rem', color: '#3b82f6' }} />
      </div>
    );
  }

  const { data: extractedData } = state.policy;
  const displayData = extractedData || {
    policyNumber: '—', concept: '—', agentCode: '—', startDate: '—', endDate: '—'
  };

  return (
    <div className="extraction-container">
      <p className="summary-text">
        Nuestra IA ha leído y extraído los siguientes datos.{' '}
        <span className="edit-hint">Toca el lápiz ✏️ para agregar el concepto de la poliza.</span>
      </p>

      <div className="grid-cards">
        {/* DATOS DEL CLIENTE */}
        <div className="info-card client">
          <div className="card-header">
            <div className="icon-box blue"><Contact size={20} /></div>
            <h3>Datos del Cliente</h3>
          </div>
          <EditableField
            label="Nombre Completo"
            value={state.client.name || 'N/A'}
            onSave={updateClientName}
          />
          <div className="data-item">
            <label>Dirección</label>
            <p>{state.client.address || '—'}</p>
          </div>
        </div>

        {/* DATOS DE LA PÓLIZA */}
        <div className="info-card policy">
          <div className="card-header">
            <div className="icon-box green"><Files size={20} /></div>
            <h3>Datos de la Póliza</h3>
          </div>
          <div className="data-item">
            <label>Número de Póliza</label>
            <p>{displayData.policyNumber}</p>
          </div>
          <EditableField
            label="Concepto / Tipo de Seguro"
            value={displayData.concept || 'N/A'}
            onSave={updateConcept}
          />
          <EditableField
            label="Clave de Agente"
            value={displayData.agentCode || 'N/A'}
            onSave={updateAgentCode}
          />
        </div>

        {/* VIGENCIA */}
        <div className="info-card validity">
          <div className="card-header">
            <div className="icon-box purple"><CalendarDays size={20} /></div>
            <h3>Vigencia</h3>
          </div>
          <div className="data-item">
            <label>Fecha de Inicio</label>
            <p>{displayData.startDate}</p>
          </div>
          <div className="data-item">
            <label>Fecha de Fin</label>
            <p>{displayData.endDate}</p>
          </div>
        </div>

        {/* RECIBOS */}
        <div className="info-card receipts">
          <div className="card-header">
            <div className="icon-box yellow"><Banknote size={20} /></div>
            <h3>Recibos ({state.receipts.length > 0 ? `${state.receipts.length} encontrados` : 'SEMESTRAL'})</h3>
          </div>
          <div className="receipt-list">
            {state.receipts.length > 0 ? state.receipts.map((r, i) => (
              <div className="receipt-row" key={r.id}>
                <span>Recibo {i + 1}/{state.receipts.length} <small>{r.periodo}</small></span>
                <strong>${r.prima.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
              </div>
            )) : (
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Sin recibos detectados</p>
            )}
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleConfirm} style={{ margin: '3rem auto 0', display: 'flex', width: 'fit-content' }}>
        <BadgeCheck size={18} /> Confirmar y Continuar
      </button>
    </div>
  );
};

export default Step2Extraction;
