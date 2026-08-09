// Main Interactive Page Logic

import { triggerCelebration } from './effects.js';
import { cutBirthdayCake, updateSlicingProgress, resetSlicingProgress, splitCakeHalves } from './three-cake.js';

// DOM Elements
let timelineProgress;
let timelineItems;
let envelope;
let waxSeal;
let letterClose;
let cutCakeBtn;
let largeHeart;
let handOverlay;
let hasCustomVideo = false;

document.addEventListener('DOMContentLoaded', () => {
  // Select Elements
  timelineProgress = document.getElementById('timeline-progress');
  timelineItems = document.querySelectorAll('.timeline-item');
  envelope = document.getElementById('envelope');
  waxSeal = document.getElementById('wax-seal');
  letterClose = document.getElementById('letter-close');
  cutCakeBtn = document.getElementById('cut-cake-btn');
  largeHeart = document.getElementById('large-glowing-heart');
  handOverlay = document.getElementById('cake-cutting-hand-overlay');

  // Check if custom video is present
  fetch('assets/videos/cake_cut.mp4', { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        hasCustomVideo = true;
        const video = document.getElementById('external-video');
        if (video) video.src = 'assets/videos/cake_cut.mp4';

        // Async override: Hide cakes and show video preview wrapper immediately
        const container3d = document.getElementById('cutting-cake-container-3d');
        const wrapperSvg = document.getElementById('fallback-svg-cake-wrapper');
        const handOverlay = document.getElementById('cake-cutting-hand-overlay');
        const videoWrapper = document.getElementById('external-video-wrapper');
        
        if (container3d) container3d.style.display = 'none';
        if (wrapperSvg) wrapperSvg.style.display = 'none';
        if (handOverlay) handOverlay.style.display = 'none';
        
        if (videoWrapper) {
          videoWrapper.style.display = 'flex';
          videoWrapper.offsetHeight; // Force reflow
          videoWrapper.classList.add('visible');
        }
      }
    })
    .catch(() => {});

  // Initialize features
  initScrollReveals();
  initTimelineScroll();
  init3DTilt();
  initLightbox();
  initReasonsFlip();
  initEnvelopeLetter();
  initDreamBubbles();
  initFinalCelebration();
  handlePlaceholderImages();
  initCountUpTimer();
  initBirthdayLock();
});

// --- SCROLL REVEALS (Intersection Observer) ---
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal-fade');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before element hits viewport
  });

  revealElements.forEach((el) => observer.observe(el));
}

// --- TIMELINE PROGRESS LINE ---
function initTimelineScroll() {
  window.addEventListener('scroll', () => {
    const timelineSection = document.getElementById('timeline');
    if (!timelineSection || !timelineProgress) return;

    const sectionRect = timelineSection.getBoundingClientRect();
    const sectionHeight = timelineSection.offsetHeight;
    const windowHeight = window.innerHeight;

    // Calculate how far down the timeline section we've scrolled
    // Start tracking when the top of the section is in the middle of screen
    const sectionTopOffset = sectionRect.top - windowHeight / 2;
    let scrollPercent = 0;

    if (sectionTopOffset < 0) {
      scrollPercent = Math.min(Math.abs(sectionTopOffset) / (sectionHeight - windowHeight / 2), 1);
    }

    // Set height of timeline path
    timelineProgress.style.height = `${scrollPercent * 100}%`;

    // Activate timeline dots and cards as they enter middle screen
    timelineItems.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      if (itemRect.top < windowHeight * 0.6) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  });
}

// --- 3D MOUSE HOVER TILT EFFECT ---
function init3DTilt() {
  const cards = document.querySelectorAll('.memory-card-3d, .today-image-card, .wall-card');
  
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // mouse x within card
      const y = e.clientY - rect.top;  // mouse y within card
      
      // Calculate rotation angles based on position (-10 to +10 degrees)
      const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 12;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 12;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      
      // Dynamic glare highlight gradient
      const glare = card.querySelector('.photo-placeholder, .today-image-card');
      if (glare) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        card.style.setProperty('--glare-pos', `${percentX}% ${percentY}%`);
      }
    });
    
    // Reset transform on leave
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
}

