import { Chrome } from 'lucide-react';
import { dashboardBranding } from '../config/branding';

export default function GoogleLoginButton() {

  const handleLogin = async () => {
    try {
      console.log(`Google login nao disponivel no ${dashboardBranding.brandName}`);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleLogin}
        disabled={true}
        className="flex items-center justify-center gap-2 bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-lg border border-gray-300 cursor-not-allowed opacity-50"
      >
        <Chrome className="h-5 w-5 text-gray-400" />
        Login com Google desabilitado
      </button>
      <p className="text-gray-500 text-xs mt-1">Funcionalidade removida do {dashboardBranding.brandName}</p>
    </div>
  );
}
