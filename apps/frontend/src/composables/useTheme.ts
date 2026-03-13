import { ref, watch, onMounted } from "vue";

type Theme = "light" | "dark";

const theme = ref<Theme>("light");

export function useTheme() {
  function apply(t: Theme) {
    theme.value = t;
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  }

  function toggle() {
    apply(theme.value === "light" ? "dark" : "light");
  }

  function init() {
    const saved = localStorage.getItem("theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    apply(saved || preferred);
  }

  return { theme, toggle, init, apply };
}
