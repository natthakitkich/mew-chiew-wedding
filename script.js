const sections = [...document.querySelectorAll('[data-section]')];
const navItems = [...document.querySelectorAll('.nav-item')];

const inviteOverlay = document.getElementById('inviteOverlay');
const openInvitationBtn = document.getElementById('openInvitationBtn');
const mainContent = document.getElementById('mainContent');

const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');

const attendanceSelect = document.getElementById('attendanceSelect');
const paxSelect = document.getElementById('paxSelect');
const guestInput = document.getElementById('guestInput');
const wishInput = document.getElementById('wishInput');
const submitBtn = document.getElementById('submitBtn');
const rsvpForm = document.getElementById('rsvpForm');
const thankYouMessage = document.getElementById('thankYouMessage');

const galleryMain = document.getElementById('galleryMain');
const thumbs = [...document.querySelectorAll('.thumb')];

const heroBg = document.querySelector('.hero-fixed-bg');
const heroBlurLayer = document.getElementById('heroBlurLayer');
const decorEls = [...document.querySelectorAll('.decor')];
const wishesList = document.getElementById('wishesList');

let musicPlaying = false;
let ticking = false;
let revealObserver = null;
let navObserver = null;

/* ---------------- FIRST LOAD TO TOP ---------------- */

function forceStartAtTop() {
  if (location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }
  window.scrollTo(0, 0);
}

forceStartAtTop();

window.addEventListener('load', () => {
  forceStartAtTop();
  initRevealObserver();
  initNavObserver();
  initParallax();
  runInitialStaticReveal();
});

/* ---------------- OPEN INVITATION ---------------- */

function runHeroSequence() {
  const seqEls = document.querySelectorAll('.reveal-seq');
  seqEls.forEach((el) => el.classList.remove('show'));

  requestAnimationFrame(() => {
    seqEls.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('show');
      }, 120 + index * 180);
    });
  });
}

function runInitialStaticReveal() {
  const firstVisible = document.querySelectorAll('.reveal');
  firstVisible.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      el.classList.add('show');
    }
  });
}

openInvitationBtn?.addEventListener('click', async () => {
  forceStartAtTop();

  inviteOverlay.classList.add('hidden');
  mainContent.classList.remove('locked');

  try {
    await bgm.play();
    musicPlaying = true;
    if (musicIcon) musicIcon.textContent = 'pause';
  } catch (_) {}

  setTimeout(() => {
    inviteOverlay.style.display = 'none';
    runHeroSequence();
    updateActiveNavByScroll();
    runInitialStaticReveal();
  }, 850);
});

/* ---------------- MUSIC ---------------- */

musicBtn?.addEventListener('click', async () => {
  try {
    if (musicPlaying) {
      bgm.pause();
      musicPlaying = false;
      if (musicIcon) musicIcon.textContent = 'music_note';
    } else {
      await bgm.play();
      musicPlaying = true;
      if (musicIcon) musicIcon.textContent = 'pause';
    }
  } catch (_) {}
});

/* ---------------- NAV CLICK ---------------- */

navItems.forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();

    const targetId = item.getAttribute('href')?.replace('#', '');
    const target = document.getElementById(targetId);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - 12;

    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  });
});

/* ---------------- REVEAL ON SCROLL ---------------- */

function initRevealObserver() {
  if (revealObserver) revealObserver.disconnect();

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('show');
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });
}

/* ---------------- ACTIVE NAV ---------------- */

function setActiveNav(id) {
  navItems.forEach((item) => {
    item.classList.toggle('active', item.getAttribute('href') === `#${id}`);
  });
}

function updateActiveNavByScroll() {
  const viewportMiddle = window.scrollY + window.innerHeight * 0.42;
  let currentId = sections[0]?.id || 'hero';

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (viewportMiddle >= top && viewportMiddle < top + height) {
      currentId = section.id;
    }
  });

  setActiveNav(currentId);
}

function initNavObserver() {
  if (navObserver) navObserver.disconnect();

  navObserver = new IntersectionObserver(
    () => {
      updateActiveNavByScroll();
    },
    {
      threshold: [0.2, 0.45, 0.7]
    }
  );

  sections.forEach((section) => navObserver.observe(section));
}

/* ---------------- PARALLAX / SOFT MOTION ---------------- */

