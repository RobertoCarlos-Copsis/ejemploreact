import React, { useState, useRef, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import '../../styles/wizard/CameraModal.css';

const CameraModal = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }, // Preferir cámara trasera en móviles
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
            setError(null);
        } catch (err) {
            console.error("Error al acceder a la cámara:", err);
            setError("No se pudo acceder a la cámara. Revisa los permisos.");
        }
    };

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Ajustar canvas al tamaño del video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Dibujar el frame actual
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convertir a Blob/File
        canvas.toBlob((blob) => {
            const file = new File([blob], `captura_poliza_${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
            onClose();
        }, 'image/jpeg', 0.9);
    };

    if (!isOpen) return null;

    return (
        <div className="camera-modal-overlay">
            <div className="camera-modal-content">
                <div className="camera-modal-header">
                    <h3>Tomar Foto de Póliza</h3>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="camera-view-container">
                    {error ? (
                        <div className="camera-error">
                            <AlertCircle size={48} color="#ef4444" />
                            <p>{error}</p>
                            <button className="btn btn-primary" onClick={startCamera}>Reintentar</button>
                        </div>
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline className="video-stream" />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            <div className="camera-overlay-guide">
                                <div className="guide-box"></div>
                            </div>
                        </>
                    )}
                </div>

                <div className="camera-modal-footer">
                    <p className="camera-hint">Centra la carátula de la póliza en el recuadro</p>
                    <div className="camera-actions">
                        <button className="capture-btn" onClick={capturePhoto} disabled={!stream}>
                            <div className="capture-inner"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CameraModal;
