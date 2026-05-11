import React from "react";
import { EngagementProvider } from "./EngagementContext";
import { Mode } from "./AppContext"; // Your existing context
import { useState } from "react";

export const AllProviders = ({ children }) => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  // ... other state from Mode context

  const modeValue = {
    isLoggedin,
    setIsLoggedin,
    // ... other Mode values
  };

  return (
    <Mode.Provider value={modeValue}>
      <EngagementProvider>
        {children}
      </EngagementProvider>
    </Mode.Provider>
  );
};

export default AllProviders;