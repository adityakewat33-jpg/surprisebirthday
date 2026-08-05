// Visual Effects Engine - HTML5 Canvas Particle System

let canvas;
let ctx;
let width;
let height;
let animationFrameId;

// Particle pools
const stars = [];
const petals = [];
const hearts = [];
const butterflies = [];
const bokehs = [];
const fireworks = [];

// Performance / Behavior limits
const MAX_STARS = 45;
const MAX_PETALS = 25;
const MAX_HEARTS = 15;
const MAX_BUTTERFLIES = 4;
const MAX_BOKEHS = 10;

// Reduced motion setting
let isReducedMotion = false;

// Initialize Background Effects
function initEffects() {
  canvas = document.getElementById('effects-canvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  
  // Check user preference for reduced motion
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  isReducedMotion = motionQuery.matches;
  motionQuery.addEventListener('change', (e) => {
    isReducedMotion = e.matches;
  });

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize pools
  initStars();
  initBokehs();
  
  // Continuously spawn petals and hearts (if not reduced motion)
  if (!isReducedMotion) {
    // Fill initial pools
    for (let i = 0; i < 15; i++) spawnPetal(true);
    for (let i = 0; i < 8; i++) spawnHeart(true);
    for (let i = 0; i < 3; i++) spawnButterfly(true);

    // Spawn loops
    setInterval(() => {
      if (petals.length < MAX_PETALS) spawnPetal(false);
    }, 1500);

    setInterval(() => {
      if (hearts.length < MAX_HEARTS) spawnHeart(false);
    }, 2500);

    setInterval(() => {
      if (butterflies.length < MAX_BUTTERFLIES) spawnButterfly(false);
    }, 8000);
  }

  // Start frame loop
  animate();
}

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

// --- STARS ---
function initStars() {
  for (let i = 0; i < MAX_STARS; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.9, // Avoid bottom region
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random(),
      twinkleSpeed: 0.01 + Math.random() * 0.02
    });
  }
}

