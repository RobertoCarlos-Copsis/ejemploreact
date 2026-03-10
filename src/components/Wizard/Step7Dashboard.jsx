import React, { useMemo } from 'react';
import { useWizard } from '../../context/WizardContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { BadgeCheck, RotateCcw, Files, UsersRound, Coins, Percent } from 'lucide-react';
import { formatCurrency } from '../../utils/utils';
import '../../styles/wizard/Step7Dashboard.css';

const Step7Dashboard = () => {
    const { state, dispatch, ACTIONS } = useWizard();
    const { receipts = [], commissionPercentage = 0 } = state;

    const stats = useMemo(() => {
        const totalPrima = receipts.reduce((sum, r) => sum + r.prima, 0);
        const totalComision = totalPrima * (commissionPercentage / 100);
        return {
            totalPrima,
            totalComision,
            primaNeta: totalPrima - totalComision,
            count: receipts.length
        };
    }, [receipts, commissionPercentage]);

    const chartData = useMemo(() => {
        return receipts.map((r, i) => ({
            name: `Recibo ${i + 1}/${receipts.length}`,
            Prima: r.prima,
            Comision: r.prima * (commissionPercentage / 100)
        }));
    }, [receipts, commissionPercentage]);

    const pieData = [
        { name: 'Prima Neta', value: stats.primaNeta, fill: '#e2e8f0' },
        { name: 'Comisión', value: stats.totalComision, fill: '#4f46e5' },
    ];

    const handleReset = () => {
        dispatch({ type: ACTIONS.RESET });
    };

    return (
        <div className="dashboard-container">
            <div className="kpi-grid">
                <div className="kpi-card blue">
                    <div className="kpi-icon"><Files size={20} /></div>
                    <div className="kpi-data">
                        <span>Póliza Registrada</span>
                        <strong>1</strong>
                    </div>
                </div>
                <div className="kpi-card purple">
                    <div className="kpi-icon"><UsersRound size={20} /></div>
                    <div className="kpi-data">
                        <span>Cliente Contactado</span>
                        <strong>1</strong>
                    </div>
                </div>
                <div className="kpi-card orange">
                    <div className="kpi-icon"><Coins size={20} /></div>
                    <div className="kpi-data">
                        <span>Primas Acumuladas</span>
                        <strong>{formatCurrency(stats.totalPrima)}</strong>
                    </div>
                </div>
                <div className="kpi-card green">
                    <div className="kpi-icon"><Percent size={20} /></div>
                    <div className="kpi-data">
                        <span>Comisiones Acumuladas</span>
                        <strong>{formatCurrency(stats.totalComision)}</strong>
                    </div>
                </div>
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <h3>Primas y Comisiones por Recibo</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPrima" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorComision" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#059669" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => formatCurrency(value)} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Area type="monotone" dataKey="Prima" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorPrima)" />
                                <Area type="monotone" dataKey="Comision" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorComision)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-legend">
                        <span className="leg-item"><i className="dot blue"></i> Prima</span>
                        <span className="leg-item"><i className="dot green"></i> Comisión</span>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Distribución de Primas</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="100%" barSize={24} data={pieData}>
                                <RadialBar
                                    minAngle={15}
                                    background
                                    clockWise
                                    dataKey="value"
                                    cornerRadius={12}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="pie-center-label">
                            <span className="label">Comisión</span>
                            <span className="value">{commissionPercentage}%</span>
                        </div>
                    </div>
                    <div className="chart-legend vertical">
                        <div className="leg-row">
                            <i className="dot green"></i>
                            <div className="leg-info">
                                <span>Comisión</span>
                                <strong>{formatCurrency(stats.totalComision)}</strong>
                            </div>
                        </div>
                        <div className="leg-row">
                            <i className="dot gray"></i>
                            <div className="leg-info">
                                <span>Prima Neta</span>
                                <strong>{formatCurrency(stats.primaNeta)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="action-summary-card">
                <div className="summary-header">
                    <BadgeCheck size={24} color="#059669" />
                    <h3>Resumen de Acciones Realizadas</h3>
                </div>
                <div className="summary-columns">
                    <div className="summ-col">
                        <h4>Datos Procesados:</h4>
                        <ul>
                            <li>Póliza importada y leída con IA</li>
                            <li>Datos del cliente completados</li>
                            <li>Comisión configurada al {commissionPercentage}%</li>
                            <li>{stats.count} recibos registrados</li>
                        </ul>
                    </div>
                    <div className="summ-col">
                        <h4>Sistema Activado:</h4>
                        <ul>
                            <li>Notificaciones automáticas configuradas</li>
                            <li>Recordatorios de pago programados</li>
                            <li>Alertas de renovación activadas</li>
                            <li>Estadísticas en tiempo real</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '3rem' }}>
                <button className="btn btn-primary" onClick={handleReset}>
                    <RotateCcw size={18} /> Probar con otra póliza
                </button>
            </div>
        </div>
    );
};

export default Step7Dashboard;
