import React, { useMemo, useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import { Mails, Smartphone, Baseline, HardDriveDownload, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../../utils/utils';
import '../../styles/wizard/Step3Completion.css';

const Step3Completion = () => {
  const { state, dispatch, ACTIONS } = useWizard();
  const { client, receipts, commissionPercentage } = state;
  const [errors, setErrors] = useState({});

  const handleClientChange = (e) => {
    let { name, value } = e.target;

    // Filtro estricto para número de teléfono: solo dígitos y máximo 10
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    dispatch({ type: ACTIONS.UPDATE_CLIENT, payload: { [name]: value } });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleCommissionChange = (e) => {
    dispatch({ type: ACTIONS.UPDATE_COMMISSION, payload: Number(e.target.value) });
  };

  const calculatedCommissions = useMemo(() => {
    return receipts.map(r => ({
      ...r,
      commission: r.prima * (commissionPercentage / 100)
    }));
  }, [receipts, commissionPercentage]);

  const totalCommission = useMemo(() => {
    return calculatedCommissions.reduce((sum, r) => sum + r.commission, 0);
  }, [calculatedCommissions]);

  const validate = () => {
    const newErrors = {};

    if (!client.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!client.phone) {
      newErrors.phone = 'El número celular es requerido';
    } else if (!/^[0-9]{10}$/.test(client.phone)) {
      newErrors.phone = 'El celular debe tener exactamente 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      dispatch({ type: ACTIONS.ADD_LOG, payload: `Datos de contacto y comisión (${commissionPercentage}%) configurados.` });
      dispatch({ type: ACTIONS.NEXT_STEP });
    }
  };

  return (
    <div className="completion-container">
      <p className="summary-text">Algunos datos no están en la carátula. Por favor complétalos para activar todas las funcionalidades.</p>

      <div className="form-card card">
        <div className="form-group">
          <label className="form-label">
            <Mails size={16} className="label-icon" /> Correo Electrónico del Cliente <span className="required">*</span>
          </label>
          <input
            type="email"
            name="email"
            className={`form-input ${errors.email ? 'is-invalid' : ''}`}
            placeholder="ejemplo@correo.com"
            value={client.email || ''}
            onChange={handleClientChange}
          />
          {errors.email ? (
            <p className="error-text"><ShieldAlert size={14} /> {errors.email}</p>
          ) : (
            <p className="helper-text">Necesario para enviar póliza y notificaciones por correo</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            <Smartphone size={16} className="label-icon" /> Número de Celular <span className="required">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
            placeholder="5512345678"
            value={client.phone || ''}
            onChange={handleClientChange}
          />
          {errors.phone ? (
            <p className="error-text"><ShieldAlert size={14} /> {errors.phone}</p>
          ) : (
            <p className="helper-text">Necesario para enviar SMS y mensajes de WhatsApp</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            <Baseline size={16} className="label-icon" /> Porcentaje de Comisión
          </label>
          <div className="slider-group">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              className="commission-slider"
              value={commissionPercentage}
              onChange={handleCommissionChange}
            />
            <span className="slider-value">{commissionPercentage}%</span>
          </div>
          <p className="helper-text">Porcentaje de comisión que recibes por esta póliza</p>
        </div>

        <div className="commission-summary">
          <h3>Comisiones calculadas:</h3>
          <div className="summary-rows">
            {calculatedCommissions.map((r, i) => (
              <div key={i} className="summary-row">
                <span>Recibo {i + 1}/{receipts.length}:</span>
                <strong>{formatCurrency(r.commission)}</strong>
              </div>
            ))}
            <div className="summary-row total">
              <span>Total Comisión:</span>
              <strong>{formatCurrency(totalCommission)}</strong>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '2rem', width: '100%' }}>
          <HardDriveDownload size={18} /> Guardar y Continuar
        </button>
      </div>
    </div>
  );
};

export default Step3Completion;
