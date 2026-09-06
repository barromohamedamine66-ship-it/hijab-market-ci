'use client';
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  className?: string;
}

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
};

export function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Bloquer le scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={clsx(
          'relative w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in',
          SIZES[size],
          className
        )}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
            {showClose && (
              <button
                onClick={onClose}
                className="ml-auto p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Drawer latéral
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  width?: string;
}

export function Drawer({ isOpen, onClose, title, children, side = 'right', width = 'w-full max-w-md' }: DrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={clsx(
          'fixed top-0 bottom-0 z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out',
          width,
          side === 'right' ? 'right-0' : 'left-0',
          isOpen
            ? 'translate-x-0'
            : side === 'right' ? 'translate-x-full' : '-translate-x-full'
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
