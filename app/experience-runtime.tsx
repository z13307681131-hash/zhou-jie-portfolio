"use client";

import { useEffect } from "react";

export function ExperienceRuntime() {
  useEffect(() => {
    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>(".hero");
    const passage = document.querySelector<HTMLElement>("[data-depth-passage]");
    const depthStage = passage?.querySelector<HTMLElement>("[data-depth-stage]");
    const depthScenes = Array.from(
      passage?.querySelectorAll<HTMLElement>("[data-depth-scene]") ?? [],
    );
    const depthNumber = passage?.querySelector<HTMLElement>("[data-depth-stage-number]");
    const depthLabel = passage?.querySelector<HTMLElement>("[data-depth-stage-label]");
    const depthTitle = passage?.querySelector<HTMLElement>("[data-depth-stage-title]");
    const depthPercent = passage?.querySelector<HTMLElement>("[data-depth-percent]");
    const depthMeter = passage?.querySelector<HTMLElement>("[data-depth-meter]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pointerFrame = 0;
    let scrollFrame = 0;
    let activeChapter = -1;
    root.classList.add("motion-ready");

    const clamp = (value: number, minimum = 0, maximum = 1) =>
      Math.min(maximum, Math.max(minimum, value));
    const smoothstep = (start: number, end: number, value: number) => {
      const progress = clamp((value - start) / (end - start));
      return progress * progress * (3 - 2 * progress);
    };
    const chapters = [
      { at: 0, no: "00", label: "IDENTITY / INTRODUCTION", title: "ZHOU JIE — VISUAL DESIGNER" },
      { at: 0.11, no: "01", label: "EDITORIAL / CATALOG", title: "AOLEAO GLOBAL CATALOG" },
      { at: 0.32, no: "02", label: "BRAND / SYSTEM", title: "VISUAL IDENTITY SYSTEM" },
      { at: 0.53, no: "03", label: "COMMERCE / CAMPAIGN", title: "E-COMMERCE VISUAL SERIES" },
      { at: 0.74, no: "04", label: "DIGITAL / EXPERIENCE", title: "IP & INTERACTIVE DESIGN" },
      { at: 0.91, no: "05", label: "SELECTED WORK / INDEX", title: "ENTER THE COMPLETE ARCHIVE" },
    ];

    const updatePointer = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reduceMotion) return;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const px = event.clientX / window.innerWidth;
        const py = event.clientY / window.innerHeight;
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
        hero?.style.setProperty("--hero-x", `${(px - 0.5) * 2}`);
        hero?.style.setProperty("--hero-y", `${(py - 0.5) * 2}`);
      });
    };

    const renderScroll = () => {
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maximum > 0 ? window.scrollY / maximum : 0;
      root.style.setProperty("--scroll-progress", `${progress}`);

      if (passage && depthStage && !reduceMotion) {
        const passageRect = passage.getBoundingClientRect();
        const distance = Math.max(1, passage.offsetHeight - depthStage.clientHeight);
        const depthProgress = clamp(-passageRect.top / distance);
        const introOpacity = 1 - smoothstep(0.035, 0.19, depthProgress);
        const journeyOpacity = smoothstep(0.055, 0.15, depthProgress) *
          (1 - smoothstep(0.88, 0.985, depthProgress));
        const captionOpacity = smoothstep(0.09, 0.17, depthProgress) *
          (1 - smoothstep(0.83, 0.93, depthProgress));
        const arrivalOpacity = smoothstep(0.85, 0.97, depthProgress);

        depthStage.style.setProperty("--depth-progress", depthProgress.toFixed(4));
        depthStage.style.setProperty("--intro-opacity", introOpacity.toFixed(4));
        depthStage.style.setProperty("--journey-opacity", journeyOpacity.toFixed(4));
        depthStage.style.setProperty("--caption-opacity", captionOpacity.toFixed(4));
        depthStage.style.setProperty("--arrival-opacity", arrivalOpacity.toFixed(4));

        depthScenes.forEach((scene, index) => {
          const start = Number(scene.dataset.start ?? 0);
          const end = Number(scene.dataset.end ?? 1);
          const localProgress = clamp((depthProgress - start) / Math.max(0.01, end - start));
          const sceneOpacity = Math.pow(Math.sin(localProgress * Math.PI), 0.58);
          const direction = index % 2 === 0 ? -1 : 1;
          const horizontalTravel = Math.min(window.innerWidth * 0.19, 300);
          const verticalTravel = Math.min(window.innerHeight * 0.21, 190);
          const sceneX = direction * (1 - localProgress) * horizontalTravel;
          const sceneY = (0.48 - localProgress) * verticalTravel + (index % 2 ? 24 : -18);
          const sceneZ = -1050 + localProgress * 1900;
          const sceneRotate = direction * (1 - localProgress) * -10;
          const sceneScale = 0.78 + localProgress * 0.17;
          const sceneKey = "abcd"[index] ?? "a";

          scene.style.setProperty("--scene-opacity", sceneOpacity.toFixed(4));
          scene.style.setProperty("--scene-x", `${sceneX.toFixed(2)}px`);
          scene.style.setProperty("--scene-y", `${sceneY.toFixed(2)}px`);
          scene.style.setProperty("--scene-z", `${sceneZ.toFixed(2)}px`);
          scene.style.setProperty("--scene-rotate", `${sceneRotate.toFixed(2)}deg`);
          scene.style.setProperty("--scene-scale", sceneScale.toFixed(4));
          depthStage.style.setProperty(`--scene-${sceneKey}`, sceneOpacity.toFixed(4));
        });

        let nextChapter = 0;
        chapters.forEach((chapter, index) => {
          if (depthProgress >= chapter.at) nextChapter = index;
        });
        if (nextChapter !== activeChapter) {
          activeChapter = nextChapter;
          const chapter = chapters[activeChapter];
          if (depthNumber) depthNumber.textContent = chapter.no;
          if (depthLabel) depthLabel.textContent = chapter.label;
          if (depthTitle) depthTitle.textContent = chapter.title;
          depthStage.dataset.depthChapter = `${activeChapter}`;
        }

        if (depthPercent) depthPercent.textContent = `${Math.round(depthProgress * 100)}`.padStart(2, "0");
        if (depthMeter) depthMeter.style.transform = `scaleY(${depthProgress})`;
      }

      scrollFrame = 0;
    };

    const updateScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(renderScroll);
    };

    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 40px" },
    );
    reveals.forEach((element) => observer.observe(element));

    const updateTilt = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reduceMotion) return;
      const card = (event.target as Element | null)?.closest<HTMLElement>("[data-tilt]");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${x * 1.6}deg`);
      card.style.setProperty("--tilt-y", `${y * -1.6}deg`);
      card.style.setProperty("--card-x", `${(x + 0.5) * 100}%`);
      card.style.setProperty("--card-y", `${(y + 0.5) * 100}%`);
    };
    const resetTilt = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest<HTMLElement>("[data-tilt]");
      if (!card || card.contains(event.relatedTarget as Node | null)) return;
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    document.addEventListener("pointermove", updateTilt, { passive: true });
    document.addEventListener("pointerout", resetTilt, { passive: true });
    renderScroll();

    return () => {
      cancelAnimationFrame(pointerFrame);
      cancelAnimationFrame(scrollFrame);
      observer.disconnect();
      root.classList.remove("motion-ready");
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      document.removeEventListener("pointermove", updateTilt);
      document.removeEventListener("pointerout", resetTilt);
    };
  }, []);

  return <div className="scroll-progress" aria-hidden="true" />;
}
