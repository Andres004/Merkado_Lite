"use client";

import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar'; // Importamos el sidebar creado
import { MoreVertical, DollarSign, Package, RotateCw, ShoppingCart } from 'lucide-react';

// ----------------------------------------------------
// 1. MOCK DATA Y TIPOS
// ----------------------------------------------------

interface KpiCardProps {
    title: string;
    value: string;
    subtext: string;
    icon: React.ElementType;
    color: string;
}

const kpis = [
    {
        title: 'Ventas de Hoy',
        value: 'Bs: 1.450,00',
        subtext: '+15% vs. Ayer',
        icon: DollarSign,
        color: 'text-green-600 bg-green-50',
    },
    {
        title: 'Pedidos de Hoy',
        value: '32',
        subtext: '5 pendientes de asignar',
        icon: ShoppingCart,
        color: 'text-[#F40009] bg-red-50',
    },
    {
        title: 'Devoluciones',
        value: '1',
        subtext: '(Bs. 55.00)',
        icon: RotateCw,
        color: 'text-blue-600 bg-blue-50',
    },
];

// Datos simulados para el gráfico de línea (Ventas por Hora)
const salesData = [
    { hour: '8:00', sales: 50 }, { hour: '9:00', sales: 80 }, { hour: '10:00', sales: 150 },
    { hour: '11:00', sales: 180 }, { hour: '12:00', sales: 130 }, { hour: '13:00', sales: 100 },
    { hour: '14:00', sales: 70 }, { hour: '15:00', sales: 140 }, { hour: '16:00', sales: 20 },
    { hour: '17:00', sales: 40 }, { hour: '18:00', sales: 60 }
];

// Datos simulados para el gráfico de barras (Productos Más Vendidos)
const topProducts = [
    { name: 'Leche PIL', sales: 100 }, { name: 'Fanta', sales: 30 }, { name: 'Naranja', sales: 45 },
    { name: 'Frutilla', sales: 20 }, { name: 'Tomate', sales: 90 }, { name: 'Nuggets Dino', sales: 65 },
];

// ----------------------------------------------------
// 2. COMPONENTES DE GRÁFICO (Simulados con SVG)
// ----------------------------------------------------

/**
 * Gráfico de Línea SVG simulado para Ventas Por Hora.
 */
const SalesLineChart: React.FC = () => {
    const width = 600;
    const height = 200;
    const padding = 30;

    // Calcular escalas
    const maxSales = 200;
    const maxDataSales = Math.max(...salesData.map(d => d.sales));
    const xUnit = (width - 2 * padding) / (salesData.length - 1);
    const yUnit = (height - 2 * padding) / maxSales;

    // Generar la cadena de puntos (polyline points)
    const points = salesData.map((d, i) => {
        const x = padding + i * xUnit;
        // Invertimos el eje Y para que los valores más altos estén arriba
        const y = height - padding - d.sales * yUnit;
        return `${x},${y}`;
    }).join(' ');

    // Eje Y: 5 líneas de guía (0, 50, 100, 150, 200 Bs.)
    const yLines = [0, 50, 100, 150, 200].map((value, index) => {
        const y = height - padding - value * yUnit;
        return (
            <g key={`y-axis-${index}`}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeDasharray="3 3" />
                <text x={padding - 5} y={y + 5} textAnchor="end" className="text-xs fill-gray-500">
                    {value} Bs.
                </text>
            </g>
        );
    });

    // Eje X: Etiquetas de hora
    const xLabels = salesData.map((d, i) => {
        const x = padding + i * xUnit;
        return (
            <text key={d.hour} x={x} y={height - padding + 15} textAnchor="middle" className="text-xs fill-gray-700">
                {d.hour}
            </text>
        );
    });

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Fondo y Guías Y */}
            {yLines}
            
            {/* Línea Principal del Gráfico */}
            <polyline
                fill="none"
                stroke="#F40009"
                strokeWidth="4"
                points={points}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            
            {/* Puntos (Opcional, para destacar) */}
            {salesData.map((d, i) => {
                const x = padding + i * xUnit;
                const y = height - padding - d.sales * yUnit;
                return <circle key={`dot-${i}`} cx={x} cy={y} r="4" fill="#F40009" stroke="white" strokeWidth="2" />;
            })}

            {/* Eje X y Etiquetas */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d1d5db" />
            {xLabels}
        </svg>
    );
};

/**
 * Gráfico de Barras SVG simulado para Productos Más Vendidos.
 */
const TopProductsBarChart: React.FC = () => {
    const width = 300;
    const height = 200;
    const padding = 20;
    const barWidth = 20;

    // Calcular escalas
    const maxSales = Math.max(...topProducts.map(d => d.sales));
    const totalBars = topProducts.length;
    const groupSpace = (width - 2 * padding) / totalBars;

    // Calcular las barras
    const bars = topProducts.map((d, i) => {
        const x = padding + i * groupSpace + (groupSpace / 2) - (barWidth / 2);
        const barHeight = (d.sales / maxSales) * (height - 2 * padding);
        const y = height - padding - barHeight;

        return (
            <g key={d.name}>
                {/* Barra */}
                <rect 
                    x={x} 
                    y={y} 
                    width={barWidth} 
                    height={barHeight} 
                    fill="#F40009" 
                    rx="4" 
                    ry="4"
                    className="hover:fill-red-700 transition-colors duration-150"
                />
                {/* Etiqueta X */}
                <text 
                    x={x + barWidth / 2} 
                    y={height - padding + 5} 
                    textAnchor="middle" 
                    className="text-xs fill-gray-700"
                    // Rota el texto para que no se superponga
                    transform={`rotate(45, ${x + barWidth / 2}, ${height - padding + 5}) translate(0, 10)`}
                >
                    {d.name.split(' ').map((word, idx) => (
                        <tspan key={idx} x={x + barWidth / 2} dy={idx === 0 ? 0 : "1.2em"}>
                            {word}
                        </tspan>
                    ))}
                </text>
            </g>
        );
    });

    return (
        <svg viewBox={`0 0 ${width} ${height + 40}`} className="w-full h-full overflow-visible">
             <g transform={`translate(0, 0)`}>
                {bars}
            </g>
        </svg>
    );
};


