// Distance Map & Connection Animation

let canvas;
let ctx;
let width;
let height;
let animationFrameId;

// Location Nodes
let leftNode = { x: 0, y: 0 };
let rightNode = { x: 0, y: 0 };

// Control points for curved path
let cp1 = { x: 0, y: 0 };
let cp2 = { x: 0, y: 0 };

// Particles (messages traveling)
const messageParticles = [];
const stars = [];

class MessageParticle {
  constructor(delay = 0) {
    this.t = 0; // Curve progress (0 to 1)
    this.speed = 0.003 + Math.random() * 0.002;
    this.size = Math.random() * 4 + 3;
    this.color = Math.random() > 0.4 ? '#FFC0CB' : '#D4AF37'; // Pink vs Gold glow
    this.delay = delay; // Spawn delay
    this.x = 0;
    this.y = 0;
  }

  update() {
    if (this.delay > 0) {
      this.delay--;
      return;
    }

    this.t += this.speed;
    if (this.t >= 1) {
      this.t = 0;
      this.speed = 0.003 + Math.random() * 0.002;
      this.size = Math.random() * 4 + 3;
    }

    // Cubic Bezier interpolation
    const t = this.t;
    const mt = 1 - t;

    this.x = mt*mt*mt*leftNode.x + 3*mt*mt*t*cp1.x + 3*mt*t*t*cp2.x + t*t*t*rightNode.x;
    this.y = mt*mt*mt*leftNode.y + 3*mt*mt*t*cp1.y + 3*mt*t*t*cp2.y + t*t*t*rightNode.y;
  }

  draw() {
    if (this.delay > 0) return;

    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    
    // Draw a small sparkling diamond/star shape or a simple circle
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initDistanceMap() {
  canvas = document.getElementById('distance-canvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  
  resizeMap();
  window.addEventListener('resize', resizeMap);

  // Initialize stars on the local map background
  for (let i = 0; i < 30; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.2 + 0.4,
      opacity: Math.random(),
      twinkle: 0.01 + Math.random() * 0.02
    });
  }

  // Populate particles with staggered delays
  for (let i = 0; i < 8; i++) {
    messageParticles.push(new MessageParticle(i * 120));
  }

  animate();
}

function resizeMap() {
  const container = canvas.parentElement;
  width = container.clientWidth;
  height = 360; // Fixed box height
  canvas.width = width;
  canvas.height = height;

  // Determine coordinates based on device width
  const isMobile = width < 768;

  leftNode.x = isMobile ? width * 0.22 : width * 0.25;
  leftNode.y = isMobile ? height * 0.65 : height * 0.5;

  rightNode.x = isMobile ? width * 0.78 : width * 0.75;
  rightNode.y = isMobile ? height * 0.35 : height * 0.5;

  // Establish arching Bezier control points
  const dx = rightNode.x - leftNode.x;
  cp1.x = leftNode.x + dx * 0.33;
  cp1.y = isMobile ? height * 0.25 : leftNode.y - 120;

  cp2.x = leftNode.x + dx * 0.66;
  cp2.y = isMobile ? height * 0.75 : rightNode.y - 120;

  // Position HTML overlay labels directly above nodes
  const labelMe = document.querySelector('.location-me');
  const labelHer = document.querySelector('.location-her');

  if (labelMe) {
    labelMe.style.left = `${leftNode.x}px`;
    labelMe.style.top = `${leftNode.y}px`;
  }
  if (labelHer) {
    labelHer.style.left = `${rightNode.x}px`;
    labelHer.style.top = `${rightNode.y}px`;
  }
}

function drawBackground() {
  // Starry deep sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(255, 240, 243, 0.25)');
  grad.addColorStop(1, 'rgba(250, 240, 255, 0.2)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Twinkle stars
  ctx.fillStyle = '#FFFFFF';
  stars.forEach((star) => {
    star.opacity += star.twinkle;
    if (star.opacity > 1 || star.opacity < 0.1) {
      star.twinkle = -star.twinkle;
    }
    ctx.globalAlpha = star.opacity;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;
}

function drawConnectionLine() {
  // Draw glowing Bezier connection path
  ctx.save();
  ctx.strokeStyle = 'rgba(248, 175, 203, 0.4)';
  ctx.lineWidth = 3.5;
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#F8AFCB';
  
  ctx.beginPath();
  ctx.moveTo(leftNode.x, leftNode.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, rightNode.x, rightNode.y);
  ctx.stroke();

  // Fine core line
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.stroke();
  
  ctx.restore();
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  ctx.clearRect(0, 0, width, height);

  drawBackground();
  drawConnectionLine();

  // Update and draw messaging particles
  messageParticles.forEach((p) => {
    p.update();
    p.draw();
  });
}

// Start Map on load
document.addEventListener('DOMContentLoaded', () => {
  // Short delay to allow layouts to stretch
  setTimeout(initDistanceMap, 180);
});
