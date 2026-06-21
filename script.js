/* =========================================================
   SCRIPT.JS
   Plain JavaScript — no frameworks, no libraries.
   Handles: loader, constellation background, custom cursor,
            typing effect, scroll reveal, stat counters,
            3D tilt cards, magnetic buttons, scroll progress,
            navbar style and the mobile menu.
   ========================================================= */


/* ---------------------------------------------------------
   HELPER: detect touch devices (we skip fancy mouse effects)
   --------------------------------------------------------- */
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;


/* =========================================================
   1) INTERACTIVE CONSTELLATION BACKGROUND
   Floating dots connected by lines; lines also reach toward
   the mouse for a subtle interactive feel.
   ========================================================= */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: -9999, y: -9999 };   // far away by default

// Make the canvas match the window size (and handle resizing)
function sizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
sizeCanvas();

// Build the particle list. Fewer particles on small screens.
function buildParticles() {
  particles = [];
  const count = Math.min(90, Math.floor(window.innerWidth / 16));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,   // slow drift
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.6 + 0.6
    });
  }
}
buildParticles();

// The main animation loop
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    // move
    p.x += p.vx;
    p.y += p.vy;

    // bounce off the edges
    if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    // draw the dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(96, 165, 250, 0.7)';
    ctx.fill();

    // draw lines to nearby particles
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dist = Math.hypot(p.x - q.x, p.y - q.y);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        // closer = brighter line
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.12 * (1 - dist / 120)})`;
        ctx.stroke();
      }
    }

    // draw a brighter line toward the mouse if it's close
    const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
    if (md < 170) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.strokeStyle = `rgba(34, 211, 238, ${0.25 * (1 - md / 170)})`;
      ctx.stroke();
    }
  }

  requestAnimationFrame(drawParticles);
}
drawParticles();

// Track the mouse for the background interaction
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Rebuild on resize so it always fills the screen
window.addEventListener('resize', () => {
  sizeCanvas();
  buildParticles();
});


/* =========================================================
   2) CUSTOM CURSOR (dot + trailing ring)
   The ring smoothly chases the dot for a nice lag effect.
   ========================================================= */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (!isTouch) {
  let dotX = 0, dotY = 0;     // instant position (the dot)
  let ringX = 0, ringY = 0;   // eased position (the ring)

  window.addEventListener('mousemove', (e) => {
    dotX = e.clientX;
    dotY = e.clientY;
    // the dot follows instantly
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top  = dotY + 'px';
  });

  // animate the ring catching up to the dot
  function animateRing() {
    ringX += (dotX - ringX) * 0.18;
    ringY += (dotY - ringY) * 0.18;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // grow the ring when hovering over clickable things
  const hoverTargets = document.querySelectorAll('a, button, .tilt, .skill-tag, .cert-frame');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-grow'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-grow'));
  });
}


/* =========================================================
   3) LOADING SCREEN
   Count 0 -> 100, fill the bar, then split the curtains.
   ========================================================= */
const loader        = document.getElementById('loader');
const loaderCount   = document.getElementById('loaderCount');
const progressFill  = document.getElementById('progressFill');
const content       = document.getElementById('content');

let progress = 0;
const loadingTimer = setInterval(() => {
  progress += Math.floor(Math.random() * 6) + 2;   // add a random chunk
  if (progress >= 100) {
    progress = 100;
    clearInterval(loadingTimer);
    setTimeout(revealSite, 450);   // pause a beat at 100%
  }
  loaderCount.textContent = progress;
  progressFill.style.width = progress + '%';
}, 130);

function revealSite() {
  loader.classList.add('done');   // curtains slide apart
  content.classList.add('show');  // content fades in
  startTyping();                  // begin the name typing effect

  // reveal the home elements right away
  document.querySelectorAll('.home .reveal').forEach(el => el.classList.add('visible'));

  // fully remove the loader from the page once the animation ends
  setTimeout(() => { loader.style.display = 'none'; }, 1100);
}


/* =========================================================
   4) TYPING EFFECT for the name
   ========================================================= */
const typedName = document.getElementById('typedName');
const nameText = 'Swarnitha';

function startTyping() {
  let i = 0;
  const typer = setInterval(() => {
    typedName.textContent = nameText.slice(0, i + 1);
    i++;
    if (i === nameText.length) clearInterval(typer);
  }, 130);
}


/* =========================================================
   5) SCROLL REVEAL using IntersectionObserver
   Adds .visible to elements as they scroll into view.
   ========================================================= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // if this element holds stat numbers, start counting them
      if (entry.target.querySelectorAll) {
        entry.target.querySelectorAll('.stat-num').forEach(runCounter);
      }
      revealObserver.unobserve(entry.target);   // animate only once
    }
  });
}, { threshold: 0.15 });

// Observe every section and give it the reveal behaviour
document.querySelectorAll('.section').forEach(sec => {
  sec.classList.add('reveal');
  revealObserver.observe(sec);
});


/* =========================================================
   6) ANIMATED STAT COUNTERS (count up to a target number)
   ========================================================= */
function runCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  let current = 0;
  const step = Math.max(1, Math.floor(target / 40));

  const counter = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(counter);
    }
    el.textContent = current + suffix;
  }, 30);
}


/* =========================================================
   7) 3D TILT CARDS
   Cards rotate slightly toward the mouse for a 3D feel,
   and the glossy shine follows the pointer.
   ========================================================= */
if (!isTouch) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.style.transformStyle = 'preserve-3d';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;   // mouse pos inside the card
      const y = e.clientY - rect.top;

      // convert to a -1..1 range from the center
      const rotateY = ((x / rect.width)  - 0.5) * 14;
      const rotateX = ((y / rect.height) - 0.5) * -14;

      card.style.transform =
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      // move the shine to the pointer (CSS reads --mx / --my)
      card.style.setProperty('--mx', (x / rect.width) * 100 + '%');
      card.style.setProperty('--my', (y / rect.height) * 100 + '%');
    });

    // reset smoothly when the mouse leaves
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
    });
  });
}


/* =========================================================
   8) MAGNETIC BUTTONS
   Buttons gently pull toward the cursor when hovered.
   ========================================================= */
if (!isTouch) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}


/* =========================================================
   9) SCROLL PROGRESS BAR + NAVBAR STYLE
   ========================================================= */
const scrollProgress = document.getElementById('scrollProgress');
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  // how far down the page we are, as a percentage
  const scrollTop = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (scrollTop / height) * 100;
  scrollProgress.style.width = pct + '%';

  // add a solid background to the navbar after scrolling a bit
  if (scrollTop > 40) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});


/* =========================================================
   10) MOBILE MENU TOGGLE
   ========================================================= */
const menuBtn  = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// close the menu after clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    menuBtn.classList.remove('open');
    navLinks.classList.remove('open');
  });
});