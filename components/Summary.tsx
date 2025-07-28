import React from 'react';

interface SummaryProps {
    totals: {
        material: number;
        labor: number;
        overhead: number;
        subtotal: number;
        salesTax: number;
        total: number;
        hours: number;
        profitPerHour: number;
    };
    financials: {
        profitMargin: number;
        salesTaxRate: number;
        shippingCost: number;
    };
    onFinancialsChange: (field: keyof SummaryProps['financials'], value: number) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const SummaryRow: React.FC<{ label: string; value: string; isBold?: boolean; isTotal?: boolean }> = ({ label, value, isBold, isTotal }) => (
    <div className={`summary-row flex justify-between items-center py-2 px-3 rounded-md min-h-[40px] ${isTotal ? 'bg-brand-brown text-white mt-2' : ''} ${isBold ? 'font-bold' : ''}`}>
        <span className="summary-label flex items-center">{label}</span>
        <span className="summary-value flex items-center text-right">{value}</span>
    </div>
);

const SummaryInputRow: React.FC<{ label: string; value: number; onChange: (val: number) => void; isPercent?: boolean; name: string }> = ({ label, value, onChange, isPercent, name }) => (
     <div className="summary-row flex justify-between items-center py-2 px-3 rounded-md bg-gray-200/50 min-h-[40px]">
        <label htmlFor={name} className="summary-label font-semibold flex items-center">{label}</label>
        <div className="summary-value flex items-center">
            {isPercent ? null : <span className="mr-1 text-gray-500">$</span>}
            <input
                id={name}
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-24 bg-white/50 text-right font-semibold border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange no-export"
            />
            {isPercent && <span className="ml-1 text-gray-500">%</span>}
            <span className="export-only-inline flex items-center">{isPercent ? `${value}%` : formatCurrency(value)}</span>
        </div>
    </div>
);


export const Summary: React.FC<SummaryProps> = ({ totals, financials, onFinancialsChange }) => {
    return (
        <div className="bg-white/60 p-4 rounded-lg shadow-sm border border-brand-brown/10 h-full">
            <h2 className="text-xl font-bold text-brand-brown mb-3">Cost Overview</h2>
            <div className="space-y-1 text-sm">
                <SummaryRow label="Material Costs" value={formatCurrency(totals.material)} />
                <SummaryRow label="Labour Costs" value={formatCurrency(totals.labor)} />
                <SummaryRow label="Overhead Costs" value={formatCurrency(totals.overhead)} />
                <hr className="my-2 border-brand-brown/20" />
                <SummaryRow label="Subtotal Cost" value={formatCurrency(totals.subtotal)} isBold />
                <hr className="my-2 border-brand-brown/20" />
                <SummaryInputRow label="Profit Margin" name="profit" value={financials.profitMargin} onChange={(v) => onFinancialsChange('profitMargin', v)} />
                <SummaryInputRow label="Sales Tax Rate" name="tax" value={financials.salesTaxRate} onChange={(v) => onFinancialsChange('salesTaxRate', v)} isPercent />
                <div className="flex justify-end text-xs text-gray-600 pr-3">Amount: {formatCurrency(totals.salesTax)}</div>
                <SummaryInputRow label="Shipping Cost" name="shipping" value={financials.shippingCost} onChange={(v) => onFinancialsChange('shippingCost', v)} />

                <SummaryRow label="Total Price" value={formatCurrency(totals.total)} isTotal />

                <div className="pt-4 grid grid-cols-2 gap-4">
                     <SummaryRow label="Hours worked" value={totals.hours.toFixed(2)} />
                     <SummaryRow label="Profit / Hour" value={formatCurrency(totals.profitPerHour)} />
                </div>
            </div>
        </div>
    );
};