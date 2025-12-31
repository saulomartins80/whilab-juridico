'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataCorrectionRequest {
  action: 'edit' | 'delete' | 'convert';
  fromType?: 'transaction' | 'goal' | 'investment' | 'schedule' | 'card';
  fromId?: string;
  fromSku?: string;
  toType?: 'transaction' | 'goal' | 'investment' | 'schedule' | 'card';
  suggestedData?: Record<string, unknown>;
  reason?: string;
}

interface DataCorrectionModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  correctionData: DataCorrectionRequest | null;
  onConfirmAction: () => void;
}

export default function DataCorrectionModal({
  isOpen,
  onCloseAction,
  correctionData,
  onConfirmAction,
}: DataCorrectionModalProps) {
  if (!isOpen || !correctionData) return null;

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'edit':
        return 'Editar';
      case 'delete':
        return 'Excluir';
      case 'convert':
        return 'Converter';
      default:
        return action;
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'transaction':
        return 'Transação';
      case 'goal':
        return 'Meta';
      case 'investment':
        return 'Investimento';
      case 'schedule':
        return 'Agendamento';
      case 'card':
        return 'Cartão';
      default:
        return type || 'Registro';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onCloseAction}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Correção de Dados
                </h2>
              </div>
              <button
                onClick={onCloseAction}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Ação:</strong> {getActionLabel(correctionData.action)}
                </p>
                {correctionData.fromType && (
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Tipo:</strong> {getTypeLabel(correctionData.fromType)}
                  </p>
                )}
                {correctionData.reason && (
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                    <strong>Motivo:</strong> {correctionData.reason}
                  </p>
                )}
              </div>

              {correctionData.suggestedData && Object.keys(correctionData.suggestedData).length > 0 && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dados sugeridos:
                  </p>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                    {JSON.stringify(correctionData.suggestedData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onCloseAction}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmAction}
                className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
