"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { world } from "@/lib/world";
import Nav from "./ui/Nav";
import Overlay from "./ui/Overlay";
import Loader from "./ui/Loader";
import ArtworkModal from "./ui/ArtworkModal";
import Fallback from "./ui/Fallback";

gsap.registerPlugin(ScrollTrigger);

const CanvasScene = dynamic(() => import("./CanvasScene"), { ssr: false });

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export default function Experience() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [artworkId, setArtworkId] = useState<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // capability probe — decides 3D vs. editorial fallback before anything mounts
  useEffect(() => {
    world.isMobile =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    setWebgl(webglAvailable());
  }, []);

  // smooth scrolling: Lenis drives both ScrollTrigger and the camera dolly
  useEffect(() => {
    if (!webgl) return;
    const lenis = new Lenis({ duration: 1.35, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on("scroll", (l: Lenis) => {
      world.progress = l.limit > 0 ? l.scroll / l.limit : 0;
      ScrollTrigger.update();
    });
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [webgl]);

  // pointer → world space (the scene, particles, and sculpture all listen)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      world.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      world.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // paintings in the 3D layer open the DOM viewing room through this hook
  useEffect(() => {
    world.openArtwork = (id: number) => setArtworkId(id);
    return () => {
      world.openArtwork = null;
    };
  }, []);

  // freeze the walk while a piece is being viewed
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (artworkId !== null) lenis.stop();
    else lenis.start();
  }, [artworkId]);

  if (webgl === null) {
    return <div className="fixed inset-0 bg-ink" />;
  }

  if (!webgl) {
    return (
      <>
        <Nav />
        <Fallback />
      </>
    );
  }

  return (
    <>
      <CanvasScene />
      <Nav />
      <Overlay />
      <ArtworkModal artworkId={artworkId} onClose={() => setArtworkId(null)} />
      <Loader />
    </>
  );
}
