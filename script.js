/* ── CURSOR ── */
const cur  = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx=0, my=0, rx=0, ry=0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.transform = `translate(${mx-5}px,${my-5}px)`;
});
(function animRing() {
  rx += (mx-rx-16)*0.13; ry += (my-ry-16)*0.13;
  ring.style.transform = `translate(${rx}px,${ry}px)`;
  requestAnimationFrame(animRing);
})();
document.querySelectorAll('a,button').forEach(el => {
  el.addEventListener('mouseenter', () => ring.style.opacity='0.9');
  el.addEventListener('mouseleave', () => ring.style.opacity='0.5');
});

/* ── PARTICLES ── */
const pWrap = document.getElementById('particles');
for (let i = 0; i < 28; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random()*4+2;
  p.style.cssText = `
    width:${size}px; height:${size}px;
    left:${Math.random()*100}%;
    animation-duration:${Math.random()*14+8}s;
    animation-delay:${Math.random()*10}s;
    background:${Math.random()>0.5?'#60A5FA':'#22D3EE'};
  `;
  pWrap.appendChild(p);
}

/* ── TYPEWRITER ── */
const phrases = [
  'Exploring Quantum Computing.',
  'Learning AI & Machine Learning.',
  'Building web experiences.',
  'Curious about Robotics.',
  'A Future Interns developer.'
];
let pi=0, ci=0, del=false;
const tEl = document.getElementById('typed-text');
function type() {
  const ph = phrases[pi];
  tEl.textContent = del ? ph.slice(0,--ci) : ph.slice(0,++ci);
  if (!del && ci===ph.length)  { del=true; setTimeout(type,1800); return; }
  if (del && ci===0) { del=false; pi=(pi+1)%phrases.length; }
  setTimeout(type, del?55:85);
}
type();

/* ── SCROLL REVEAL + SKILL BARS ── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      e.target.querySelectorAll('.bar').forEach(b => b.style.width = b.dataset.w);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

/* ── NAV HIDE ON SCROLL ── */
let lastY = 0;
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.style.transform = (y > lastY && y > 80) ? 'translateY(-100%)' : 'translateY(0)';
  lastY = y;
});

/* ── CONTACT FORM ── */
function handleSubmit() {
  const name  = document.getElementById('fname').value.trim();
  const email = document.getElementById('femail').value.trim();
  const msg   = document.getElementById('fmsg').value.trim();
  if (!name || !email || !msg) { alert('Please fill all fields.'); return; }
  const toast = document.getElementById('toast');
  toast.style.display = 'block';
  document.getElementById('fname').value  = '';
  document.getElementById('femail').value = '';
  document.getElementById('fmsg').value   = '';
  setTimeout(() => toast.style.display='none', 4500);
}
function showResumeAlert() {
  alert("📄 Resume not available for direct download.\n\nPlease contact me at:\ngunupudiswarnitha@gmail.com\n\nI'll send it to you right away! 😊");
}
