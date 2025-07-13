import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import PostCard from '../components/PostCard';
import { useToast } from '@/hooks/use-toast';

const Following: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFollowingPosts();
  }, []);

  const fetchFollowingPosts = async () => {
    try {
      const data = await apiService.getPosts('following');
      setPosts(data.posts || []);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Takip ettiğiniz kişilerin gönderileri yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await apiService.likePost(postId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, isLiked: !post.isLiked, likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1 }
          : post
      ));
    } catch (error) {
      toast({
        title: "Hata",
        description: "Gönderi beğenilemedi.",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      await apiService.followUser(userId);
      setPosts(prev => prev.map(post =>
        post.user.id === userId
          ? {
              ...post,
              user: {
                ...post.user,
                isFollowing: !post.user.isFollowing,
              }
            }
          : post
      ));
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kullanıcı takip edilemedi/kaldırılamadı.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-400">Takip ettiğiniz kişilerin gönderileri yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Takip Edilenler</h1>
        <p className="text-gray-400">Takip ettiğiniz kişilerin gönderileri</p>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Takip ettiğiniz kişilerin henüz gönderi yok.</p>
            <p className="text-gray-500 mt-2">Takip etmeye başlayarak burada gönderilerinizi görüntüleyin!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onFollow={handleFollow}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Following;
