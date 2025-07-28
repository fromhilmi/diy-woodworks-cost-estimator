import React from 'react';
import { ProjectDetails } from '../types';

interface ProjectInfoProps {
    details: ProjectDetails;
    onChange: (field: keyof ProjectDetails, value: string) => void;
}

const InfoRow: React.FC<{ label: string; value: string; name: keyof ProjectDetails; onChange: (field: keyof ProjectDetails, value: string) => void; type?: string }> = ({ label, value, name, onChange, type = "text" }) => (
    <div className="flex items-center min-h-[36px]">
        <label className="w-32 font-semibold text-sm flex items-center">{label}</label>
        <div className="flex-1">
            <input
                type={type}
                name={name}
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                className="w-full bg-white/50 border border-brand-brown/20 rounded-md px-3 py-2 text-sm focus:ring-brand-orange focus:border-brand-orange transition no-export"
            />
            <div className="export-only-block text-sm flex items-center py-2 px-3 min-h-[40px] bg-white/50 border border-brand-brown/20 rounded-md">{value}</div>
        </div>
    </div>
);

export const ProjectInfo: React.FC<ProjectInfoProps> = ({ details, onChange }) => {
    return (
        <div className="bg-white/60 p-4 rounded-lg shadow-sm border border-brand-brown/10 no-break">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <InfoRow label="Project Name:" name="name" value={details.name} onChange={onChange} />
                <InfoRow label="Date:" name="date" value={details.date} onChange={onChange} type="date" />
                <InfoRow label="Customer Name:" name="customerName" value={details.customerName} onChange={onChange} />
                <InfoRow label="Customer Phone:" name="customerPhone" value={details.customerPhone} onChange={onChange} />
                <InfoRow label="Customer Email:" name="customerEmail" value={details.customerEmail} onChange={onChange} type="email" />
            </div>
        </div>
    );
};