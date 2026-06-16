import React, { useCallback, useEffect, useRef } from "react";
import {
  leaderSpineUrl,
  leaderSpineScale,
  leaderSpineOffsetY,
  leaderSpineOffsetX,
  usesSetupCenter,
} from "./leaderIds";
import { onGameAnimation } from "../field/animationBus";

// On evolve we play the leader's "extra" reaction once, falling back to the
// closest equivalent the skeleton has, then return to looping idle.
const EVOLVE_PRIORITY = [
  "extra",
  "extra_2",
  "positive",
  "positive_2",
  "greet",
  "shock",
];
const pickEvolveAnim = (names) =>
  EVOLVE_PRIORITY.find((n) => names.includes(n)) || null;

// The framing box (the width/height props) decides scale + centring, but the
// actual canvas is rendered this much larger on every side so the animation can
// bleed past the box with no hard rectangular edge. The character is still
// positioned relative to the framing box, so per-leader tuning is unaffected.
const CANVAS_PAD = 0.4;

// Streams a leader's Spine skeletal animation from svgdb (json + atlas + texture)
// and loops its "idle" clip in a transparent WebGL canvas, sized to sit exactly
// where the static leader portrait used to. pixi.js + pixi-spine are imported
// dynamically so they only load (as their own chunk) when a leader is shown.
//
// While the skeleton loads — or if anything fails / the leader has no animation —
// we stay silent and let the parent keep showing the static PNG. `onReady` fires
// once the animation is actually on screen (so the parent can hide the PNG),
// `onError` fires on any failure (so the parent keeps it).
export default function LeaderSpine({
  name,
  active = true,
  width = 320,
  height = 380,
  side = "mine",
  onReady,
  onError,
}) {
  const hostRef = useRef(null);
  const spineRef = useRef(null);
  const geomRef = useRef(null);
  const animMetaRef = useRef(null);

  // Render canvas, padded out past the framing box on every side.
  const canvasW = Math.round(width * (1 + CANVAS_PAD * 2));
  const canvasH = Math.round(height * (1 + CANVAS_PAD * 2));
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  // Position + scale the spine from its measured geometry and this leader's
  // manual scale/offset overrides. geom is in the spine's local space: {bw,bh}
  // size, {cx,cy} centre, {topY} top edge (pixi y points down, so the top is
  // the smallest value).
  const applyTransform = useCallback(() => {
    const spine = spineRef.current;
    const geom = geomRef.current;
    if (!spine || !geom) return;
    const { bw, bh, cx, cy, topY } = geom;
    // Frame against the logical box, then shift into the larger canvas so the
    // box stays centred and the extra canvas is even margin on every side.
    const padX = width * CANVAS_PAD;
    const padY = height * CANVAS_PAD;
    const s = Math.min(width / bw, height / bh) * leaderSpineScale(name);
    spine.scale.set(s);
    spine.x = width / 2 - s * cx + width * leaderSpineOffsetX(name) + padX;
    const topMargin = height * 0.04;
    // Centre vertically when it fits; once taller than the box, anchor the top
    // so the head/upper body stays in frame instead of cropping through it.
    spine.y = bh * s <= height ? height / 2 - s * cy : topMargin - s * topY;
    spine.y += height * leaderSpineOffsetY(name) + padY;
  }, [name, width, height]);

  // Play the evolve reaction once on track 0, then queue idle back on (loop).
  const playEvolve = useCallback(() => {
    const spine = spineRef.current;
    const meta = animMetaRef.current;
    if (!spine || !meta || !meta.evo) return;
    spine.state.setAnimation(0, meta.evo, false);
    if (meta.idle) spine.state.addAnimation(0, meta.idle, true, 0);
  }, []);

  // The evolve effect is broadcast on the shared animation bus with side
  // "player" (the local board, i.e. my leader) or "enemy" (the opponent's),
  // so both clients react on the evolving player's leader.
  useEffect(() => {
    const off = onGameAnimation((evt) => {
      if (evt.kind !== "evolve") return;
      const isMine = evt.side === "player" && side === "mine";
      const isFoe = evt.side === "enemy" && side === "enemy";
      if (isMine || isFoe) playEvolve();
    });
    return off;
  }, [side, playEvolve]);

  useEffect(() => {
    const url = leaderSpineUrl(name);
    if (!url || !hostRef.current) {
      onErrorRef.current && onErrorRef.current();
      return;
    }

    let disposed = false;
    let app = null;

    (async () => {
      try {
        // pixi-spine registers its loader with @pixi/assets as an import side
        // effect, so loading the .json also pulls the .atlas + texture.
        const PIXI = await import("pixi.js");
        const { Spine } = await import("pixi-spine");
        if (disposed || !hostRef.current) return;

        const dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
        app = new PIXI.Application({
          width: canvasW,
          height: canvasH,
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: dpr,
        });
        if (disposed) {
          app.destroy(true, { children: true });
          app = null;
          return;
        }
        hostRef.current.appendChild(app.view);

        const resource = await PIXI.Assets.load(url);
        if (disposed || !app) return;

        const spine = new Spine(resource.spineData);

        // Some skeletons ship the visible art on a second skin (svgdb does the
        // same) — use it when present.
        const skins = spine.spineData.skins || [];
        if (skins.length > 1 && skins[1].attachments) {
          try {
            spine.skeleton.setSkinByName(skins[1].name);
            spine.skeleton.setSlotsToSetupPose();
          } catch {
            /* fall back to default skin */
          }
        }

        // Loop "idle" if the skeleton has it, otherwise the first animation.
        const anims = spine.spineData.animations || [];
        const idle = anims.find((a) => a.name === "idle") || anims[0];
        if (idle) spine.state.setAnimation(0, idle.name, true);
        animMetaRef.current = {
          idle: idle ? idle.name : null,
          evo: pickEvolveAnim(anims.map((a) => a.name)),
        };

        app.stage.addChild(spine);
        spine.update(0);

        // Measure the geometry once. Opt-in leaders use the fixed setup-pose
        // bounds (frame-independent) because their live idle frame sits
        // off-centre; everyone else uses the live rendered bounds. pixi-spine
        // flips Y, so a setup point (x, y) lives at local (x, -y) and the art
        // box is x ∈ [data.x, data.x+w], y ∈ [-(data.y+h), -data.y].
        const data = spine.spineData;
        let geom = null;
        if (usesSetupCenter(name) && data && data.width > 0 && data.height > 0) {
          const bw = data.width;
          const bh = data.height;
          geom = {
            bw,
            bh,
            cx: data.x + bw / 2,
            cy: -(data.y + bh / 2),
            topY: -(data.y + bh),
          };
        } else {
          spine.scale.set(1);
          spine.position.set(0, 0);
          spine.update(0);
          app.renderer.render(app.stage);
          const b = spine.getBounds();
          if (b.width > 0 && b.height > 0) {
            geom = {
              bw: b.width,
              bh: b.height,
              cx: b.x + b.width / 2,
              cy: b.y + b.height / 2,
              topY: b.y,
            };
          }
        }

        spineRef.current = spine;
        geomRef.current = geom;
        applyTransform();

        onReadyRef.current && onReadyRef.current();
      } catch (err) {
        if (!disposed) onErrorRef.current && onErrorRef.current();
      }
    })();

    return () => {
      disposed = true;
      spineRef.current = null;
      geomRef.current = null;
      if (app) {
        // Keep loaded textures cached for instant reuse — only tear down the
        // renderer/canvas, not the shared Spine assets.
        app.destroy(true, { children: true, texture: false, baseTexture: false });
        app = null;
      }
    };
  }, [name, width, height, applyTransform]);

  return (
    <div
      ref={hostRef}
      style={{
        width: canvasW,
        height: canvasH,
        pointerEvents: "none",
        filter: active ? undefined : "brightness(30%)",
        transition: "filter 0.3s ease",
      }}
    />
  );
}