// ----------------------------------------------------
// 3. COMPONENTE KPI CARD
// ----------------------------------------------------

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">{title}</h3>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`p-2 rounded-full ${color.split(' ')[1]}`}>
                <Icon size={20} className={color.split(' ')[0]} />
            </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500">{subtext}</span>
            <MoreVertical size={16} className="text-gray-400 cursor-pointer hover:text-gray-700 transition" />
        </div>
    </div>
);


// ----------------------------------------------------
// 4. PÁGINA PRINCIPAL
// ----------------------------------------------------
export default function AdminDashboardPage() {
    // Estado mock para la selección de fecha
    const [selectedDate, setSelectedDate] = useState('12/11/2025');
    
    // Lista de opciones de fechas mock
    const dateOptions = ['12/11/2025', '11/11/2025', '10/11/2025'];

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4">
                
                {/* Estructura de Contenido: Sidebar + Contenido Principal */}
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Columna Izquierda: Menú de Navegación */}
                    <aside className="hidden lg:block lg:w-64">
                        <AdminSidebar />
                    </aside>

                    {/* Columna Derecha: Contenido del Dashboard */}
                    <main className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-extrabold text-gray-900">Panel de Control: Resumen del Día</h1>
                            
                            {/* Selector de Fecha */}
                            <select 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 shadow-sm"
                            >
                                {dateOptions.map(date => (
                                    <option key={date} value={date}>{date}</option>
                                ))}
                            </select>
                        </div>

                        {/* 1. Tarjetas de Indicadores Clave (KPIs) */}
                        <section className="mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {kpis.map((kpi) => (
                                    <KpiCard key={kpi.title} {...kpi} />
                                ))}
                            </div>
                        </section>

                        {/* 2. Gráficos de Análisis */}
                        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Ventas por Hora (Gráfico de Línea) */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Ventas Por Hora</h2>
                                <div className="h-96">
                                    <SalesLineChart />
                                </div>
                            </div>
                            
                            {/* Productos Más Vendidos (Gráfico de Barras) */}
                            <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Productos Más Vendidos</h2>
                                <div className="h-96 flex items-end justify-center pt-10">
                                    <TopProductsBarChart />
                                </div>
                            </div>
                        </section>
                        
                        {/* 3. Alertas y Pedidos Pendientes (Basado en la segunda imagen proporcionada) */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            
                            {/* Alertas de Stock Mínimo */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Alertas de Stock Mínimo</h2>
                                <div className="space-y-4">
                                    <div className="border-l-4 border-yellow-500 pl-3">
                                        <p className="font-semibold text-gray-900">Nuggets Dino Sofia 1 kg</p>
                                        <p className="text-sm text-gray-600">Quedan 10/50 - <span className="text-xs text-yellow-600">Reabastecer</span></p>
                                    </div>
                                    <div className="border-l-4 border-yellow-500 pl-3">
                                        <p className="font-semibold text-gray-900">Leche PIL</p>
                                        <p className="text-sm text-gray-600">Quedan 10/20 - <span className="text-xs text-yellow-600">Reabastecer</span></p>
                                    </div>
                                </div>
                                <div className="mt-4 text-right">
                                    <a href="/administrador/inventario" className="text-sm text-[#F40009] hover:underline font-medium">Ver Inventario Completo</a>
                                </div>
                            </div>

                            {/* Últimos Pedidos Pendientes */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Últimos Pedidos (Pendientes)</h2>
                                <ul className="space-y-4">
                                    <li className="flex justify-between items-center text-sm border-b pb-2">
                                        <span>(#1047) xxxxxx - Bs. 150</span>
                                        <div className="space-x-2">
                                            <a href="#" className="text-blue-500 hover:underline font-medium">Asignar Repartidor</a>
                                            <a href="#" className="text-gray-500 hover:underline">Ver Detalle</a>
                                            <a href="#" className="text-red-500 hover:underline">Anular Pedido</a>
                                        </div>
                                    </li>
                                    <li className="flex justify-between items-center text-sm">
                                        <span>(#1046) xxxxxx - Bs. 80</span>
                                        <div className="space-x-2">
                                            <a href="#" className="text-blue-500 hover:underline font-medium">Asignar Repartidor</a>
                                            <a href="#" className="text-gray-500 hover:underline">Ver Detalle</a>
                                            <a href="#" className="text-red-500 hover:underline">Anular Pedido</a>
                                        </div>
                                    </li>
                                </ul>
                                <div className="mt-4 text-right">
                                    <a href="/administrador/pedidos" className="text-sm text-[#F40009] hover:underline font-medium">Ver todos los Pedidos</a>
                                </div>
                            </div>

                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}