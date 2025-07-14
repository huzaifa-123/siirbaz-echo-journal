import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Quote, UserPlus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useToast } from '@/hooks/use-toast';
import { Dialog as UIDialog } from '@/components/ui/dialog';
import CommentDialog from './CommentDialog';
import { Link } from 'react-router-dom';

interface PostCardProps {
  post: {
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
  };
  onLike: (postId: number) => void;
  showFollowButton?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, showFollowButton = true }) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post.user?.isFollowing ?? false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiService.getProfile(post.user.username);
        setProfileData(data.user);
      } catch (error) {
        setProfileData(null);
      }
    };
    fetchProfile();
  }, [post.user.username]);

  // Sync isFollowing state with prop in case it changes (e.g., after refresh or navigation)
  useEffect(() => {
    setIsFollowing(post.user?.isFollowing ?? false);
  }, [post.user?.isFollowing]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  

  // Defensive user fallback
  const user = post.user || { fullName: 'Bilinmeyen Kullanıcı', username: 'bilinmeyen', profilePicture: '', isFollowing: false };
  // Remove: onFollow, showFollowButton props, isFollowLoading, showUnfollowDialog, handleFollow, handleUnfollow, and all follow button JSX.
  // Remove all references to post.user.isFollowing and follow button rendering.

  // Share handler
  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link kopyalandı!',
        description: 'Gönderi URL\'si panoya kopyalandı.',
      });
    } catch {
      toast({
        title: 'Hata',
        description: 'Link kopyalanamadı.',
        variant: 'destructive',
      });
    }
  };

  const handleComment = async () => {
    setShowComments(true);
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const data = await apiService.getComments(post.id);
      setComments(data.comments || []);
    } catch (err) {
      setCommentsError('Yorumlar yüklenemedi.');
    }
    setCommentsLoading(false);
  };

  const handlePostComment = async () => {
    if (!currentUser) {
      toast({ title: 'Giriş gerekli', description: 'Lütfen giriş yapınız.', variant: 'destructive' });
      return;
    }
    if (!commentText.trim()) {
      toast({ title: 'Boş yorum', description: 'Yorum yazınız.', variant: 'destructive' });
      return;
    }
    setIsCommenting(true);
    setPostError(null);
    try {
      await apiService.commentOnPost(post.id, commentText);
      setCommentText('');
      setCommentsCount(c => c + 1);
      // Refresh comments list
      const data = await apiService.getComments(post.id);
      setComments(data.comments || []);
    } catch (err) {
      setPostError('Yorum gönderilemedi.');
      toast({ title: 'Hata', description: 'Yorum gönderilemedi.', variant: 'destructive' });
    }
    setIsCommenting(false);
  };

  const handleReport = () => {
    setShowReportDialog(true);
  };

  const handleConfirmReport = async () => {
    setIsReporting(true);
    try {
      await apiService.reportPost(post.id, reportReason);
      setHasReported(true);
      setShowReportDialog(false);
      setReportReason('');
      toast({ title: 'Raporlandı', description: 'Gönderi yönetici tarafından raporlandı.' });
    } catch (err) {
      toast({ title: 'Hata', description: 'Gönderi raporlanamadı veya zaten raporlandı.', variant: 'destructive' });
    }
    setIsReporting(false);
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
    toast({
        title: 'Giriş gerekli',
        description: 'Lütfen giriş yapınız.',
        variant: 'destructive',
      });
      return;
    }
    setIsFollowLoading(true);
    try {
      const result = await apiService.followUser(post.user.id);
      if (typeof result.following === 'boolean') {
        setIsFollowing(result.following);
      }
    } catch (error) {
      toast({ title: 'Hata', description: 'Takip durumu güncellenemedi.', variant: 'destructive' });
    }
    setIsFollowLoading(false);
  };

  return (
    <article className="bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-neutral-800/60 hover:border-neutral-700/80 transition-all duration-700 group overflow-hidden relative">
      {/* Elegant Quote Decoration */}
      <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
        <Quote className="h-12 w-12 text-neutral-700" />
      </div>
      
      {/* Sophisticated Header */}
      <div className="p-8 pb-0">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="h-16 w-16 rounded-full ring-2 ring-neutral-700/30 group-hover:ring-neutral-500/40 transition-all duration-500 overflow-hidden bg-neutral-800 flex items-center justify-center">
                <img
                  src={
                    profileData?.profile_picture
                      ? (profileData.profile_picture.startsWith('http')
                          ? profileData.profile_picture
                          : `https://dizesi-backend.onrender.com${profileData.profile_picture}`)
                      : '/default.png'
                  }
                  alt={post.user.fullName}
                  className="object-cover w-full h-full rounded-full"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/default.png'; }}
                />
              </div>
              {user.username === "elifdogan" && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-neutral-900">
                  <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.388-2.46c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" />
                  </svg>
                </span>
              )}
            </div>
            
            <div>
              <h3 className="font-bold text-neutral-100 text-lg group-hover:text-neutral-300 transition-colors duration-500">
                {post.user.fullName}
              </h3>
              <p className="text-neutral-400 text-sm">
                <Link to={`/profile/${post.user.username}`} className="hover:underline">
                  @{post.user.username}
                </Link> • {formatDate(post.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {showFollowButton && currentUser && post.user && currentUser.id !== post.user.id && (
                <Button
                variant={isFollowing ? 'outline' : 'default'}
                  size="sm"
                onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                className={isFollowing ? 'bg-neutral-700/20 text-neutral-300 border-neutral-400/50' : 'hover:bg-neutral-700/10 text-neutral-300'}
              >
                {isFollowing ? (
                    <>
                      <Check className="h-4 w-4 mr-2" /> takip edilen
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" /> Takip Et
                    </>
                  )}
                </Button>
            )}
            
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 hover:bg-neutral-800/30 transition-all duration-500 rounded-xl"
                onClick={() => setMenuOpen(v => !v)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-neutral-900 border border-neutral-700 rounded-xl shadow-lg z-50">
                  {!hasReported ? (
                  <button
                    className="w-full text-left px-4 py-2 text-neutral-200 hover:bg-neutral-800 rounded-xl transition-colors"
                      onClick={() => { setMenuOpen(false); handleReport(); }}
                  >
                    Report Post
                  </button>
                  ) : (
                    <div className="w-full text-left px-4 py-2 text-neutral-400 cursor-not-allowed">Reported</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Refined Content */}
      <div className="px-8 pb-8">
        <h2 className="text-3xl font-bold text-neutral-100 mb-6 group-hover:text-neutral-200 transition-colors duration-500 leading-tight">
          {post.title}
        </h2>
        
        <div className="prose prose-invert max-w-none mb-8">
          <p className="text-neutral-300 leading-relaxed text-lg font-light">
            {showFullContent ? post.content : post.content.substring(0, 300)}
            {post.content.length > 300 && !showFullContent && (
              <button
                className="text-neutral-400 cursor-pointer hover:text-neutral-200 transition-colors font-medium ml-2 underline"
                onClick={() => setShowFullContent(true)}
                type="button"
              >
                Devamını oku...
              </button>
            )}
          </p>
        </div>
        
        {/* Enhanced Image Display */}
        {post.image_url && (
          <div className="relative overflow-hidden rounded-2xl border border-neutral-800/60 mb-8 group-hover:border-neutral-700/80 transition-all duration-700">
            <img
              src={`https://dizesi-backend.onrender.com${post.image_url}`}
              alt="Post illustration"
              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        )}

        {/* Sophisticated Actions */}
        <div className="flex items-center justify-between pt-8 border-t border-neutral-800/60">
          <div className="flex items-center space-x-8">
            <ActionButton
              icon={Heart}
              count={post.likesCount}
              active={post.isLiked}
              onClick={() => onLike(post.id)}
              activeColor="text-red-400"
              hoverColor="hover:text-red-400"
              label="beğen"
            />
            
            <ActionButton
              icon={MessageCircle}
              count={commentsCount}
              onClick={handleComment}
              hoverColor="hover:text-neutral-300"
              label="yorum yap"
            />
            
            <ActionButton
              icon={Share2}
              onClick={handleShare}
              hoverColor="hover:text-neutral-300"
              label="paylaş"
            />
          </div>
        </div>
        {showComments && (
          <CommentDialog open={showComments} onClose={() => setShowComments(false)}>
            <h2 className="text-lg font-bold text-neutral-100 mb-4">
            yorumlar</h2>
            {commentsLoading ? (
              <div className="text-neutral-400">Loading...</div>
            ) : commentsError ? (
              <div className="text-red-400">{commentsError}</div>
            ) : comments.length === 0 ? (
              <div className="text-neutral-400">Henüz yorum yok.</div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="border-b border-neutral-800 pb-2">
                    <div className="font-semibold text-neutral-200">
                      <Link to={`/profile/${comment.user?.username}`} className="hover:underline">
                        {comment.user?.full_name || 'Unknown User'}
                      </Link>
                    </div>
                    <div className="text-neutral-400 text-sm">{comment.content}</div>
                    <div className="text-neutral-600 text-xs mt-1">{new Date(comment.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
            {/* Comment input and post button */}
            <div className="flex items-center space-x-2 mt-4">
              <input
                className="flex-1 rounded-lg bg-neutral-800 text-white px-4 py-2 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                disabled={isCommenting}
                maxLength={500}
              />
              <Button
                onClick={handlePostComment}
                disabled={isCommenting || !commentText.trim()}
                className="ml-2"
              >
                {isCommenting ? 'Posting...' : 'Post'}
              </Button>
            </div>
            {postError && <div className="text-red-400 mt-2">{postError}</div>}
          </CommentDialog>
        )}
      </div>

      {/* Report Dialog */}
      {showReportDialog && (
        <UIDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl p-8 shadow-2xl w-full max-w-md mx-auto">
              <button
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 focus:outline-none"
                onClick={() => setShowReportDialog(false)}
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-lg font-bold text-neutral-100 mb-4">Gönderiyi Raporla</h2>
              <p className="text-neutral-300 mb-4">Bu gönderiyi raporlamak istediğinizden emin misiniz? İsterseniz aşağıya bir sebep yazabilirsiniz.</p>
              <textarea
                className="w-full rounded-lg bg-neutral-800 text-white px-4 py-2 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4"
                placeholder="Sebep (isteğe bağlı)"
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                rows={3}
                disabled={isReporting}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <Button variant="ghost" onClick={() => setShowReportDialog(false)} disabled={isReporting}>İptal</Button>
                <Button variant="destructive" onClick={handleConfirmReport} disabled={isReporting}>
                  {isReporting ? 'Raporlanıyor...' : 'Raporla'}
                </Button>
              </div>
            </div>
          </div>
        </UIDialog>
      )}
    </article>
  );
};

// Refined Action Button Component
interface ActionButtonProps {
  icon: React.ElementType;
  count?: number;
  active?: boolean;
  onClick: () => void;
  activeColor?: string;
  hoverColor?: string;
  label?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon: Icon, 
  count, 
  active, 
  onClick, 
  activeColor = 'text-neutral-300',
  hoverColor = 'hover:text-neutral-300',
  label
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-3 text-neutral-400 transition-all duration-300 group/action
      ${hoverColor} ${active ? activeColor : ''}
      hover:scale-105 active:scale-95 px-3 py-2 rounded-xl hover:bg-neutral-800/20
    `}
    title={label}
  >
    <Icon className={`h-5 w-5 ${active ? 'fill-current' : ''}`} />
    {count !== undefined && (
      <span className="text-sm font-medium">
        {count}
      </span>
    )}
  </button>
);

export default PostCard;
