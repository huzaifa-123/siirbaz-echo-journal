import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import PostCard from '../components/PostCard';
import { User } from 'lucide-react';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults: React.FC = () => {
  const query = useQuery();
  const q = query.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    setUsers([]);
    setPosts([]);
    apiService.search(q)
      .then(data => {
        if (ignore) return;
        setUsers(data.users || []);
        setPosts(data.posts || []);
      })
      .catch(err => {
        if (ignore) return;
        setError('Failed to fetch results.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [q]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Search Results for "{q}"</h2>
      {loading && <div className="text-center py-12">Loading...</div>}
      {error && <div className="text-center text-red-400 py-12">{error}</div>}
      {!loading && !error && users.length === 0 && posts.length === 0 && (
        <div className="text-center text-neutral-400 py-12">No results found.</div>
      )}
      {!loading && !error && (
        <>
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Users</h3>
            {users.length === 0 ? (
              <div className="text-neutral-500">No users found.</div>
            ) : (
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex items-center space-x-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                    <User className="h-8 w-8 text-neutral-400" />
                    <div>
                      <div className="font-bold text-neutral-100">{user.full_name}</div>
                      <div className="text-neutral-400">@{user.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Posts</h3>
            {posts.length === 0 ? (
              <div className="text-neutral-500">No posts found.</div>
            ) : (
              <div className="space-y-6">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} onLike={() => {}} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults; 