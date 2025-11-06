/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    YT: any;
  }
}

import { useEffect, useRef } from "react";

const VIDEO_ID = "la_AEFO8m7U";

interface OceanSoundPlayerProps {
  volume?: number; // 0 a 100
}

export function OceanSoundPlayer({ volume = 3 }: OceanSoundPlayerProps) {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Cria o script do IFrame API se ainda não existir
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    // Espera a API carregar
    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player("ocean-sound-player", {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 0, // só depois da interação
          loop: 1,
          playlist: VIDEO_ID,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(10);
          },
        },
      });
    };

    // Listener para tocar depois da primeira interação do usuário
    const handleUserInteraction = () => {
      if (playerRef.current) {
        playerRef.current.playVideo();
        document.removeEventListener("click", handleUserInteraction);
      }
    };

    document.addEventListener("click", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
    };
  }, [volume]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
    >
      <div
        id="ocean-sound-player"
        className="absolute w-0 h-0 opacity-0"
        title="Som do oceano"
      />
    </div>
  );
}