// --- LIGHTBOX OVERLAY ---
function initLightbox() {
  const lightbox = document.getElementById('lightbox-overlay');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const imgBox = document.getElementById('lightbox-img-box');
  const titleEl = document.getElementById('lightbox-title');
  const descEl = document.getElementById('lightbox-desc');
  
  const triggerElements = document.querySelectorAll('.memory-card-3d, .today-image-card');
  
  triggerElements.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const title = el.getAttribute('data-title');
      const caption = el.getAttribute('data-caption');
      const img = el.querySelector('img');
      
      titleEl.innerText = title;
      descEl.innerText = caption;
      imgBox.innerHTML = ''; // Clear
      
      // Check if image loaded successfully (dimensions > 0)
      if (img && img.naturalWidth > 0) {
        const clonedImg = img.cloneNode();
        imgBox.appendChild(clonedImg);
      } else {
        // Fallback beautiful glassmorphic visual box if image is placeholder/missing
        const placeholderDiv = document.createElement('div');
        placeholderDiv.className = 'placeholder-visual';
        placeholderDiv.style.width = '100%';
        placeholderDiv.style.height = '100%';
        placeholderDiv.style.display = 'flex';
        placeholderDiv.style.alignItems = 'center';
        placeholderDiv.style.justifyContent = 'center';
        placeholderDiv.style.fontSize = '3.5rem';
        placeholderDiv.style.background = 'linear-gradient(135deg, #FFEBEF 0%, #FAF0FF 100%)';
        placeholderDiv.innerText = '🌸';
        
        const label = document.createElement('span');
        label.style.position = 'absolute';
        label.style.bottom = '30px';
        label.style.fontSize = '0.9rem';
        label.style.letterSpacing = '2px';
        label.style.textTransform = 'uppercase';
        label.style.color = '#8E7A82';
        label.innerText = title + ' Placeholder';
        
        placeholderDiv.appendChild(label);
        imgBox.appendChild(placeholderDiv);
      }
      
      lightbox.classList.add('active');
    });
  });
  
  // Close events
  const closeLightbox = () => lightbox.classList.remove('active');
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

// --- FLIP REASONS CARDS ---
function initReasonsFlip() {
  const reasonCards = document.querySelectorAll('.reason-card-container');
  
  reasonCards.forEach((card) => {
    // Toggle flipped class on click/tap to support touch screens perfectly
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.toggle('flipped');
    });
  });
}

// --- LUXURY ENVELOPE & WRITTEN LETTER ---
function initEnvelopeLetter() {
  if (!envelope || !waxSeal || !letterClose) return;

  const openAction = (e) => {
    e.stopPropagation();
    if (!envelope.classList.contains('open')) {
      envelope.classList.add('open');
      synthesizeWaxCrack();
    }
  };

  const closeAction = (e) => {
    e.stopPropagation();
    envelope.classList.remove('open');
  };

  waxSeal.addEventListener('click', openAction);
  envelope.addEventListener('click', openAction);
  letterClose.addEventListener('click', closeAction);
}

// Envelope Wax Seal Crack Sound synthesis using Web Audio API
function synthesizeWaxCrack() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    // Low crackling noise
    const bufferSize = audioCtx.sampleRate * 0.15; // 150ms buffer
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(4.0, now);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    noise.start(now);
  } catch (err) {
    // Silent fail if Web Audio is blocked or unsupported
  }
}

