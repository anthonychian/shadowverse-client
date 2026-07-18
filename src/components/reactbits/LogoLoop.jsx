// LogoLoop — from reactbits.dev (https://reactbits.dev/animations/logo-loop)
// Continuously scrolling marquee. Items render via `renderItem` for custom
// nodes (used by the Home deck strip), or as plain <img>/node entries.
// Local addition: a `draggable` prop — pointer-drag scrubs the strip directly
// (auto-scroll pauses while held), releasing flings it with the throw velocity
// before easing back to the marquee speed. Clicks that follow a real drag
// (> 8px) are suppressed so item onClick handlers only fire on true clicks.
import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import "./LogoLoop.css";

const ANIMATION_CONFIG = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, COPY_HEADROOM: 2 };

const toCssLength = (value) => (typeof value === "number" ? `${value}px` : (value ?? undefined));

const useResizeObserver = (callback, elements, dependencies) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => callback();
      window.addEventListener("resize", handleResize);
      callback();
      return () => window.removeEventListener("resize", handleResize);
    }
    const observers = elements.map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });
    callback();
    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [callback, elements, dependencies]);
};

const useImageLoader = (seqRef, onLoad, dependencies) => {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll("img") ?? [];
    if (images.length === 0) {
      onLoad();
      return;
    }
    let remainingImages = images.length;
    const handleImageLoad = () => {
      remainingImages -= 1;
      if (remainingImages === 0) onLoad();
    };
    images.forEach((img) => {
      const htmlImg = img;
      if (htmlImg.complete) {
        handleImageLoad();
      } else {
        htmlImg.addEventListener("load", handleImageLoad, { once: true });
        htmlImg.addEventListener("error", handleImageLoad, { once: true });
      }
    });
    return () => {
      images.forEach((img) => {
        img.removeEventListener("load", handleImageLoad);
        img.removeEventListener("error", handleImageLoad);
      });
    };
  }, [onLoad, seqRef, dependencies]);
};

const useAnimationLoop = (trackRef, targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical, dragStateRef) => {
  const rafRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const seqSize = isVertical ? seqHeight : seqWidth;

    if (seqSize > 0) {
      offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
      const transformValue = isVertical
        ? `translate3d(0, ${-offsetRef.current}px, 0)`
        : `translate3d(${-offsetRef.current}px, 0, 0)`;
      track.style.transform = transformValue;
    }

    const animate = (timestamp) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const drag = dragStateRef?.current;

      if (drag && drag.active) {
        // While held, the pointer owns the offset: consume the accumulated
        // drag delta verbatim and keep the auto-velocity dead.
        velocityRef.current = 0;
        if (seqSize > 0 && drag.pendingDelta !== 0) {
          let nextOffset = offsetRef.current + drag.pendingDelta;
          drag.pendingDelta = 0;
          nextOffset = ((nextOffset % seqSize) + seqSize) % seqSize;
          offsetRef.current = nextOffset;

          const transformValue = isVertical
            ? `translate3d(0, ${-offsetRef.current}px, 0)`
            : `translate3d(${-offsetRef.current}px, 0, 0)`;
          track.style.transform = transformValue;
        }
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // Just released: seed the velocity with the throw so the strip flings,
      // then the easing below carries it back to the marquee speed.
      if (drag && drag.releaseVelocity !== null) {
        velocityRef.current = drag.releaseVelocity;
        drag.releaseVelocity = null;
      }

      const target = isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;

      const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (seqSize > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * deltaTime;
        nextOffset = ((nextOffset % seqSize) + seqSize) % seqSize;
        offsetRef.current = nextOffset;

        const transformValue = isVertical
          ? `translate3d(0, ${-offsetRef.current}px, 0)`
          : `translate3d(${-offsetRef.current}px, 0, 0)`;
        track.style.transform = transformValue;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical, trackRef, dragStateRef]);
};

