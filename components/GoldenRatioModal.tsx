import React from 'react';
import Modal from './Modal';
import { PhiLogoIcon } from './icons/Icons';

interface GoldenRatioModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GoldenRatioModal: React.FC<GoldenRatioModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="The Golden Ratio & Color">
            <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                    <strong>PhiColors</strong> is built upon a timeless principle of natural design: the <strong>Golden Ratio (φ)</strong>, an irrational number approximately equal to 1.618. This ratio appears throughout nature, art, and architecture, and is renowned for creating compositions that feel organic and aesthetically pleasing.
                </p>

                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 pt-2">From Ratio to Angle</h3>
                <p>
                    While the ratio itself is a number, we can use it to divide a circle into a special angle. This is the <strong>Golden Angle</strong>, which is approximately <strong>137.5°</strong>.
                </p>
                <p>
                    This isn't just a random number; it's nature's favorite angle for arranging things efficiently. You can see it in the spiral patterns of sunflower seeds, pinecones, and the arrangement of leaves on a stem (a field called phyllotaxis). This layout ensures maximum exposure to sunlight and resources.
                </p>

                <div className="text-center py-4">
                    <PhiLogoIcon className="w-16 h-16 inline-block animated-gradient-text" />
                </div>

                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 pt-2">Application in Color</h3>
                <p>
                    So, how does this apply to colors? PhiColors uses the Golden Angle to select complementary hues. Instead of picking colors at evenly spaced intervals (like 180° for complementary or 120° for triadic), we do the following:
                </p>
                 <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>We start with your chosen <strong>base hue</strong>.</li>
                    <li>To find the next color, we rotate around the color wheel by <strong>137.5°</strong>.</li>
                    <li>For each subsequent color, we rotate again by another 137.5° from the last one.</li>
                </ol>
                <p>
                    This method produces a set of colors that are not rigidly symmetrical but are distributed in a way that is naturally balanced and dynamic. The result is a palette that feels less formulaic and more harmonious, just like patterns in the natural world.
                </p>
            </div>
        </Modal>
    );
};

export default GoldenRatioModal;
