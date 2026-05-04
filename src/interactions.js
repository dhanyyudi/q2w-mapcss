/*! q2w-interactions | optional vanilla helpers for q2w-mapcss */
(function () {
  "use strict";

  const root = document.documentElement;
  const themeKey = "q2w-theme";

  function setTheme(theme) {
    root.dataset.theme = theme;
    try {
      localStorage.setItem(themeKey, theme);
    } catch {}
  }

  function initThemeToggles() {
    document.querySelectorAll(".q2w-theme-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const current = root.dataset.theme || "light";
        const next = current === "dark" ? "light" : "dark";
        setTheme(next);
      });
    });
  }

  function closeModal(backdrop) {
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.style.display = "none";
  }

  function openModal(backdrop) {
    backdrop.setAttribute("aria-hidden", "false");
    backdrop.style.display = "";
  }

  function initModals() {
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-q2w-modal]");
      if (trigger) {
        const modal = document.getElementById(trigger.dataset.q2wModal);
        if (modal) openModal(modal);
      }

      const closeTrigger = event.target.closest("[data-q2w-close]");
      if (closeTrigger) {
        const backdrop = closeTrigger.closest(".q2w-modal-backdrop");
        if (backdrop) closeModal(backdrop);
      }

      if (event.target.classList.contains("q2w-modal-backdrop")) {
        closeModal(event.target);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      document.querySelectorAll('.q2w-modal-backdrop[aria-hidden="false"]').forEach(closeModal);
    });
  }

  function dismissToast(toast) {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 320);
  }

  function initToasts() {
    document.querySelectorAll(".q2w-toast[data-q2w-duration]").forEach((toast) => {
      const duration = Number.parseInt(toast.dataset.q2wDuration || "4000", 10);
      setTimeout(() => dismissToast(toast), Number.isNaN(duration) ? 4000 : duration);
    });
  }

  function createToast(message, type = "info", duration = 4000) {
    const icons = { success: "✓", warning: "⚠", danger: "✕", info: "i" };
    const toast = document.createElement("div");
    toast.className = `q2w-toast q2w-toast--${type}`;
    toast.style.cssText = "position:fixed;right:24px;bottom:24px;z-index:var(--q2w-z-toast,1000)";
    toast.innerHTML = `<div class="q2w-toast__icon">${icons[type] || icons.info}</div><div><div class="q2w-toast__title">${message}</div></div>`;
    document.body.appendChild(toast);
    setTimeout(() => dismissToast(toast), duration);
    return toast;
  }

  function initTabs() {
    document.querySelectorAll(".q2w-tabs").forEach((group) => {
      const tabs = group.querySelectorAll("[data-q2w-tab]");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const target = tab.dataset.q2wTab;
          tabs.forEach((item) => item.classList.remove("q2w-tab--active", "active"));
          tab.classList.add("q2w-tab--active", "active");
          document.querySelectorAll(`[data-q2w-panel-group="${group.dataset.q2wPanelGroup || "default"}"] [data-q2w-panel]`).forEach((panel) => {
            panel.style.display = panel.dataset.q2wPanel === target ? "" : "none";
          });
        });
      });
    });
  }

  function initSheets() {
    document.querySelectorAll(".q2w-sheet[data-q2w-sheet]").forEach((sheet) => {
      const handle = sheet.querySelector(".q2w-sheet__handle");
      if (!handle) return;
      handle.addEventListener("click", () => {
        sheet.classList.toggle("is-open");
      });
    });
  }

  function coordDisplay(map, target) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!map || !el || typeof map.on !== "function") return;
    map.on("mousemove", (event) => {
      el.textContent = `${event.latlng.lat.toFixed(5)}, ${event.latlng.lng.toFixed(5)}`;
    });
  }

  function bindLayerPanel(map, layerMap) {
    if (!map || !layerMap) return;
    document.querySelectorAll(".q2w-layer[data-layer-id]").forEach((row) => {
      const id = row.dataset.layerId;
      const check = row.querySelector(".q2w-layer__check");
      const layer = layerMap[id];
      if (!layer || !check) return;
      row.addEventListener("click", () => {
        const isOn = check.classList.contains("q2w-layer__check--on");
        if (isOn) {
          map.removeLayer(layer);
          check.classList.remove("q2w-layer__check--on");
          check.textContent = "";
          return;
        }
        map.addLayer(layer);
        check.classList.add("q2w-layer__check--on");
        check.textContent = "✓";
      });
    });
  }

  function initPopupClose() {
    document.addEventListener("click", (event) => {
      const closeButton = event.target.closest(".q2w-popup__close");
      if (!closeButton) return;
      const popup = closeButton.closest(".q2w-popup");
      if (popup) popup.style.display = "none";
    });
  }

  function init() {
    initThemeToggles();
    initModals();
    initToasts();
    initTabs();
    initSheets();
    initPopupClose();
  }

  window.q2w = window.q2w || {};
  window.q2w.toast = createToast;
  window.q2w.coordDisplay = coordDisplay;
  window.q2w.bindLayerPanel = bindLayerPanel;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
