import { useSelector } from "react-redux";

export function useUiChromeVisible() {
  return !useSelector((s) => s.gameState.uiChromeHidden);
}

/** @param {boolean} isOpen
 *  @param {{ persistWhenChromeHidden?: boolean }} [options]
 */
export function useUiModalOpen(isOpen, { persistWhenChromeHidden = false } = {}) {
  const visible = useUiChromeVisible();
  if (persistWhenChromeHidden) return Boolean(isOpen);
  return Boolean(isOpen) && visible;
}
