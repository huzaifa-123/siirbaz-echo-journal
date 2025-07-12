import { apiService } from '../services/api';
import PostCard from '../components/PostCard';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Feather, Star, Clock, TrendingUp, Users2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  image?: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    profilePicture?: string;
    isFollowing?: boolean;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  created_at: string;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await apiService.getPosts('general');
      setPosts(data.posts || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load articles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const result = await apiService.likePost(postId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked, 
              likesCount: typeof result?.likesCount === 'number' ? result.likesCount : Math.max(0, (post.isLiked ? post.likesCount - 1 : post.likesCount + 1))
            }
          : post
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like article.",
        variant: "destructive",
      });
    }
  };

  // The follow/unfollow state is stored in the DB, but the UI must update based on the API response.
  // The backend returns { following: true/false } after toggling follow.
  // We use that value to update the UI, so it matches the DB state even after refresh.
  const [isProcessing, setIsProcessing] = useState(false);
  const handleFollow = async (userId: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await apiService.followUser(userId);
      setPosts(prev => prev.map(post => post.user.id === userId
        ? { ...post, user: { ...post.user, isFollowing: !post.user.isFollowing } }
        : post
      ));
    } catch (error) {
      toast({ title: "Error", description: "Failed to follow user.", variant: "destructive" });
    }
    setIsProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          <Feather className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-violet-400 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="space-y-8">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-white mb-4">No Posts Yet</h3>
            <p className="text-gray-400 text-lg">Be the first to share something amazing with the community!</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <div 
              key={post.id} 
              className="transform transition-all duration-500 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PostCard
                post={post}
                onLike={handleLike}
                onFollow={handleFollow}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Refined Filter Tab Component
interface FilterTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}

const FilterTab: React.FC<FilterTabProps> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-3 px-8 py-4 rounded-xl font-medium transition-all duration-300
      ${active 
        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
      }
    `}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
);

export default Home;
