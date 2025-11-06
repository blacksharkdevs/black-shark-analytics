import { OceanBackground } from "../layout/OceanBackground";
import { OceanSoundPlayer } from "./OceanSoundPlayer";
import { SharkSwim } from "./SharkSwin";

export function LoadingScreen() {
  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-blackshark-background">
      <OceanSoundPlayer />
      <OceanBackground />
      <div className="flex flex-col">
        <SharkSwim width={270} />
      </div>
    </div>
  );
}