export const LogoLoop = memo(
  ({
    logos,
    speed = 120,
    direction = "left",
    width = "100%",
    logoHeight = 28,
    gap = 32,
    pauseOnHover,
    hoverSpeed,
    fadeOut = false,
    fadeOutColor,
    scaleOnHover = false,
    draggable = false,
    renderItem,
    ariaLabel = "Partner logos",
    className,
    style,
  }) => {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const seqRef = useRef(null);

    const [seqWidth, setSeqWidth] = useState(0);
    const [seqHeight, setSeqHeight] = useState(0);
    const [copyCount, setCopyCount] = useState(ANIMATION_CONFIG.MIN_COPIES);
    const [isHovered, setIsHovered] = useState(false);

    const effectiveHoverSpeed = useMemo(() => {
      if (hoverSpeed !== undefined) return hoverSpeed;
      if (pauseOnHover === true) return 0;
      if (pauseOnHover === false) return undefined;
      return 0;
    }, [hoverSpeed, pauseOnHover]);

    const isVertical = direction === "up" || direction === "down";

    const targetVelocity = useMemo(() => {
      const magnitude = Math.abs(speed);
      let directionMultiplier;
      if (isVertical) {
        directionMultiplier = direction === "up" ? 1 : -1;
      } else {
        directionMultiplier = direction === "left" ? 1 : -1;
      }
      const speedMultiplier = speed < 0 ? -1 : 1;
      return magnitude * directionMultiplier * speedMultiplier;
    }, [speed, direction, isVertical]);

    const updateDimensions = useCallback(() => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const sequenceRect = seqRef.current?.getBoundingClientRect?.();
      const sequenceWidth = sequenceRect?.width ?? 0;
      const sequenceHeight = sequenceRect?.height ?? 0;
      if (isVertical) {
        const parentHeight = containerRef.current?.parentElement?.clientHeight ?? 0;
        if (containerRef.current && parentHeight > 0) {
          const targetHeight = Math.ceil(parentHeight);
          if (containerRef.current.style.height !== `${targetHeight}px`)
            containerRef.current.style.height = `${targetHeight}px`;
        }
        if (sequenceHeight > 0) {
          setSeqHeight(Math.ceil(sequenceHeight));
          const viewport = containerRef.current?.clientHeight ?? parentHeight ?? sequenceHeight;
          const copiesNeeded = Math.ceil(viewport / sequenceHeight) + ANIMATION_CONFIG.COPY_HEADROOM;
          setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
        }
      } else if (sequenceWidth > 0) {
        setSeqWidth(Math.ceil(sequenceWidth));
        const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
        setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
      }
    }, [isVertical]);

    useResizeObserver(updateDimensions, [containerRef, seqRef], [logos, gap, logoHeight, isVertical]);

    useImageLoader(seqRef, updateDimensions, [logos, gap, logoHeight, isVertical]);

    // Drag-to-scrub state, consumed by the animation loop each frame.
    const dragStateRef = useRef({
      active: false,
      pendingDelta: 0,
      releaseVelocity: null,
    });
    const dragPointerRef = useRef({
      lastPos: 0,
      lastTime: 0,
      velocity: 0,
      totalDistance: 0,
    });
    const suppressClickRef = useRef(false);

    const dragAxisPos = useCallback((e) => (isVertical ? e.clientY : e.clientX), [isVertical]);

    const handlePointerDown = useCallback(
      (e) => {
        if (!draggable || !e.isPrimary) return;
        // NOTE: no pointer capture here — a captured pointer retargets the
        // subsequent click event to the container, which would swallow item
        // clicks. Capture starts only once a real drag is detected (below).
        dragStateRef.current.active = true;
        dragStateRef.current.pendingDelta = 0;
        dragStateRef.current.releaseVelocity = null;
        dragPointerRef.current = {
          pointerId: e.pointerId,
          captured: false,
          lastPos: dragAxisPos(e),
          lastTime: e.timeStamp,
          velocity: 0,
          totalDistance: 0,
        };
        suppressClickRef.current = false;
      },
      [draggable, dragAxisPos],
    );

    const handlePointerMove = useCallback(
      (e) => {
        if (!draggable || !dragStateRef.current.active || !e.isPrimary) return;
        const pos = dragAxisPos(e);
        const pointer = dragPointerRef.current;
        const delta = pointer.lastPos - pos; // content follows the finger
        const dt = Math.max(1, e.timeStamp - pointer.lastTime);
        pointer.velocity = (delta / dt) * 1000; // px/s, sign matches offset
        pointer.lastPos = pos;
        pointer.lastTime = e.timeStamp;
        pointer.totalDistance += Math.abs(delta);
        if (pointer.totalDistance > 8 && !pointer.captured) {
          // A real drag: from here on the container owns the pointer (keeps
          // the scrub alive outside its bounds) and the trailing click is void.
          pointer.captured = true;
          suppressClickRef.current = true;
          containerRef.current?.setPointerCapture?.(pointer.pointerId);
        }
        dragStateRef.current.pendingDelta += delta;
      },
      [draggable, dragAxisPos],
    );

    const handlePointerUp = useCallback(
      (e) => {
        if (!draggable || !dragStateRef.current.active) return;
        const pointer = dragPointerRef.current;
        if (pointer.captured) {
          try {
            containerRef.current?.releasePointerCapture?.(pointer.pointerId);
          } catch {
            // Already released (e.g. pointercancel) — nothing to do.
          }
          pointer.captured = false;
        }
        dragStateRef.current.active = false;
        // Hand the throw velocity to the loop for a fling-then-resume.
        dragStateRef.current.releaseVelocity = pointer.velocity;
      },
      [draggable],
    );

    // A click that ends a real drag must not activate the item under the
    // pointer; capture phase runs before the item's own onClick.
    const handleClickCapture = useCallback((e) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        e.preventDefault();
        e.stopPropagation();
      }
    }, []);

    useAnimationLoop(
      trackRef,
      targetVelocity,
      seqWidth,
      seqHeight,
      isHovered,
      effectiveHoverSpeed,
      isVertical,
      dragStateRef,
    );

    const cssVariables = useMemo(
      () => ({
        "--logoloop-gap": `${gap}px`,
        "--logoloop-logoHeight": `${logoHeight}px`,
        ...(fadeOutColor && { "--logoloop-fadeColor": fadeOutColor }),
      }),
      [gap, logoHeight, fadeOutColor],
    );

    const rootClassName = useMemo(
      () =>
        [
          "logoloop",
          isVertical ? "logoloop--vertical" : "logoloop--horizontal",
          fadeOut && "logoloop--fade",
          scaleOnHover && "logoloop--scale-hover",
          draggable && "logoloop--draggable",
          className,
        ]
          .filter(Boolean)
          .join(" "),
      [isVertical, fadeOut, scaleOnHover, draggable, className],
    );

    const handleMouseEnter = useCallback(() => {
      if (effectiveHoverSpeed !== undefined) setIsHovered(true);
    }, [effectiveHoverSpeed]);
    const handleMouseLeave = useCallback(() => {
      if (effectiveHoverSpeed !== undefined) setIsHovered(false);
    }, [effectiveHoverSpeed]);

    const renderLogoItem = useCallback(
      (item, key) => {
        if (renderItem) {
          return (
            <li className="logoloop__item" key={key} role="listitem">
              {renderItem(item, key)}
            </li>
          );
        }
        const isNodeItem = "node" in item;
        const content = isNodeItem ? (
          <span className="logoloop__node" aria-hidden={!!item.href && !item.ariaLabel}>
            {item.node}
          </span>
        ) : (
          <img
            src={item.src}
            srcSet={item.srcSet}
            sizes={item.sizes}
            width={item.width}
            height={item.height}
            alt={item.alt ?? ""}
            title={item.title}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        );
        const itemAriaLabel = isNodeItem ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title);
        const itemContent = item.href ? (
          <a
            className="logoloop__link"
            href={item.href}
            aria-label={itemAriaLabel || "logo link"}
            target="_blank"
            rel="noreferrer noopener"
          >
            {content}
          </a>
        ) : (
          content
        );
        return (
          <li className="logoloop__item" key={key} role="listitem">
            {itemContent}
          </li>
        );
      },
      [renderItem],
    );

    const logoLists = useMemo(
      () =>
        Array.from({ length: copyCount }, (_, copyIndex) => (
          <ul
            className="logoloop__list"
            key={`copy-${copyIndex}`}
            role="list"
            aria-hidden={copyIndex > 0}
            ref={copyIndex === 0 ? seqRef : undefined}
          >
            {logos.map((item, itemIndex) => renderLogoItem(item, `${copyIndex}-${itemIndex}`))}
          </ul>
        )),
      [copyCount, logos, renderLogoItem],
    );

    const containerStyle = useMemo(
      () => ({
        width: isVertical
          ? toCssLength(width) === "100%"
            ? undefined
            : toCssLength(width)
          : (toCssLength(width) ?? "100%"),
        ...cssVariables,
        ...style,
      }),
      [width, cssVariables, style, isVertical],
    );

    return (
      <div
        ref={containerRef}
        className={rootClassName}
        style={containerStyle}
        role="region"
        aria-label={ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
      >
        <div className="logoloop__track" ref={trackRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {logoLists}
        </div>
      </div>
    );
  },
);

LogoLoop.displayName = "LogoLoop";

export default LogoLoop;
