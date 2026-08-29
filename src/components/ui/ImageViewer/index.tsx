import React, { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface ViewerImage {
  src: string;
  alt: string;
  title?: string;
}

interface ImageViewerProps {
  images: ViewerImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ images, initialIndex = 0, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  // Reset state when opened or index changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
    }
  }, [isOpen, initialIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  }, [currentIndex, images.length, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));
  const resetZoom = () => setScale(1);

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setScale(1);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setScale(1);
    }
  };

  const content = (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gray-900/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white z-10 bg-gradient-to-b from-gray-900/80 to-transparent">
        <div className="font-medium text-lg tracking-wide">
          {currentImage.title || `Image ${currentIndex + 1}`}
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close image viewer"
        >
          <X size={28} />
        </button>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {images.length > 1 && currentIndex > 0 && (
          <button 
            className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-md"
            onClick={prevImage}
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>
        )}
        
        <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
          <img 
            src={currentImage.src} 
            alt={currentImage.alt}
            className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out"
            style={{ transform: `scale(${scale})` }}
          />
        </div>

        {images.length > 1 && currentIndex < images.length - 1 && (
          <button 
            className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-md"
            onClick={nextImage}
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-6 flex flex-col items-center gap-4 z-10 bg-gradient-to-t from-gray-900/90 to-transparent">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-xl">
          <button onClick={zoomOut} className="p-2.5 hover:bg-white/10 rounded-xl text-white transition-colors" aria-label="Zoom out">
            <ZoomOut size={20} />
          </button>
          <div className="w-16 text-center text-sm font-bold text-white tracking-widest">
            {Math.round(scale * 100)}%
          </div>
          <button onClick={zoomIn} className="p-2.5 hover:bg-white/10 rounded-xl text-white transition-colors" aria-label="Zoom in">
            <ZoomIn size={20} />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button onClick={resetZoom} className="p-2.5 hover:bg-white/10 rounded-xl text-white transition-colors flex items-center gap-2 px-4" aria-label="Reset zoom">
            <RotateCcw size={18} />
            <span className="text-sm font-medium hidden sm:inline">Reset</span>
          </button>
        </div>
        
        {images.length > 1 && (
          <div className="text-white/60 text-sm font-medium tracking-widest uppercase">
            {currentIndex + 1} OF {images.length}
          </div>
        )}
      </div>
    </div>
  );

  // Portal to body to avoid z-index stacking context issues
  return createPortal(content, document.body);
};