function drawStars() {
  ctx.fillStyle = '#FFFFFF';
  stars.forEach((star) => {
    // Twinkle opacity oscillation
    if (!isReducedMotion) {
      star.opacity += star.twinkleSpeed;
      if (star.opacity > 1 || star.opacity < 0) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }
    }
    ctx.globalAlpha = Math.max(0.1, star.opacity);
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// --- BOKEH LIGHTS ---
function initBokehs() {
  const colors = ['rgba(255, 192, 203, 0.08)', 'rgba(233, 213, 255, 0.08)', 'rgba(255, 230, 210, 0.06)'];
  for (let i = 0; i < MAX_BOKEHS; i++) {
    bokehs.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 60 + Math.random() * 90,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

function drawBokehs() {
  bokehs.forEach((b) => {
    if (!isReducedMotion) {
      b.x += b.vx;
      b.y += b.vy;

      // Bounce boundaries
      if (b.x < -b.radius) b.x = width + b.radius;
      if (b.x > width + b.radius) b.x = -b.radius;
      if (b.y < -b.radius) b.y = height + b.radius;
      if (b.y > height + b.radius) b.y = -b.radius;
    }

    ctx.globalAlpha = 1.0;
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
    grad.addColorStop(0, b.color);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

// --- FLOWER PETALS ---
function spawnPetal(initial = false) {
  petals.push({
    x: Math.random() * width,
    y: initial ? Math.random() * height : -20,
    size: Math.random() * 8 + 6,
    angle: Math.random() * Math.PI * 2,
    spinSpeed: (Math.random() - 0.5) * 0.03,
    vx: (Math.random() * 0.4) + 0.3, // Slow drift to the right
    vy: (Math.random() * 0.6) + 0.5, // Slow fall speed
    wobble: Math.random() * Math.PI,
    wobbleSpeed: 0.01 + Math.random() * 0.02,
    color: Math.random() > 0.4 ? 'rgba(248, 175, 203, 0.45)' : 'rgba(255, 192, 203, 0.4)' // Rose vs Soft pink
  });
}

function drawPetals() {
  petals.forEach((p, idx) => {
    if (!isReducedMotion) {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.wobble) * 0.3; // Sideways sway
      p.wobble += p.wobbleSpeed;
      p.angle += p.spinSpeed;
    }

    // Clean out bounds
    if (p.y > height + 20 || p.x > width + 20) {
      petals.splice(idx, 1);
      return;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 1.0;
    
    // Draw an organic petal shape (squeezed ellipse)
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// --- HEARTS ---
function spawnHeart(initial = false) {
  hearts.push({
    x: Math.random() * width,
    y: initial ? Math.random() * height : height + 30,
    size: Math.random() * 12 + 8,
    vy: -((Math.random() * 0.5) + 0.4), // Rising speed
    opacity: initial ? Math.random() * 0.7 + 0.1 : 0.8,
    wobble: Math.random() * Math.PI,
    wobbleSpeed: 0.02 + Math.random() * 0.02,
    color: `rgba(248, 175, 203, ${Math.random() * 0.3 + 0.3})`
  });
}

function drawHeartShape(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
  ctx.bezierCurveTo(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
  ctx.fill();
}

function drawHearts() {
  hearts.forEach((h, idx) => {
    if (!isReducedMotion) {
      h.y += h.vy;
      h.x += Math.sin(h.wobble) * 0.4;
      h.wobble += h.wobbleSpeed;
    }

    // Clean out bounds or fade out near the top
    if (h.y < -30) {
      hearts.splice(idx, 1);
      return;
    }

    // Subtle fade as they rise higher
    const finalOpacity = Math.min(h.opacity, h.y / (height * 0.5));

    ctx.fillStyle = h.color;
    ctx.globalAlpha = finalOpacity;
    
    ctx.save();
    // Offset drawing to center coordinates
    ctx.translate(h.x, h.y);
    drawHeartShape(ctx, 0, 0, h.size);
    ctx.restore();
  });
}

// --- BUTTERFLIES ---
function spawnButterfly(initial = false) {
  butterflies.push({
    x: Math.random() * width,
    y: initial ? Math.random() * height * 0.8 : height + 50,
    size: Math.random() * 6 + 6,
    angle: Math.random() * Math.PI * 2,
    speed: 0.5 + Math.random() * 0.6,
    flapSpeed: 0.15 + Math.random() * 0.1,
    targetX: Math.random() * width,
    targetY: Math.random() * height * 0.6,
    opacity: 0.8,
    color: 'rgba(233, 213, 255, 0.7)' // Light Lavender
  });
}

function drawButterflies() {
  butterflies.forEach((b, idx) => {
    if (!isReducedMotion) {
      // Fly towards target coordinate
      const dx = b.targetX - b.x;
      const dy = b.targetY - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 40) {
        // Set new target
        b.targetX = Math.random() * width;
        b.targetY = Math.random() * height * 0.7;
      }

      // Adjust angle towards target
      const targetAngle = Math.atan2(dy, dx);
      b.angle += (targetAngle - b.angle) * 0.03; // Smooth turning

      // Move forward
      b.x += Math.cos(b.angle) * b.speed;
      b.y += Math.sin(b.angle) * b.speed;
    }

    // Clean up if it drifts too far off
    if (b.y < -50 || b.x < -50 || b.x > width + 50) {
      butterflies.splice(idx, 1);
      return;
    }

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle + Math.PI / 2); // Align forward pointing

    // Flap scale width parameter
    const wingFlap = Math.abs(Math.sin(Date.now() * b.flapSpeed * 0.05));
    
    ctx.fillStyle = b.color;
    ctx.globalAlpha = b.opacity;

    // Draw butterfly wings
    ctx.beginPath();
    
    // Left Wing (Scale horizontally by wingFlap)
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-b.size * 1.5 * wingFlap, -b.size * 1.2, -b.size * 2 * wingFlap, -b.size * 0.2, 0, 0);
    ctx.bezierCurveTo(-b.size * 1.8 * wingFlap, b.size * 0.6, -b.size * 1.2 * wingFlap, b.size * 1.2, 0, 0);
    
    // Right Wing
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(b.size * 1.5 * wingFlap, -b.size * 1.2, b.size * 2 * wingFlap, -b.size * 0.2, 0, 0);
    ctx.bezierCurveTo(b.size * 1.8 * wingFlap, b.size * 0.6, b.size * 1.2 * wingFlap, b.size * 1.2, 0, 0);
    
    ctx.fill();

    // Small body line
    ctx.strokeStyle = 'rgba(125, 93, 104, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -b.size);
    ctx.lineTo(0, b.size * 0.8);
    ctx.stroke();

    ctx.restore();
  });
}

// --- FIREWORKS & BURSTS ---
class FireworkParticle {
  constructor(x, y, color, isHeart = false) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.isHeart = isHeart;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 4 + 1.5;
    this.friction = 0.96;
    this.gravity = 0.08;
    this.opacity = 1.0;
    this.fade = Math.random() * 0.015 + 0.01;
    this.size = Math.random() * 4 + 2;
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.opacity -= this.fade;
  }

  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    
    if (this.isHeart) {
      ctx.save();
      ctx.translate(this.x, this.y);
      drawHeartShape(ctx, 0, 0, this.size * 1.5);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function updateFireworks() {
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const p = fireworks[i];
    p.update();
    if (p.opacity <= 0) {
      fireworks.splice(i, 1);
    } else {
      p.draw();
    }
  }
}

// Exportable celebration trigger
export function triggerCelebration(originX = width / 2, originY = height / 2) {
  const colors = ['#FFC0CB', '#F8AFCB', '#E9D5FF', '#D4AF37', '#FFDAB9', '#FFFDFC'];
  const particlesCount = 80;

  for (let i = 0; i < particlesCount; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const isHeart = Math.random() > 0.4;
    fireworks.push(new FireworkParticle(originX, originY, color, isHeart));
  }
}

// Animation loop
function animate() {
  animationFrameId = requestAnimationFrame(animate);

  // Clear Canvas (semi-transparent for slight motion blur trailing)
  ctx.clearRect(0, 0, width, height);

  // Draw background elements
  drawBokehs();
  drawStars();
  
  if (!isReducedMotion) {
    drawPetals();
    drawHearts();
    drawButterflies();
    updateFireworks();
  }
}

// Launch
document.addEventListener('DOMContentLoaded', () => {
  initEffects();
});
