"use strict";

/* ===== HELPERS ===== */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ===== REVIEW CAROUSEL ===== */
const revs = [...$$("#revDeck .rev")];
const dotsWrap = $("#revDots");
let revIdx = 0;
let revTimer = null;

revs.forEach((_, i) => {
  const b = document.createElement("button");
  b.className = "revDot";
  b.setAttribute("aria-label", "Review " + (i + 1));
  b.onclick = () => {
    go(i);
    reset();
  };
  dotsWrap.appendChild(b);
});

function go(i) {
  revIdx = (i + revs.length) % revs.length;
  revs.forEach((r, k) => r.classList.toggle("on", k === revIdx));
  dotsWrap.querySelectorAll(".revDot").forEach((d, k) =>
    d.classList.toggle("on", k === revIdx)
  );
}

function reset() {
  clearInterval(revTimer);
  revTimer = setInterval(() => go(revIdx + 1), 5200);
}

go(0);
reset();

const rw = document.querySelector(".revWrap");
if (rw) {
  rw.addEventListener("mouseenter", () => clearInterval(revTimer));
  rw.addEventListener("mouseleave", reset);
}

/* ===== REVEAL ON SCROLL ===== */
function forceRevealAll() {
  $$(".reveal").forEach((el) => {
    el.classList.remove("will");
    el.classList.add("in");
  });
}

try {
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("will");
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );

    $$(".reveal").forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      el.classList.add("will");
      io.observe(el);
    });
  } else {
    forceRevealAll();
  }
} catch (e) {
  forceRevealAll();
}

window.addEventListener("error", forceRevealAll);

/* ===== TERMINAL RE-ANIMATION ON SCROLL ===== */
if ("IntersectionObserver" in window) {
  const tb = document.querySelector(".terminal-body");
  if (tb) {
    const io2 = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            tb.querySelectorAll(".line").forEach((l) => {
              l.style.animation = "none";
              void l.offsetWidth;
              l.style.animation = "";
            });
            io2.unobserve(tb);
          }
        }),
      { threshold: 0.35 }
    );
    io2.observe(tb);
  }
}

/* ===== DYNAMIC YEAR ===== */
const yr = $("#year");
if (yr) yr.textContent = new Date().getFullYear();

/* ===== SMOOTH GAME ROW CLICK (optional enhancement) ===== */
/* If you want entire row clickable except repo button, you'd handle it here.
   Currently title and repo button are separate links — that's intentional
   to avoid nested anchors and keep GitHub links independent. */

/* ===== KEYBOARD NAVIGATION FOR REVIEW DOTS ===== */
document.addEventListener("keydown", (e) => {
  if (!dotsWrap) return;
  const dots = [...dotsWrap.querySelectorAll(".revDot")];
  const active = dots.findIndex((d) => d.classList.contains("on"));

  if (e.key === "ArrowRight") {
    e.preventDefault();
    go(active + 1);
    reset();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    go(active - 1);
    reset();
  }
});

/* ===== TOUCH SWIPE FOR REVIEWS ===== */
let touchStartX = 0;
let touchEndX = 0;

const revDeck = $("#revDeck");
if (revDeck) {
  revDeck.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  revDeck.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true }
  );
}

function handleSwipe() {
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      go(revIdx + 1);
    } else {
      go(revIdx - 1);
    }
    reset();
  }
}

/* ===== HUB-STYLE GAME ROW ACCENT GLOW ON HOVER ===== */
$$(".gRow").forEach((row) => {
  row.addEventListener("mouseenter", () => {
    const acc = getComputedStyle(row).getPropertyValue("--acc").trim();
    row.style.boxShadow = `inset 0 0 0 1px ${acc}22, 0 0 30px ${acc}11`;
  });

  row.addEventListener("mouseleave", () => {
    row.style.boxShadow = "none";
  });
});

/* ===== LAZY LOADING FALLBACK FOR AVATARS ===== */
$$(".avatar img").forEach((img) => {
  img.addEventListener("error", () => {
    img.closest(".avatar")?.classList.add("fb");
  });
});

/* ===== STATS COUNTER ANIMATION (subtle, on first view) ===== */
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const b = entry.target.querySelector("b");
        if (!b || b.dataset.animated) return;
        b.dataset.animated = "true";

        const text = b.textContent.trim();
        // Only animate pure numbers
        if (/^\d+$/.test(text)) {
          const target = parseInt(text, 10);
          let current = 0;
          const step = Math.max(1, Math.floor(target / 20));
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            b.textContent = String(current).padStart(2, "0");
          }, 40);
        }
      }
    });
  },
  { threshold: 0.5 }
);

$$(".stat").forEach((s) => statObserver.observe(s));