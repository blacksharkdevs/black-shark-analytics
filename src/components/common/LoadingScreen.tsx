import { useThemeToggle } from "@/hooks/useThemeToggle";
import { OceanBackground } from "../layout/OceanBackground";
import { OceanSoundPlayer } from "./OceanSoundPlayer";
import { SharkSwim } from "./SharkSwin";

interface LoadingScreenProps {
  backgroundTransparent?: boolean;
}

export function LoadingScreen({
  backgroundTransparent = false,
}: LoadingScreenProps) {
  const { theme } = useThemeToggle();

  return (
    <div
      className={`relative flex items-center justify-center min-h-screen p-4 ${
        backgroundTransparent ? "bg-transparent" : "bg-blackshark-background"
      }`}
    >
      <OceanSoundPlayer />
      <OceanBackground backgroundTransparent={backgroundTransparent} />
      <div className="flex flex-col text-foreground">
        <SharkSwim key={theme} color="auto" />
      </div>
    </div>
  );
}