function applyParallax() {
  const scrollY = window.scrollY;

  if (heroBg) {
    heroBg.style.transform = `scale(1.04) translate3d(0, ${scrollY * 0.08}px, 0)`;
  }

  if (heroBlurLayer) {
    const blur = Math.min(scrollY * 0.02, 6);
    heroBlurLayer.style.backdropFilter = `blur(${blur}px)`;
    heroBlurLayer.style.webkitBackdropFilter = `blur(${blur}px)`;
  }

  decorEls.forEach((el, index) => {
    const speed = index === 0 ? 0.045 : index === 1 ? -0.028 : 0.035;
    const rotate = index === 0 ? 0.2 : index === 1 ? -0.12 : 0.15;
    el.style.transform = `translate3d(0, ${scrollY * speed}px, 0) rotate(${scrollY * rotate * 0.02}deg)`;
  });

  sections.forEach((section) => {
    const content = section.querySelector('.content');
    if (!content) return;

    const rect = section.getBoundingClientRect();
    const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
    const move = Math.max(-18, Math.min(18, centerOffset * -0.03));
    const opacity = Math.max(0.88, 1 - Math.abs(centerOffset) / 2400);

    content.style.transform = `translate3d(0, ${move}px, 0)`;
    content.style.opacity = `${opacity}`;
  });

  updateActiveNavByScroll();
}

function initParallax() {
  applyParallax();

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          applyParallax();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
}

/* ---------------- COUNTDOWN ---------------- */

const weddingDate = new Date('2026-04-17T18:00:00+07:00').getTime();

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

function updateCountdown() {
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const now = Date.now();
  const distance = weddingDate - now;

  if (distance <= 0) {
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  daysEl.textContent = String(days).padStart(2, '0');
  hoursEl.textContent = String(hours).padStart(2, '0');
  minutesEl.textContent = String(minutes).padStart(2, '0');
  secondsEl.textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ---------------- RSVP ---------------- */

function updateRSVPState() {
  if (!attendanceSelect || !paxSelect || !guestInput || !submitBtn) return;

  const guestName = guestInput.value.trim();
  const attendance = attendanceSelect.value;

  if (attendance === 'Yes') {
    paxSelect.disabled = false;
  } else {
    paxSelect.disabled = true;
    paxSelect.value = '';
  }

  const ready =
    guestName !== '' &&
    attendance &&
    (attendance === 'No' || paxSelect.value);

  submitBtn.disabled = !ready;
  submitBtn.classList.toggle('enabled', ready);
}

guestInput?.addEventListener('input', updateRSVPState);
attendanceSelect?.addEventListener('change', updateRSVPState);
paxSelect?.addEventListener('change', updateRSVPState);

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

rsvpForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const guestName = guestInput.value.trim() || 'แขกผู้มีเกียรติ';
  const wishText = wishInput?.value.trim();

  if (wishText && wishesList) {
    const article = document.createElement('article');
    article.className = 'wish-item';
    article.innerHTML = `
      <p class="thai-text">${escapeHtml(wishText)}</p>
      <h3 class="thai-title">${escapeHtml(guestName)}</h3>
    `;
    wishesList.prepend(article);
  }

  if (thankYouMessage) {
    thankYouMessage.style.display = 'block';
    setTimeout(() => {
      thankYouMessage.style.display = 'none';
    }, 2200);
  }

  rsvpForm.reset();
  paxSelect.disabled = true;
  submitBtn.disabled = true;
  submitBtn.classList.remove('enabled');
});

/* ---------------- GALLERY ---------------- */

thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    const newSrc = thumb.dataset.src;
    if (!newSrc || !galleryMain) return;

    thumbs.forEach((t) => t.classList.remove('active'));

    galleryMain.style.opacity = '0.2';
    galleryMain.style.transform = 'scale(1.015)';

    setTimeout(() => {
      galleryMain.src = newSrc;
      thumb.classList.add('active');
    }, 140);

    galleryMain.onload = () => {
      galleryMain.style.opacity = '1';
      galleryMain.style.transform = 'scale(1)';
    };
  });
});

/* ---------------- SAFETY ---------------- */

window.addEventListener('pageshow', () => {
  if (window.scrollY < 10) {
    updateActiveNavByScroll();
  }
});
