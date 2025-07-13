import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Quote, UserPlus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Dialog as UIDialog } from '@/components/ui/dialog';
import CommentDialog from './CommentDialog';

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
  const initials = user.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('')
    : 'B';

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
              <Avatar className="h-16 w-16 ring-2 ring-neutral-700/30 group-hover:ring-neutral-500/40 transition-all duration-500">
                <AvatarImage src={user.profilePicture} alt={user.fullName} />
                <AvatarFallback className="bg-neutral-800 text-white font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-neutral-700 rounded-full border-2 border-neutral-900"></div>
            </div>
            
            <div>
              <h3 className="font-bold text-neutral-100 text-lg group-hover:text-neutral-300 transition-colors duration-500">
                {user.fullName}
              </h3>
              <p className="text-neutral-400 text-sm">
                @{user.username} • {formatDate(post.created_at)}
              </p>
              <p className="text-neutral-500 text-xs font-medium mt-1">Literary Contributor</p>
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
                      <Check className="h-4 w-4 mr-2" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" /> Follow
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
            {post.content.substring(0, 300)}
            {post.content.length > 300 && (
              <span className="text-neutral-400 cursor-pointer hover:text-neutral-200 transition-colors font-medium ml-2">
                Read more...
              </span>
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
              label="Appreciate"
            />
            
            <ActionButton
              icon={MessageCircle}
              count={commentsCount}
              onClick={handleComment}
              hoverColor="hover:text-neutral-300"
              label="Discuss"
            />
            
            <ActionButton
              icon={Share2}
              onClick={handleShare}
              hoverColor="hover:text-neutral-300"
              label="Share"
            />
          </div>
        </div>
        {showComments && (
          <CommentDialog open={showComments} onClose={() => setShowComments(false)}>
            <h2 className="text-lg font-bold text-neutral-100 mb-4">Comments</h2>
            {commentsLoading ? (
              <div className="text-neutral-400">Loading...</div>
            ) : commentsError ? (
              <div className="text-red-400">{commentsError}</div>
            ) : comments.length === 0 ? (
              <div className="text-neutral-400">No comments yet.</div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="border-b border-neutral-800 pb-2">
                    <div className="font-semibold text-neutral-200">{comment.user?.full_name || 'Unknown User'}</div>
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
