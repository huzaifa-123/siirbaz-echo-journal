import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, Calendar, Instagram } from 'lucide-react';
import PostCard from '../components/PostCard';
import { X, Camera, Pencil, Trash2, Save, XCircle } from 'lucide-react';

// Define types for profile and post
interface ProfileUser {
  id: number;
  username: string;
  full_name: string;
  profile_picture?: string;
  cover_image?: string;
  bio?: string;
  instagram_url?: string;
  date_of_birth?: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}
interface ProfilePost {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    full_name: string;
    profile_picture?: string;
    isFollowing?: boolean;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

const Profile: React.FC = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [coverPic, setCoverPic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [coverPicPreview, setCoverPicPreview] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [removeProfilePic, setRemoveProfilePic] = useState(false);
  const [removeCoverPic, setRemoveCoverPic] = useState(false);
  const [imgLoading, setImgLoading] = useState<'profile' | 'cover' | null>(null);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      const data = await apiService.getProfile(username!);
      setProfile(data.user);
      setPosts(data.posts || []);
      setBio(data.user.bio || '');
      setInstagram(data.user.instagram_url || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setImgLoading('profile');
    try {
      const resp = await apiService.uploadProfileImage('profile_picture', file);
      setProfilePicPreview(null);
      setProfilePic(null);
      setProfile(prev => prev ? { ...prev, profile_picture: resp.user.profile_picture } : prev);
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
    }
    setImgLoading(null);
  };
  const handleCoverPicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setImgLoading('cover');
    try {
      const resp = await apiService.uploadProfileImage('cover_image', file);
      setCoverPicPreview(null);
      setCoverPic(null);
      setProfile(prev => prev ? { ...prev, cover_image: resp.user.cover_image } : prev);
    } catch (err) {
      console.error('Failed to upload cover image:', err);
    }
    setImgLoading(null);
  };
  const handleRemoveProfilePic = async () => {
    setImgLoading('profile');
    try {
      const resp = await apiService.removeProfileImage('profile_picture');
      setProfile(prev => prev ? { ...prev, profile_picture: null } : prev);
    } catch (err) {
      console.error('Failed to remove profile picture:', err);
    }
    setImgLoading(null);
  };
  const handleRemoveCoverPic = async () => {
    setImgLoading('cover');
    try {
      const resp = await apiService.removeProfileImage('cover_image');
      setProfile(prev => prev ? { ...prev, cover_image: null } : prev);
    } catch (err) {
      console.error('Failed to remove cover image:', err);
    }
    setImgLoading(null);
  };
  const handleCancel = () => {
    setEditMode(false);
    setBio(profile?.bio || '');
    setInstagram(profile?.instagram_url || '');
  };
  const handleSave = async () => {
    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('instagram_url', instagram);
    try {
      await apiService.updateProfile(formData);
      setEditMode(false);
      fetchProfile(); // Refetch profile to update state
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiService.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      alert('Failed to delete post.');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center py-12 text-gray-400">Profile not found</div>;
  }

  const isOwnProfile = currentUser?.username === username;

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://dizesi-backend.onrender.com/api";
  const getImageUrl = (path?: string | null) => {
    if (!path) return undefined;
    const base = API_BASE_URL.replace(/\/api$/, "");
    return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
  };

  const getInstagramHref = (url: string) => {
    if (/^https?:\/\//i.test(url)) return url;
    return '//' + url;
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Cover Image Banner */}
      <div className="relative h-56 md:h-64 w-full mb-[-5rem] rounded-t-lg overflow-hidden bg-gray-900 flex items-center justify-center">
        {(coverPicPreview || profile?.cover_image) ? (
          <img
            src={coverPicPreview || getImageUrl(profile?.cover_image) || ''}
            alt="Cover"
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">kapak fotoğrafı yok</div>
        )}
        {isOwnProfile && (
          <div className="absolute top-3 right-3 flex space-x-2">
            <label className="cursor-pointer bg-black/60 hover:bg-black/80 p-2 rounded-full">
              <Camera className="h-5 w-5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverPicChange} />
            </label>
            {(coverPicPreview || profile?.cover_image) && (
              <button onClick={handleRemoveCoverPic} className="bg-black/60 hover:bg-black/80 p-2 rounded-full">
                <Trash2 className="h-5 w-5 text-white" />
              </button>
            )}
          </div>
        )}
      </div>
      {/* Profile Card */}
      <Card className="bg-gray-800 border-gray-700 mt-0">
        <CardContent className="pt-0 pb-8 px-6">
          <div className="relative flex flex-col items-center md:flex-row md:items-end md:space-x-8">
            {/* Profile Image */}
            <div className="relative -mt-20 md:-mt-24 mb-4 md:mb-0">
              <div className="h-36 w-36 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-700 flex items-center justify-center">
                {(profilePicPreview || profile?.profile_picture) ? (
                  <img
                    src={profilePicPreview || getImageUrl(profile?.profile_picture) || ''}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <img
                    src="/default.png"
                    alt="Varsayılan profil"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {isOwnProfile && (
                <div className="absolute bottom-2 right-2 flex space-x-2">
                  <label className="cursor-pointer bg-black/70 hover:bg-black/90 p-2 rounded-full">
                    <Camera className="h-5 w-5 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                  </label>
                  {(profilePicPreview || profile?.profile_picture) && (
                    <button onClick={handleRemoveProfilePic} className="bg-black/70 hover:bg-black/90 p-2 rounded-full">
                      <Trash2 className="h-5 w-5 text-white" />
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* Profile Info & Edit Form */}
            <div className="flex-1 w-full md:w-auto text-center md:text-left mt-4 md:mt-0">
              {editMode ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Bio"
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-[#FF832F] focus:border-[#FF832F]"
                    maxLength={200}
                  />
                  <input
                    type="text"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    placeholder="Instagram URL"
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-[#FF832F] focus:border-[#FF832F]"
                  />
                  <div className="flex space-x-2 justify-center md:justify-start">
                    <Button onClick={handleSave} className="bg-[#FF832F] hover:bg-[#FF832F]/90 text-white flex items-center space-x-2"><Save className="h-4 w-4 mr-1" />Save</Button>
                    <Button variant="outline" onClick={handleCancel} className="flex items-center space-x-2"><XCircle className="h-4 w-4 mr-1" />Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-white mb-1">{profile?.full_name}</h1>
                  <p className="text-xl text-gray-400 mb-2">@{profile?.username}</p>
                  {profile?.bio && <p className="text-gray-300 mb-3">{profile.bio}</p>}
                  <div className="flex flex-wrap justify-center md:justify-start items-center space-x-6 mb-3">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Users className="h-5 w-5" />
                      <span>{profile?.followersCount || 0} followers</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Users className="h-5 w-5" />
                      <span>{profile?.followingCount || 0} following</span>
                    </div>
                    {profile?.date_of_birth && (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Calendar className="h-5 w-5" />
                        <span>Born {new Date(profile.date_of_birth).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  {profile?.instagram_url && (
                    <a
                      href={getInstagramHref(profile.instagram_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-pink-400 hover:text-pink-300"
                    >
                      <Instagram className="h-5 w-5" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {isOwnProfile && (
                    <Button variant="outline" className="mt-4 flex items-center space-x-2" onClick={() => setEditMode(true)}>
                      <Pencil className="h-4 w-4 mr-1" />profili düzenle
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* User Posts */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-white mb-6">gönderiler</h2>
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Henüz bir gönderi yok</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="relative group">
                <PostCard
                  post={{
                    ...post,
                    user: {
                      ...post.user,
                      fullName: post.user.full_name,
                      profilePicture: post.user.profile_picture,
                    }
                  }}
                  onLike={() => {}}
                />
                {isOwnProfile && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/60 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                    title="Delete Post"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
