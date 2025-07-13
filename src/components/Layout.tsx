import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Home, PlusCircle, Users, Settings, BookOpen, Feather, Edit3, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerClose } from '@/components/ui/drawer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    // Fetch notifications and count unread
    (async () => {
      try {
        const data = await import('../services/api').then(m => m.apiService.getNotifications());
        const count = Array.isArray(data.notifications)
          ? data.notifications.filter(n => !n.is_read).length
          : 0;
        setUnreadCount(count);
      } catch (e) {
        setUnreadCount(0);
      }
    })();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearching(true);
      try {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      } finally {
        setIsSearching(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Elegant background pattern */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black"></div>
      </div>

      {/* Sophisticated Header */}
      <header className="bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Elegant Logo */}
            <Link to="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <img src="/dizesi.jpg" alt="Dizesi Logo" className="h-12 w-12 rounded-2xl border border-neutral-700/40 group-hover:border-neutral-400/50 transition-all duration-500 bg-neutral-800/60 object-cover" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-100 group-hover:text-neutral-300 transition-colors duration-500 tracking-tight">
                  Dizesi
                </h1>
              </div>
            </Link>

            {/* Refined Search - hidden on mobile */}
            <div className="flex-1 max-w-xl mx-12 hidden md:block">
              <div className="relative group flex items-center">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5 group-focus-within:text-neutral-300 transition-colors duration-300" />
                <Input
                  placeholder="yazı, yazar, konu başlığı ara..."
                  className="pl-14 pr-6 py-3 bg-neutral-800/60 border-neutral-700/50 focus:border-neutral-500/60 focus:ring-2 focus:ring-neutral-500/20 text-neutral-100 placeholder-neutral-400 rounded-2xl transition-all duration-300 text-base"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  disabled={isSearching}
                />
                {isSearching && <span className="ml-2 animate-spin">🔄</span>}
              </div>
            </div>

            {/* Desktop Navigation - hidden on mobile */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <NavButton to="/" icon={Home} tooltip="Ana Sayfa" />
                  <NavButton to="/create" icon={Feather} tooltip="Yazı Yaz" />
                  <NavButton to="/following" icon={Users} tooltip="Takip Edilenler" />
                  <NavButton to="/notifications" icon={Bell} tooltip="Bildirimler" badge={unreadCount > 0 ? String(unreadCount) : undefined} />
                  <NavButton to={`/profile/${user.username}`} icon={User} tooltip="Profil" />
                  {user.role === 'admin' && (
                    <NavButton to="/admin" icon={Settings} tooltip="Yönetici Paneli" />
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="relative group hover:bg-neutral-700/30 hover:border-neutral-400/30 transition-all duration-300 ml-3 rounded-xl"
                  >
                    <LogOut className="h-5 w-5 group-hover:text-neutral-400 transition-colors" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="border-neutral-600 hover:border-neutral-400/50 hover:bg-neutral-700/10 transition-all duration-300 rounded-xl">
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium shadow-lg shadow-neutral-900/25 rounded-xl">
                      Topluluğa Katıl
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger Menu for Mobile */}
            <div className="md:hidden flex items-center">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-7 w-7" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <img src="/dizesi.jpg" alt="Dizesi Logo" className="h-10 w-10 rounded-2xl border border-neutral-700/40 bg-neutral-800/60 object-cover" />
                      <span className="text-xl font-bold">Dizesi</span>
                    </div>
                  </DrawerHeader>
                  <nav className="flex flex-col gap-2 px-4 pb-4">
                    {user ? (
                      <>
                        <Link to="/" className="py-2" onClick={() => document.activeElement && (document.activeElement as HTMLElement).blur()}>
                          Ana Sayfa
                        </Link>
                        <Link to="/create" className="py-2" onClick={() => document.activeElement && (document.activeElement as HTMLElement).blur()}>
                          Yazı Yaz
                        </Link>
                        <Link to="/following" className="py-2" onClick={() => document.activeElement && (document.activeElement as HTMLElement).blur()}>
                          Takip Edilenler
                        </Link>
                        <Link to="/notifications" className="py-2" onClick={() => document.activeElement && (document.activeElement as HTMLElement).blur()}>
                          Bildirimler
                          {unreadCount > 0 && (
                            <span className="ml-2 inline-block bg-[#FF832F] text-xs rounded-full px-2 py-0.5 text-white font-bold">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                        <Link to={`/profile/${user.username}`} className="py-2" onClick={() => document.activeElement && (document.activeElement as HTMLElement).blur()}>
                          Profil
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="py-2" onClick={() => document.activeElement && (document.activeElement as HTMLElement).blur()}>
                            Yönetici Paneli
                          </Link>
                        )}
                        <Button variant="ghost" size="sm" className="mt-4" onClick={handleLogout}>
                          Çıkış Yap
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="py-2" onClick={() => document.activeElement && (document.activeElement as HTMLElement).blur()}>
                          Giriş Yap
                        </Link>
                        <Link to="/register" className="py-2" onClick={() => document.activeElement && (document.activeElement as HTMLElement).blur()}>
                          Topluluğa Katıl
                        </Link>
                      </>
                    )}
                  </nav>
                  <DrawerClose asChild>
                    <Button variant="outline" size="sm" className="w-full mt-2">Kapat</Button>
                  </DrawerClose>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {children}
      </main>

      {/* Sophisticated Footer */}
      <footer className="bg-neutral-900/60 backdrop-blur-xl border-t border-neutral-800/60 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/40">
                  <Edit3 className="h-6 w-6 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-100">Dizesi</h3>
                  <p className="text-neutral-400">Edebi Mükemmellik</p>
                </div>
              </div>
              <p className="text-neutral-400 leading-relaxed max-w-md">
                Yazarlar, şairler ve edebiyat tutkunlarının eserlerini paylaşabileceği ve diğer kelime ustalarıyla bağlantı kurabileceği sofistike bir platform.
              </p>
            </div>
            
            <div>
              <h4 className="text-neutral-200 font-semibold mb-4">Topluluk</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-neutral-400 hover:text-neutral-200 transition-colors">Hakkımızda</Link></li>
                <li><Link to="/guidelines" className="text-neutral-400 hover:text-neutral-200 transition-colors">Yazım Kuralları</Link></li>
                <li><Link to="/support" className="text-neutral-400 hover:text-neutral-200 transition-colors">Destek</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-neutral-200 font-semibold mb-4">Kaynaklar</h4>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-neutral-400 hover:text-neutral-200 transition-colors">Yardım Merkezi</Link></li>
                <li><Link to="/privacy" className="text-neutral-400 hover:text-neutral-200 transition-colors">Gizlilik Politikası</Link></li>
                <li><Link to="/terms" className="text-neutral-400 hover:text-neutral-200 transition-colors">Kullanım Koşulları</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-neutral-800/60 text-center">
            <p className="text-neutral-400">
              © 2024 Dizesi. Crafted with passion for the literary arts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Refined Navigation Button Component
interface NavButtonProps {
  to: string;
  icon: React.ElementType;
  tooltip: string;
  badge?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ to, icon: Icon, tooltip, badge }) => (
  <Link to={to} className="relative group">
    <Button 
      variant="ghost" 
      size="sm" 
      className="relative hover:bg-neutral-700/20 hover:border-neutral-400/30 transition-all duration-300 group-hover:scale-105 rounded-xl"
    >
      <Icon className="h-5 w-5 group-hover:text-neutral-300 transition-colors" />
    </Button>
    {badge && (
      <span
        className="
          absolute -top-2 -right-2
          bg-[#FF832F]
          text-xs
          rounded-full
          h-6 w-6
          flex items-center justify-center
          text-white font-bold
          shadow-lg
          border-2 border-neutral-900
          animate-pulse
          z-10
        "
      >
        {badge}
      </span>
    )}
    {/* Elegant Tooltip */}
    <div
      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 px-3 py-2 text-xs bg-neutral-800 border border-neutral-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl z-50 text-center"
      style={{ whiteSpace: 'normal' }}
    >
      {tooltip}
    </div>
  </Link>
);

export default Layout;
