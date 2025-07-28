import React from 'react';

interface NotesProps {
    notes: string;
    onNotesChange: (notes: string) => void;
}

export const Notes: React.FC<NotesProps> = ({ notes, onNotesChange }) => {
    return (
        <div className="bg-white/60 p-4 rounded-lg shadow-sm border border-brand-brown/10 h-full flex flex-col">
            <h2 className="text-xl font-bold text-brand-brown mb-3">General Notes</h2>
            <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                className="flex-grow w-full bg-white/50 border border-brand-brown/20 rounded-md p-3 text-sm focus:ring-brand-orange focus:border-brand-orange transition no-export"
                placeholder="Add any additional notes here..."
            />
            <p className="export-only-block text-sm whitespace-pre-wrap">{notes}</p>
        </div>
    );
};