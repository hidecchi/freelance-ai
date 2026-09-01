export type CylinderSlide = {
  src: string;
  alt: string;
};

export function mountCylinderSlider(
  root: HTMLElement,
  slides: CylinderSlide[],
) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = root.querySelector<HTMLElement>("[data-cylinder]");
  if (!stage || slides.length === 0) return () => {};

  const count = slides.length;
  const theta = 360 / count;

  stage.innerHTML = slides
    .map(
      (slide, i) => `
      <figure class="cylinder-card" style="--i:${i}">
        <img src="${slide.src}" alt="${slide.alt}" draggable="false" />
      </figure>
    `,
    )
    .join("");

  const setRadius = () => {
    const card = stage.querySelector<HTMLElement>(".cylinder-card");
    if (!card) return;
    const width = card.offsetWidth || 180;
    // Leave a gap between cards so the form reads clearly as a cylinder.
    const radius = Math.round((width * 1.28) / (2 * Math.tan(Math.PI / count)));
    stage.style.setProperty("--radius", `${radius}px`);
  };
  setRadius();

  let rotation = 0;
  let velocity = 0;
  let autoSpeed = reduced ? 0 : 0.012;
  let dragging = false;
  let lastX = 0;
  let raf = 0;
  let paused = false;

  const clampVelocity = (v: number) => Math.max(-0.45, Math.min(0.45, v));

  const onPointerDown = (event: PointerEvent) => {
    dragging = true;
    paused = true;
    lastX = event.clientX;
    velocity = 0;
    root.classList.add("is-dragging");
    root.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    lastX = event.clientX;
    const delta = dx * 0.18;
    rotation += delta;
    velocity = clampVelocity(delta * 0.35);
  };

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove("is-dragging");
    window.setTimeout(() => {
      if (!dragging) paused = false;
    }, 900);
  };

  root.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  const onVisibility = () => {
    paused = document.hidden;
  };
  document.addEventListener("visibilitychange", onVisibility);

  const ro = new ResizeObserver(setRadius);
  ro.observe(root);

  const tick = () => {
    if (!reduced) {
      if (!dragging && !paused) rotation -= autoSpeed;
      else if (!dragging) {
        rotation -= velocity;
        velocity *= 0.94;
        if (Math.abs(velocity) < 0.002) velocity = 0;
      }
      stage.style.setProperty("--rot", `${rotation}deg`);
    } else {
      stage.style.setProperty("--rot", "0deg");
    }
    raf = requestAnimationFrame(tick);
  };

  if (reduced) {
    stage.style.setProperty("--rot", "0deg");
    stage.style.setProperty("--count", String(count));
    stage.style.setProperty("--theta", `${theta}deg`);
  } else {
    stage.style.setProperty("--count", String(count));
    stage.style.setProperty("--theta", `${theta}deg`);
    raf = requestAnimationFrame(tick);
  }

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    root.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
