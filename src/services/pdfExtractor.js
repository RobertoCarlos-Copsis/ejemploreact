import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/* =====================================
   EXTRAER TEXTO DEL PDF
===================================== */

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

/* =====================================
   FUNCION AUXILIAR PARA CAMPOS
===================================== */

function extractField(text, patterns, fallback = 'N/A') {
    for (const pattern of patterns) {
        const match = text.match(pattern);

        if (match && match[1] && match[1].trim()) {
            return match[1].trim();
        }
    }

    return fallback;
}

/* =====================================
   EXTRAER RECIBOS
===================================== */

function extractReceipts(text) {
    const receipts = [];

    const labeledPatterns = [
        /PRIMA\s+(?:NETA|TARIFA)[^\d]*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
        /DERECHO\s+DE\s+P[ÓO]LIZA[^\d]*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
        /GASTOS\s+DE\s+EXPEDICI[ÓO]N[^\d]*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
        /(IVA|I\.V\.A)[^\d]*(\d{1,3}(?:,\d{3})*\.\d{2})/i
    ];

    labeledPatterns.forEach((pattern) => {

        const match = text.match(pattern);

        if (match) {

            const value = parseFloat(
                (match[2] || match[1]).replace(/,/g, "")
            );

            if (!receipts.some(r => r.prima === value)) {
                receipts.push({
                    id: receipts.length + 1,
                    prima: value,
                    periodo: `Recibo ${receipts.length + 1}`,
                    status: "PENDIENTE"
                });
            }
            /* ---------------------------------
            Eliminar recibos duplicados
            ---------------------------------- */

            const uniqueReceipts = [...new Map(
                receipts.map(r => [r.prima, r])
            ).values()];

            return uniqueReceipts;
        }
    });

    if (receipts.length === 0) {

        const amountPattern = /\$?\s?(\d{1,3}(?:,\d{3})*\.\d{2})/g;

        const matches = [...text.matchAll(amountPattern)];

        const values = matches
            .map(m => parseFloat(m[1].replace(/,/g, "")))
            .filter(v => v > 50 && v < 100000);

        const unique = [...new Set(values)];

        unique.slice(0, 3).forEach((value, i) => {

            receipts.push({
                id: i + 1,
                prima: value,
                periodo: `Recibo ${i + 1}`,
                status: "PENDIENTE"
            });

        });

    }

    if (receipts.length === 0) {

        receipts.push({
            id: 1,
            prima: 0,
            periodo: "Ver PDF",
            status: "PENDIENTE"
        });

    }

    return receipts;
}

/* =====================================
   PARSEAR DATOS DE POLIZA
===================================== */

export function parsePolicyData(text) {
    const upperText = text.toUpperCase();
    const namePatterns = [
        /\bCONTRATANTE\s+([A-ZÁÉÍÓÚÑÜ\s]{6,70}?)(?=\s+(CALLE|RFC|R\.F\.C|DOMICILIO|VIGENCIA|CÓDIGO|TEL|CORREO))/i,
        /(?:RAZÓN\s+SOCIAL\s+O\s+CONTRATANTE)[:\s]+([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ\s\-\.]{4,70})(?:\r?\n|REGISTRO|RFC|CP|CLAVE|TEL|DIR|DOM|POL|VIG|$)/i,
        /NOMBRE\s+DEL\s+ASEGURADO[:\s]+([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ\s\-\.]{4,70})/i,
        /\bASEGURADO[:\s]+([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ\s\-\.]{4,70})/i,
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
            .replace(/\s+DES$/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /* ---------- POLIZA ---------- */

    const policyNumber = extractField(upperText, [
        /(?:PÓLIZA|POLIZA|NO\. DE PÓLIZA|CERTIFICADO|FOLIO)[:\s#]*([A-Z0-9\-]{5,25})(?!\s*(?:CALLE|DOMICILIO|COLONIA|DIRECCIÓN|RFC))/i,
        /(?:PÓLIZA|POLIZA)[:\s#]*([0-9]{5,20})/i,
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

    ], 'N/A');

    /* ---------- VIGENCIA ---------- */

    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4})/g;

    const dates = [...upperText.matchAll(datePattern)].map(d => d[0]);

    const startDate = dates[0] || 'N/A';
    const endDate = dates[1] || 'N/A';

    /* ---------- COMISIÓN ---------- */
    const commissionMatch = upperText.match(/(?:COMISI[ÓO]N)[:\s#]*(\d{1,2}(?:\.\d{1,2})?)\s*%/);
    const extractedCommission = commissionMatch ? parseFloat(commissionMatch[1]) : null;

    /* ---------- RECIBOS ---------- */

    const receipts = extractReceipts(upperText);

    /* ---------- RETURN FINAL ---------- */

    return {

        client: {
            name: clientName,
            address: clientAddress
        },

        policyData: {
            policyNumber,
            concept,
            agentCode,
            startDate,
            endDate
        },

        receipts,
        commissionPercentage: extractedCommission

    };

}