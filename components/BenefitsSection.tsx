
import React from 'react';

const benefits = [
    { title: "Criamos seu site em menos de 24h" },
    { title: "Tudo personalizado do jeito que você sempre sonhou" },
    { title: "Você sonha, a gente realiza!" }
];

const BenefitsSection: React.FC = () => {
    return (
        <section id="benefits" className="py-20 bg-black">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="group relative p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-center transition-all duration-300 hover:border-[#FF007F] hover:-translate-y-2">
                             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-transparent to-[#FF007F]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <h3 className="relative z-10 text-xl font-bold font-manrope text-white">{benefit.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;