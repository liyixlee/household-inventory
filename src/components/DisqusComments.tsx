import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  ThumbsUp,
  LogIn,
  LogOut,
  User,
  Search,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Trash2,
  CheckCircle2,
  Heart
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  avatarColor: string;
  isLoggedIn: boolean;
}

interface Reply {
  id: string;
  author: string;
  avatarColor: string;
  text: string;
  date: string;
  likes: number;
  userLiked?: boolean;
}

interface Comment {
  id: string;
  author: string;
  avatarColor: string;
  badge?: string;
  text: string;
  date: string;
  likes: number;
  userLiked?: boolean;
  replies: Reply[];
}

interface Reaction {
  key: string;
  emoji: string;
  label: string;
  count: number;
}

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-indigo-600'
];

export const DisqusComments: React.FC = () => {
  // User Authentication State
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('disqus_app_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      name: '',
      email: '',
      avatarColor: 'bg-blue-600',
      isLoggedIn: false
    };
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');

  // Reactions State
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([
    { key: 'upvote', emoji: '👍', label: 'Upvote', count: 8 },
    { key: 'helpful', emoji: '💡', label: 'Helpful', count: 5 },
    { key: 'love', emoji: '❤️', label: 'Love It', count: 6 },
    { key: 'ideas', emoji: '✨', label: 'Great Ideas', count: 3 },
    { key: 'surprised', emoji: '😲', label: 'Surprised', count: 1 }
  ]);

  // Comments State
  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const saved = localStorage.getItem('disqus_inventory_comments');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: '1',
        author: 'Alex Rivera',
        avatarColor: 'bg-blue-600',
        badge: 'Inventory Specialist',
        text: 'The barcode scanner for quick item additions works amazingly well! Makes pantry audits so much faster.',
        date: '2 hours ago',
        likes: 5,
        replies: [
          {
            id: '1-1',
            author: 'Sarah Chen',
            avatarColor: 'bg-emerald-600',
            text: 'Agreed! The batch expiry tracking also saved us from tossing out items that were close to expiring.',
            date: '1 hour ago',
            likes: 3
          }
        ]
      },
      {
        id: '2',
        author: 'David Miller',
        avatarColor: 'bg-purple-600',
        badge: 'Verified Reviewer',
        text: 'Super helpful app for tracking household supplies, garage tools, and medication storage. High stock alerts are a life saver!',
        date: '1 day ago',
        likes: 7,
        replies: []
      }
    ];
  });

  // UI state
  const [newCommentText, setNewCommentText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'likes'>('newest');

  // Save comments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('disqus_inventory_comments', JSON.stringify(comments));
    } catch (e) {
      console.error(e);
    }
  }, [comments]);

  // Save user profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('disqus_app_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim()) return;

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    setUser({
      name: loginName.trim(),
      email: loginEmail.trim() || `${loginName.trim().toLowerCase().replace(/\s+/g, '')}@user.com`,
      avatarColor: randomColor,
      isLoggedIn: true
    });

    setShowLoginModal(false);
    setLoginName('');
    setLoginEmail('');
  };

  const handleLogout = () => {
    setUser({
      name: '',
      email: '',
      avatarColor: 'bg-blue-600',
      isLoggedIn: false
    });
  };

  const handleReaction = (key: string) => {
    setReactions((prev) =>
      prev.map((r) => {
        if (r.key === key) {
          const isSelected = activeReaction === key;
          return { ...r, count: isSelected ? r.count - 1 : r.count + 1 };
        } else if (r.key === activeReaction) {
          return { ...r, count: r.count - 1 };
        }
        return r;
      })
    );
    setActiveReaction((prev) => (prev === key ? null : key));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    if (!user.isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      author: user.name,
      avatarColor: user.avatarColor,
      text: newCommentText.trim(),
      date: 'Just now',
      likes: 0,
      replies: []
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
  };

  const handleAddReply = (commentId: string) => {
    const text = replyTextMap[commentId];
    if (!text || !text.trim()) return;

    if (!user.isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const newReply: Reply = {
      id: `${commentId}-${Date.now()}`,
      author: user.name,
      avatarColor: user.avatarColor,
      text: text.trim(),
      date: 'Just now',
      likes: 0
    };

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return { ...c, replies: [...c.replies, newReply] };
        }
        return c;
      })
    );

    setReplyTextMap((prev) => ({ ...prev, [commentId]: '' }));
    setActiveReplyId(null);
  };

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const userLiked = !c.userLiked;
          return {
            ...c,
            userLiked,
            likes: userLiked ? c.likes + 1 : c.likes - 1
          };
        }
        return c;
      })
    );
  };

  const handleLikeReply = (commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: c.replies.map((r) => {
              if (r.id === replyId) {
                const userLiked = !r.userLiked;
                return {
                  ...r,
                  userLiked,
                  likes: userLiked ? r.likes + 1 : r.likes - 1
                };
              }
              return r;
            })
          };
        }
        return c;
      })
    );
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const filteredComments = comments
    .filter(
      (c) =>
        c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.author.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'likes') return b.likes - a.likes;
      return parseInt(b.id) - parseInt(a.id);
    });

  const totalResponses = reactions.reduce((acc, r) => acc + r.count, 0);

  return (
    <section className="mt-12 pt-8 border-t border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Community & Reviewer Discussion
            </h2>
            <p className="text-xs text-slate-400">
              Share inventory tips, product feedback, and ask questions with the community
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {user.isLoggedIn ? (
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
              <div
                className={`w-6 h-6 rounded-full ${user.avatarColor} text-white font-bold flex items-center justify-center text-[10px]`}
              >
                {user.name[0]?.toUpperCase()}
              </div>
              <span className="text-slate-200 font-semibold max-w-[120px] truncate">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 p-1 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In / Sign Up</span>
            </button>
          )}

          <a
            href="https://disqus.com/home/forums/household-2/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            title="Open official Disqus forum"
          >
            <span>Disqus Forum</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Main Discussion Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-slate-100 space-y-8">
        {/* Reactions Section */}
        <div className="text-center pt-2 pb-6 border-b border-slate-800">
          <div className="flex items-center justify-center space-x-1.5 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Reactions</span>
          </div>
          <h3 className="text-lg font-bold text-white">What do you think of Household Inventory?</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalResponses} {totalResponses === 1 ? 'Response' : 'Responses'} so far
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 max-w-2xl mx-auto">
            {reactions.map((r) => {
              const isSelected = activeReaction === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => handleReaction(r.key)}
                  type="button"
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/30 border-2 border-blue-500 text-white scale-105 shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-2xl mb-1 select-none">{r.emoji}</span>
                  <span className="text-xs font-semibold">{r.label}</span>
                  {r.count > 0 && (
                    <span className="text-[10px] font-bold text-blue-400 mt-1 bg-blue-950/80 border border-blue-500/30 px-2 py-0.5 rounded-full">
                      {r.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 font-bold text-sm text-white">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <span>
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Sort: Newest</option>
              <option value="likes">Sort: Most Liked</option>
            </select>
          </div>
        </div>

        {/* Add Comment Input Form */}
        <form onSubmit={handleAddComment} className="space-y-3">
          <div className="flex items-start space-x-3">
            <div
              className={`w-10 h-10 rounded-full ${
                user.isLoggedIn ? user.avatarColor : 'bg-slate-700'
              } text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm border border-slate-600`}
            >
              {user.isLoggedIn ? user.name[0]?.toUpperCase() : <User className="w-4 h-4 text-slate-400" />}
            </div>

            <div className="flex-1 space-y-2">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={
                  user.isLoggedIn
                    ? `Join the discussion as ${user.name}...`
                    : 'Click to log in and share your feedback...'
                }
                onClick={() => {
                  if (!user.isLoggedIn) setShowLoginModal(true);
                }}
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-y"
              />

              <div className="flex items-center justify-between">
                {!user.isLoggedIn ? (
                  <p className="text-xs text-slate-400">
                    Log in with your name to join the community discussion.
                  </p>
                ) : (
                  <span className="text-xs text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Logged in as {user.name}</span>
                  </span>
                )}

                <button
                  type="submit"
                  disabled={!newCommentText.trim() && user.isLoggedIn}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <span>Post Comment</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4 pt-2">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No comments found. Be the first to start the discussion!
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
              >
                {/* Comment Top Line */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-full ${comment.avatarColor} text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm`}
                    >
                      {comment.author[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{comment.author}</span>
                        {comment.badge && (
                          <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">
                            {comment.badge}
                          </span>
                        )}
                        <span className="text-slate-400 text-xs">• {comment.date}</span>
                      </div>
                    </div>
                  </div>

                  {user.isLoggedIn && user.name === comment.author && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Comment Text */}
                <p className="text-slate-200 text-sm pl-12 whitespace-pre-wrap leading-relaxed">
                  {comment.text}
                </p>

                {/* Comment Actions */}
                <div className="pl-12 flex items-center space-x-4 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleLikeComment(comment.id)}
                    className={`flex items-center space-x-1 font-semibold cursor-pointer transition-colors ${
                      comment.userLiked ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${comment.userLiked ? 'fill-blue-400' : ''}`} />
                    <span>{comment.likes > 0 ? `${comment.likes} Likes` : 'Like'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveReplyId(activeReplyId === comment.id ? null : comment.id)
                    }
                    className="text-slate-400 hover:text-slate-200 font-semibold cursor-pointer flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reply ({comment.replies.length})</span>
                  </button>
                </div>

                {/* Reply Input Box */}
                {activeReplyId === comment.id && (
                  <div className="pl-12 pt-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={
                          user.isLoggedIn
                            ? `Replying as ${user.name}...`
                            : 'Click to log in and reply...'
                        }
                        onClick={() => {
                          if (!user.isLoggedIn) setShowLoginModal(true);
                        }}
                        value={replyTextMap[comment.id] || ''}
                        onChange={(e) =>
                          setReplyTextMap({ ...replyTextMap, [comment.id]: e.target.value })
                        }
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddReply(comment.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies Thread */}
                {comment.replies.length > 0 && (
                  <div className="pl-12 space-y-2.5 pt-2 border-t border-slate-800/80 mt-2">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start space-x-2.5"
                      >
                        <div
                          className={`w-7 h-7 rounded-full ${reply.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0`}
                        >
                          {reply.author[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-xs">{reply.author}</span>
                            <span className="text-slate-500 text-[10px]">• {reply.date}</span>
                          </div>
                          <p className="text-slate-300 text-xs mt-0.5">{reply.text}</p>

                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={() => handleLikeReply(comment.id, reply.id)}
                              className={`flex items-center space-x-1 text-[11px] font-semibold transition-colors ${
                                reply.userLiked ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${reply.userLiked ? 'fill-blue-400' : ''}`} />
                              <span>{reply.likes > 0 ? reply.likes : 'Like'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* In-App Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <User className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Join Community Discussion</h3>
            </div>

            <p className="text-xs text-slate-400">
              Enter your name to post comments, leave feedback, and interact with other community members right here.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. alex@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
                >
                  Save & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
