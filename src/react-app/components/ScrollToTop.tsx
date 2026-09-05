import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * React Router keeps the scroll position across navigations. This resets it to
 * the top on every route change, or scrolls to the #anchor when the URL has one
 * (e.g. "/#pricing" from the header nav on another page).
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      // wait a frame so the target section is mounted after a route change
      const t = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
        else window.scrollTo(0, 0);
      }, 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
