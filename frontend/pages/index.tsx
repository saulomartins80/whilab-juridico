// pages/index.tsx - BOVINEXT REDESIGN RADICAL
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import CountUp from 'react-countup';
import { 
  FiArrowRight, 
  FiPlay, 
  FiStar, 
  FiTrendingUp, 
  FiX, 
  FiLinkedin, 
  FiInstagram, 
  FiMenu, 
  FiSun, 
  FiMoon, 
  FiGlobe, 
  FiShield, 
  FiUsers, 
  FiAward, 
  FiSmartphone, 
  FiMonitor, 
  FiTablet,
  FiHexagon,
  FiMessageCircle,
  FiPhone,
  FiMail,
  FiClock,
  FiZap,
  FiTarget
} from 'react-icons/fi';
import { 
  GiCow,
  GiArtificialIntelligence,
  GiNetworkBars,
  GiProgression,
  GiCookie
} from 'react-icons/gi';
import Link from 'next/link';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Novo logo moderno para BOVINEXT
const BovinextLogo = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00E676" />
        <stop offset="50%" stopColor="#00C853" />
        <stop offset="100%" stopColor="#2E7D32" />
      </linearGradient>
    </defs>
    <path 
      d="M50 15 L75 40 L65 50 L50 35 L35 50 L25 40 Z" 
      fill="url(#gradient)"
    />
    <path 
      d="M35 50 L15 70 L30 85 L50 65 L70 85 L85 70 L65 50 L50 65 Z" 
      fill="url(#gradient)"
      opacity="0.9"
    />
  </svg>
);

// Componente de Partículas Flutuantes - Estilo cursor.sh
const FloatingParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 4,
    size: Math.random() * 4 + 1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 10 - 5, 0],
            opacity: [0.1, 0.8, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Componente de Grid Interativo - Estilo cursor.sh
const InteractiveGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <div className="absolute inset-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(99 102 241 / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(99 102 241 / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)'
        }}
      />
    </div>
  );
};

// Componente de Glow Effect
const GlowEffect = () => {
  return (
    <>
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl filter opacity-30 animate-pulse-slow" />
      <div className="absolute top-2/3 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl filter opacity-30 animate-pulse-medium" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500/8 rounded-full blur-3xl filter opacity-25 animate-pulse-slow" />
    </>
  );
};

