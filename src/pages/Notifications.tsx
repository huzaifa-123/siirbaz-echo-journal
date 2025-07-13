
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, UserPlus } from 'lucide-react';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-[#FF832F]" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: any) => {
    console.log('Notification actor:', notification.actor);
    switch (notification.type) {
      case 'like':
        return `${notification.actor?.full_name} senin gönderinizi beğendi`;
      case 'comment':
        return `${notification.actor?.full_name} senin gönderinize yorum yaptı`;
      case 'follow':
        return `${notification.actor?.full_name} seni takip etmeye başladı`;
      default:
        return 'Yeni bildirim';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-400">Bildirimler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Bildirimler</h1>
        <p className="text-gray-400">Aktivitelerinizle ilgili güncellemeleri takip edin</p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Henüz bildirim yok.</p>
            <p className="text-gray-500 mt-2">Bir şey olduğunda bildirim alacaksınız!</p>
          </div>
        ) : (
          notifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`bg-gray-800 border-gray-700 ${!notification.isRead ? 'border-[#FF832F]' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.actor?.profilePicture} />
                    <AvatarFallback className="bg-gray-600 text-white">
                      {notification.actor?.full_name?.charAt(0) || 'N'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {getNotificationIcon(notification.type)}
                      <p className="text-white">{getNotificationText(notification)}</p>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-[#FF832F] rounded-full"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
