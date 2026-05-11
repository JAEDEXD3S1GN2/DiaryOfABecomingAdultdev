import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { getToken } from "../../../utils/tokenService";
import { BaseUrl } from "../../../Baseconfig";
import { Mode } from '../../AppContext';

const API_BASE = (BaseUrl || "").replace(/\/+$/g, "");

const AdminDashboard = () => {
  const externalToken = sessionStorage.getItem("token");
  const LoginStatus = useContext(Mode);

  const [dashboardData, setDashboardData] = useState({
    users: [],
    posts: [],
    messages: [],
    comments: [],
    analytics: {
      totalUsers: 0,
      totalPosts: 0,
      totalComments: 0,
      totalMessages: 0,
      totalViews: 0,
      totalLikes: 0,
      totalDislikes: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!externalToken) {
      LoginStatus.setIsLoggedin(false);
    } else {
      LoginStatus.setIsLoggedin(true);
    }

    const fetchAdminData = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${API_BASE}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  const { users, posts, messages, comments, analytics } = dashboardData;

  const statCards = [
    { label: "Total Users", value: analytics.totalUsers, color: "bg-blue-500" },
    { label: "Total Posts", value: analytics.totalPosts, color: "bg-green-500" },
    { label: "Total Comments", value: analytics.totalComments, color: "bg-yellow-500" },
    { label: "Total Messages", value: analytics.totalMessages, color: "bg-purple-500" },
    { label: "Total Views", value: analytics.totalViews, color: "bg-pink-500" },
    { label: "Total Likes", value: analytics.totalLikes, color: "bg-emerald-500" },
    { label: "Total Dislikes", value: analytics.totalDislikes, color: "bg-red-500" },
  ];

  const tabs = ["overview", "users", "posts", "comments", "messages"];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow p-5">
            <div className={`w-10 h-10 rounded-full ${card.color} mb-3`} />
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow p-6">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
            {posts.slice(0, 5).map((post) => (
              <div key={post.id} className="border-b py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{post.title}</p>
                  <p className="text-sm text-gray-500">{post.genre}</p>
                </div>
                <div className="text-sm text-gray-500 text-right">
                  <p>👁 {post.views ?? 0}</p>
                  <p>👍 {post.likes ?? 0} &nbsp; 👎 {post.dislikes ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">All Users ({users.length})</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b text-gray-500">
                  <th className="py-2">ID</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Blogs Opened</th>
                  <th className="py-2">Comments</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{user.id}</td>
                    <td className="py-2">{user.name}</td>
                    <td className="py-2">{user.email}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "admin" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2">{user.blogsOpened ?? 0}</td>
                    <td className="py-2">{user.commentsMade ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* POSTS */}
        {activeTab === "posts" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">All Posts ({posts.length})</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b text-gray-500">
                  <th className="py-2">ID</th>
                  <th className="py-2">Title</th>
                  <th className="py-2">Genre</th>
                  <th className="py-2">Views</th>
                  <th className="py-2">Likes</th>
                  <th className="py-2">Dislikes</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{post.id}</td>
                    <td className="py-2">{post.title}</td>
                    <td className="py-2">{post.genre}</td>
                    <td className="py-2">{post.views ?? 0}</td>
                    <td className="py-2">{post.likes ?? 0}</td>
                    <td className="py-2">{post.dislikes ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* COMMENTS */}
        {activeTab === "comments" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">All Comments ({comments.length})</h2>
            {comments.length === 0 ? (
              <p className="text-gray-500">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b py-3">
                  <p className="text-sm text-gray-500">
                    User #{comment.userId} on Post #{comment.postId}
                  </p>
                  <p className="mt-1">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* MESSAGES */}
        {activeTab === "messages" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">All Messages ({messages.length})</h2>
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="border-b py-3">
                  <p className="font-semibold">{msg.fullName}</p>
                  <p className="text-sm text-gray-500">{msg.email}</p>
                  <p className="mt-2 text-gray-700">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;