import { useSelector } from "react-redux";

export function useUiChromeVisible() {
  return !useSelector((s) => s.gameState.uiChromeHidden);
}

export function useUiModalOpen(isOpen) {
  const visible = useUiChromeVisible();
  return Boolean(isOpen) && visible;
}
