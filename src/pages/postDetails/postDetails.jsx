import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { BaseUrl } from "../../../Baseconfig";
import { useParams } from "react-router-dom";
import { Mode } from "../../AppContext";
import { EngagementContext } from "../../EngagementContext";
import Comments from "../../components/Comments/Comments";
import { motion } from "framer-motion";
import {
	AiOutlineLike,
	AiFillLike,
	AiOutlineDislike,
	AiFillDislike,
	AiOutlineEye,
} from "react-icons/ai";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { getToken } from "../../../utils/tokenService";

const API_BASE = (BaseUrl || "").replace(/\/+$/g, "");

function isYouTubeUrl(url) {
	if (!url) return false;
	return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/i.test(url);
}

function getYouTubeEmbedUrl(url) {
	try {
		if (/youtube\.com\/embed\//i.test(url)) return url;
		const u = new URL(url);
		if (u.hostname.includes("youtube.com")) {
			const v = u.searchParams.get("v");
			if (v) return `https://www.youtube.com/embed/${v}`;
		}
		if (u.hostname === "youtu.be") {
			const id = u.pathname.slice(1);
			if (id) return `https://www.youtube.com/embed/${id}`;
		}
	} catch (e) {}
	return url;
}

const PostDetails = () => {
	const { id } = useParams();
	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [likeAnimating, setLikeAnimating] = useState(false);
	const [dislikeAnimating, setDislikeAnimating] = useState(false);

	// ── Favourite state ──────────────────────────────────────────────────────
	const [isFavourited, setIsFavourited] = useState(false);
	const [favouriteLoading, setFavouriteLoading] = useState(false);
	const [favouriteAnimating, setFavouriteAnimating] = useState(false);
	// ────────────────────────────────────────────────────────────────────────

	const token = sessionStorage.getItem("token");
	const LoginStatus = useContext(Mode);

	const {
		userLiked,
		setUserLiked,
		userDisliked,
		setUserDisliked,
		likeLoading,
		setLikeLoading,
		dislikeLoading,
		setDislikeLoading,
		resetVotes,
	} = useContext(EngagementContext);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	useEffect(() => {
		if (!token) LoginStatus.setIsLoggedin(false);
		else LoginStatus.setIsLoggedin(true);

		const fetchPost = async () => {
			try {
				const res = await axios.get(`${API_BASE}/api/posts/${id}`);
				setPost(res.data);
				recordView();
				resetVotes();

				// ── Check if this post is already favourited ──────────────────
				if (token) {
					try {
						const favRes = await axios.get(
							`${API_BASE}/api/posts/${id}/favourite-status`,
							{ headers: { Authorization: `Bearer ${token}` } }
						);
						setIsFavourited(favRes.data.isFavorited ?? false);
					} catch {
						// silently fail — favourite status is non-critical
					}
				}
				// ─────────────────────────────────────────────────────────────
			} catch (err) {
				console.error(err);
				setError("Unable to load post.");
			} finally {
				setLoading(false);
			}
		};

		fetchPost();
	}, [id]);

	const recordView = async () => {
		try {
			const response = await axios.post(`${API_BASE}/api/posts/${id}/view`);
			setPost((prev) =>
				prev ? { ...prev, views: response.data.views } : prev
			);
		} catch (err) {
			console.error("Failed to record view:", err);
		}
	};

	const handleLike = async () => {
		if (!token) { alert("Please log in to like posts"); return; }
		if (userLiked) {
			setLikeLoading(true); setLikeAnimating(true);
			try {
				const response = await axios.post(
					`${API_BASE}/api/posts/${id}/like`, {},
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setPost((prev) => ({ ...prev, likes: response.data.likes }));
				setUserLiked(false);
			} catch (err) { console.error(err); alert("Failed to unlike post"); }
			finally { setLikeLoading(false); setTimeout(() => setLikeAnimating(false), 600); }
			return;
		}
		setLikeLoading(true); setLikeAnimating(true);
		try {
			const response = await axios.post(
				`${API_BASE}/api/posts/${id}/like`, {},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setPost((prev) => ({
				...prev,
				likes: response.data.likes,
				dislikes: response.data.dislikes || prev?.dislikes || 0,
			}));
			setUserLiked(true);
			if (userDisliked) setUserDisliked(false);
		} catch (err) { console.error(err); alert("Failed to like post"); }
		finally { setLikeLoading(false); setTimeout(() => setLikeAnimating(false), 600); }
	};

	const handleDislike = async () => {
		if (!token) { alert("Please log in to dislike posts"); return; }
		if (userDisliked) {
			setDislikeLoading(true); setDislikeAnimating(true);
			try {
				const response = await axios.post(
					`${API_BASE}/api/posts/${id}/dislike`, {},
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setPost((prev) => ({ ...prev, dislikes: response.data.dislikes }));
				setUserDisliked(false);
			} catch (err) { console.error(err); alert("Failed to remove dislike"); }
			finally { setDislikeLoading(false); setTimeout(() => setDislikeAnimating(false), 600); }
			return;
		}
		setDislikeLoading(true); setDislikeAnimating(true);
		try {
			const response = await axios.post(
				`${API_BASE}/api/posts/${id}/dislike`, {},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setPost((prev) => ({
				...prev,
				dislikes: response.data.dislikes,
				likes: response.data.likes || prev?.likes || 0,
			}));
			setUserDisliked(true);
			if (userLiked) setUserLiked(false);
		} catch (err) { console.error(err); alert("Failed to dislike post"); }
		finally { setDislikeLoading(false); setTimeout(() => setDislikeAnimating(false), 600); }
	};

	// ── Handle favourite toggle ──────────────────────────────────────────────
	const handleFavourite = async () => {
		const token = getToken();

		if (!token) {
			alert("Please log in to favourite posts");
			return;
		}

		setFavouriteLoading(true);
		setFavouriteAnimating(true);

		try {
			const response = await axios.post(
				`${API_BASE}/api/posts/${id}/favorite`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setIsFavourited(response.data.isFavorited);
		} catch (err) {
			console.error("Failed to toggle favourite:", err);
			alert("Failed to update favourite");
		} finally {
			setFavouriteLoading(false);
			setTimeout(() => setFavouriteAnimating(false), 600);
		}
	};
	// ────────────────────────────────────────────────────────────────────────

	if (loading) return <div className="text-center py-40 text-lg">Loading post...</div>;
	if (error) return <div className="text-center py-40 text-red-500 text-lg">{error}</div>;
	if (!post) return <div className="text-center py-40 text-lg">Post not found.</div>;

	const appear = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };
	const buttonVariants = { hover: { scale: 1.05 }, tap: { scale: 0.95 } };
	const scaleAnimation = {
		initial: { scale: 1 },
		animate: { scale: [1, 1.2, 1], transition: { duration: 0.6 } },
	};

	return (
		<motion.main
			initial="hidden"
			animate="show"
			className="bg-cream min-h-screen overflow-x-hidden"
		>
			{/* HERO SECTION */}
			<motion.section
				variants={appear}
				className="relative py-20 px-6 bg-gradient-to-br from-greenBrand via-greenBrand/90 to-blackBrand text-white"
			>
				<div className="max-w-4xl mx-auto text-center">
					<motion.span
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						className="inline-block mb-6 px-4 py-1 text-xs tracking-widest uppercase bg-white/20 backdrop-blur-md rounded-full"
					>
						{post.genre}
					</motion.span>

					<h1 className="text-4xl md:text-6xl font-diary leading-tight mb-6">
						{post.title}
					</h1>
				</div>
			</motion.section>

			{/* CONTENT + COMMENTS */}
			<motion.section variants={appear} className="py-12 md:py-20">
				<div className="max-w-4xl mx-auto px-6">
					<div className="bg-white rounded-3xl shadow-lg p-6 md:p-12">

						{/* ENGAGEMENT METRICS */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200"
						>
							<div className="text-sm text-gray-600 font-medium" />

							<div className="flex gap-3 md:gap-4 items-center">

								{/* LIKE BUTTON */}
								<motion.button
									variants={buttonVariants}
									whileHover="hover"
									whileTap="tap"
									onClick={handleLike}
									disabled={likeLoading}
									animate={likeAnimating ? scaleAnimation.animate : "initial"}
									title={token ? "Like this post" : "Login to like"}
									className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold transition duration-200 ${
										userLiked
											? "bg-greenBrand text-white shadow-lg"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									} disabled:opacity-50 cursor-pointer`}
								>
									<motion.div
										animate={userLiked ? { rotate: 360 } : { rotate: 0 }}
										transition={{ duration: 0.3 }}
									>
										{userLiked ? (
											<AiFillLike className="text-lg" />
										) : (
											<AiOutlineLike className="text-lg" />
										)}
									</motion.div>
									<span className="text-xs md:text-sm">{post.likes}</span>
								</motion.button>

								{/* DISLIKE BUTTON */}
								<motion.button
									variants={buttonVariants}
									whileHover="hover"
									whileTap="tap"
									onClick={handleDislike}
									disabled={dislikeLoading}
									animate={dislikeAnimating ? scaleAnimation.animate : "initial"}
									title={token ? "Dislike this post" : "Login to dislike"}
									className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold transition duration-200 ${
										userDisliked
											? "bg-red-500 text-white shadow-lg"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									} disabled:opacity-50 cursor-pointer`}
								>
									<motion.div
										animate={userDisliked ? { rotate: -360 } : { rotate: 0 }}
										transition={{ duration: 0.3 }}
									>
										{userDisliked ? (
											<AiFillDislike className="text-lg" />
										) : (
											<AiOutlineDislike className="text-lg" />
										)}
									</motion.div>
									<span className="text-xs md:text-sm">{post.dislikes}</span>
								</motion.button>

								{/* ── FAVOURITE BUTTON ───────────────────────────────────── */}
								<motion.button
									variants={buttonVariants}
									whileHover="hover"
									whileTap="tap"
									onClick={handleFavourite}
									disabled={favouriteLoading}
									animate={favouriteAnimating ? scaleAnimation.animate : "initial"}
									title={token ? (isFavourited ? "Remove from favourites" : "Add to favourites") : "Login to favourite"}
									className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold transition duration-200 ${
										isFavourited
											? "bg-orangeBrand text-white shadow-lg"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									} disabled:opacity-50 cursor-pointer`}
								>
									<motion.div
										animate={
											isFavourited
												? { scale: [1, 1.4, 1], transition: { duration: 0.4 } }
												: { scale: 1 }
										}
									>
										{isFavourited ? (
											<BsBookmarkFill className="text-lg" />
										) : (
											<BsBookmark className="text-lg" />
										)}
									</motion.div>
									<span className="hidden sm:inline text-xs md:text-sm">
										{isFavourited ? "Saved" : "Save"}
									</span>
								</motion.button>
								{/* ─────────────────────────────────────────────────────── */}

							</div>
						</motion.div>

						<div className="prose max-w-none text-gray-800 text-base md:text-lg leading-relaxed">
							<div dangerouslySetInnerHTML={{ __html: post.description }} />
						</div>

						<div className="mt-10">
							<Comments postId={post.id} />
						</div>
					</div>
				</div>
			</motion.section>

			{/* GALLERY */}
			{post.imageUrls && post.imageUrls.length > 0 && (
				<motion.section variants={appear} className="py-12 md:py-20">
					<div className="max-w-6xl mx-auto px-6">
						<h2 className="text-2xl md:text-3xl font-semibold text-blackBrand mb-8">
							Gallery
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{post.imageUrls.map((img, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									className="overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition duration-300"
								>
									<img
										src={img}
										alt="blog visual"
										className="w-full h-[220px] md:h-[320px] object-cover hover:scale-105 transition duration-500"
									/>
								</motion.div>
							))}
						</div>
					</div>
				</motion.section>
			)}

			{/* VIDEO / PODCAST */}
			{post.videoUrl && (
				<motion.section variants={appear} className="py-12 md:py-20">
					<div className="max-w-4xl mx-auto px-6">
						<h2 className="text-2xl md:text-3xl font-semibold mb-6 text-blackBrand">
							Podcast
						</h2>
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="rounded-3xl overflow-hidden shadow-xl bg-white"
						>
							{isYouTubeUrl(post.videoUrl) ? (
								<iframe
									className="w-full h-[240px] md:h-[440px]"
									src={getYouTubeEmbedUrl(post.videoUrl)}
									title="Podcast"
									allowFullScreen
								/>
							) : (
								<div className="w-full h-[240px] md:h-[440px] bg-gray-100 flex items-center justify-center">
									<div className="text-center p-6">
										<p className="mb-4 text-gray-600">
											This link cannot be embedded. Open externally instead.
										</p>
										<a
											href={post.videoUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-block bg-greenBrand text-white px-4 py-2 rounded-lg hover:bg-greenBrand/90 transition"
										>
											Open Link
										</a>
									</div>
								</div>
							)}
						</motion.div>
					</div>
				</motion.section>
			)}
		</motion.main>
	);
};

export default PostDetails;
