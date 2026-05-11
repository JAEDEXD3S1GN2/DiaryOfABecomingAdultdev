import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { getToken } from "../../../utils/tokenService";
import { BaseUrl } from "../../../Baseconfig";
import { Mode } from "../../AppContext";

const API_BASE = (BaseUrl || "").replace(/\/+$/g, "");

// ── Stat pill ──────────────────────────────────────────────────────────────
const StatPill = ({ label, value, accent }) => (
  <div
    className={`flex flex-col items-center justify-center px-6 py-4 rounded-2xl border-2 ${accent} bg-cream min-w-[110px]`}
  >
    <span className="text-2xl font-bold font-montserrat text-blackBrand">
      {value ?? 0}
    </span>
    <span className="text-xs font-Worksans text-blackBrand/60 mt-1 tracking-wide uppercase">
      {label}
    </span>
  </div>
);

// ── Favourite card ─────────────────────────────────────────────────────────
const FavCard = ({ post }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-cream border border-blackBrand/10 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
    {/* Thumbnail */}
    <div className="relative h-44 w-full overflow-hidden bg-blackBrand/10">
      {post.thumbnailUrl ? (
        <img
          src={post.thumbnailUrl}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-5xl opacity-20">📖</span>
        </div>
      )}
      {/* Genre badge */}
      <span className="absolute top-3 left-3 bg-greenBrand text-cream text-[10px] font-montserrat font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
        {post.genre}
      </span>
    </div>

    {/* Body */}
    <div className="p-5">
      <h3 className="font-montserrat font-bold text-blackBrand text-base leading-snug mb-2 line-clamp-2">
        {post.title}
      </h3>
      <p className="font-Worksans text-blackBrand/60 text-sm line-clamp-2 mb-4">
       <div dangerouslySetInnerHTML={{ __html: post.description }} />
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs font-robotomono text-blackBrand/50">
        <span className="flex items-center gap-1">
          <span>👁</span> {post.views ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <span>👍</span> {post.likes ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <span>👎</span> {post.dislikes ?? 0}
        </span>
      </div>
    </div>

    {/* Bottom accent line */}
    <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-orangeBrand transition-all duration-500 group-hover:w-full" />
  </div>
);

// ── Avatar initials ────────────────────────────────────────────────────────
const Avatar = ({ name }) => {
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";
  return (
    <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-greenBrand shadow-lg border-4 border-cream select-none">
      <span className="text-4xl font-montserrat font-black text-cream">
        {initials}
      </span>
      {/* Orange ring */}
      <div className="absolute -inset-1.5 rounded-full border-2 border-orangeBrand/50 animate-pulse" />
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
const UserProfile = () => {
  const externalToken = sessionStorage.getItem("token");
  const LoginStatus = useContext(Mode);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!externalToken) {
      LoginStatus.setIsLoggedin(false);
    } else {
      LoginStatus.setIsLoggedin(true);
    }

    const fetchProfile = async () => {
      try {
        const token = getToken();
        // Decode userId from token (adjust if you store it differently)
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.id || payload.userId;

        const res = await axios.get(`${API_BASE}/api/users/${userId}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        setError("Could not load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-greenBrand border-t-orangeBrand rounded-full animate-spin" />
          <p className="font-Worksans text-blackBrand/50 tracking-widest text-sm uppercase">
            Loading profile…
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <p className="font-montserrat text-blackBrand font-semibold text-lg mb-2">
            Something went wrong
          </p>
          <p className="font-Worksans text-blackBrand/50 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const favourites = profile?.favoritesPosts ?? [];
  const filtered = favourites.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero banner ── */}
      <div className="relative w-full h-52 bg-blackBrand overflow-hidden">
        {/* Decorative diagonal stripes */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-full w-24 bg-greenBrand"
              style={{
                left: `${i * 14}%`,
                transform: "skewX(-20deg)",
                opacity: 0.6 - i * 0.06,
              }}
            />
          ))}
        </div>
        {/* Orange accent blob */}
        <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-orangeBrand/20 blur-3xl" />
        <div className="absolute top-6 left-8">
          <span className="font-montserrat text-cream/20 text-7xl font-black select-none leading-none">
            DOABA
          </span>
        </div>
      </div>

      {/* ── Profile card ── */}
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-8">
        {/* Avatar — overlaps banner */}
        <div className="relative flex flex-col sm:flex-row sm:items-end gap-6 -mt-14 mb-8">
          <Avatar name={profile?.name} />

          <div className="flex-1 pt-2">
            <h1 className="font-montserrat font-black text-blackBrand text-3xl sm:text-4xl leading-tight">
              {profile?.name}
            </h1>
            <p className="font-Worksans text-blackBrand/50 text-sm mt-1 tracking-wide">
              {profile?.email}
            </p>
            {profile?.createdAt && (
              <p className="font-robotomono text-xs text-blackBrand/30 mt-1">
                Member since{" "}
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            )}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="flex flex-wrap gap-3 mb-12">
          <StatPill
            label="Blogs Read"
            value={profile?.blogsOpened}
            accent="border-greenBrand"
          />
          <StatPill
            label="Comments"
            value={profile?.commentsMade}
            accent="border-orangeBrand"
          />
          <StatPill
            label="Favourites"
            value={profile?.favoriteCount}
            accent="border-blackBrand"
          />
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-blackBrand/10" />
          <span className="font-montserrat font-black text-blackBrand/20 text-xs uppercase tracking-[0.25em]">
            Favourited Posts
          </span>
          <div className="flex-1 h-px bg-blackBrand/10" />
        </div>

        {/* ── Search bar ── */}
        {favourites.length > 0 && (
          <div className="relative mb-8 max-w-sm">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blackBrand/30 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search favourites…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-blackBrand/10 bg-white font-Worksans text-sm text-blackBrand placeholder-blackBrand/30 focus:outline-none focus:border-greenBrand transition"
            />
          </div>
        )}

        {/* ── Favourites grid ── */}
        {favourites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">🌱</span>
            <p className="font-montserrat font-bold text-blackBrand text-xl mb-2">
              No favourites yet
            </p>
            <p className="font-Worksans text-blackBrand/40 text-sm max-w-xs">
              Start exploring posts and save the ones you love — they'll appear
              right here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-Worksans text-blackBrand/40 text-sm">
              No posts match "{search}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filtered.map((post) => (
              <FavCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
