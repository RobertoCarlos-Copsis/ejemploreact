import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { Check } from 'lucide-react';

const Stepper = () => {
    const { state } = useWizard();
    const { currentStep } = state;

    const steps = [
        { number: 1, label: 'Importar' },
        { number: 2, label: 'IA Extrae' },
        { number: 3, label: 'Completar' },
        { number: 4, label: 'Recibos' },
        { number: 5, label: 'Póliza' },
        { number: 6, label: 'Notificaciones' },
        { number: 7, label: 'Estadísticas' },
    ];

    return (
        <div className="stepper-wrapper">
            <div className="stepper">
                {steps.map((step, index) => {
                    const isActive = currentStep === step.number;
                    const isCompleted = currentStep > step.number;
                    const isLast = index === steps.length - 1;

                    return (
                        <React.Fragment key={step.number}>
                            <div className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                <div className="step-circle">
                                    {isCompleted ? <Check size={16} /> : step.number}
                                </div>
                                <span className="step-label">{step.label}</span>
                            </div>
                            {!isLast && (
                                <div className={`step-line ${isCompleted ? 'completed' : ''}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <style>{`
        .stepper-wrapper {
          width: 100%;
          margin-bottom: 4rem;
        }
        .stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1000px;
          margin: 0 auto;
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
          width: 80px;
        }
        .step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f3f4f6;
          border: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #9ca3af;
          margin-bottom: 0.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .step-item.active .step-circle {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
          transform: scale(1.1);
        }
        .step-item.completed .step-circle {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }
        .step-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-align: center;
        }
        .step-item.active .step-label {
          color: var(--primary);
        }
        .step-line {
          flex: 1;
          height: 3px;
          background: #e5e7eb;
          margin: 0 -10px 1.5rem -10px;
          transition: background 0.4s ease;
        }
        .step-line.completed {
          background: var(--success);
        }
      `}</style>
        </div>
    );
};

export default Stepper;
