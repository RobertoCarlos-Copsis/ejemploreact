import React, { useState, useEffect } from 'react';
import { useWizard } from '../../context/WizardContext';
import { Contact, Files, CalendarDays, Banknote, BadgeCheck, Loader2 } from 'lucide-react';
import EditableField from './EditableField';
import '../../styles/wizard/Step2Extraction.css';

const Step2Extraction = () => {
  const { state, dispatch, ACTIONS } = useWizard();
  const [loading, setLoading] = useState(true);

  // Loader simulando análisis de IA
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Confirmar paso
  const handleConfirm = () => {
    dispatch({ type: ACTIONS.ADD_LOG, payload: 'Datos extraídos confirmados por el usuario.' });
    dispatch({ type: ACTIONS.NEXT_STEP });
  };

  // Actualizar cliente
  const updateClientName = (val) => {
    dispatch({ type: ACTIONS.UPDATE_CLIENT, payload: { name: val } });
  };

  // Función genérica para actualizar campos de póliza
  const updatePolicyField = (field, value) => {
    dispatch({
      type: ACTIONS.UPDATE_POLICY_DATA,
      payload: {
        clientData: state.client,
        policyData: {
          ...state.policy?.data,
          [field]: value
        },
        receipts: state.receipts
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

  const displayData = state.policy?.data || {};

  return (
    <div className="extraction-container">

      <p className="summary-text">
        Nuestra IA ha leído y extraído los siguientes datos.{' '}
        <span className="edit-hint">
          Toca el lápiz ✏️ para agregar o corregir información.
        </span>
      </p>

      <div className="grid-cards">

        {/* DATOS CLIENTE */}
        <div className="info-card client">
          <div className="card-header">
            <div className="icon-box blue">
              <Contact size={20} />
            </div>
            <h3>Datos del Cliente</h3>
          </div>

          <EditableField
            label="Nombre Completo"
            value={state.client?.name || 'N/A'}
            onSave={updateClientName}
          />

          <div className="data-item">
            <label>Dirección</label>
            <p>{state.client?.address || '—'}</p>
          </div>
        </div>

        {/* DATOS POLIZA */}
        <div className="info-card policy">
          <div className="card-header">
            <div className="icon-box green">
              <Files size={20} />
            </div>
            <h3>Datos de la Póliza</h3>
          </div>

          <div className="data-item">
            <label>Número de Póliza</label>
            <p>{displayData.policyNumber || '—'}</p>
          </div>

          <EditableField
            label="Concepto / Tipo de Seguro"
            value={displayData.concept || 'N/A'}
            onSave={(val) => updatePolicyField('concept', val)}
          />

          <EditableField
            label="Clave de Agente"
            value={displayData.agentCode || 'N/A'}
            onSave={(val) => updatePolicyField('agentCode', val)}
          />
        </div>

        {/* VIGENCIA */}
        <div className="info-card validity">
          <div className="card-header">
            <div className="icon-box orange">
              <CalendarDays size={20} />
            </div>
            <h3>Vigencia</h3>
          </div>

          <div className="data-item">
            <label>Fecha de Inicio</label>
            <p>{displayData.startDate || '—'}</p>
          </div>

          <div className="data-item">
            <label>Fecha de Fin</label>
            <p>{displayData.endDate || '—'}</p>
          </div>
        </div>

        {/* RECIBOS */}
        <div className="info-card receipts">
          <div className="card-header">
            <div className="icon-box yellow">
              <Banknote size={20} />
            </div>
            <h3>
              Recibos {state.receipts?.length ? `(${state.receipts.length} encontrados)` : ''}
            </h3>
            {state.commissionPercentage > 0 && (
              <span className="commission-tag">Comisión: {state.commissionPercentage}%</span>
            )}
          </div>

          <div className="receipt-list">
            {state.receipts?.length ? (
              state.receipts.map((r, i) => (
                <div className="receipt-row" key={r.id}>
                  <span>
                    Recibo {i + 1}/{state.receipts.length}
                    <small> {r.periodo}</small>
                  </span>

                  <strong>
                    ${r.prima.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              ))
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Sin recibos detectados
              </p>
            )}
          </div>
        </div>

      </div>

      <button
        className="btn btn-primary"
        onClick={handleConfirm}
        style={{ margin: '3rem auto 0', display: 'flex', width: 'fit-content' }}
      >
        <BadgeCheck size={18} />
        Confirmar y Continuar
      </button>

    </div>
  );
};

export default Step2Extraction;