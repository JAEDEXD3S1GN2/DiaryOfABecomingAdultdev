import React, { createContext, useState } from "react";

/**
 * EngagementContext
 * 
 * Manages the state for like/dislike button interactions
 * Prevents prop drilling and centralizes engagement state
 * 
 * Usage:
 * 1. Wrap your app with <EngagementProvider>
 * 2. In components: const { userLiked, setUserLiked, ... } = useContext(EngagementContext)
 */

export const EngagementContext = createContext();

export const EngagementProvider = ({ children }) => {
  // Like/Dislike states
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);

  // Loading states for API calls
  const [likeLoading, setLikeLoading] = useState(false);
  const [dislikeLoading, setDislikeLoading] = useState(false);

  /**
   * Reset votes to initial state
   * Call this when switching to a different post
   */
  const resetVotes = () => {
    setUserLiked(false);
    setUserDisliked(false);
    setLikeLoading(false);
    setDislikeLoading(false);
  };

  /**
   * Set both liked and disliked to false
   * Useful for toggling states
   */
  const clearAllVotes = () => {
    setUserLiked(false);
    setUserDisliked(false);
  };

  // Context value object
  const value = {
    // Like states
    userLiked,
    setUserLiked,

    // Dislike states
    userDisliked,
    setUserDisliked,

    // Loading states
    likeLoading,
    setLikeLoading,
    dislikeLoading,
    setDislikeLoading,

    // Utility methods
    resetVotes,
    clearAllVotes,
  };

  return (
    <EngagementContext.Provider value={value}>
      {children}
    </EngagementContext.Provider>
  );
};

export default EngagementContext;
