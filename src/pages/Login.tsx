import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(credentials);
      navigate('/');
      toast({
        title: "Tekrar Hoşgeldiniz!",
        description: "Başarıyla giriş yaptınız.",
      });
    } catch (error) {
      toast({
        title: "Giriş başarısız",
        description: "Geçersiz kullanıcı adı veya şifre.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Tekrar Hoşgeldiniz</CardTitle>
          <p className="text-gray-400">Hesabınıza giriş yapın</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Kullanıcı Adı veya E-posta"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF832F] focus:border-[#FF832F] rounded-md"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Şifre"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF832F] focus:border-[#FF832F] rounded-md"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#FF832F] hover:bg-[#FF832F]/90 text-white font-semibold rounded-md shadow"
              disabled={loading}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="text-[#FF832F] hover:underline font-semibold">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default Login;
