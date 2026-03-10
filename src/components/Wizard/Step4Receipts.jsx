import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import { SendHorizontal, MessageCircle, Smartphone, BookText, BadgeCheck, MoveRight } from 'lucide-react';
import { formatCurrency } from '../../utils/utils';
import '../../styles/wizard/Step4Receipts.css';

const Step4Receipts = () => {
  const { state, dispatch, ACTIONS } = useWizard();
  const { receipts, client } = state;
  const [selectedReceipt, setSelectedReceipt] = useState(0);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [modalData, setModalData] = useState(null);

  const openModal = (type, title, icon) => {
    setModalData({
      type,
      title,
      icon,
      to: type === 'Email' ? (client.email || 'calidad2@copsis.com') : (client.phone || '4534534534'),
      message: type === 'Registro'
        ? ''
        : (type === 'Email'
          ? `Estimado/a ${client.name || 'JOSE JOSE TORRES DE LA CRUZ'},\n\nLe recordamos que su recibo ${selectedReceipt + 1}/${receipts.length} por ${formatCurrency(receipts[selectedReceipt].prima)} vence el ${receipts[selectedReceipt].periodo.split(' - ')[0]}.\n\nPuede realizar su pago en línea en: [LINK DE PAGO]`
          : `Recordatorio: Su recibo ${selectedReceipt + 1} de póliza por ${formatCurrency(receipts[selectedReceipt].prima)} está próximo a vencer. Pague aquí: [LINK]`)
    });
  };

  const closeModal = () => setModalData(null);

  const handleSendAction = () => {
    const { type } = modalData;
    dispatch({ type: ACTIONS.ADD_LOG, payload: `${type} para el recibo ${selectedReceipt + 1}` });

    closeModal();
    setActionSuccess({ type, message: `¡${type} enviado exitosamente!` });
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const togglePaid = (index) => {
    const receipt = receipts[index];
    const newStatus = receipt.status === 'PAGADO' ? 'PENDIENTE' : 'PAGADO';
    dispatch({
      type: ACTIONS.UPDATE_RECEIPT,
      payload: { id: receipt.id, data: { status: newStatus } }
    });
    dispatch({ type: ACTIONS.ADD_LOG, payload: `Recibo ${index + 1} marcado como ${newStatus}.` });
  };

  return (
    <div className="receipts-container">
      <p className="summary-text">Gestiona los pagos y comunicaciones de los recibos detectados.</p>

      <div className="receipts-layout">
        {/* Left: Receipt List */}
        <div className="receipt-sidebar">
          {receipts.map((r, i) => (
            <div
              key={i}
              className={`receipt-item-card ${selectedReceipt === i ? 'active' : ''}`}
              onClick={() => setSelectedReceipt(i)}
            >
              <div className="receipt-info">
                <span className="r-period">{r.periodo}</span>
                <span className="r-amount">{formatCurrency(r.prima)}</span>
              </div>
              <div className={`r-status ${r.status.toLowerCase()}`}>
                {r.status}
              </div>
              <MoveRight size={18} className="chevron" />
            </div>
          ))}
        </div>

        {/* Right: Actions Grid */}
        <div className="actions-panel">
          <div className="panel-header">
            <h3 className="panel-title">Acciones para Recibo {selectedReceipt + 1}</h3>
            {actionSuccess && (
              <div className="action-toast fade-in">
                <BadgeCheck size={16} /> {actionSuccess.message}
              </div>
            )}
          </div>

          <div className="actions-grid">
            <div className={`action-card email ${actionSuccess?.type === 'Email' ? 'successPulse' : ''}`} onClick={() => openModal('Email', 'Enviar Recordatorio por Correo', <SendHorizontal size={24} color="#2563eb" />)}>
              <div className="action-icon"><SendHorizontal size={32} /></div>
              <h4>Enviar Email</h4>
              <p>Envío de liga de pago por correo</p>
            </div>
            <div className={`action-card sms ${actionSuccess?.type === 'SMS' ? 'successPulse' : ''}`} onClick={() => openModal('SMS', 'Enviar Recordatorio por SMS', <MessageCircle size={24} color="#be185d" />)}>
              <div className="action-icon"><MessageCircle size={32} /></div>
              <h4>Enviar SMS</h4>
              <p>Recordatorio rápido al celular</p>
            </div>
            <div className={`action-card whatsapp ${actionSuccess?.type === 'WhatsApp' ? 'successPulse' : ''}`} onClick={() => openModal('WhatsApp', 'Enviar por WhatsApp', <Smartphone size={24} color="#15803d" />)}>
              <div className="action-icon"><Smartphone size={32} /></div>
              <h4>WhatsApp</h4>
              <p>Comunicación directa y oficial</p>
            </div>
            <div className={`action-card log ${actionSuccess?.type === 'Registro' ? 'successPulse' : ''}`} onClick={() => openModal('Registro', 'Registrar en Bitácora', <BookText size={24} color="#7c3aed" />)}>
              <div className="action-icon"><BookText size={32} /></div>
              <h4>Bitácora</h4>
              <p>Ver historial de este recibo</p>
            </div>
          </div>

          <div className="status-toggle-box">
            <p>¿Este recibo ya fue liquidado?</p>
            <button
              className={`btn ${receipts[selectedReceipt].status === 'PAGADO' ? 'btn-success' : 'btn-primary'}`}
              onClick={() => togglePaid(selectedReceipt)}
            >
              {receipts[selectedReceipt].status === 'PAGADO' ? 'Pagado ✓' : 'Marcar como Pagado'}
            </button>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={() => dispatch({ type: ACTIONS.NEXT_STEP })} style={{ margin: '3rem auto 0', display: 'flex' }}>
        Continuar al Siguiente Paso
      </button>

      {/* Action Modal */}
      {modalData && (
        <div className="modal-backdrop">
          <div className="modal-content fade-in">
            <div className="modal-header">
              {modalData.icon}
              <h3 className="modal-title">{modalData.title}</h3>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="modal-label">Para:</label>
                <input
                  type="text"
                  className="modal-input"
                  value={modalData.to}
                  onChange={(e) => setModalData({ ...modalData, to: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="modal-label">{modalData.type === 'Registro' ? 'Comentarios:' : 'Mensaje:'}</label>
                <textarea
                  className="modal-textarea"
                  rows="6"
                  placeholder={modalData.type === 'Registro' ? 'Ej: Cliente solicitó extensión de 5 días...' : ''}
                  value={modalData.message}
                  onChange={(e) => setModalData({ ...modalData, message: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn modal-btn-cancel" onClick={closeModal}>Cancelar</button>
              <button className="btn modal-btn-send" onClick={handleSendAction}>
                <span className="send-icon">{modalData.type === 'Registro' ? '↗' : '↗'}</span>
                {modalData.type === 'Registro' ? 'Guardar' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4Receipts;
