# 🧠 Project Brain: Wizard SaaS Pólizas de Seguros (GEMINI.md)

Este documento es la fuente de verdad arquitectónica y de estándares para el proyecto. Su objetivo es proporcionar a desarrolladores y agentes de IA un entendimiento rápido y claro de la estructura, flujo y reglas del sistema.

## 📌 Contexto del Proyecto

El proyecto es un **Wizard SaaS para la gestión de pólizas de seguros**, desarrollado íntegramente con **React 18**. La aplicación guía al usuario a través de un proceso estructurado para digitalizar, completar y administrar pólizas mediante inteligencia artificial.

### 🔄 Flujo de 7 Pasos (Wizard)

1. **Importar póliza**: Carga de documentos (PDF/Imágenes).
2. **IA extrae información**: Procesamiento automático de datos del cliente, póliza y recibos.
3. **Completar datos faltantes**: Formulario para añadir datos de contacto (email, teléfono, porcentaje de comisión).
4. **Gestión de recibos**: Panel de control para revisar recibos, registrar pagos y enviar recordatorios u otros mensajes por diversos canales.
5. **Entrega y renovación**: Opciones para compartir la póliza (TuPoliza Email, App móvil) y fijar recordatorios de renovación.
6. **Notificaciones automáticas**: Configuración de alertas modulares interactables para cobranza, renovaciones, siniestros y comisiones.
7. **Dashboard final**: Panel completo de estadísticas, métricas de acciones y gráficas de rendimiento (AreaChart, RadialBarChart).

---

## 🛠️ Stack Tecnológico

- **Core**: React 18
- **Componentes**: Functional Components
- **Manejo de Estado Local/Efectos**: React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
- **Manejo de Estado Global**: Context API + `useReducer`
- **Manejo de Fechas**: `date-fns` (o nativo mediante `Intl.DateTimeFormat`)
- **Visualización de Datos**: Recharts (o Chart.js)
- **Estilos**: CSS Modules o Vanilla CSS (`global.css`) enfocado en variables para temática SaaS Premium e íconos (`lucide-react`).

🚫 **Restricciones estrictas de Stack (NO USAR)**:
- Angular
- Bootstrap
- TypeScript
- Moment.js

---

## 📦 Estado Global Esperado (`useReducer` Store)

El estado global de la aplicación es manejado a través de Context API y encapsula de forma inmutable la información transaccional y preferencias del Wizard en curso:

```javascript
{
  currentStep: 1, // Número del paso actual (1-7)
  policy: {
    data: {},     // Información extraída de la póliza (número, aseguradora, concepto, etc.)
  },
  client: {
    name: "",     // Nombre del cliente
    email: "",    // Correo electrónico
    phone: "",    // Teléfono celular
    address: ""   // Dirección
  },
  receipts: [
    // Array de objetos de recibos: { id, prima, periodo, status, commission }
  ],
  commissionPercentage: 0, // Porcentaje de comisión aplicable a las primas netas
  notifications: {
    cobranza: { active: true },
    renovacion: { active: true },
    siniestros: { active: false },
    comisiones: { active: true },
    generales: { active: false }
  },
  logs: [
    // Array de strings para el historial de acciones y auditoría de envío
  ],
  statistics: {
    // Datos y métricas para uso opcional agregado
  }
}
```

---

## 📐 Reglas Arquitectónicas y Estándares

1. **Separación de Responsabilidades (SoC)**:
   - Mantener una estricta separación entre UI (Componentes Visuales), Lógica de Negocio (Context/Reducers) y Servicios API o Mockups de datos.
2. **Cálculos Financieros Centralizados**:
   - Todo cálculo complejo o financiero (primas, conversiones, comisiones, impuestos) **debe** residir y documentarse en `/utils`. No calcular primas dentro del render o efectos sin encapsular.
3. **Funciones Puras**:
   - Utilizar funciones puras (sin side-effects) apoyadas en `utils` para toda lógica de negocio, facilitando el unit testing rápido y el mantenimiento.
4. **Arquitectura Modular y Escalable**:
   - Estructura escalable pensada en módulos independientes. Los componentes `Step<X>` del wizard funcionan como páginas conectadas al Context, sin props-drilling excesivo.

---

## 📁 Estructura Base del Proyecto

A continuación, la distribución de directorios obligatoria del front-end del proyecto:

```text
src/
├── components/          # Componentes reutilizables de UI general
├── context/             # Archivos de Context API y Reducers (ej. WizardContext.jsx, wizardReducer.js)
├── features/
│   └── wizard/
│       └── steps/       # Componentes de UI principales correspondientes a cada uno de los 7 pasos
├── hooks/               # Custom hooks globales (ej. shared logic abstracting API/Store requests)
├── services/            # Fetch wrappers y llamadas asíncronas hacia el backend
└── utils/               # Matemáticas puras de comisiones, formateadores, conversores de fecha
```

---

## 🚀 Ejecución del Proyecto

### Requisitos previos
- Node.js (versión 18+ recomendada)
- npm o yarn

### Comandos principales

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Levantar servidor de desarrollo (Vite)**:
   ```bash
   npm run dev
   ```
   > 🔴 *La aplicación estará disponible localmente por defecto en `http://localhost:5173` o el puerto que Vite asigne.*

3. **Construir para producción (Build)**:
   ```bash
   npm run build
   ```

4. **Previsualizar build de producción**:
   ```bash
   npm run preview
   ```
