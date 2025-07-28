import React from 'react';
import { CostRow } from '../types';
import { AddIcon, DeleteIcon } from './Icons';

interface CostSectionProps {
    title: string;
    rows: CostRow[];
    handlers: {
        addRow: () => void;
        updateRow: (index: number, field: keyof CostRow, value: string | number) => void;
        deleteRow: (index: number) => void;
    };
    subtotal: number;
    quantityLabel?: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const CostSection: React.FC<CostSectionProps> = ({ title, rows, handlers, subtotal, quantityLabel = "Quantity" }) => {

    const handleNumericChange = (index: number, field: keyof CostRow, value: string) => {
        const numValue = parseFloat(value);
        handlers.updateRow(index, field, isNaN(numValue) ? 0 : numValue);
    };

    return (
        <div className="bg-white/60 p-4 rounded-lg shadow-sm border border-brand-brown/10 no-break">
            <h2 className="text-xl font-bold text-brand-brown mb-3">{title}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-brand-orange/20 text-brand-brown">
                        <tr>
                            <th className="p-2 w-1/4">Item</th>
                            <th className="p-2 w-2/5">Description</th>
                            <th className="p-2 text-right">Unit Price</th>
                            <th className="p-2 text-right">{quantityLabel}</th>
                            <th className="p-2 text-right">Total Cost</th>
                            <th className="p-2 no-export w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={row.id} className="border-b border-brand-brown/10">
                                <td className="p-2 align-middle">
                                    <input type="text" value={row.item} onChange={(e) => handlers.updateRow(index, 'item', e.target.value)} className="w-full bg-transparent py-2 px-2 rounded border border-brand-brown/20 focus:bg-white/50 focus:ring-1 focus:ring-brand-orange no-export" />
                                    <div className="export-only-block py-2 px-2 flex items-center min-h-[40px]">{row.item}</div>
                                </td>
                                <td className="p-2 align-middle">
                                    <input type="text" value={row.description} onChange={(e) => handlers.updateRow(index, 'description', e.target.value)} className="w-full bg-transparent py-2 px-2 rounded border border-brand-brown/20 focus:bg-white/50 focus:ring-1 focus:ring-brand-orange no-export" />
                                    <div className="export-only-block py-2 px-2 flex items-center min-h-[40px]">{row.description}</div>
                                </td>
                                <td className="p-2 text-right align-middle">
                                    <div className="relative no-export">
                                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                        <input type="number" step="0.01" value={row.unitPrice} onChange={(e) => handleNumericChange(index, 'unitPrice', e.target.value)} className="w-full bg-transparent py-2 pl-6 pr-2 rounded text-right border border-brand-brown/20 focus:bg-white/50 focus:ring-1 focus:ring-brand-orange" />
                                    </div>
                                    <div className="export-only-block py-2 px-2 flex items-center justify-end min-h-[40px]">{formatCurrency(row.unitPrice)}</div>
                                </td>
                                <td className="p-2 text-right align-middle">
                                    <input type="number" step="0.01" value={row.quantity} onChange={(e) => handleNumericChange(index, 'quantity', e.target.value)} className="w-full bg-transparent py-2 px-2 rounded text-right border border-brand-brown/20 focus:bg-white/50 focus:ring-1 focus:ring-brand-orange no-export" />
                                    <div className="export-only-block py-2 px-2 flex items-center justify-end min-h-[40px]">{row.quantity}</div>
                                </td>
                                <td className="p-2 text-right align-middle">{formatCurrency(row.unitPrice * row.quantity)}</td>
                                <td className="p-2 text-center align-middle no-export">
                                    <button onClick={() => handlers.deleteRow(index)} className="text-red-600 hover:text-red-800"><DeleteIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold text-brand-brown bg-brand-orange/20">
                            <td colSpan={4} className="text-right p-2">{title} Subtotal</td>
                            <td className="text-right p-2">{formatCurrency(subtotal)}</td>
                            <td className="no-export"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <button onClick={handlers.addRow} className="mt-3 flex items-center gap-1 text-sm text-brand-brown hover:text-brand-orange font-semibold transition-colors no-export">
                <AddIcon /> Add Row
            </button>
        </div>
    );
};