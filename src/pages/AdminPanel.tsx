import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Eye } from 'lucide-react';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  profilePicture?: string;
  bio?: string;
  isAdmin?: boolean;
  created_at: string;
  updatedAt: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  image?: string;
  userId: number;
  created_at: string;
  updatedAt: string;
  user?: { username: string };
}

interface Report {
  id: number;
  post_id: number;
  user_id: number;
  reason: string;
  created_at: string;
  post?: {
    id: number;
    title: string;
    content: string;
    image_url?: string | null;
  status: string;
    [key: string]: any;
  };
  user?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    bio?: string | null;
    [key: string]: any;
  };
}

const ITEMS_PER_PAGE = 5;

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'reports'>('users');
  const [postsPage, setPostsPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.isAdmin) {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      return;
    }
    fetchData();
    fetchReports();
  }, [user]);

  const fetchData = async () => {
    try {
      const usersData = await apiService.getAllUsers();
      const postsData = await apiService.getPendingPosts();
      setUsers(usersData.users);
      setPosts(postsData.posts);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const data = await apiService.getReports();
      setReports(data.reports || []);
    } catch (err) {
      setReportsError('Failed to fetch reports.');
    }
    setReportsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  

  const handleApprove = async (postId: number) => {
    try {
      await apiService.approvePost(postId);
      toast({ title: 'Post approved' });
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to approve post', variant: 'destructive' });
    }
  };

  const handleReject = async (postId: number) => {
    try {
      await apiService.rejectPost(postId);
      toast({ title: 'Post rejected and deleted' });
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to reject post', variant: 'destructive' });
    }
  };

  const handleDeleteReportedPost = (postId: number) => {
    setPostToDelete(postId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (postToDelete) {
      try {
        await apiService.deleteReportedPost(postToDelete);
        toast({ title: 'Post deleted' });
        setReports(reports.filter((r) => r.post?.id !== postToDelete));
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to delete post', variant: 'destructive' });
      }
      setShowDeleteDialog(false);
      setPostToDelete(null);
    }
  };

  // Pagination helpers
  const paginatedPosts = posts.slice((postsPage - 1) * ITEMS_PER_PAGE, postsPage * ITEMS_PER_PAGE);
  const paginatedReports = reports.slice((reportsPage - 1) * ITEMS_PER_PAGE, reportsPage * ITEMS_PER_PAGE);
  const postsPageCount = Math.ceil(posts.length / ITEMS_PER_PAGE);
  const reportsPageCount = Math.ceil(reports.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#FF832F]/30 border-t-[#FF832F] rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <Eye className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-[#FF832F] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white py-12">
      <div className="container mx-auto px-4 bg-card rounded-lg shadow-lg">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="posts">Pending Posts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="posts">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPosts.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center">No pending posts</TableCell></TableRow>
                ) : (
                  paginatedPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>{post.title}</TableCell>
                      <TableCell>{post.content}</TableCell>
                      <TableCell>{post.user ? post.user.username : post.userId}</TableCell>
                      <TableCell>{post.created_at ? formatDate(post.created_at) : 'Invalid Date'}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="secondary" onClick={() => handleApprove(post.id)} className="mr-2">Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(post.id)}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {postsPageCount > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                <Button size="sm" disabled={postsPage === 1} onClick={() => setPostsPage(postsPage - 1)}>Prev</Button>
                <span className="px-2">Page {postsPage} of {postsPageCount}</span>
                <Button size="sm" disabled={postsPage === postsPageCount} onClick={() => setPostsPage(postsPage + 1)}>Next</Button>
                    </div>
            )}
          </TabsContent>
          <TabsContent value="reports">
            {reportsLoading ? (
              <div className="text-gray-400">Loading...</div>
            ) : reportsError ? (
              <div className="text-red-400">{reportsError}</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReports.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center">No reports</TableCell></TableRow>
                    ) : (
                      paginatedReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.post?.title || 'Deleted Post'}</TableCell>
                          <TableCell>{report.post?.content}</TableCell>
                          <TableCell>{report.user?.full_name || report.user?.username || 'Unknown'}</TableCell>
                          <TableCell>{report.reason || 'No reason provided'}</TableCell>
                          <TableCell>{report.created_at ? formatDate(report.created_at) : 'Invalid Date'}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteReportedPost(report.post?.id)}>Delete Post</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {reportsPageCount > 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    <Button size="sm" disabled={reportsPage === 1} onClick={() => setReportsPage(reportsPage - 1)}>Prev</Button>
                    <span className="px-2">Page {reportsPage} of {reportsPageCount}</span>
                    <Button size="sm" disabled={reportsPage === reportsPageCount} onClick={() => setReportsPage(reportsPage + 1)}>Next</Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminPanel;
