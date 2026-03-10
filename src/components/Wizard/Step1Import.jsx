import React, { useState, useRef, useCallback } from 'react';
import { useWizard } from '../../context/WizardContext';
import { UploadCloud, FileImage, TabletSmartphone, BadgeCheck, Cpu, AlertCircle, Focus, Camera } from 'lucide-react';
import { extractTextFromPDF, parsePolicyData } from '../../services/pdfExtractor';
import CameraModal from './CameraModal';
import '../../styles/wizard/Step1Import.css';

const Step1Import = () => {
    const { dispatch, ACTIONS } = useWizard();
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef(null);

    const processFile = async (file) => {
        if (!file) return;

        // Validar tipo de archivo
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setErrorMsg('Formato no válido. Sube un PDF, JPG o PNG.');
            setUploadStatus('error');
            return;
        }

        // Validar tamaño (10MB máx)
        if (file.size > 10 * 1024 * 1024) {
            setErrorMsg('El archivo supera el límite de 10MB.');
            setUploadStatus('error');
            return;
        }

        setFileName(file.name);
        setUploadStatus('uploading');
        setProgress(0);
        setErrorMsg('');

        // Simular progreso visual mientras se procesa
        let p = 0;
        const progressInterval = setInterval(() => {
            p += Math.floor(Math.random() * 10) + 1;
            if (p >= 90) {
                clearInterval(progressInterval);
                setProgress(90);
            } else {
                setProgress(p);
            }
        }, 150);

        try {
            let extractedData = null;

            if (file.type === 'application/pdf') {
                const text = await extractTextFromPDF(file);
                extractedData = parsePolicyData(text);
            } else {
                // Simular delay de OCR para fotos
                await new Promise(r => setTimeout(r, 2000));

                // Si es imagen, intentamos cargar datos realistas o mock base
                extractedData = {
                    clientData: { name: 'ANA GARCIA LUNA', address: 'AV. INSURGENTES SUR 123, CDMX' },
                    policyData: {
                        policyNumber: 'HIR-' + Math.floor(Math.random() * 1000000),
                        concept: 'SEGURO COLECTIVO DE ACCIDENTES',
                        agentCode: '887722',
                        startDate: '01/01/2026',
                        endDate: '01/01/2027',
                    },
                    receipts: [
                        { id: 1, prima: 1250.50, periodo: 'Pago Anual', status: 'PENDIENTE' }
                    ],
                };
            }

            setProgress(100);

            // Guardar datos en estado global
            dispatch({ type: ACTIONS.UPDATE_POLICY_DATA, payload: extractedData });
            dispatch({ type: ACTIONS.UPDATE_POLICY_FILE, payload: { name: file.name, size: `${(file.size / 1024).toFixed(1)}KB`, status: 'success' } });
            dispatch({ type: ACTIONS.ADD_LOG, payload: `Documento "${file.name}" capturado y procesado con IA.` });

            setUploadStatus('success');

            setTimeout(() => {
                dispatch({ type: ACTIONS.NEXT_STEP });
            }, 1200);

        } catch (err) {
            clearInterval(progressInterval);
            setErrorMsg('Error al procesar el archivo. Intenta de nuevo.');
            setUploadStatus('error');
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const triggerFileInput = () => fileInputRef.current?.click();

    const handleRetry = () => {
        setUploadStatus('idle');
        setProgress(0);
        setFileName('');
        setErrorMsg('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="step-container">
            <div className="step-header">
                <h2 className="step-title">Paso 1: Importa tu Póliza</h2>
                <p className="step-subtitle">
                    Sube un PDF o toma una foto clara de la carátula. Nuestra IA extraerá automáticamente todos los datos.
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                style={{ display: 'none' }}
                onChange={handleFileInput}
            />

            <CameraModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onCapture={processFile}
            />

            <div className="upload-section">
                <div
                    className={`dropzone ${uploadStatus === 'success' ? 'success' : ''} ${isDragging ? 'dragging' : ''} ${uploadStatus === 'error' ? 'error-state' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={uploadStatus === 'idle' || uploadStatus === 'error' ? triggerFileInput : undefined}
                    style={{ cursor: (uploadStatus === 'idle' || uploadStatus === 'error') ? 'pointer' : 'default' }}
                >
                    {uploadStatus === 'idle' && (
                        <>
                            <div className="icon-group">
                                <div className="icon-circle blue"><FileImage size={32} /></div>
                                <div className="icon-circle purple"><Focus size={32} /></div>
                            </div>
                            <h3 className="dz-title">Arrastra tu archivo aquí</h3>
                            <p className="dz-subtitle">o selecciona una opción debajo</p>

                            <div className="dz-actions">
                                <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
                                    <UploadCloud size={18} /> Subir PDF o Imagen
                                </button>
                                <button className="btn btn-purple" onClick={(e) => { e.stopPropagation(); setIsCameraOpen(true); }}>
                                    <Camera size={18} /> Tomar Foto
                                </button>
                            </div>
                            <p className="dz-info">Formatos aceptados: PDF, JPG, PNG • Máximo 10MB</p>
                        </>
                    )}

                    {uploadStatus === 'uploading' && (
                        <div className="uploading-state">
                            <div className="ai-scanner">
                                <div className="scanner-line"></div>
                                <Cpu size={48} className="ai-icon" />
                            </div>
                            <h3 className="dz-title" style={{ marginTop: '1rem', fontSize: '1.25rem' }}>Analizando con IA</h3>
                            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Leyendo documento: <strong>{fileName}</strong></p>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>Procesando... {progress}%</p>
                        </div>
                    )}

                    {uploadStatus === 'success' && (
                        <div className="success-state">
                            <div className="icon-circle success-bg fade-in">
                                <BadgeCheck size={48} color="white" />
                            </div>
                            <h3 className="dz-title" style={{ marginTop: '1.5rem' }}>¡Documento Capturado!</h3>
                            <p className="dz-subtitle">Iniciando extracción de datos...</p>
                        </div>
                    )}

                    {uploadStatus === 'error' && (
                        <div className="error-display">
                            <div className="icon-circle error-bg">
                                <AlertCircle size={48} color="white" />
                            </div>
                            <h3 className="dz-title" style={{ marginTop: '1.5rem', color: '#dc2626' }}>Error</h3>
                            <p style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{errorMsg}</p>
                            <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); handleRetry(); }}>
                                Reintentar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="feature-cards">
                <div className="f-card">
                    <FileImage size={24} className="f-icon" color="#3b82f6" />
                    <span>Formatos PDF</span>
                </div>
                <div className="f-card">
                    <TabletSmartphone size={24} className="f-icon" color="#a855f7" />
                    <span>Mobile Ready</span>
                </div>
                <div className="f-card success">
                    <BadgeCheck size={24} className="f-icon" color="#10b981" />
                    <span>OCR Inteligente</span>
                </div>
            </div>
        </div>
    );
};

export default Step1Import;
