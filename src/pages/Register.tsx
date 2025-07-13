import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '../services/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'other',
    dateOfBirth: '',
  });
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Şifreler uyuşmuyor",
        description: "Şifreler eşleşmiyor.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/');
      toast({
        title: "Dizesi'ye Hoşgeldiniz!",
        description: "Hesabınız başarıyla oluşturuldu.",
      });
    } catch (error) {
      toast({
        title: "Kayıt başarısız",
        description: "Lütfen farklı bilgilerle tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

    if (e.target.name === 'username') {
      setUsernameStatus('idle');
    }
  };

  const handleUsernameBlur = async () => {
    if (!formData.username) return;
    setUsernameStatus('checking');
    try {
      const resp = await apiService.checkUsername(formData.username);
      setUsernameStatus(resp.available ? 'available' : 'taken');
    } catch (err) {
      setUsernameStatus('idle');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-white">Join Dizesi</CardTitle>
          <p className="text-gray-400">Create your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fullName" className="text-gray-300 text-sm">
                  Ad Soyad
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Adınızı ve soyadınızı girin"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="bg-gray-700 border border-gray-600 text-white placeholder-gray-400 h-9 focus:ring-2 focus:ring-[#FF832F] focus:border-[#FF832F] rounded-md"
                  required
                />
              </div>
              <div>
                <Label htmlFor="username" className="text-gray-300 text-sm">
                  Kullanıcı Adı
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Bir kullanıcı adı seçin"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleUsernameBlur}
                  className="bg-gray-700 border border-gray-600 text-white placeholder-gray-400 h-9 focus:ring-2 focus:ring-[#FF832F] focus:border-[#FF832F] rounded-md"
                  required
                />
                {usernameStatus === 'checking' && (
                  <p className="text-xs text-gray-400 mt-1">Kullanılabilirlik kontrol ediliyor...</p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-xs text-green-400 mt-1">Kullanıcı adı kullanılabilir ✓</p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="text-xs text-red-400 mt-1">Kullanıcı adı zaten alınmış</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" className="text-gray-300 text-sm">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="bg-gray-700 border border-gray-600 text-white placeholder-gray-400 h-9 focus:ring-2 focus:ring-[#FF832F] focus:border-[#FF832F] rounded-md"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="gender" className="text-gray-300 text-sm">
                  Gender
                </Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full h-9 px-3 rounded-md bg-gray-700 border border-gray-600 text-white text-sm focus:ring-2 focus:ring-[#FF832F] focus:border-[#FF832F]"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="dateOfBirth" className="text-gray-300 text-sm">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="bg-gray-700 border border-gray-600 text-white h-9 focus:ring-2 focus:ring-[#FF832F] focus:border-[#FF832F] rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="password" className="text-gray-300 text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-gray-700 border border-gray-600 text-white placeholder-gray-400 h-9 focus:ring-2 focus:ring-[#FF832F] focus:border-[#FF832F] rounded-md"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-300 text-sm">
                  Şifreyi Onayla
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Şifreyi onaylayın"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-gray-700 border border-gray-600 text-white placeholder-gray-400 h-9 focus:ring-2 focus:ring-[#FF832F] focus:border-[#FF832F] rounded-md"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full mt-4 bg-[#FF832F] hover:bg-[#FF832F]/90 text-white font-semibold rounded-md shadow"
              disabled={loading || usernameStatus === 'taken' || usernameStatus === 'checking'}
            >
              {loading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-[#FF832F] hover:underline font-semibold">
                Giriş yap
              </Link>
            </p>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default Register;
