export const initialState = {
  currentStep: 1,
  policy: {
    file: null,
    uploadProgress: 0,
    status: 'idle', // 'idle', 'uploading', 'success', 'error'
    data: null, // { number, concept, agentCode, startDate, endDate }
  },
  client: {
    name: '',
    address: '',
    email: '',
    phone: '',
  },
  receipts: [], // { id, amount, periodValue, periodName, status, logs }
  commissionPercentage: 10,
  notifications: {
    cobranza: [15, 7, 3],
    renovacion: [60, 30, 15],
    siniestros: true,
    comisiones: true,
    generales: true,
  },
  logs: [], // { type, date, observation }
  statistics: {
    policiesRegistered: 0,
    clientsContacted: 0,
    totalPrimas: 0,
    totalCommissions: 0,
  }
};

export const ACTIONS = {
  SET_STEP: 'SET_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  UPDATE_POLICY_FILE: 'UPDATE_POLICY_FILE',
  UPDATE_POLICY_DATA: 'UPDATE_POLICY_DATA',
  UPDATE_CLIENT: 'UPDATE_CLIENT',
  UPDATE_COMMISSION: 'UPDATE_COMMISSION',
  UPDATE_RECEIPT: 'UPDATE_RECEIPT',
  ADD_LOG: 'ADD_LOG',
  UPDATE_NOTIFICATIONS: 'UPDATE_NOTIFICATIONS',
  RESET: 'RESET',
};

export function wizardReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_STEP:
      return { ...state, currentStep: action.payload };
    case ACTIONS.NEXT_STEP:
      return { ...state, currentStep: Math.min(state.currentStep + 1, 7) };
    case ACTIONS.PREV_STEP:
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    case ACTIONS.UPDATE_POLICY_FILE:
      return { ...state, policy: { ...state.policy, ...action.payload } };
    case ACTIONS.UPDATE_POLICY_DATA:
      return { 
        ...state, 
        policy: { ...state.policy, data: action.payload.policyData },
        client: { ...state.client, ...action.payload.clientData },
        receipts: action.payload.receipts
      };
    case ACTIONS.UPDATE_CLIENT:
      return { ...state, client: { ...state.client, ...action.payload } };
    case ACTIONS.UPDATE_COMMISSION:
      return { ...state, commissionPercentage: action.payload };
    case ACTIONS.UPDATE_RECEIPT:
      return {
        ...state,
        receipts: state.receipts.map(r => r.id === action.payload.id ? { ...r, ...action.payload.data } : r)
      };
    case ACTIONS.ADD_LOG:
      return { ...state, logs: [action.payload, ...state.logs] };
    case ACTIONS.UPDATE_NOTIFICATIONS:
      return { ...state, notifications: { ...state.notifications, ...action.payload } };
    case ACTIONS.RESET:
      return initialState;
    default:
      return state;
  }
}
