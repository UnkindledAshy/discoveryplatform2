'use client';

import { useState } from 'react';

const Features = () => {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        { title: 'Platforms', description: 'Keep track of all the games on every platform.' },
        { title: 'Reviews', description: 'Read reviews from other users and find the best games.' },
        { title: 'Favorites', description: 'Add your favorite games to your list and never miss an update.' },
        { title: 'Recommendations', description: 'Get personalized game recommendations based on your preferences.' },
    ];

    return (
        <section className="bg-[#F3F3F3] text-black py-24 px-8 md:px-16 border-t border-[#333] border-dashed">
            <div className="flex flex-col md:flex-row gap-16">
                <div className="w-full md:w-1/3">
                    <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-blue-600 mb-8">Features</h2>
                    <div className="flex flex-col gap-6">
                        {tabs.map((tab, idx) => (
                            <button
                                key={idx}
                                onMouseEnter={() => setActiveTab(idx)}
                                className={`text-left transition-all duration-300 ${activeTab === idx ? 'pl-4 border-l-2 border-blue-600' : 'pl-0 border-l-0 border-transparent text-black/40 hover:text-black'
                                    }`}
                            >
                                <div className="text-3xl font-black tracking-tighter leading-none mb-2">{tab.title}</div>
                                {activeTab === idx && (
                                    <p className="text-sm font-medium leading-relaxed max-w-[280px]">{tab.description}</p>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full md:w-2/3">
                    <div className="aspect-video bg-black relative flex items-center justify-center p-8 md:p-16 border border-[#333] border-dashed group">
                        <div className="absolute inset-0 dashed-grid opacity-20 pointer-events-none"></div>

                        <div className="relative z-10 text-center">
                            <h3 className="text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[0.8] mb-8">
                                {activeTab === 0 && "EVERY\nPLATFORM"}
                                {activeTab === 1 && "EVERY\nREVIEW"}
                                {activeTab === 2 && "YOUR\nFAVORITES"}
                                {activeTab === 3 && "PERSONAL\nRECOMMENDATIONS"}
                            </h3>
                            <div className="inline-block px-4 py-2 border border-blue-600 border-dashed text-blue-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] bg-black">
                                {tabs[activeTab].title}
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-600 animate-pulse hidden md:block"></div>

                    </div>
                </div>
            </div>
        </section>
    );
}

export default Features;
