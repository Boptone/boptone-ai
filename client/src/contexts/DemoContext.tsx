import { createContext, useContext, useState, ReactNode } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  demoUser: {
    id: number;
    name: string;
    email: string;
    role: "user" | "admin";
  };
  demoProfile: {
    id: number;
    userId: number;
    stageName: string;
    bio: string;
    genres: string[];
    location: string;
    careerPhase: string;
    priorityScore: string;
    avatarUrl: string;
    coverImageUrl: string;
    socialLinks: {
      instagram: string;
      tiktok: string;
      twitter: string;
      youtube: string;
      spotify: string;
      website: string;
    };
    themeColor: string;
    accentColor: string;
    layoutStyle: "default" | "minimal" | "grid";
    fontFamily: string;
  };
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const demoUser = {
    id: 999,
    name: "Demo Artist",
    email: "demo@boptone.com",
    role: "user" as const,
  };

  const demoProfile = {
    id: 999,
    userId: 999,
    stageName: "Luna Rivers",
    bio: "Independent artist blending R&B, soul, and electronic music. Based in Los Angeles, creating sounds that move the soul.",
    genres: ["R&B", "Soul", "Electronic", "Pop"],
    location: "Los Angeles, CA",
    careerPhase: "Development",
    priorityScore: "7.85",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    coverImageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop",
    socialLinks: {
      instagram: "https://instagram.com/lunarivers",
      tiktok: "https://tiktok.com/@lunarivers",
      twitter: "https://twitter.com/lunarivers",
      youtube: "https://youtube.com/@lunarivers",
      spotify: "https://open.spotify.com/artist/demo",
      website: "https://lunarivers.com",
    },
    themeColor: "#8b5cf6",
    accentColor: "#ec4899",
    layoutStyle: "default" as const,
    fontFamily: "Inter",
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    if (enabled) {
      console.log("🎭 Demo Mode Activated");
    }
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        setDemoMode,
        demoUser,
        demoProfile,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
