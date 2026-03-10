import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import { Inbox, TabletSmartphone, RotateCw, CheckSquare, ShieldCheck, FileDown } from 'lucide-react';
import { calculateDaysRemaining } from '../../utils/utils';
import '../../styles/wizard/Step5Delivery.css';

const Step5Delivery = () => {
  const { state, dispatch, ACTIONS } = useWizard();
  const { policy, client } = state;
  const policyData = policy.data || {};
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [modalData, setModalData] = useState(null);

  const expiration = policyData.endDate ? calculateDaysRemaining(policyData.endDate) : { label: 'Vencimiento pendiente', color: 'gray' };

  const handleActionClick = (type, title, icon) => {
    setSelectedMethod(type);
    setModalData({
      type,
      title,
      icon,
      to: client.email,
      description: type === 'Envío por Email'
        ? 'Se enviará un correo con un enlace a un landing de bienvenida donde el cliente podrá descargar su póliza en PDF.'
        : 'Se enviará un enlace seguro de acceso a la app móvil.'
    });
  };

  const closeModal = () => setModalData(null);

  const confirmAction = () => {
    dispatch({ type: ACTIONS.ADD_LOG, payload: `${modalData.type} enviado a ${modalData.to}` });
    closeModal();
  };

  const handleNext = () => {
    if (selectedMethod) {
      dispatch({ type: ACTIONS.ADD_LOG, payload: `Método de entrega seleccionado: ${selectedMethod}` });
    }
    dispatch({ type: ACTIONS.NEXT_STEP });
  };

  return (
    <div className="delivery-container">
      <div className="summary-banner">
        <div className={`banner-badge ${expiration.color}`}>
          {expiration.label}
        </div>
      </div>

      <div className="policy-preview-section fade-in">
        <div className="policy-doc-card">
          <div className="doc-header">
            <div className="insurer-logo-mock">
              <ShieldCheck size={32} color="#4f46e5" />
              <span>{policyData.insurer || 'HIR Seguros'}</span>
            </div>
            <div className="doc-status-badge">DOCUMENTO LISTO</div>
          </div>

          <div className="doc-body">
            <div className="doc-main-info">
              <div className="doc-field">
                <label>Número de Póliza</label>
                <strong>{policyData.policyNumber || '—'}</strong>
              </div>
              <div className="doc-field">
                <label>Tipo de Seguro</label>
                <p>{policyData.concept || '—'}</p>
              </div>
            </div>

            <div className="doc-sep"></div>

            <div className="doc-footer-info">
              <div className="doc-field">
                <label>Asegurado / Contratante</label>
                <strong>{client.name || '—'}</strong>
              </div>
              <div className="doc-dates">
                <div className="doc-field">
                  <label>Desde</label>
                  <span>{policyData.startDate || '—'}</span>
                </div>
                <div className="doc-field">
                  <label>Hasta</label>
                  <span>{policyData.endDate || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="delivery-card card">
        <h3 className="section-title">Acciones de Entrega y Renovación</h3>

        <div className="delivery-grid">
          <div className={`d-card email ${selectedMethod === 'Envío por Email' ? 'active' : ''}`} onClick={() => handleActionClick('Envío por Email', 'Enviar Póliza con TuPoliza', <Inbox size={24} color="#2563eb" />)}>
            {selectedMethod === 'Envío por Email' && <div className="card-check"><CheckSquare size={24} /></div>}
            <div className="d-icon-box"><Inbox size={32} /></div>
            <h4>TuPoliza</h4>
            <p>Envío por correo con landing</p>
          </div>

          <div className={`d-card app ${selectedMethod === 'Compartir en App' ? 'active' : ''}`} onClick={() => handleActionClick('Compartir en App', 'Compartir vía MiPoliza App', <TabletSmartphone size={24} color="#7c3aed" />)}>
            {selectedMethod === 'Compartir en App' && <div className="card-check"><CheckSquare size={24} /></div>}
            <div className="d-icon-box"><TabletSmartphone size={32} /></div>
            <h4>MiPoliza App</h4>
            <p>Compartir vía app móvil</p>
          </div>

          <div className={`d-card renewal ${selectedMethod === 'Recordatorio Renovación' ? 'active' : ''}`} onClick={() => { setSelectedMethod('Recordatorio Renovación'); }}>
            {selectedMethod === 'Recordatorio Renovación' && <div className="card-check"><CheckSquare size={24} /></div>}
            <div className="d-icon-box"><RotateCw size={32} /></div>
            <h4>Renovación</h4>
            <p>Recordatorio de vencimiento</p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleNext}
          style={{ marginTop: '2rem', width: '100%' }}>
          {selectedMethod ? 'Confirmar y Continuar' : 'Continuar sin Seleccionar'}
        </button>
      </div>

      {/* Action Modal */}
      {modalData && (
        <div className="modal-backdrop">
          <div className="modal-content fade-in">
            <div className="modal-header">
              {modalData.icon}
              <h3 className="modal-title">{modalData.title}</h3>
            </div>

            <p className="modal-desc">{modalData.description}</p>

            <div className="modal-body">
              <div className="modal-info-box">
                <div className="form-group">
                  <label className="modal-label" style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '0.25rem' }}>Enviar a: </label>
                  <input
                    type="text"
                    className="modal-input"
                    value={modalData.to}
                    onChange={(e) => setModalData({ ...modalData, to: e.target.value })}
                    style={{ border: 'none', padding: '0', fontWeight: '600', fontSize: '1rem', background: 'transparent' }}
                  />
                </div>
              </div>

              {modalData.type === 'Envío por Email' && (
                <div className="modal-features-box">
                  <p style={{ fontSize: '0.8125rem', color: '#4b5563', marginBottom: '0.5rem' }}>El cliente recibirá un enlace al landing de bienvenida donde podrá:</p>
                  <ul style={{ fontSize: '0.8125rem', color: '#4b5563', paddingLeft: '1.25rem', margin: 0 }}>
                    <li>Ver el detalle de su póliza</li>
                    <li>Descargar el PDF</li>
                    <li>Acceder a soporte</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn modal-btn-cancel" onClick={closeModal}>Cancelar</button>
              <button className="btn modal-btn-send" onClick={confirmAction}>
                <span className="send-icon">↗</span> Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5Delivery;
