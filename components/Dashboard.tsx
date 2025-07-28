import React, { useEffect, useRef } from 'react';

// Use Chart.js from CDN
declare global {
    interface Window {
        Chart: any;
    }
}

export interface PieChartData {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
        hoverOffset: number;
    }[];
}

export interface BarChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
        yAxisID: 'yLength' | 'yCost';
    }[];
}

interface DashboardProps {
    pieData: PieChartData;
    barData: BarChartData;
}

export const Dashboard: React.FC<DashboardProps> = ({ pieData, barData }) => {
    const pieChartRef = useRef<HTMLCanvasElement>(null);
    const barChartRef = useRef<HTMLCanvasElement>(null);
    const pieChartInstance = useRef<any>(null);
    const barChartInstance = useRef<any>(null);

    // Effect for chart creation and updates
    useEffect(() => {
        const createCharts = () => {
            // Wait for Chart.js to be available
            if (!window.Chart) {
                console.warn('Chart.js not loaded yet, retrying...');
                setTimeout(createCharts, 100);
                return;
            }

            try {
                // Pie Chart
                if (pieChartRef.current) {
                    if (pieChartInstance.current) {
                        pieChartInstance.current.destroy();
                    }
                    
                    pieChartInstance.current = new window.Chart(pieChartRef.current, {
                        type: 'pie',
                        data: pieData,
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                            }
                        }
                    });
                }

                // Bar Chart
                if (barChartRef.current) {
                    if (barChartInstance.current) {
                        barChartInstance.current.destroy();
                    }
                    
                    barChartInstance.current = new window.Chart(barChartRef.current, {
                        type: 'bar',
                        data: barData,
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                            },
                            scales: {
                                yLength: {
                                    type: 'linear',
                                    display: true,
                                    position: 'left',
                                    title: { display: true, text: 'Length (in)' }
                                },
                                yCost: {
                                    type: 'linear',
                                    display: true,
                                    position: 'right',
                                    title: { display: true, text: 'Cost ($)' },
                                    grid: { drawOnChartArea: false },
                                }
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Error creating charts:', error);
            }
        };

        createCharts();
        
        // Cleanup on unmount
        return () => {
            try {
                pieChartInstance.current?.destroy();
                pieChartInstance.current = null;
                barChartInstance.current?.destroy();
                barChartInstance.current = null;
            } catch (error) {
                console.error('Error destroying charts:', error);
            }
        }
    }, [pieData, barData]);

    return (
        <div className="bg-white/60 p-4 rounded-lg shadow-sm border border-brand-brown/10 mt-6 no-break">
            <h2 className="text-xl font-bold text-brand-brown mb-4">Cost Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-center mb-2">Cost Breakdown</h3>
                    <div className="max-h-96 mx-auto">
                        <canvas ref={pieChartRef}></canvas>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-center mb-2">Wood Cut List Analysis</h3>
                     <div className="max-h-96 mx-auto">
                        <canvas ref={barChartRef}></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
};