import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { CircleDollarSign, RotateCw, AlertTriangle, Percent, BellDot } from 'lucide-react';
import '../../styles/wizard/Step6Notifications.css';

const Step6Notifications = () => {
    const { state, dispatch, ACTIONS } = useWizard();
    const { notifications } = state;

    const toggleNotification = (key) => {
        dispatch({
            type: ACTIONS.UPDATE_NOTIFICATIONS,
            payload: { [key]: { ...notifications[key], active: !notifications[key].active } }
        });
    };

    const notifOptions = [
        { key: 'cobranza', label: 'Cobranza (CxC)', desc: 'Recordatorios automáticos de pago 15, 7 y 3 días antes del vencimiento', icon: <CircleDollarSign size={24} />, color: '#10b981', bg: '#ecfdf5', border: '#d1fae5' },
        { key: 'renovacion', label: 'Renovaciones', desc: 'Alertas de renovación 60, 30 y 15 días antes del vencimiento', icon: <RotateCw size={24} />, color: '#f97316', bg: '#fff7ed', border: '#ffedd5' },
        { key: 'siniestros', label: 'Siniestros', desc: 'Actualizaciones sobre siniestros registrados y su seguimiento', icon: <AlertTriangle size={24} />, color: '#6b7280', bg: '#f9fafb', border: '#f3f4f6' },
        { key: 'comisiones', label: 'Comisiones', desc: 'Avisos cuando se registren nuevos pagos de comisiones', icon: <Percent size={24} />, color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' },
        { key: 'generales', label: 'Notificaciones Generales', desc: 'Actualizaciones del sistema y novedades de la plataforma', icon: <BellDot size={24} />, color: '#3b82f6', bg: '#eff6ff', border: '#dbeafe' },
    ];

    return (
        <div className="notif-container">
            <div className="notif-list">
                {notifOptions.map((opt) => (
                    <div
                        key={opt.key}
                        className="notif-item"
                        style={{ background: opt.bg, borderColor: opt.border }}
                    >
                        <div className="notif-icon" style={{ background: 'white', color: opt.color }}>
                            {opt.icon}
                        </div>
                        <div className="notif-details">
                            <h4 style={{ color: '#111827' }}>{opt.label}</h4>
                            <p>{opt.desc}</p>
                        </div>
                        <div className="notif-toggle">
                            <label className="switch" style={{ '--active-color': opt.color }}>
                                <input
                                    type="checkbox"
                                    checked={notifications[opt.key].active}
                                    onChange={() => toggleNotification(opt.key)}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="info-box-footer">
                <BellDot size={20} color="#3b82f6" />
                <div className="info-text">
                    <h5>Notificaciones configuradas</h5>
                    <p>Las notificaciones activas se enviarán automáticamente por correo, SMS o WhatsApp según tus preferencias.</p>
                </div>
            </div>

            <button className="btn btn-primary" onClick={() => dispatch({ type: ACTIONS.NEXT_STEP })} style={{ marginTop: '2.5rem', width: '300px' }}>
                Ver Estadísticas Finales
            </button>
        </div>
    );
};

export default Step6Notifications;
