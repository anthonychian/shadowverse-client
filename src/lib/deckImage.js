import React from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import DeckShareCard, {
  SHARE_CARD_WIDTH,
} from "../components/deckbuilder/DeckShareCard";

// Produces the JPEG that a shared deck's link unfurls with, by rendering
// DeckShareCard off-screen at a fixed width and screenshotting it. Rendering a
// dedicated component (rather than capturing whatever preview happens to be on
// screen) keeps the output identical on phones and desktops, and keeps the
// door open to generating the same layout server-side later.

const BACKGROUND = "#0d1017";
const JPEG_QUALITY = 0.85;

const nextFrame = () =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()));

// Resolve once every <img> in the subtree has loaded or given up. Listeners are
// added rather than assigned to onload/onerror so the components' own onError
// art fallbacks keep working; a card that falls back starts loading a second
// source, which the settle loop below picks up.
const imagesSettled = (node) =>
  Promise.all(
    [...node.querySelectorAll("img")].map(
      (img) =>
        img.complete ||
        new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        }),
    ),
  );

const PASSES = 3;

export const renderDeckShareImage = async ({ deck, ownerName, url }) => {
  const host = document.createElement("div");
  // Off-screen but laid out: html2canvas can't measure display:none, and
  // negative positioning avoids any flash on top of the real page.
  host.style.cssText =
    "position:fixed;left:-20000px;top:0;width:" +
    SHARE_CARD_WIDTH +
    "px;pointer-events:none;z-index:-1;";
  document.body.appendChild(host);

  const root = createRoot(host);
  try {
    root.render(
      <DeckShareCard deck={deck} ownerName={ownerName} url={url} />,
    );

    // createRoot commits asynchronously, so wait for the card to actually be in
    // the DOM before measuring anything.
    for (let i = 0; i < 30 && !host.firstChild; i++) await nextFrame();
    if (!host.firstChild) throw new Error("Could not render the deck preview.");

    // Then wait out the card art (and any art fallbacks that kick off a second
    // load) plus the web fonts the layout is measured with.
    for (let i = 0; i < PASSES; i++) {
      await imagesSettled(host);
      await nextFrame();
    }
    if (document.fonts?.ready) await document.fonts.ready;

    const canvas = await html2canvas(host.firstChild, {
      backgroundColor: BACKGROUND,
      scale: 1,
      useCORS: true,
      logging: false,
      width: SHARE_CARD_WIDTH,
      windowWidth: SHARE_CARD_WIDTH,
    });

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Could not encode preview.")),
        "image/jpeg",
        JPEG_QUALITY,
      );
    });
  } finally {
    // Unmounting synchronously from inside a React lifecycle is disallowed;
    // this runs from an event handler, so defer it a tick to be safe.
    setTimeout(() => {
      root.unmount();
      host.remove();
    }, 0);
  }
};
