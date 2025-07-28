import React, { useMemo } from 'react';
import { CutList, CutListRow } from '../types';
import { AddIcon, DeleteIcon } from './Icons';

interface CutListSectionProps {
    title: string;
    list: CutList;
    onUpdateList: (field: keyof CutList, value: any) => void;
    onAddRow: () => void;
    onUpdateRow: (index: number, field: keyof CutListRow, value: number) => void;
    onDeleteRow: (index: number) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const CutListSection: React.FC<CutListSectionProps> = ({ title, list, onUpdateList, onAddRow, onUpdateRow, onDeleteRow }) => {
    
    const handleNumericChange = (setter: (val: number) => void, value: string) => {
        const numValue = parseFloat(value);
        setter(isNaN(numValue) ? 0 : numValue);
    };
    
    const totals = useMemo(() => {
        const totalLength = list.rows.reduce((sum, row) => sum + (row.length * row.quantity), 0);
        // Assuming 8-foot boards, so 96 inches
        const boardsNeeded = list.unitPrice > 0 ? Math.ceil(totalLength / 96) : 0;
        const totalCost = boardsNeeded * list.unitPrice;
        return { totalLength, boardsNeeded, totalCost };
    }, [list]);

    return (
        <div className="bg-white/60 p-4 rounded-lg shadow-sm border border-brand-brown/10 no-break">
            <h3 className="text-lg font-bold text-brand-brown mb-2">{title}</h3>
            <div className="space-y-2 text-sm mb-3">
                <div className="min-h-[36px] flex items-center">
                    <input type="text" value={list.description} placeholder="Lumber Description" onChange={(e) => onUpdateList('description', e.target.value)} className="w-full bg-transparent py-2 px-2 rounded border border-brand-brown/20 focus:bg-white/50 focus:ring-1 focus:ring-brand-orange no-export"/>
                    <div className="export-only-block py-2 px-2 font-semibold flex items-center min-h-[40px]">{list.description}</div>
                </div>
                <div className="flex items-center justify-between min-h-[36px]">
                    <span className="text-brand-brown/80 font-semibold flex items-center">Unit Price</span>
                    <div className="w-1/2">
                        <div className="relative no-export">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input type="number" step="0.01" value={list.unitPrice} onChange={(e) => handleNumericChange((v) => onUpdateList('unitPrice', v), e.target.value)} className="w-full bg-transparent py-2 pl-6 pr-2 rounded text-right border border-brand-brown/20 focus:bg-white/50 focus:ring-1 focus:ring-brand-orange"/>
                        </div>
                        <div className="export-only-block py-2 px-2 text-right flex items-center justify-end min-h-[40px]">{formatCurrency(list.unitPrice)}</div>
                    </div>
                </div>
            </div>

            <table className="w-full text-sm text-left">
                <thead className="bg-brand-orange/20 text-brand-brown">
                    <tr>
                        <th className="p-2">Length (in)</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 no-export w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {list.rows.map((row, index) => (
                        <tr key={row.id} className="border-b border-brand-brown/10">
                            <td className="p-2 align-middle">
                                <input type="number" value={row.length} onChange={(e) => handleNumericChange((v) => onUpdateRow(index, 'length', v), e.target.value)} className="w-full bg-transparent py-2 px-2 rounded border border-brand-brown/20 focus:bg-white/50 focus:ring-1 focus:ring-brand-orange no-export"/>
                                <div className="export-only-block py-2 px-2 flex items-center min-h-[40px]">{row.length}</div>
                            </td>
                            <td className="p-2 align-middle">
                                <input type="number" value={row.quantity} onChange={(e) => handleNumericChange((v) => onUpdateRow(index, 'quantity', v), e.target.value)} className="w-full bg-transparent py-2 px-2 rounded text-right border border-brand-brown/20 focus:bg-white/50 focus:ring-1 focus:ring-brand-orange no-export"/>
                                <div className="export-only-block py-2 px-2 flex items-center justify-end min-h-[40px]">{row.quantity}</div>
                            </td>
                            <td className="p-2 text-center align-middle no-export">
                                <button onClick={() => onDeleteRow(index)} className="text-red-600 hover:text-red-800"><DeleteIcon /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={onAddRow} className="mt-2 flex items-center gap-1 text-sm text-brand-brown hover:text-brand-orange font-semibold transition-colors no-export">
                <AddIcon /> Add Row
            </button>
            <div className="mt-3 pt-2 border-t border-brand-brown/20 text-sm space-y-1">
                <div className="flex justify-between font-semibold"><span className="text-brand-brown/80">Total Length (in):</span> <span>{totals.totalLength}</span></div>
                <div className="flex justify-between font-semibold"><span className="text-brand-brown/80">Boards Needed:</span> <span>{totals.boardsNeeded}</span></div>
                <div className="flex justify-between font-bold text-base"><span className="text-brand-brown/80">Total Cost:</span> <span>{formatCurrency(totals.totalCost)}</span></div>
            </div>
        </div>
    );
};