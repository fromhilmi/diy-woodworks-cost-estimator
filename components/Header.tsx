import React from 'react';

const Logo: React.FC = () => (
    <img 
        src="/mylogo.jpg" 
        alt="DIY Woodworks Logo" 
        width="60" 
        height="60" 
        className="rounded-lg object-contain"
    />
);


export const Header: React.FC = () => {
    return (
        <div className="flex items-center gap-4">
            <Logo />
            <div>
                <h1 className="text-3xl font-bold text-brand-brown">DIY WOODWORKING</h1>
                <p className="text-lg text-brand-brown/80">Project Cost Estimator</p>
            </div>
        </div>
    );
};