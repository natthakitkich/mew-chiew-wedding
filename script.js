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
const submitBtn = document.getElementById('submitBtn');
const rsvpForm = document.getElementById('rsvpForm');
const thankYouMessage = document.getElementById('thankYouMessage');

const copyAccountBtn = document.getElementById('copyAccountBtn');
const copyToast = document.getElementById('copyToast');

const galleryMain = document.getElementById('galleryMain');
const thumbs = [...document.querySelectorAll('.thumb')];

const revealEls = [...document.querySelectorAll('.reveal')];
const decorEls = [...document.querySelectorAll('.decor')];
const heroBg = document.querySelector('.hero-fixed-bg');

let musicPlaying = false;

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function forceHomeState() {
  history.replaceState(null, '', window.location.pathname);
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function updateNavByScroll() {
  const triggerY = window.innerHeight * 0.35;
  let currentId = sections[0]?.id || 'hero';

  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= triggerY && rect.bottom > triggerY) {
      currentId = section.id;
      break;
    }
  }

  navItems.forEach((item) => {
    item.classList.toggle(
      'active',
      item.getAttribute('href') === `#${currentId}`
    );
  });
}

function initRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function initSectionObserver() {
  const observer = new IntersectionObserver(
    () => updateNavByScroll(),
    {
      threshold: 0.25
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function smoothScrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  history.replaceState(null, '', window.location.pathname);
}

function updateParallax() {
  const scrollY = window.scrollY;

  if (heroBg) {
    heroBg.style.transform = `scale(1.03) translate3d(0, ${scrollY * 0.08}px, 0)`;
  }

  decorEls.forEach((el, index) => {
    const speed = (index % 3 === 0) ? 0.08 : (index % 3 === 1 ? -0.05 : 0.06);
    const section = el.closest('.section');
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const offset = rect.top * speed;
    el.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
}

openInvitationBtn?.addEventListener('click', async () => {
  inviteOverlay.classList.add('hidden');
  mainContent.classList.remove('locked');

  forceHomeState();

  try {
    await bgm.play();
    musicPlaying = true;
    if (musicIcon) musicIcon.textContent = 'pause';
  } catch (_) {}

  setTimeout(() => {
    inviteOverlay.style.display = 'none';
    revealEls.forEach((el, idx) => {
      if (idx < 6) {
        setTimeout(() => el.classList.add('show'), idx * 80);
      }
    });
  }, 850);
});

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

navItems.forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    if (mainContent.classList.contains('locked')) return;

    const targetId = item.getAttribute('href').replace('#', '');
    smoothScrollToSection(targetId);
  });
});

// countdown
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

// RSVP
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

rsvpForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  if (thankYouMessage) {
    thankYouMessage.style.display = 'block';
    setTimeout(() => {
      thankYouMessage.style.display = 'none';
    }, 2200);
  }
});

// toast
copyAccountBtn?.addEventListener('click', () => {
  if (!copyToast) return;

  copyToast.style.display = 'block';
  setTimeout(() => {
    copyToast.style.display = 'none';
  }, 1800);
});

// gallery
thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    const newSrc = thumb.dataset.src;
    if (!newSrc || !galleryMain) return;

    thumbs.forEach((t) => t.classList.remove('active'));
    thumb.classList.add('active');
    galleryMain.src = newSrc;
  });
});

// scroll listeners
window.addEventListener('scroll', () => {
  updateNavByScroll();
  updateParallax();
}, { passive: true });

window.addEventListener('resize', () => {
  updateNavByScroll();
  updateParallax();
});

window.addEventListener('load', () => {
  forceHomeState();
  updateNavByScroll();
  updateParallax();
  initRevealObserver();
  initSectionObserver();
});
