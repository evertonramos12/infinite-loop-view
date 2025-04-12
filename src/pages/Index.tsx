
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="max-w-md w-full p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-6">Infinite Loop Videos</h1>
        <p className="text-gray-300 mb-8">
          Crie uma playlist de vídeos para reprodução em loop infinito. Perfeito para displays, apresentações e visualizações contínuas.
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3"
          >
            Entrar ou Cadastrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
