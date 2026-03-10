/**
 * pdfExtractor.js
 * Servicio para extraer texto de archivos PDF y parsear datos de pólizas de seguros.
 * Usa pdfjs-dist en el lado del cliente, sin necesidad de backend.
 *
 * NOTA: El worker se importa desde node_modules usando el sufijo ?url de Vite.
 * Esto evita el error 404 que ocurre al apuntar al CDN de cdnjs.
 */

import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configurar el worker local (NO usar CDN, la versión 5.5.x no está en cdnjs)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Extrae todo el texto de un archivo PDF.
 * @param {File} file - Archivo PDF seleccionado por el usuario
 * @returns {Promise<string>} - Texto completo extraído del PDF
 */
export async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
}

/**
 * Intenta extraer un campo de texto buscando patrones en el texto del PDF.
 */
function extractField(text, patterns, fallback = 'N/A') {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim()) {
            return match[1].trim();
        }
    }
    return fallback;
}

/**
 * Parsea el texto extraído del PDF para detectar campos de una póliza de seguros mexicana.
 * @param {string} text - Texto completo extraído del PDF
 * @returns {object} - Datos estructurados de la póliza listos para el estado global
 */
export function parsePolicyData(text) {
    const upperText = text.toUpperCase();

    // --- DATOS DEL CLIENTE ---
    // Estrategia multi-patrón: intenta de más específico a más general
    const namePatterns = [

        // CONTRATANTE seguido del nombre y luego la dirección
        /\bCONTRATANTE\s+([A-ZÁÉÍÓÚÑÜ\s]{6,70}?)(?=\s+(CALLE|RFC|R\.F\.C|DOMICILIO|VIGENCIA|CÓDIGO|TEL|CORREO))/i,

        // RAZÓN SOCIAL
        /(?:RAZÓN\s+SOCIAL\s+O\s+CONTRATANTE)[:\s]+([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ\s\-\.]{4,70})(?:\r?\n|REGISTRO|RFC|CP|CLAVE|TEL|DIR|DOM|POL|VIG|$)/i,

        // NOMBRE DEL ASEGURADO
        /NOMBRE\s+DEL\s+ASEGURADO[:\s]+([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ\s\-\.]{4,70})/i,

        // ASEGURADO
        /\bASEGURADO[:\s]+([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ\s\-\.]{4,70})/i,

        // CONTRATANTE simple
        /\bCONTRATANTE[:\s]+([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ\s\-\.]{4,70})/i,

    ];
    const clientName = extractField(upperText, namePatterns, 'N/A');

    const cleanText = upperText.replace(/D[IÍ]A\s+MES\s+A[NÑ]O/gi, '');

    let clientAddress = extractField(cleanText, [
        /(?:CALLE)[:\s]+([^\n]{10,80})/i,
        /(?:DOMICILIO|DIRECCIÓN)[:\s]+([^\n]{10,80})/i,
    ], 'N/A');

    if (clientAddress !== 'N/A') {
        clientAddress = clientAddress
            .replace(/CALLE:/gi, '')
            .replace(/COLONIA:/gi, '')
            .replace(/ESTADO:/gi, '')
            .replace(/CÓDIGO POSTAL:/gi, '')
            .replace(/CP:/gi, '')
            .replace(/C.P/gi, '')
            .replace(/,/g, '')
            .replace(/\s+DES$/gi, '') // Eliminar fragmento "DES" al final si existe
            .replace(/\s+/g, ' ')
            .trim();
    }

    // --- DATOS DE LA PÓLIZA ---
    const policyNumber = extractField(upperText, [
        /(?:PÓLIZA|POLIZA|NO\. DE PÓLIZA|NÚMERO DE PÓLIZA|NO\.)[:\s#]*([\w\-]{4,20})/i,
        /(?:CERTIFICADO|FOLIO)[:\s#]*([\w\-]{4,20})/i,
    ], 'N/A');

    const conceptPatterns = [
        /TIPO\s+DE\s+SEGURO[:\s]*([A-ZÁÉÍÓÚÑÜ\s]{5,80})/i,
        /SEGURO\s+COLECTIVO\s+DE\s+([A-ZÁÉÍÓÚÑÜ\s]{5,80})/i,
        /P[ÓO]LIZA\s+DE\s+SEGURO\s+([A-ZÁÉÍÓÚÑÜ\s]{5,80})/i,
        /PLAN\s+([A-ZÁÉÍÓÚÑÜ\s]{3,80})/i,
        /RAMO[:\s]*([A-ZÁÉÍÓÚÑÜ\s]{5,80})/i

    ];
    let concept = extractField(upperText, conceptPatterns, 'N/A');

    function normalizeInsuranceType(text) {
        if (/GASTOS\s*M[EÉ]DICOS/.test(text)) return "GASTOS MÉDICOS";
        if (/ACCIDENTES\s*PERSONALES/.test(text)) return "ACCIDENTES PERSONALES";
        if (/VIDA/.test(text)) return "SEGURO DE VIDA";
        if (/AUTO|AUTOM[ÓO]VIL/.test(text)) return "AUTO";
        if (/DA[ÑN]OS/.test(text)) return "DAÑOS";
        return text;
    }
    concept = normalizeInsuranceType(concept);

    const agentCode = extractField(upperText, [
        /CLAVE\s+DE\s+AGENTE[:\s#]*([\d]{3,15})/i,
        /CLAVE\s+AGENTE[:\s#]*([\d]{3,15})/i,
        /\bCLAVE[:\s#]*([\d]{5,15})/i,
        /AGENTE\s+(?:NO\.?|NUM\.?|NÚMERO)[:\s#]*([\d]{3,15})/i,
    ], 'N/A');

    // --- DETECCIÓN DE ASEGURADORA ---
    function detectInsurer(text) {
        if (/(?:GRUPO\s+NACIONAL\s+PROVINCIAL|GNP)/i.test(text)) return "GNP SEGUROS";
        if (/(?:HIR\s+COMPA[ÑN]IA\s+DE\s+SEGUROS|HIR\s+SEGUROS)/i.test(text)) return "HIR SEGUROS";
        if (/(?:AXA\s+SEGUROS|AXA)/i.test(text)) return "AXA SEGUROS";
        if (/CHUBB/i.test(text)) return "CHUBB";
        if (/MAPFRE/i.test(text)) return "MAPFRE";
        return "HIR SEGUROS"; // Default / Fallback
    }
    const insurer = detectInsurer(upperText);

    // --- VIGENCIA ---
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+(?:DE\s+)?(?:ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC)[A-Z]*\.?\s+\d{4})/gi;
    const allDates = [...upperText.matchAll(datePattern)].map((m) => m[0].trim());

    const startDate = allDates[0] || 'N/A';
    const endDate = allDates[1] || 'N/A';

    // --- PRIMAS / RECIBOS ---
    const montoPattern = /\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
    const allMontos = [...upperText.matchAll(montoPattern)]
        .map((m) => parseFloat(m[1].replace(/,/g, '')))
        .filter((v) => v >= 500 && v <= 10_000_000);

    const uniqueMontos = [...new Set(allMontos)].slice(0, 3);
    const receipts = uniqueMontos.map((prima, i) => ({
        id: i + 1,
        prima,
        periodo: `Recibo ${i + 1}`,
        status: 'PENDIENTE',
    }));

    if (receipts.length === 0) {
        receipts.push({ id: 1, prima: 0, periodo: 'Ver PDF para detalles', status: 'PENDIENTE' });
    }

    return {
        clientData: {
            name: clientName !== 'N/A' ? clientName.replace(/\s+/g, ' ').trim() : 'Ver PDF para nombre',
            address: clientAddress !== 'N/A' ? clientAddress.replace(/\s+/g, ' ').trim() : 'Ver PDF para dirección',
        },
        policyData: {
            policyNumber,
            concept: concept !== 'N/A' ? concept.replace(/\s+/g, ' ').trim() : 'N/A',
            agentCode,
            startDate,
            endDate,
            insurer,
        },
        receipts,
    };
}