// --- DREAMS FLOATING BUBBLES ---
function initDreamBubbles() {
  const bubbles = document.querySelectorAll('.dream-bubble');
  let time = 0;

  // Simple sin/cos floating translation loops
  function floatLoop() {
    time += 0.02;
    bubbles.forEach((bubble, idx) => {
      const offsetX = Math.sin(time + idx * 1.5) * 12;
      const offsetY = Math.cos(time * 0.8 + idx * 2.0) * 15;
      const angle = Math.sin(time * 0.3 + idx) * 3;
      
      // Retain hover scale override if hovered
      bubble.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${angle}deg)`;
    });
    requestAnimationFrame(floatLoop);
  }
  
  // Start bubble movement
  requestAnimationFrame(floatLoop);
}

// WebGL Context Detector
function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

// --- FINAL SECTION CELEBRATION FLOW ---
function initFinalCelebration() {
  const finalSection = document.getElementById('final');
  if (!finalSection) return;

  const intro1 = document.getElementById('intro-msg-1');
  const intro2 = document.getElementById('intro-msg-2');
  const intro3 = document.getElementById('intro-msg-3');
  const finalActionBox = document.getElementById('final-action-box');
  
  const introContainer = document.getElementById('final-intro-messages');
  const wishesContainer = document.getElementById('final-wishes-messages');
  const heartPulsate = document.getElementById('final-heart-pulsate');
  
  const container3d = document.getElementById('cutting-cake-container-3d');
  const wrapperSvg = document.getElementById('fallback-svg-cake-wrapper');
  
  const isWebGLAvailable = detectWebGL();

  // Route modes
  if (hasCustomVideo) {
    if (container3d) container3d.style.display = 'none';
    if (wrapperSvg) wrapperSvg.style.display = 'none';
    if (handOverlay) handOverlay.style.display = 'none';
    
    // Display the video preview card (showing the poster cover or 1st frame)
    const videoWrapper = document.getElementById('external-video-wrapper');
    if (videoWrapper) {
      videoWrapper.style.display = 'flex';
      videoWrapper.offsetHeight; // Force reflow
      videoWrapper.classList.add('visible');
    }
  } else {
    if (isWebGLAvailable) {
      if (container3d) container3d.style.display = 'block';
      if (wrapperSvg) wrapperSvg.style.display = 'none';
    } else {
      if (container3d) container3d.style.display = 'none';
      if (wrapperSvg) wrapperSvg.style.display = 'block';
    }
  }

  let triggeredSequence = false;
  let sliceCompleted = false;

  // Trigger emotional text sequence when user scrolls to final section
  window.addEventListener('scroll', () => {
    const rect = finalSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight * 0.55 && !triggeredSequence) {
      triggeredSequence = true;
      
      // Step-by-step emotional text reveal sequence
      setTimeout(() => {
        // Intro 1 is active by default
      }, 500);

      setTimeout(() => {
        if (intro1) intro1.classList.remove('active');
        if (intro2) intro2.classList.add('active');
      }, 3500);

      setTimeout(() => {
        if (intro2) intro2.classList.remove('active');
        if (intro3) intro3.classList.add('active');
      }, 7000);

      setTimeout(() => {
        if (intro3) intro3.classList.remove('active');
        
        if (hasCustomVideo) {
          // If video exists, directly show the action button to trigger video!
          if (finalActionBox) {
            finalActionBox.classList.add('active');
          }
        } else {
          // Show hand overlay hovering at top, ready to drag
          if (handOverlay) {
            handOverlay.style.display = 'flex';
            handOverlay.offsetHeight; // Force reflow
            handOverlay.classList.add('visible');
            
            // Add drag instruction class or floating help
            const instructions = document.createElement('span');
            instructions.className = 'cake-instructions swipe-instructions';
            instructions.id = 'swipe-instructions';
            instructions.innerText = 'Drag the knife down to cut! 🎂';
            instructions.style.position = 'absolute';
            instructions.style.top = '10px';
            instructions.style.fontSize = '0.9rem';
            instructions.style.letterSpacing = '1px';
            instructions.style.color = '#7D5D68';
            instructions.style.opacity = '0.8';
            instructions.style.fontFamily = 'var(--font-sans)';
            instructions.style.animation = 'pulse 1.5s infinite';
            
            const stage = document.getElementById('cake-cutting-stage');
            if (stage) stage.appendChild(instructions);
          }

          // Delay the backup auto-slice button fade-in as accessibility helper (4s later)
          setTimeout(() => {
            if (!sliceCompleted && finalActionBox) {
              finalActionBox.classList.add('active');
            }
          }, 4000);
        }
      }, 10500);
    }
  });

  // DRAG TO SLICE INTERACTION MECHANICS
  let isDragging = false;
  let startY = 0;
  let currentY = 0;
  let dragPercent = 0;
  const maxDragY = 195; // Translate range (Y offset matches full slice cut)

  const triggerFullSurprise = () => {
    sliceCompleted = true;

    // Remove instruction text
    const instructions = document.getElementById('swipe-instructions');
    if (instructions) instructions.remove();

    // Hide auto action box helper
    if (finalActionBox) {
      finalActionBox.classList.remove('active');
      finalActionBox.style.display = 'none';
    }

    // Retract the hand knife overlay back up and fade it out
    setTimeout(() => {
      if (handOverlay) {
        handOverlay.style.transition = 'transform 1.2s ease, opacity 1.2s ease';
        handOverlay.classList.add('retracting');
      }
    }, 400);

    // Clean up hand overlay state after retraction completes (1.2s)
    setTimeout(() => {
      if (handOverlay) {
        handOverlay.style.display = 'none';
        handOverlay.className = 'cake-cutting-hand-overlay';
      }
    }, 1600);

    // Helper to reveal wishes text and beating heart
    const showWishesAndHeart = () => {
      // Hide intro text container
      if (introContainer) introContainer.style.display = 'none';

      // Show actual birthday wishes
      if (wishesContainer) {
        wishesContainer.style.display = 'block';
      }

      // Trigger spectacular screen explosions
      triggerCelebration(window.innerWidth * 0.3, window.innerHeight * 0.35);
      setTimeout(() => triggerCelebration(window.innerWidth * 0.7, window.innerHeight * 0.35), 300);
      setTimeout(() => triggerCelebration(window.innerWidth * 0.5, window.innerHeight * 0.25), 600);
      setTimeout(() => triggerCelebration(window.innerWidth * 0.2, window.innerHeight * 0.5), 900);
      setTimeout(() => triggerCelebration(window.innerWidth * 0.8, window.innerHeight * 0.5), 1200);

      // Synthesize bells/chimes
      synthesizeChimes();

      // Reveal beating heart at the end of wishes (after 7.5s)
      setTimeout(() => {
        if (heartPulsate) {
          heartPulsate.style.display = 'flex';
        }
        synthesizeHeartPulseSound();
      }, 7500);
    };

    // If custom video file is present, play it first!
    if (hasCustomVideo) {
      const videoWrapper = document.getElementById('external-video-wrapper');
      const video = document.getElementById('external-video');
      const videoPreview = document.getElementById('external-video-preview');
      const videoOverlayText = document.getElementById('video-overlay-text');
      
      // Hide 3D/SVG cake objects to clear the stage for video playback
      if (container3d) container3d.style.display = 'none';
      if (wrapperSvg) wrapperSvg.style.display = 'none';

      if (videoWrapper && video) {
        // Swap preview image with video player on click
        if (videoPreview) videoPreview.style.display = 'none';
        if (videoOverlayText) videoOverlayText.style.display = 'none';
        video.style.display = 'block';

        videoWrapper.style.display = 'flex';
        videoWrapper.offsetHeight; // Force reflow
        videoWrapper.classList.add('visible');
        
        // Play video
        video.play().catch(err => {
          // If browser blocks autoplay, wishes will trigger as fallback
          showWishesAndHeart();
        });

        // Once video completes, fade out video and show romantic wishes
        video.onended = () => {
          videoWrapper.classList.remove('visible');
          setTimeout(() => {
            videoWrapper.style.display = 'none';
            showWishesAndHeart();
          }, 800);
        };
      } else {
        showWishesAndHeart();
      }
    } else {
      // Normal flow (no video uploaded)
      showWishesAndHeart();
    }
  };

  // Drag interaction event handlers
  const onDragStart = (e) => {
    if (sliceCompleted || !handOverlay || !handOverlay.classList.contains('visible') || handOverlay.classList.contains('slicing')) return;
    
    isDragging = true;
    startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    
    handOverlay.style.transition = 'none';
    document.body.style.userSelect = 'none'; // Prevent selections
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    
    currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const dy = currentY - startY;
    
    // Clamp movement
    const clampedDy = Math.min(maxDragY, Math.max(0, dy));
    dragPercent = clampedDy / maxDragY;
    
    // Translate hand overlay wrapper (Original translateY is -80px)
    handOverlay.style.transform = `translateY(${-80 + dragPercent * 195}px)`;

    if (isWebGLAvailable) {
      // Feed live coordinates to 3D Three.js cake wicks and crumb emitters
      updateSlicingProgress(dragPercent);
    } else {
      // Feed live coordinates to SVG fallback
      const svgFlames = document.querySelectorAll('.svg-flame');
      if (dragPercent > 0.45) {
        svgFlames.forEach(f => f.classList.add('extinguished'));
      } else {
        svgFlames.forEach(f => f.classList.remove('extinguished'));
      }
    }

    // Check cutting threshold (hits bottom stand)
    if (dragPercent >= 0.98) {
      isDragging = false;
      document.body.style.userSelect = '';
      
      const stage = document.getElementById('cake-cutting-stage');
      if (stage) {
        stage.classList.add('shake');
        setTimeout(() => stage.classList.remove('shake'), 450);
      }

      if (isWebGLAvailable) {
        splitCakeHalves(triggerFullSurprise);
      } else {
        const svgLeft = document.getElementById('svg-cake-left');
        const svgRight = document.getElementById('svg-cake-right');
        if (svgLeft) svgLeft.classList.add('sliced');
        if (svgRight) svgRight.classList.add('sliced');
        
        synthesizeHeartPulseSound();
        triggerFullSurprise();
      }
    }
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.userSelect = '';

    if (dragPercent < 0.95) {
      // Snap back to top if released early
      handOverlay.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease';
      handOverlay.style.transform = 'translateY(-80px)';
      dragPercent = 0;

      if (isWebGLAvailable) {
        resetSlicingProgress();
      } else {
        const svgFlames = document.querySelectorAll('.svg-flame');
        svgFlames.forEach(f => f.classList.remove('extinguished'));
      }
    }
  };

  // Bind drag listeners to hand knife overlay
  if (handOverlay) {
    handOverlay.addEventListener('mousedown', onDragStart);
    handOverlay.addEventListener('touchstart', onDragStart, { passive: true });
    
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('touchmove', onDragMove, { passive: false });
    
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchend', onDragEnd);
  }

  // Backup Auto-slice button click handler (as accessibility helper)
  if (cutCakeBtn) {
    cutCakeBtn.addEventListener('click', () => {
      if (sliceCompleted) return;
      
      // Hide button helper
      if (finalActionBox) {
        finalActionBox.classList.remove('active');
        finalActionBox.style.display = 'none';
      }

      if (hasCustomVideo) {
        // If custom video is present, play it immediately on click!
        triggerFullSurprise();
      } else {
        // Trigger automatic slice animation
        if (handOverlay) {
          handOverlay.style.transition = 'transform 1.6s cubic-bezier(0.85, 0, 0.15, 1)';
          handOverlay.classList.add('slicing');
        }

        if (isWebGLAvailable) {
          cutBirthdayCake(triggerFullSurprise);
        } else {
          const svgLeft = document.getElementById('svg-cake-left');
          const svgRight = document.getElementById('svg-cake-right');
          const svgFlames = document.querySelectorAll('.svg-flame');
          const stage = document.getElementById('cake-cutting-stage');

          setTimeout(() => {
            svgFlames.forEach(f => f.classList.add('extinguished'));
          }, 600);

          setTimeout(() => {
            if (stage) stage.classList.add('shake');
            if (svgLeft) svgLeft.classList.add('sliced');
            if (svgRight) svgRight.classList.add('sliced');
            
            synthesizeHeartPulseSound();
            triggerFullSurprise();

            setTimeout(() => {
              if (stage) stage.classList.remove('shake');
            }, 450);
          }, 1600);
        }
      }
    });
  }

  // Beating heart click explosion
  if (largeHeart) {
    largeHeart.addEventListener('click', (e) => {
      triggerCelebration(e.clientX, e.clientY);
      synthesizeHeartPulseSound();
    });
  }
}

// Magical bell chimes synthesiser (Web Audio)
function synthesizeChimes() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98];
    
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const delay = idx * 0.08;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gainNode.gain.setValueAtTime(0.001, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.12, now + delay + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.8);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.9);
    });
  } catch (err) {}
}

// Low heartbeat synth pulse
function synthesizeHeartPulseSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    const playBeat = (delay) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, now + delay);
      osc.frequency.exponentialRampToValueAtTime(20, now + delay + 0.15);
      
      gainNode.gain.setValueAtTime(0.001, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.4, now + delay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.25);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.3);
    };

    playBeat(0);
    playBeat(0.18);
  } catch (err) {}
}

// --- PLACEHOLDER IMAGES ERROR HANDLING ---
// Renders an attractive visual fallback inside the image elements if the user has not replaced the files yet.
function handlePlaceholderImages() {
  const images = document.querySelectorAll('.photo-placeholder img, .today-image-card img');
  
  images.forEach((img) => {
    const parent = img.parentElement;
    const status = parent ? parent.querySelector('.photo-status') : null;

    const handleSuccess = () => {
      if (parent) {
        parent.classList.add('image-loaded');
        if (status) status.style.display = 'none';
      }
    };

    const handleError = () => {
      img.style.display = 'none'; // Hide broken image symbol
      if (parent) {
        parent.classList.add('broken-image-fallback');
        if (status) {
          status.style.display = ''; // Make sure it's visible if it was hidden
          status.style.background = 'rgba(255, 255, 255, 0.8)';
          status.style.color = '#A8647D';
        }
      }
    };

    img.addEventListener('load', handleSuccess);
    img.addEventListener('error', handleError);
    
    // Check if the image is already loaded/cached by browser
    if (img.complete) {
      if (img.naturalWidth > 0) {
        handleSuccess();
      } else {
        handleError();
      }
    }
  });
}

// --- COUNT UP TIMER (Diwali 2024) ---
// Calculates calendar years, months, and exact fractional days/hours/minutes/seconds since wished "Happy Diwali" (Oct 31, 2024)
function initCountUpTimer() {
  const startDate = new Date('2024-10-31T00:00:00'); // Diwali 2024 Start Date
  
  const yearsEl = document.getElementById('timer-years');
  const monthsEl = document.getElementById('timer-months');
  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minsEl = document.getElementById('timer-mins');
  const secsEl = document.getElementById('timer-secs');
  
  if (!yearsEl) return;
  
  function updateTimer() {
    const now = new Date();
    
    // Calendar calculation: subtract years & months
    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    
    // Adjust month boundary
    let tempDate = new Date(startDate.getTime());
    tempDate.setFullYear(now.getFullYear());
    tempDate.setMonth(startDate.getMonth() + months);
    
    if (tempDate > now) {
      months--;
      tempDate = new Date(startDate.getTime());
      tempDate.setFullYear(now.getFullYear());
      tempDate.setMonth(startDate.getMonth() + months);
    }
    
    if (months < 0) {
      months += 12;
      years--;
      tempDate = new Date(startDate.getTime());
      tempDate.setFullYear(now.getFullYear());
      tempDate.setMonth(startDate.getMonth() + months);
    }
    
    // Exact delta of remaining ms from the adjusted date
    const diffMs = now - tempDate;
    const totalSecs = Math.floor(diffMs / 1000);
    
    const secs = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const mins = totalMins % 60;
    const totalHours = Math.floor(totalMins / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);
    
    // Write digits to DOM
    yearsEl.innerText = years;
    monthsEl.innerText = months;
    daysEl.innerText = String(days).padStart(2, '0');
    hoursEl.innerText = String(hours).padStart(2, '0');
    minsEl.innerText = String(mins).padStart(2, '0');
    secsEl.innerText = String(secs).padStart(2, '0');
  }
  
  updateTimer();
  setInterval(updateTimer, 1000);
}

// --- BIRTHDAY LOCK SCREEN GATEKEEPER ---
// Blocks body scroll, counts down to August 17, 2026, and slides/fades out elastically on unlock.
function initBirthdayLock() {
  const lockScreen = document.getElementById('birthday-lock-screen');
  if (!lockScreen) return;
  
  // ==========================================
  // NOTE FOR TESTING:
  // To test and bypass this lock screen immediately, change the date below
  // to a past date (for example, '2026-08-01T00:00:00').
  // ==========================================
  const targetDate = new Date('2026-08-01T00:00:00'); // Temporarily bypassed locally for editing
  
  const daysEl = document.getElementById('lock-days');
  const hoursEl = document.getElementById('lock-hours');
  const minsEl = document.getElementById('lock-mins');
  const secsEl = document.getElementById('lock-secs');
  
  // If we are already past the birthday date, hide the lock overlay immediately
  if (new Date() >= targetDate) {
    lockScreen.style.display = 'none';
    return;
  }
  
  // Lock scroll bar interactions
  document.body.style.overflow = 'hidden';
  
  function updateLockCountdown() {
    const now = new Date();
    const diffMs = targetDate - now;
    
    // Once target date is hit
    if (diffMs <= 0) {
      clearInterval(lockInterval);
      document.body.style.overflow = ''; // Unlock body scroll
      lockScreen.classList.add('unlocked');
      
      // Clear element from DOM after transition (1.5s)
      setTimeout(() => {
        lockScreen.remove();
      }, 1500);
      return;
    }
    
    // Breakdown milliseconds
    const totalSecs = Math.floor(diffMs / 1000);
    const secs = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const mins = totalMins % 60;
    const totalHours = Math.floor(totalMins / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);
    
    // Render to elements
    if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
    if (minsEl) minsEl.innerText = String(mins).padStart(2, '0');
    if (secsEl) secsEl.innerText = String(secs).padStart(2, '0');
  }
  
  updateLockCountdown();
  const lockInterval = setInterval(updateLockCountdown, 1000);
}
