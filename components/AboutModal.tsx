import React from 'react';
import Modal from './Modal';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="What is PhiColors?">
            <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                    <strong>PhiColors</strong> is a professional tool designed for designers, developers, and artists to create beautiful, harmonious, and accessible color palettes with ease.
                </p>
                
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 pt-2">The Golden Ratio Core</h3>
                <p>
                    The tool's foundation is the <strong>golden angle (≈ 137.5°)</strong>, derived from the golden ratio (Phi). It generates complementary colors that are naturally balanced and aesthetically pleasing, mimicking patterns found in nature and art.
                </p>

                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 pt-2">Accessibility-First Design</h3>
                <p>
                    A key feature is the automatic contrast correction system. It intelligently adjusts color lightness to ensure compliance with Web Content Accessibility Guidelines (WCAG) for AA or AAA levels, making your designs readable for everyone.
                </p>

                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 pt-2">Explore Color Harmonies</h3>
                <p>
                    Beyond the golden ratio, you can instantly generate classic color harmonies like Analogous, Triadic, and Monochromatic from your base color. This allows for rapid exploration of different visual moods and themes.
                </p>
                
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 pt-2">Visualize & Customize Your Theme</h3>
                <p>
                    Use the <strong>Theme Mapper</strong> to assign semantic roles (like background, primary, text) to your colors. Your assignments instantly power live previews of a UI Kit, typography, gradients, and even a logo, showing you exactly how your palette will work in a real-world application.
                </p>

                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 pt-2">Save & Share Your Work</h3>
                <p>
                    Easily <strong>Save</strong> your palettes as JSON files to continue your work later, or <strong>Import</strong> existing ones. You can also <strong>Export</strong> your final palette or harmony suggestion as a high-quality PNG image, perfect for sharing or including in design documents.
                </p>

                <p className="pt-2">
                    PhiColors bridges the gap between mathematical beauty and practical application, giving you the power to create effective and accessible color themes efficiently.
                </p>
            </div>
        </Modal>
    );
};

export default AboutModal;