export default function HomePage() {
  const { user, loading } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [showChatTooltip, setShowChatTooltip] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Redirecionar usuários logados para o dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }

      // Verificar se está no final da página
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const atBottom = scrollTop + windowHeight >= documentHeight - 200;
      
      if (atBottom !== isAtBottom) {
        setIsAtBottom(atBottom);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled, isAtBottom]);

  // Métricas dinâmicas da pecuária
  const metrics = [
    { value: 2.5, suffix: 'K+', label: 'Pecuaristas ativos', icon: <FiUsers className="w-6 h-6" /> },
    { value: 98, suffix: '%', label: 'Satisfação', icon: <FiStar className="w-6 h-6" /> },
    { value: 4.9, suffix: '/5', label: 'Avaliação', icon: <FiAward className="w-6 h-6" /> },
    { value: 24, suffix: '/7', label: 'Suporte Técnico', icon: <FiShield className="w-6 h-6" /> }
  ];

  // Features da pecuária inteligente - Estilo cursor.sh
  const features = [
    {
      icon: <GiNetworkBars className="w-8 h-8" />,
      title: "Analytics Pecuário com IA",
      description: "Relatórios em tempo real com machine learning para prever tendências produtivas e otimizar manejo",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: <GiProgression className="w-8 h-8" />,
      title: "Genética Integrada",
      description: "Gerencie genealogia, melhoramento genético e seleção de reprodutores com IA",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: <GiArtificialIntelligence className="w-8 h-8" />,
      title: "Automação Rural",
      description: "Sistema automático que identifica problemas sanitários e otimiza protocolos por você",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: <FiHexagon className="w-8 h-8" />,
      title: "Saúde Animal",
      description: "Monitoramento contínuo de saúde, alertas preventivos e protocolos sanitários inteligentes",
      gradient: "from-green-500 to-green-600",
    }
  ];

  // Menu items
  const menuItems = [
    { name: 'Recursos', path: '/recursos' },
    { name: 'Soluções', path: '/solucoes' },
    { name: 'Pecuaristas', path: '/pecuaristas' },
    { name: 'Preços', path: '/precos' },
    { name: 'Cases', path: '/cases' },
    { name: 'Contato', path: '/contato' }
  ];

  // Fazendas parceiras - Estilo cursor.sh
  const partnerFarms = [
    { 
      name: "SANTA ROSA", 
      style: "fazenda",
      color: "text-green-700",
      font: "font-bold tracking-widest text-2xl"
    },
    { 
      name: "Esperança", 
      style: "sitio",
      color: "text-blue-600",
      font: "font-semibold tracking-normal text-2xl",
      icon: <GiProgression className="w-6 h-6" />
    },
    { 
      name: "progresso", 
      style: "fazenda",
      color: "text-purple-600",
      font: "font-bold tracking-tight text-2xl italic"
    },
    { 
      name: "verde.agro", 
      style: "rancho",
      color: "text-emerald-600",
      font: "font-bold tracking-normal text-2xl"
    },
    { 
      name: "BELA VISTA", 
      style: "estancia",
      color: "text-indigo-700",
      font: "font-black tracking-widest text-2xl"
    },
    { 
      name: "horizonte", 
      style: "fazenda",
      color: "text-orange-600",
      font: "font-medium tracking-wide text-2xl",
      icon: <FiTrendingUp className="w-6 h-6" />
    },
    { 
      name: "três irmãos", 
      style: "sitio",
      color: "text-teal-600",
      font: "font-bold tracking-wide text-2xl"
    },
    { 
      name: "pecuária", 
      style: "fazenda",
      color: "text-red-600",
      font: "font-semibold tracking-normal text-2xl",
      icon: <GiCow className="w-6 h-6" />
    },
    { 
      name: "OuroVerde", 
      style: "fazenda",
      color: "text-yellow-600",
      font: "font-bold tracking-normal text-2xl"
    },
    { 
      name: "agro brasil", 
      style: "cooperativa",
      color: "text-green-800",
      font: "font-bold tracking-normal text-2xl",
      icon: <GiNetworkBars className="w-6 h-6" />
    }
  ];

  // Depoimentos
  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Pecuarista - Fazenda Santa Rosa",
      text: "Com o BOVINEXT, aumentei minha produtividade em 45% em apenas 6 meses. O controle do rebanho ficou muito mais eficiente.",
      rating: 5
    },
    {
      name: "Maria Santos",
      role: "Produtora Rural - Sítio Esperança",
      text: "A plataforma revolucionou minha gestão. Agora tenho controle total sobre cada animal e os resultados são impressionantes.",
      rating: 5
    },
    {
      name: "João Oliveira",
      role: "Fazendeiro - Fazenda Progresso",
      text: "Recomendo o BOVINEXT para todos os pecuaristas. É uma ferramenta indispensável para quem quer crescer no agronegócio.",
      rating: 5
    }
  ];

  // Estatísticas avançadas
  const advancedStats = [
    { icon: <FiGlobe className="w-6 h-6" />, value: "15+", label: "Estados Atendidos", color: "text-blue-500" },
    { icon: <FiZap className="w-6 h-6" />, value: "99.9%", label: "Uptime Garantido", color: "text-green-500" },
    { icon: <FiTarget className="w-6 h-6" />, value: "45%", label: "Aumento Médio Produtividade", color: "text-purple-500" },
    { icon: <FiClock className="w-6 h-6" />, value: "24h", label: "Suporte Técnico", color: "text-orange-500" }
  ];

  // Informações de contato empresarial (não usado)
  // const contactInfo = [
  //   { icon: <FiPhone className="w-5 h-5" />, label: "Telefone", value: "+55 (11) 3000-0000", color: "text-blue-500" },
  //   { icon: <FiMail className="w-5 h-5" />, label: "E-mail", value: "contato@bovinext.com.br", color: "text-green-500" },
  //   { icon: <FiMapPin className="w-5 h-5" />, label: "Endereço", value: "São Paulo, SP - Brasil", color: "text-purple-500" }
  // ];

  // Tecnologias Avançadas
  const advancedTechnologies = [
    { 
      icon: <GiArtificialIntelligence className="w-8 h-8" />, 
      title: "Machine Learning", 
      description: "Algoritmos preditivos para otimização da produção",
      gradient: "from-green-500 to-green-600",
    },
    { 
      icon: <FiZap className="w-8 h-8" />, 
      title: "IoT Integrado", 
      description: "Sensores inteligentes conectados em tempo real",
      gradient: "from-green-500 to-green-600",
    },
    { 
      icon: <FiShield className="w-8 h-8" />, 
      title: "Blockchain", 
      description: "Rastreabilidade completa e segurança de dados",
      gradient: "from-green-500 to-green-600",
    },
    { 
      icon: <FiGlobe className="w-8 h-8" />, 
      title: "Cloud Computing", 
      description: "Infraestrutura escalável e alta disponibilidade",
      gradient: "from-green-500 to-green-600",
    }
  ];

  // Certificações e Segurança
  const certifications = [
    { 
      icon: <FiShield className="w-6 h-6" />, 
      title: "ISO 27001", 
      subtitle: "Segurança da Informação",
      color: "text-blue-500"
    },
    { 
      icon: <FiAward className="w-6 h-6" />, 
      title: "LGPD", 
      subtitle: "Proteção de Dados",
      color: "text-green-500"
    },
    { 
      icon: <FiTarget className="w-6 h-6" />, 
      title: "AWS Certified", 
      subtitle: "Cloud Infrastructure",
      color: "text-purple-500"
    }
  ];

  // Dispositivos suportados
  const supportedDevices = [
    { icon: <FiSmartphone className="w-8 h-8" />, name: "Mobile", description: "iOS e Android" },
    { icon: <FiTablet className="w-8 h-8" />, name: "Tablet", description: "Otimizado para campo" },
    { icon: <FiMonitor className="w-8 h-8" />, name: "Desktop", description: "Gestão completa" }
  ];

  // Mostrar loading apenas quando está carregando
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        resolvedTheme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>BOVINEXT - Revolução na Gestão Pecuária com Inteligência Artificial</title>
        <meta name="description" content="Transforme sua pecuária com IA avançada. Gestão inteligente de rebanho, controle sanitário, análise genética e otimização produtiva." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header Estilo cursor.sh */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? resolvedTheme === 'dark' 
              ? 'bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/30' 
              : 'bg-white/80 backdrop-blur-xl border-b border-gray-200/30'
            : 'bg-transparent'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >  
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <BovinextLogo />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">
              BOVINEXT
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    resolvedTheme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800/30' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                resolvedTheme === 'dark' 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800/30' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              {resolvedTheme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/auth/login"  
                className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                  resolvedTheme === 'dark' 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Entrar
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/auth/register" 
                  className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
                >
                  Comece Agora
                </Link>
              </motion.div>
            </div>
          </div>

          <button 
            className={`text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${
              resolvedTheme === 'dark' 
                ? 'from-green-400 to-green-500' 
                : 'from-green-500 to-green-600'
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <FiMenu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden absolute top-full left-0 right-0 ${
                resolvedTheme === 'dark' 
                  ? 'bg-gray-900/95 backdrop-blur-md border-t border-gray-800/30' 
                  : 'bg-white/95 backdrop-blur-md border-t border-gray-200/30'
              } overflow-hidden`}
            >
              <div className="px-4 py-6 space-y-4">
                {menuItems.map((item) => (
                  <Link 
                    key={item.path}
                    href={item.path}
                    className={`block py-2 font-medium ${
                      resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-800/30 space-y-3">
                  <Link 
                    href="/auth/login" 
                    className={`block text-center py-2 font-medium ${
                      resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="block text-center py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Comece Agora
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section - Estilo cursor.sh */}
      <section className={`relative min-h-screen flex items-center justify-center overflow-hidden pt-20 ${
        resolvedTheme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
        <InteractiveGrid />
        <FloatingParticles />
        <GlowEffect />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8"
            >
              <span className="text-sm font-medium text-indigo-500">NOVA VERSÃO 3.0 LANÇADA</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
                resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Revolução na{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">
                Pecuária 4.0
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`text-xl md:text-2xl max-w-3xl mx-auto mb-10 ${
                resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              A primeira plataforma que combina gestão pecuária com inteligência artificial preditiva para maximizar sua produtividade e lucratividade.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Começar Agora
                  <FiArrowRight className="ml-2" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  className={`inline-flex items-center px-8 py-4 font-medium rounded-lg border transition-all duration-300 ${
                    resolvedTheme === 'dark'
                      ? 'border-gray-800 text-gray-300 hover:border-green-500 hover:text-white'
                      : 'border-gray-300 text-gray-600 hover:border-green-500 hover:text-gray-900'
                  }`}
                >
                  <FiPlay className="mr-2" />
                  Ver Demonstração
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {metrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className={`flex justify-center mb-3 ${
                    resolvedTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {metric.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">
                    <CountUp 
                      end={metric.value} 
                      suffix={metric.suffix}
                      duration={3}
                      decimals={metric.value % 1 ? 1 : 0}
                    />
                  </div>
                  <div className={`text-sm font-medium ${
                    resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Estilo cursor.sh */}
      <section className={`py-24 relative overflow-hidden ${
        resolvedTheme === 'dark' ? 'bg-gray-950' : 'bg-white'
      }`}>
        <InteractiveGrid />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-4xl md:text-5xl font-bold mb-6 ${
                resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Tecnologia <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">Revolucionária</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={`text-xl max-w-3xl mx-auto ${
                resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Recursos avançados com IA que você não encontra em nenhum outro lugar. 
              Seja o primeiro a experimentar o futuro da pecuária!
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`relative p-8 rounded-2xl transition-all duration-500 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800/30' 
                    : 'bg-gray-50/50 hover:bg-gray-50/70 border border-gray-200/30'
                } ${hoveredFeature === index ? 'scale-105' : ''}`}
              >
                <motion.div 
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-6`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-lg ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 hover:opacity-5 transition-opacity duration-300 -z-10`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Farms Carousel */}
      <section className={`py-16 relative overflow-hidden ${
        resolvedTheme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100/50'
      }`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Fazendas <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">Parceiras</span>
            </h2>
            <p className={`text-lg ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Produtores que confiam no BOVINEXT para transformar sua pecuária
            </p>
          </div>
          
          <div className="relative">
            <motion.div 
              className="flex space-x-12"
              animate={{ x: [0, -1920] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {[...partnerFarms, ...partnerFarms].map((farm, index) => (
                <motion.div
                  key={`${farm.name}-${index}`}
                  className="flex items-center space-x-3 whitespace-nowrap"
                  whileHover={{ scale: 1.1 }}
                >
                  {farm.icon && (
                    <div className={farm.color}>
                      {farm.icon}
                    </div>
                  )}
                  <span className={`${farm.font} ${farm.color}`}>
                    {farm.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advanced Stats */}
      <section className={`py-24 ${
        resolvedTheme === 'dark' ? 'bg-gray-950' : 'bg-white'
      }`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Números que <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">Impressionam</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Resultados reais de uma plataforma que realmente funciona
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {advancedStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className={`text-center p-8 rounded-2xl transition-all duration-300 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800/30' 
                    : 'bg-gray-50/50 hover:bg-gray-50/70 border border-gray-200/30 shadow-lg'
                }`}
              >
                <div className={`flex justify-center mb-4 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">
                  {stat.value}
                </div>
                <div className={`text-sm font-medium ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Devices */}
      <section className={`py-24 ${
        resolvedTheme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100/50'
      }`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-4xl md:text-5xl font-bold mb-6 ${
                resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Disponível em <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">Todos os Dispositivos</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={`text-xl max-w-3xl mx-auto ${
                resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Plataforma otimizada para todos os dispositivos. Gerencie seu rebanho no campo, escritório ou em casa.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {supportedDevices.map((device, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className={`text-center p-8 rounded-2xl transition-all duration-300 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-900/80 hover:bg-gray-900/90 border border-gray-800/30' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200/30 shadow-lg'
                }`}
              >
                <motion.div 
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white mb-6`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {device.icon}
                </motion.div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {device.name}
                </h3>
                <p className={`text-lg ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {device.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Advanced Technologies */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {advancedTechnologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className={`relative p-6 rounded-2xl transition-all duration-500 overflow-hidden ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-900/80 hover:bg-gray-900/90 border border-gray-800/30' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200/30 shadow-lg hover:shadow-2xl'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tech.gradient} opacity-0 hover:opacity-10 transition-opacity duration-500`} />
                
                <motion.div 
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${tech.gradient} text-white mb-4 relative z-10`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {tech.icon}
                </motion.div>
                
                <h3 className={`text-xl font-bold mb-2 relative z-10 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {tech.title}
                </h3>
                
                <p className={`text-sm relative z-10 ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {tech.description}
                </p>

                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full opacity-0 group-hover:opacity-100"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </div>

          {/* Certificações e Segurança */}
          <div className="text-center mb-12">
            <h3 className={`text-2xl md:text-3xl font-bold mb-8 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Certificações <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">& Segurança</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  className={`flex flex-col items-center p-6 rounded-xl transition-all duration-300 ${
                    resolvedTheme === 'dark' 
                      ? 'bg-gray-900/80 hover:bg-gray-900/90 border border-gray-800/30' 
                      : 'bg-gray-100/50 hover:bg-white border border-gray-200/30 shadow-sm hover:shadow-lg'
                  }`}
                >
                  <div className={`mb-4 p-3 rounded-full ${cert.color} bg-opacity-20`}>
                    <div className={cert.color}>
                      {cert.icon}
                    </div>
                  </div>
                  <h4 className={`text-lg font-bold mb-1 ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {cert.title}
                  </h4>
                  <p className={`text-sm ${
                    resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {cert.subtitle}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-24 ${
        resolvedTheme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              O que dizem nossos <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">clientes</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-8 rounded-2xl ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-900/80 border border-gray-800/30' 
                    : 'bg-white border border-gray-200/30 shadow-lg'
                }`}
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-400'}`} 
                    />
                  ))}
                </div>
                <p className={`mb-8 text-lg italic ${
                  resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  &quot;{testimonial.text}&quot;
                </p>
                <div>
                  <h3 className={`font-bold ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{testimonial.name}</h3>
                  <p className={`text-sm ${
                    resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-32 relative overflow-hidden ${
        resolvedTheme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 to-indigo-900/30' 
          : 'bg-gradient-to-br from-gray-50 to-indigo-50/50'
      }`}>
        <GlowEffect />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-4xl md:text-5xl font-bold mb-8 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Pronto para a <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">revolução</span> pecuária?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`text-xl mb-12 ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Junte-se a milhares de pecuaristas que já transformaram sua gestão com o BOVINEXT.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/auth/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:shadow-xl transition-all duration-300"
              >
                Começar Gratuitamente
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/contato"
                className={`inline-flex items-center px-8 py-4 font-medium rounded-lg border transition-all duration-300 ${
                  resolvedTheme === 'dark'
                    ? 'border-gray-700 text-gray-300 hover:border-green-500 hover:text-white'
                    : 'border-gray-300 text-gray-600 hover:border-green-500 hover:text-gray-900'
                }`}
              >
                <FiPlay className="mr-2" />
                Falar com Especialista
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 ${
        resolvedTheme === 'dark' ? 'bg-gray-950' : 'bg-gray-100'
      }`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <Link href="/" className="flex items-center space-x-3 mb-6">
                <BovinextLogo />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
                  BOVINEXT
                </span>
              </Link>
              <p className={`mb-6 ${
                resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                A plataforma de gestão pecuária mais avançada do mercado, com tecnologia de ponta para transformar sua produção.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: <FiX className="w-5 h-5" />, name: 'Twitter' },
                  { icon: <FiLinkedin className="w-5 h-5" />, name: 'LinkedIn' },
                  { icon: <FiInstagram className="w-5 h-5" />, name: 'Instagram' },
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                      resolvedTheme === 'dark' 
                        ? 'bg-gray-900 text-gray-400 hover:bg-indigo-500/20 hover:text-indigo-400' 
                        : 'bg-white text-gray-600 hover:bg-indigo-500/10 hover:text-indigo-600'
                    }`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Produto',
                links: ['Recursos', 'Soluções', 'Preços', 'Cases']
              },
              {
                title: 'Empresa',
                links: ['Sobre', 'Carreiras', 'Blog', 'Contato']
              },
              {
                title: 'Legal',
                links: ['Privacidade', 'Termos', 'Segurança', 'Cookies']
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className={`font-bold text-lg mb-6 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className={`transition ${
                        resolvedTheme === 'dark' 
                          ? 'text-gray-400 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className={`border-t mt-16 pt-8 text-center ${
            resolvedTheme === 'dark' ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
          }`}>
            <p>&copy; {new Date().getFullYear()} BOVINEXT. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Chat Support Float Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
        onMouseEnter={() => setShowChatTooltip(true)}
        onMouseLeave={() => setShowChatTooltip(false)}
      >
        <motion.button
          onClick={() => {
            setChatOpen(!chatOpen);
            console.log('Abrir chat de suporte');
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
              "0 20px 25px -5px rgba(99, 102, 241, 0.4)",
              "0 10px 15px -3px rgba(99, 102, 241, 0.3)"
            ]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <FiMessageCircle className="w-6 h-6" />
        </motion.button>
        
        <AnimatePresence>
          {showChatTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={`absolute right-16 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-lg shadow-lg whitespace-nowrap ${
                resolvedTheme === 'dark' 
                  ? 'bg-gray-900 text-white border border-gray-800' 
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <div className="text-sm font-medium">Suporte Especializado</div>
              <div className="text-xs opacity-75">Consultoria técnica em pecuária</div>
              <div className={`absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 rotate-45 ${
                resolvedTheme === 'dark' ? 'bg-gray-900 border-r border-b border-gray-800' : 'bg-white border-r border-b border-gray-200'
              }`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Panel */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`absolute bottom-16 right-0 w-80 h-96 rounded-lg shadow-2xl ${
                resolvedTheme === 'dark' 
                  ? 'bg-gray-900 border border-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`font-semibold ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Suporte BOVINEXT</h3>
                <button
                  onClick={() => setChatOpen(false)}
                  className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex-1">
                <div className={`text-sm mb-4 ${
                  resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Olá! Como podemos ajudar você hoje?
                </div>
                <div className="space-y-2">
                  <motion.a
                    href="https://wa.me/5511999999999?text=Olá! Preciso de suporte técnico do BOVINEXT"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                  >
                    <FiMessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp Suporte
                  </motion.a>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <FiPhone className="w-4 h-4 mr-2" />
                    Ligar Agora
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <FiMail className="w-4 h-4 mr-2" />
                    Enviar E-mail
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cookie Preferences Float Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.5 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <motion.button
          onClick={() => {
            console.log('Abrir configurações de cookies');
          }}
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <GiCookie className="w-6 h-6" />
        </motion.button>
        
        <AnimatePresence>
          {isAtBottom && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap ${
                resolvedTheme === 'dark' 
                  ? 'bg-gray-900 text-white border border-gray-800' 
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <div className="text-xs font-medium">Preferências de Privacidade</div>
              <div className="text-xs opacity-75">Gerenciar cookies e dados</div>
              <div className={`absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 rotate-45 ${
                resolvedTheme === 'dark' ? 'bg-gray-900 border-l border-t border-gray-800' : 'bg-white border-l border-t border-gray-200'
              }`} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}