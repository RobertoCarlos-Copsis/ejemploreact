import React from 'react';
import { WizardProvider, useWizard } from './context/WizardContext';
import Stepper from './components/common/Stepper';
import Step1Import from './components/Wizard/Step1Import';
import Step2Extraction from './components/Wizard/Step2Extraction';
import Step3Completion from './components/Wizard/Step3Completion';
import Step4Receipts from './components/Wizard/Step4Receipts';
import Step5Delivery from './components/Wizard/Step5Delivery';
import Step6Notifications from './components/Wizard/Step6Notifications';
import Step7Dashboard from './components/Wizard/Step7Dashboard';
import './styles/global.css';

function AppContent() {
  const { state } = useWizard();
  const { currentStep } = state;

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Import />;
      case 2: return <Step2Extraction />;
      case 3: return <Step3Completion />;
      case 4: return <Step4Receipts />;
      case 5: return <Step5Delivery />;
      case 6: return <Step6Notifications />;
      case 7: return <Step7Dashboard />;
      default: return <Step1Import />;
    }
  };

  return (
    <div className="app-container">
      <header className="header-brand">
        <div className="container header-container">
          <div className="logo-box">q</div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>qCRM 2.0</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Demo Interactiva</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>Paso {currentStep} de 7</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {currentStep === 1 ? 'Sube tu póliza' :
                currentStep === 2 ? 'Datos extraídos' :
                  currentStep === 3 ? 'Datos faltantes' :
                    currentStep === 4 ? 'Gestión de recibos' :
                      currentStep === 5 ? 'Entrega póliza' :
                        currentStep === 6 ? 'Configura alertas' : 'Ver resultados'}
            </p>
          </div>
        </div>
      </header>

      <main className="wizard-main">
        <div className="container">
          <Stepper />
          {renderStep()}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="logo-box">q</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>qCRM 2.0</h2>
            </div>
            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
              La solución completa para gestionar tu cartera de seguros
            </p>
            <button className="btn-demo">Solicitar Demo Completa</button>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '3rem' }}>
              © 2025 qCRM 2.0. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <WizardProvider>
      <AppContent />
    </WizardProvider>
  );
}

export default App;
