import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  Clock,
  CircleHelp,
  FileText,
  Video,
  Users,
  Zap,
  ChevronRight,
  ExternalLink,
  Phone,
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import { dashboardBranding } from '../config/branding';

const SuportePage = () => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const supportChannels = [
    {
      id: 'operations',
      title: 'Atendimento',
      description: 'atendimentos@whilab.com.br',
      icon: <MessageCircle className="w-6 h-6" />,
      action: () => {
        window.location.href = 'mailto:atendimentos@whilab.com.br';
      },
      color: 'bg-blue-500',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Canal rapido para suporte e implantacao',
      icon: <Zap className="w-6 h-6" />,
      action: () => window.open('https://wa.me/5562999667963', '_blank'),
      color: 'bg-green-500',
    },
    {
      id: 'support',
      title: 'Suporte tecnico',
      description: 'suporte@whilab.com.br',
      icon: <Mail className="w-6 h-6" />,
      action: () => {
        window.location.href = 'mailto:suporte@whilab.com.br';
      },
      color: 'bg-red-500',
    },
    {
      id: 'sales',
      title: 'Vendas',
      description: 'vendas@whilab.com.br',
      icon: <Users className="w-6 h-6" />,
      action: () => {
        window.location.href = 'mailto:vendas@whilab.com.br';
      },
      color: 'bg-purple-500',
    },
  ];

  const faqItems = [
    {
      question: 'Como funciona o onboarding inicial?',
      answer:
        'Depois do primeiro contato, alinhamos escopo, acesso, setup e a trilha de implantacao mais adequada para sua operacao.',
    },
    {
      question: 'O que eu recebo no suporte?',
      answer:
        'Orientacao de acesso, esclarecimento de duvidas operacionais, suporte tecnico e encaminhamento comercial quando houver customizacao ou implantacao.',
    },
    {
      question: 'Posso usar a base com minha marca?',
      answer:
        'Sim. A estrutura comercial do WhiLab foi pensada para setup, rebranding e adaptacao com mais rapidez, dentro do escopo contratado.',
    },
    {
      question: 'Qual e o melhor canal para falar com humano rapido?',
      answer:
        'Para urgencia operacional use WhatsApp. Para suporte tecnico use suporte@whilab.com.br. Para vendas e implantacao use vendas@whilab.com.br.',
    },
  ];

  const resources = [
    {
      title: 'Recursos',
      description: 'Visao geral da base, docs e materiais publicos',
      icon: <FileText className="w-6 h-6" />,
      link: '/recursos',
    },
    {
      title: 'Licencas e planos',
      description: 'Entenda faixas de entrada, setup e upsells',
      icon: <Video className="w-6 h-6" />,
      link: '/assinaturas',
    },
    {
      title: 'Contato comercial',
      description: 'Canal para proposta, escopo e fechamento',
      icon: <Users className="w-6 h-6" />,
      link: '/contato',
    },
  ];

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Head>
        <title>Suporte | {dashboardBranding.brandName}</title>
        <meta
          name="description"
          content={`Central de suporte, atendimento e implantacao do ${dashboardBranding.brandName}.`}
        />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4"
          >
            <CircleHelp className="mr-2" size={18} />
            <span className="font-medium">Central de Suporte</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Como podemos ajudar?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className={`text-lg max-w-2xl mx-auto ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Nossa equipe esta pronta para orientar acesso, implantacao, suporte tecnico e operacao do {dashboardBranding.brandName}.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {supportChannels.map((channel) => (
            <motion.div
              key={channel.id}
              whileHover={{ y: -5 }}
              className={`p-6 rounded-xl cursor-pointer transition-all ${resolvedTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 shadow-sm hover:shadow-md'}`}
              onClick={channel.action}
            >
              <div className={`w-12 h-12 rounded-lg ${channel.color} flex items-center justify-center mb-4 text-white`}>
                {channel.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{channel.title}</h3>
              <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {channel.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className={`p-6 rounded-xl mb-16 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center mb-4">
            <Clock className="w-6 h-6 text-yellow-500 mr-3" />
            <h2 className="text-xl font-semibold">Horario de atendimento</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Suporte tecnico</h3>
              <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Segunda a Sexta: 8h as 20h
                <br />
                Sabado: 9h as 15h
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Comercial e implantacao</h3>
              <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Segunda a Sexta: 9h as 18h
                <br />
                Alinhamento sob demanda
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Perguntas frequentes</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              >
                <h3 className="font-semibold mb-2">{item.question}</h3>
                <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {item.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Recursos adicionais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-xl cursor-pointer transition-all ${resolvedTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 shadow-sm hover:shadow-md'}`}
                onClick={() => router.push(resource.link)}
              >
                <div className={`w-12 h-12 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                  {resource.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {resource.description}
                </p>
                <div className="mt-4 flex items-center text-blue-500">
                  <span className="text-sm font-medium">Acessar</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-xl ${resolvedTheme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'} border border-red-200 dark:border-red-800`}>
          <div className="flex items-center mb-4">
            <Phone className="w-6 h-6 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold">Prioridade operacional</h2>
          </div>
          <p className={`mb-4 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Para situacoes urgentes, use o WhatsApp e depois centralize o contexto no e-mail de atendimento para manter a trilha organizada.
          </p>
          <button
            onClick={() => window.open('https://wa.me/5562999667963', '_blank')}
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white"
          >
            <Zap className="mr-2" />
            Abrir canal prioritario
            <ExternalLink className="ml-2 w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default SuportePage;
