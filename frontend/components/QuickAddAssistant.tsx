import { useState } from 'react';
import { X } from 'lucide-react';

import { metaAPI } from '../services/api';
import { Prioridade } from '../types/Meta';

interface QuickAddAssistantProps {
  onClose: () => void;
  onSuccess?: (type: string, data: Record<string, string | number>) => void;
  activeTab: string;
}

export default function QuickAddAssistant({ onClose, onSuccess, activeTab }: QuickAddAssistantProps) {
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  const handleNext = async () => {
    if (step < formModels[activeTab].steps.length) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const metaData = {
        meta: String(formData.nome || ''),
        descricao: String(formData.descricao || 'Meta criada via assistente'),
        valor_total: Number(formData.valor) || 0,
        valor_atual: 0,
        data_conclusao: String(formData.data_conclusao || ''),
        categoria: formData.categoria ? String(formData.categoria) : undefined,
        prioridade: formData.prioridade ? (String(formData.prioridade).toLowerCase() as Prioridade) : undefined
      };
      const result = await metaAPI.create(metaData as Parameters<typeof metaAPI.create>[0]);
      if (onSuccess && result) onSuccess('goal', result as unknown as Record<string, string | number>);
      // Limpar o formulário antes de fechar
      resetForm();
      onClose();
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setStep(1);
    setError('');
    setValidationErrors([]);
  };

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData({...formData, [field]: value});
    setValidationErrors(prev => prev.filter(e => e.field !== field));
    setError('');
  };

  const getCurrentFieldError = () => {
    return validationErrors.find(e => e.field === currentStep?.field)?.message;
  };

  // Modelos de formulários
  const formModels = {
    goals: {
      title: 'Criar Meta',
      steps: [
        { field: 'nome', question: 'Qual o nome da meta?', type: 'text', validation: { required: true } },
        { field: 'valor', question: 'Qual o valor objetivo?', type: 'number', validation: { required: true } },
        { field: 'categoria', question: 'Qual categoria?', type: 'select', options: ['Vendas', 'Produção', 'Reprodução', 'Ganho de Peso'], validation: { required: true } },
        { field: 'prioridade', question: 'Qual a prioridade?', type: 'select', options: ['Baixa', 'Média', 'Alta'], validation: { required: true } },
        { field: 'data_conclusao', question: 'Quando deve ser concluída?', type: 'date', validation: { required: true } }
      ]
    },
    animals: {
      title: 'Adicionar Animal',
      steps: [
        { field: 'brinco', question: 'Qual o brinco do animal?', type: 'text', validation: { required: true } },
        { field: 'raca', question: 'Qual a raça?', type: 'text', validation: { required: true } },
        { field: 'categoria', question: 'Qual categoria?', type: 'select', options: ['Bezerro', 'Novilho', 'Boi', 'Bezerra', 'Novilha', 'Vaca'], validation: { required: true } },
        { field: 'peso_atual', question: 'Qual o peso atual (kg)?', type: 'number', validation: { required: true } }
      ]
    },
    transactions: {
      title: 'Nova Transação',
      steps: [
        { field: 'descricao', question: 'O que foi comprado/vendido?', type: 'text', validation: { required: true } },
        { field: 'valor', question: 'Qual o valor?', type: 'number', validation: { required: true } },
        { field: 'tipo', question: 'Tipo de transação?', type: 'select', options: ['Receita', 'Despesa'], validation: { required: true } },
        { field: 'categoria', question: 'Categoria?', type: 'select', options: ['Alimentação', 'Medicamentos', 'Combustível', 'Manutenção'], validation: { required: true } }
      ]
    }
  };

  const currentStep = formModels[activeTab as keyof typeof formModels]?.steps[step - 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold dark:text-white">
            {formModels[activeTab].title}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {currentStep.question}
            {currentStep.validation?.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          {currentStep.type === 'select' ? (
            <select
              value={String(formData[currentStep.field] || '')}
              onChange={(e) => handleFieldChange(currentStep.field, e.target.value)}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white ${getCurrentFieldError() ? 'border-red-500' : ''}`}
            >
              <option value="">Selecione...</option>
              {currentStep.options && currentStep.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : currentStep.type === 'date' ? (
            <input
              type="date"
              value={String(formData[currentStep.field] || '')}
              onChange={(e) => handleFieldChange(currentStep.field, e.target.value)}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white ${getCurrentFieldError() ? 'border-red-500' : ''}`}
            />
          ) : (
            <input
              type={currentStep.type}
              value={String(formData[currentStep.field] || '')}
              onChange={(e) => handleFieldChange(currentStep.field, e.target.value)}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white ${getCurrentFieldError() ? 'border-red-500' : ''}`}
              placeholder={currentStep.question}
            />
          )}
          {getCurrentFieldError() && (
            <p className="text-red-500 text-sm mt-1">{getCurrentFieldError()}</p>
          )}
        </div>

        <div className="flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-gray-300"
              disabled={isLoading}
            >
              Voltar
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isLoading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-lg ml-auto ${isLoading ? 'opacity-50' : ''}`}
          >
            {isLoading ? 'Processando...' : step < formModels[activeTab].steps.length ? 'Próximo' : 'Concluir'}
          </button>
        </div>
      </div>
    </div>
  );
}
