import React from 'react';
import Modal from './Modal';
import { FacebookIcon, PaletteIcon, DribbbleIcon, LinkedInIcon } from './icons/Icons';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SocialLink: React.FC<{ href: string; ariaLabel: string; children: React.ReactNode }> = ({ href, ariaLabel, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="w-12 h-12 flex items-center justify-center bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full transition-colors duration-200 text-slate-700 dark:text-slate-300"
    >
        {children}
    </a>
);

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Contact Us">
            <div className="space-y-6 flex flex-col items-center text-center">
                 <p className="text-slate-600 dark:text-slate-400">
                    This tool was designed and developed with passion. You can follow my work and get in touch through the following platforms:
                </p>
                <div className="flex items-center justify-center gap-4 pt-4">
                    <SocialLink href="#" ariaLabel="Follow me on Facebook">
                        <FacebookIcon className="w-6 h-6" />
                    </SocialLink>
                    <SocialLink href="#" ariaLabel="See my portfolio on Behance">
                        <PaletteIcon className="w-6 h-6" />
                    </SocialLink>
                    <SocialLink href="#" ariaLabel="See my work on Dribbble">
                        <DribbbleIcon className="w-6 h-6" />
                    </SocialLink>
                    <SocialLink href="#" ariaLabel="Connect with me on LinkedIn">
                        <LinkedInIcon className="w-6 h-6" />
                    </SocialLink>
                </div>
            </div>
        </Modal>
    );
};

export default ContactModal;