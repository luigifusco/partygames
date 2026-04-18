// Lightweight DOM-based move animation engine for the battle scene.
// Creates absolutely-positioned elements, animates via CSS transitions, then removes them.

import type { MoveAnimConfig } from '../data/moveAnimations';
import { BASE_PATH } from '../config';

interface Rect {
  x: number; // center x relative to arena
  y: number; // center y relative to arena
}

function getCenter(el: HTMLElement, arena: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  const a = arena.getBoundingClientRect();
  return {
    x: r.left + r.width / 2 - a.left,
    y: r.top + r.height / 2 - a.top,
  };
}

function createFxImg(arena: HTMLElement, sprite: string, x: number, y: number, size = 40): HTMLImageElement {
  const img = document.createElement('img');
  img.src = `${BASE_PATH}/fx/${sprite}`;
  img.className = 'fx-particle';
  img.style.cssText = `
    position: absolute;
    left: ${x - size / 2}px;
    top: ${y - size / 2}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    transition: all 0.3s ease-out;
    filter: drop-shadow(0 0 6px rgba(255,255,255,0.65));
    will-change: transform, opacity, left, top;
  `;
  arena.appendChild(img);
  return img;
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function animateProjectile(
  arena: HTMLElement, sprite: string, from: Rect, to: Rect, count: number, duration = 320
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  for (let i = 0; i < count; i++) {
    const img = createFxImg(arena, sprite, from.x, from.y);
    // Slight per-projectile spread + arc
    const spread = (Math.random() - 0.5) * 24;
    const arcLift = -Math.min(60, Math.abs(dx) * 0.18 + 24);
    void img.offsetWidth;
    img.style.opacity = '1';
    img.style.transition = `all ${duration}ms cubic-bezier(.45,.05,.55,.95), transform ${duration}ms linear`;
    img.style.left = `${to.x - 20 + spread}px`;
    img.style.top  = `${to.y - 20}px`;
    img.style.transform = `rotate(${(dx >= 0 ? 1 : -1) * 540}deg)`;
    // Mid-flight peak via a separate transition timing isn't available with
    // top-only animation, so we cheat: temporarily lift to arcLift then drop.
    setTimeout(() => { img.style.top = `${from.y + arcLift}px`; }, 10);
    setTimeout(() => { img.style.top = `${to.y - 20}px`; }, duration * 0.5);
    await sleep(Math.max(60, duration * 0.45));
  }
  await sleep(duration * 0.4);
  arena.querySelectorAll('img.fx-particle').forEach((el) => {
    const e = el as HTMLElement;
    e.style.opacity = '0';
    e.style.transform += ' scale(0.6)';
    setTimeout(() => el.remove(), 220);
  });
  await sleep(220);
}

async function animateContact(
  attackerEl: HTMLElement, defenderEl: HTMLElement, arena: HTMLElement, sprite?: string
) {
  const defCenter = getCenter(defenderEl, arena);

  // Lunge attacker toward defender
  const atkRect = attackerEl.getBoundingClientRect();
  const defRect = defenderEl.getBoundingClientRect();
  const dx = (defRect.left - atkRect.left) * 0.3;
  const dy = (defRect.top - atkRect.top) * 0.3;

  attackerEl.style.transition = 'transform 0.15s ease-in';
  attackerEl.style.transform += ` translate(${dx}px, ${dy}px)`;
  await sleep(150);

  // Show impact sprite at defender
  if (sprite) {
    const img = createFxImg(arena, sprite, defCenter.x, defCenter.y, 48);
    void img.offsetWidth;
    img.style.opacity = '1';
    img.style.transform = 'scale(1.3)';
    await sleep(200);
    img.style.opacity = '0';
    await sleep(150);
    img.remove();
  }

  // Return attacker
  attackerEl.style.transition = 'transform 0.15s ease-out';
  // Reset to just the base transform (scaleX for left side)
  const baseTransform = attackerEl.dataset.baseTransform || '';
  attackerEl.style.transform = baseTransform;
  await sleep(150);
}

async function animateBeam(
  arena: HTMLElement, sprite: string, from: Rect, to: Rect, count: number
) {
  const steps = count;
  for (let i = 0; i < steps; i++) {
    const t = (i + 1) / (steps + 1);
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    const img = createFxImg(arena, sprite, x, y, 36);
    void img.offsetWidth;
    img.style.opacity = '0.9';
    img.style.transform = 'scale(1.2)';
    await sleep(80);
  }
  await sleep(200);
  // Clean up beam elements
  arena.querySelectorAll(`img[src^="${BASE_PATH}/fx/"]`).forEach(el => {
    (el as HTMLElement).style.opacity = '0';
    setTimeout(() => el.remove(), 200);
  });
  await sleep(200);
}

async function animateAoe(
  arena: HTMLElement, defenderEl: HTMLElement, sprite: string, count: number
) {
  const center = getCenter(defenderEl, arena);
  const elements: HTMLImageElement[] = [];

  for (let i = 0; i < count; i++) {
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = (Math.random() - 0.5) * 60;
    const img = createFxImg(arena, sprite, center.x + offsetX, center.y + offsetY, 44);
    elements.push(img);
    void img.offsetWidth;
    img.style.opacity = '0.9';
    img.style.transform = 'scale(1.2)';
    await sleep(100);
  }
  await sleep(300);
  for (const img of elements) {
    img.style.opacity = '0';
    img.style.transform = 'scale(0.5)';
  }
  await sleep(250);
  elements.forEach(img => img.remove());
}

function flashBackground(arena: HTMLElement, color: string, duration: number) {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: absolute;
    inset: 0;
    background: ${color};
    opacity: 0;
    pointer-events: none;
    z-index: 5;
    transition: opacity ${Math.min(duration / 2, 150)}ms ease-in;
  `;
  arena.appendChild(flash);
  void flash.offsetWidth;
  flash.style.opacity = '0.3';
  setTimeout(() => {
    flash.style.transition = `opacity ${Math.min(duration / 2, 200)}ms ease-out`;
    flash.style.opacity = '0';
    setTimeout(() => flash.remove(), 250);
  }, duration / 2);
}

function shakeElement(el: HTMLElement, intensity: number, duration = 400) {
  const baseTransform = el.dataset.baseTransform || '';
  const steps = 6;
  const stepDuration = duration / steps;
  let i = 0;
  const interval = setInterval(() => {
    if (i >= steps) {
      el.style.transform = baseTransform;
      clearInterval(interval);
      return;
    }
    const dx = (Math.random() - 0.5) * intensity * 2;
    const dy = (Math.random() - 0.5) * intensity;
    el.style.transform = `${baseTransform} translate(${dx}px, ${dy}px)`;
    i++;
  }, stepDuration);
}

/** Briefly flash the defender white (hit feedback) and apply a tiny knockback
 *  in the direction of the attacker → defender vector. Crit makes both bigger. */
export function animateHit(
  defenderEl: HTMLElement,
  attackerEl: HTMLElement | null,
  crit = false,
) {
  if (!defenderEl) return;
  const baseTransform = defenderEl.dataset.baseTransform || '';

  // Direction vector (attacker → defender), normalised to ~1 unit
  let dirX = 0, dirY = 0;
  if (attackerEl) {
    const a = attackerEl.getBoundingClientRect();
    const d = defenderEl.getBoundingClientRect();
    const vx = (d.left + d.width / 2) - (a.left + a.width / 2);
    const vy = (d.top  + d.height / 2) - (a.top  + a.height / 2);
    const len = Math.hypot(vx, vy) || 1;
    dirX = vx / len;
    dirY = vy / len;
  }
  const kick = crit ? 14 : 8;

  // Apply hit-flash class for white tint + knockback
  defenderEl.classList.add(crit ? 'fx-hit-flash-crit' : 'fx-hit-flash');
  defenderEl.style.transition = 'transform 90ms ease-out';
  defenderEl.style.transform = `${baseTransform} translate(${dirX * kick}px, ${dirY * kick}px)`;

  setTimeout(() => {
    defenderEl.style.transition = 'transform 180ms cubic-bezier(.34,1.56,.64,1)';
    defenderEl.style.transform = baseTransform;
  }, 110);
  setTimeout(() => {
    defenderEl.classList.remove('fx-hit-flash');
    defenderEl.classList.remove('fx-hit-flash-crit');
  }, 280);
}

/** Floating stat-change indicator: chevron arrows + glow ring around the
 *  affected pokemon. Rises (up) or falls (down), scaled by stage count. */
export async function animateStatChange(
  arena: HTMLElement,
  targetEl: HTMLElement,
  direction: 'up' | 'down',
  stages: number = 1,
): Promise<void> {
  if (!arena || !targetEl) return;
  const center = getCenter(targetEl, arena);
  const isUp = direction === 'up';
  const cap = Math.min(3, Math.max(1, Math.abs(stages)));

  // Glow ring underneath the pokemon
  const ring = document.createElement('div');
  ring.className = `fx-stat-ring fx-stat-ring-${isUp ? 'up' : 'down'}`;
  ring.style.left = `${center.x - 60}px`;
  ring.style.top  = `${center.y - 30}px`;
  arena.appendChild(ring);

  // Chevron arrows: more arrows = stronger boost
  const arrows: HTMLElement[] = [];
  const arrowCount = cap * 3;
  for (let i = 0; i < arrowCount; i++) {
    const a = document.createElement('div');
    a.className = `fx-stat-arrow fx-stat-arrow-${isUp ? 'up' : 'down'}`;
    a.textContent = isUp ? '▲' : '▼';
    const offsetX = (Math.random() - 0.5) * 80;
    a.style.left = `${center.x + offsetX - 8}px`;
    a.style.top  = `${center.y - 4}px`;
    a.style.animationDelay = `${i * 60}ms`;
    a.style.fontSize = `${14 + cap * 4}px`;
    arena.appendChild(a);
    arrows.push(a);
  }

  await sleep(900);
  ring.remove();
  arrows.forEach((a) => a.remove());
}

/** Visual ring + particles when a status condition is inflicted. */
export async function animateStatusInflict(
  arena: HTMLElement,
  targetEl: HTMLElement,
  status: string,
): Promise<void> {
  if (!arena || !targetEl) return;
  const center = getCenter(targetEl, arena);

  const ring = document.createElement('div');
  ring.className = `fx-status-ring fx-status-${status}`;
  ring.style.left = `${center.x - 50}px`;
  ring.style.top  = `${center.y - 50}px`;
  arena.appendChild(ring);

  // A few themed particles around the target
  const particles: HTMLElement[] = [];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = `fx-status-particle fx-status-particle-${status}`;
    const angle = (i / 8) * Math.PI * 2;
    const r = 35;
    p.style.left = `${center.x + Math.cos(angle) * r - 6}px`;
    p.style.top  = `${center.y + Math.sin(angle) * r - 6}px`;
    p.style.animationDelay = `${i * 40}ms`;
    arena.appendChild(p);
    particles.push(p);
  }

  await sleep(800);
  ring.remove();
  particles.forEach((p) => p.remove());
}

export async function runMoveAnimation(
  config: MoveAnimConfig,
  arena: HTMLElement,
  attackerEl: HTMLElement | null,
  defenderEl: HTMLElement | null,
): Promise<void> {
  if (!arena) return;

  const shakeAmount = config.shakeIntensity ?? 4;
  const count = config.count ?? 1;

  // Background flash
  if (config.bgFlash) {
    flashBackground(arena, config.bgFlash, config.bgFlashDuration ?? 300);
  }

  if (config.style === 'self') {
    // Weather / self-buff — just the flash is enough
    await sleep(config.bgFlashDuration ?? 300);
    return;
  }

  if (!attackerEl || !defenderEl) {
    await sleep(400);
    return;
  }

  const atkCenter = getCenter(attackerEl, arena);
  const defCenter = getCenter(defenderEl, arena);

  switch (config.style) {
    case 'projectile':
      if (config.sprite) {
        await animateProjectile(arena, config.sprite, atkCenter, defCenter, count);
      }
      shakeElement(defenderEl, shakeAmount);
      break;

    case 'contact':
      await animateContact(attackerEl, defenderEl, arena, config.sprite);
      shakeElement(defenderEl, shakeAmount);
      break;

    case 'beam':
      if (config.sprite) {
        await animateBeam(arena, config.sprite, atkCenter, defCenter, count);
      }
      shakeElement(defenderEl, shakeAmount);
      break;

    case 'aoe':
      if (config.sprite) {
        await animateAoe(arena, defenderEl, config.sprite, count);
      }
      shakeElement(defenderEl, shakeAmount, 500);
      break;

    default:
      shakeElement(defenderEl, shakeAmount);
      break;
  }

  await sleep(200);
}
