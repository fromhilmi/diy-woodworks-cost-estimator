import React, { useState, useMemo, useCallback } from 'react';
import { ProjectDetails, CostRow, CutList, CutListRow } from './types';
import { ProjectInfo } from './components/ProjectInfo';
import { CostSection } from './components/CostSection';
import { CutListSection } from './components/CutListSection';
import { Summary } from './components/Summary';
import { Notes } from './components/Notes';
import { Header } from './components/Header';
import { PrintIcon } from './components/Icons';
import { Dashboard, PieChartData, BarChartData } from './components/Dashboard';
import { exportToPDF } from './utils/pdfExport';

const App: React.FC = () => {
    console.log('App component rendering...');
    const today = new Date().toISOString().split('T')[0];

    const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
        name: 'Custom Bookshelf', date: today, customerName: 'Jane Doe', customerPhone: '555-1234', customerEmail: 'jane.doe@example.com'
    });
    
    const [materialCosts, setMaterialCosts] = useState<CostRow[]>([
        { id: 'mat1', item: 'Screws', description: 'box of screws', unitPrice: 10.00, quantity: 1 },
    ]);
    
    const [laborCosts, setLaborCosts] = useState<CostRow[]>([
        { id: 'lab1', item: 'DIY Cutting, Shopping, Assembly', description: '', unitPrice: 15.00, quantity: 2 },
        { id: 'lab2', item: 'Sanding', description: '', unitPrice: 15.00, quantity: 2 },
    ]);

    const [overheadCosts, setOverheadCosts] = useState<CostRow[]>([
        { id: 'ovh1', item: 'Tools and equipment', description: '', unitPrice: 5.00, quantity: 4 },
    ]);

    const [cutLists, setCutLists] = useState<Record<string, CutList>>({
        '2x4': {
            description: '2x4 Lumber (8 feet each)',
            unitPrice: 3.93,
            rows: [
                { id: 'cut1-1', length: 58, quantity: 4 },
                { id: 'cut1-2', length: 60, quantity: 2 },
                { id: 'cut1-3', length: 29, quantity: 4 },
            ]
        },
        '1x5': { description: '1x4 Lumber (8 feet each)', unitPrice: 3.58, rows: [] },
        '2x8': { description: '2x8 Lumber (8 feet each)', unitPrice: 5.00, rows: [] }
    });

    const [financials, setFinancials] = useState({
        profitMargin: 52.86,
        salesTaxRate: 13.00,
        shippingCost: 5.00,
    });
    
    const [notes, setNotes] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const handleProjectDetailsChange = useCallback((field: keyof ProjectDetails, value: string) => {
        setProjectDetails(prev => ({ ...prev, [field]: value }));
    }, []);

    const createCostRowUpdater = <T extends CostRow,>(setter: React.Dispatch<React.SetStateAction<T[]>>) => {
        const addRow = () => {
            setter(prev => [...prev, { id: `row-${Date.now()}`, item: '', description: '', unitPrice: 0, quantity: 0 } as T]);
        };
        const updateRow = (index: number, field: keyof T, value: string | number) => {
            setter(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
        };
        const deleteRow = (index: number) => {
            setter(prev => prev.filter((_, i) => i !== index));
        };
        return { addRow, updateRow, deleteRow };
    };

    const materialHandlers = createCostRowUpdater(setMaterialCosts);
    const laborHandlers = createCostRowUpdater(setLaborCosts);
    const overheadHandlers = createCostRowUpdater(setOverheadCosts);

    const updateCutList = useCallback((key: string, field: keyof CutList, value: any) => {
        setCutLists(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    }, []);

    const addCutListRow = useCallback((key: string) => {
        const newRow: CutListRow = { id: `cut-${Date.now()}`, length: 0, quantity: 1 };
        updateCutList(key, 'rows', [...cutLists[key].rows, newRow]);
    }, [cutLists, updateCutList]);
    
    const updateCutListRow = useCallback((key: string, index: number, field: keyof CutListRow, value: number) => {
       const updatedRows = cutLists[key].rows.map((row, i) => i === index ? { ...row, [field]: value } : row);
       updateCutList(key, 'rows', updatedRows);
    }, [cutLists, updateCutList]);
    
    const deleteCutListRow = useCallback((key: string, index: number) => {
       const updatedRows = cutLists[key].rows.filter((_, i) => i !== index);
       updateCutList(key, 'rows', updatedRows);
    }, [cutLists, updateCutList]);
    
    const handleFinancialsChange = useCallback((field: keyof typeof financials, value: number) => {
        setFinancials(prev => ({ ...prev, [field]: value }));
    }, []);

    const calculateSubtotal = (rows: CostRow[]) => rows.reduce((acc, row) => acc + (row.unitPrice * row.quantity), 0);
    
    const materialSubtotal = useMemo(() => calculateSubtotal(materialCosts), [materialCosts]);
    const laborSubtotal = useMemo(() => calculateSubtotal(laborCosts), [laborCosts]);
    const overheadSubtotal = useMemo(() => calculateSubtotal(overheadCosts), [overheadCosts]);
    const totalHours = useMemo(() => laborCosts.reduce((acc, row) => acc + Number(row.quantity), 0), [laborCosts]);

    const cutListsWithTotals = useMemo(() => {
        return Object.entries(cutLists).reduce((acc, [key, list]) => {
            const totalLength = list.rows.reduce((sum, row) => sum + (row.length * row.quantity), 0);
            const boardsNeeded = list.unitPrice > 0 ? Math.ceil(totalLength / 96) : 0; // 8ft board = 96 inches
            const totalCost = boardsNeeded * list.unitPrice;
            acc[key] = { ...list, totalLength, boardsNeeded, totalCost };
            return acc;
        }, {} as Record<string, CutList & { totalLength: number; boardsNeeded: number; totalCost: number }>);
    }, [cutLists]);

    const cutListTotalCost = useMemo(() => {
        return Object.values(cutListsWithTotals).reduce((acc, list) => acc + list.totalCost, 0);
    }, [cutListsWithTotals]);

    const totalMaterialCost = useMemo(() => materialSubtotal + cutListTotalCost, [materialSubtotal, cutListTotalCost]);
    
    const subtotalCost = useMemo(() => totalMaterialCost + laborSubtotal + overheadSubtotal,
        [totalMaterialCost, laborSubtotal, overheadSubtotal]);
    
    const salesTaxAmount = useMemo(() => subtotalCost * (financials.salesTaxRate / 100), [subtotalCost, financials.salesTaxRate]);
    
    const totalCost = useMemo(() => subtotalCost + financials.profitMargin + salesTaxAmount + financials.shippingCost,
        [subtotalCost, financials, salesTaxAmount]);

    const profitPerHour = useMemo(() => {
        const val = (financials.profitMargin + overheadSubtotal) / totalHours;
        return isFinite(val) ? val : 0;
    }, [financials.profitMargin, overheadSubtotal, totalHours]);

    const pieChartData: PieChartData = useMemo(() => {
        const data = [
            { name: 'Material Costs', value: totalMaterialCost },
            { name: 'Labor Cost', value: laborSubtotal },
            { name: 'Overhead Cost', value: overheadSubtotal },
            { name: 'Profit Margin', value: financials.profitMargin },
            { name: 'Sales Tax', value: salesTaxAmount },
            { name: 'Shipping Cost', value: financials.shippingCost },
        ].filter(item => item.value > 0);

        return {
            labels: data.map(d => d.name),
            datasets: [{
                data: data.map(d => d.value),
                backgroundColor: ['#5a3a22', '#e59c5c', '#a16207', '#facc15', '#eab308', '#ca8a04'],
                hoverOffset: 4
            }]
        };
    }, [totalMaterialCost, laborSubtotal, overheadSubtotal, financials, salesTaxAmount]);

    const barChartData: BarChartData = useMemo(() => {
        const labels = Object.keys(cutListsWithTotals);
        const lengthData = labels.map(key => cutListsWithTotals[key].totalLength);
        const costData = labels.map(key => cutListsWithTotals[key].totalCost);
        return {
            labels,
            datasets: [
                {
                    label: 'Total Length (in)',
                    data: lengthData,
                    backgroundColor: 'rgba(229, 156, 92, 0.7)',
                    borderColor: 'rgba(229, 156, 92, 1)',
                    borderWidth: 1,
                    yAxisID: 'yLength',
                },
                {
                    label: 'Total Cost ($)',
                    data: costData,
                    backgroundColor: 'rgba(90, 58, 34, 0.7)',
                    borderColor: 'rgba(90, 58, 34, 1)',
                    borderWidth: 1,
                    yAxisID: 'yCost',
                }
            ]
        };
    }, [cutListsWithTotals]);

    const handleExportPDF = useCallback(async () => {
        if (isExporting) return;
        
        setIsExporting(true);
        try {
            const filename = `${projectDetails.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_estimate.pdf`;
            await exportToPDF(filename, pieChartData, barChartData);
        } finally {
            setIsExporting(false);
        }
    }, [projectDetails.name, isExporting, pieChartData, barChartData]);

    return (
        <>
            <div className="export-header export-only-flex items-center justify-between w-full">
                 <Header />
            </div>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 printable-area">
                <div className="flex justify-between items-start mb-6 no-export">
                    <Header />
                    <button 
                        onClick={handleExportPDF} 
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-brand-brown text-white px-4 py-2 rounded-lg shadow-md hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PrintIcon />
                        {isExporting ? 'Generating PDF...' : 'Export to PDF'}
                    </button>
                </div>

                <ProjectInfo details={projectDetails} onChange={handleProjectDetailsChange} />
                
                <div className="space-y-6 mt-6">
                    <CostSection title="Material Costs" rows={materialCosts} handlers={materialHandlers} subtotal={materialSubtotal} quantityLabel="Quantity" />
                    <CostSection title="Labour Costs" rows={laborCosts} handlers={laborHandlers} subtotal={laborSubtotal} quantityLabel="Hours" />
                    <CostSection title="Overhead Costs" rows={overheadCosts} handlers={overheadHandlers} subtotal={overheadSubtotal} quantityLabel="Hours" />
                </div>

                {/* Cut Lists - Horizontal Layout */}
                <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(cutLists).map(([key, list]) => (
                            <CutListSection
                                key={key}
                                title={key.toUpperCase()}
                                list={list}
                                onUpdateList={(field, value) => updateCutList(key, field, value)}
                                onAddRow={() => addCutListRow(key)}
                                onUpdateRow={(index, field, value) => updateCutListRow(key, index, field, value)}
                                onDeleteRow={(index) => deleteCutListRow(key, index)}
                            />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 no-break">
                     <div className="lg:col-span-2">
                        <Summary
                            totals={{
                                material: totalMaterialCost,
                                labor: laborSubtotal,
                                overhead: overheadSubtotal,
                                subtotal: subtotalCost,
                                salesTax: salesTaxAmount,
                                total: totalCost,
                                hours: totalHours,
                                profitPerHour: profitPerHour,
                            }}
                            financials={financials}
                            onFinancialsChange={handleFinancialsChange}
                        />
                     </div>
                     <div className="md:col-span-1 lg:col-span-1">
                        <Notes notes={notes} onNotesChange={setNotes} />
                     </div>
                </div>
                
                <div className="no-export">
                   <Dashboard pieData={pieChartData} barData={barChartData} />
                </div>

                {/* PDF Chart Container - Hidden by default, shown only in PDF */}
                <div className="pdf-chart-container" id="pdf-charts">
                    <div className="pdf-chart-title">Project Analysis Charts</div>
                    <div className="pdf-charts-grid">
                        <div className="pdf-chart-item">
                            <h3>Cost Breakdown</h3>
                            <canvas id="pdf-pie-chart" width="300" height="300"></canvas>
                        </div>
                        <div className="pdf-chart-item">
                            <h3>Material Usage</h3>
                            <canvas id="pdf-bar-chart" width="300" height="300"></canvas>
                        </div>
                    </div>
                </div>


            </div>
            <div className="export-footer export-only-flex">
                <span>{projectDetails.name}</span>
                <span>{projectDetails.date}</span>
            </div>
        </>
    );
};

export default App;