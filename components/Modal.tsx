import React, { useEffect, useRef } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            modalRef.current?.focus();
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-2xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 m-4 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
            >
                <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-300 dark:border-slate-800">
                    <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/50 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-slate-500"
                        aria-label="Close"
                    >
                        <span className="text-xl font-bold" aria-hidden="true">✖</span>
                    </button>
                </div>
                <div className="p-4 sm:p-6 text-left leading-relaxed">
                    {children}
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Modal;
