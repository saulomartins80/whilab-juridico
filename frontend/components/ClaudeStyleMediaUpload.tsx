'use client';

import React, { useRef, useCallback } from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClaudeStyleMediaUploadProps {
  onImageSelected: (file: File, preview: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export default function ClaudeStyleMediaUpload({
  onImageSelected,
  disabled = false,
  className = '',
}: ClaudeStyleMediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        onImageSelected(file, preview);
      }
      // Reset input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onImageSelected]
  );

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`
          p-2.5 rounded-lg transition-all duration-200
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
            : 'bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600'
          }
        `}
        whileHover={disabled ? {} : { scale: 1.05 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        title="Anexar imagem"
      >
        <Plus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </motion.button>
    </div>
  );
}
