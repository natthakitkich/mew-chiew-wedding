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

const heroBg = document.querySelector('.hero-fixed-bg');
const decorEls = [...document.querySelectorAll('.decor')];
const allRevealEls = [...document.querySelectorAll('.reveal')];

let musicPlaying = false;
let isProgrammaticScroll = false;
let activeSectionId = '';
let touchStartY = 0;
let touchStartX = 0;
let wheelLock = false;

// -----------------------------
// FORCE START AT FIRST PAGE
// -----------------------------
function resetToFirstSection() {
  if (!sections.length) return;
  history.replaceState(null, '', window.location.pathname + window.location.search);
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}

// -----------------------------
// SECTION / NAV
// -----------------------------
function updateNavByScroll() {
  const middle = window.innerHeight * 0.45;
  let current = sections[0];

  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= middle && rect.bottom >= middle) {
      current = section;
      break;
    }
  }

  if (!current) return;

  activeSectionId = current.id;

  navItems.forEach((item) => {
    item.classList.toggle('active', item.getAttribute('href') === `#${activeSectionId}`);
  });
}

function smoothScrollToSection(section) {
  if (!section) return;
  isProgrammaticScroll = true;

  section.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  setTimeout(() => {
    isProgrammaticScroll = false;
  }, 900);
}

function goToNextSection() {
  const currentIndex = sections.findIndex((sec) => sec.id === activeSectionId);
  if (currentIndex >= 0 && currentIndex < sections.length - 1) {
    smoothScrollToSection(sections[currentIndex + 1]);
  }
}

function goToPrevSection() {
  const currentIndex = sections.findIndex((sec) => sec.id === activeSectionId);
  if (currentIndex > 0) {
    smoothScrollToSection(sections[currentIndex - 1]);
  }
}

navItems.forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    if (mainContent.classList.contains('locked')) return;
    const targetId = item.getAttribute('href').replace('#', '');
    const targetSection = document.getElementById(targetId);
    smoothScrollToSection(targetSection);
  });
});

// -----------------------------
// OPEN INVITATION
// -----------------------------
openInvitationBtn?.addEventListener('click', async () => {
  inviteOverlay.classList.add('hidden');
  mainContent.classList.remove('locked');

  resetToFirstSection();

  try {
    await bgm.play();
    musicPlaying = true;
    if (musicIcon) musicIcon.textContent = 'pause';
  } catch (_) {
    musicPlaying = false;
    if (musicIcon) musicIcon.textContent = 'music_note';
  }

  setTimeout(() => {
    if (inviteOverlay) inviteOverlay.style.display = 'none';
    runInitialAnimations();
    updateOnScroll();
  }, 700);
});

// -----------------------------
// MUSIC
// -----------------------------
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

// -----------------------------
// REVEAL / APPLE-LIKE MOVEMENT
// -----------------------------
function runInitialAnimations() {
  allRevealEls.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('show');
    }, 120 + i * 70);
  });
}

function updateRevealByViewport() {
  const triggerPoint = window.innerHeight * 0.88;

  allRevealEls.forEach((el) => {
    const rect = el.getBoundingClientRect();

    if (rect.top < triggerPoint && rect.bottom > 0) {
      el.classList.add('show');
    } else if (rect.top > window.innerHeight || rect.bottom < 0) {
      el.classList.remove('show');
    }
  });
}

function updateParallax() {
  const scrollY = window.scrollY;

  if (heroBg) {
    const scale = 1.02 + Math.min(scrollY * 0.00008, 0.035);
    const translate = Math.min(scrollY * 0.18, 46);
    heroBg.style.transform = `translate3d(0, ${translate}px, 0) scale(${scale})`;
  }

  decorEls.forEach((el, index) => {
    const speed = (index + 1) * 0.08 + 0.05;
    const y = scrollY * speed;
    const x = index % 2 === 0 ? scrollY * 0.015 : -scrollY * 0.015;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}

function updateSectionDepth() {
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const progress = Math.max(0, Math.min(1, 1 - Math.abs(rect.top) / viewportH));

    const content = section.querySelector('.content');
    if (content) {
      const y = (1 - progress) * 18;
      const scale = 0.985 + progress * 0.015;
      content.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      content.style.opacity = String(0.72 + progress * 0.28);
    }
  });
}

function updateOnScroll() {
  if (mainContent.classList.contains('locked')) return;
  updateNavByScroll();
  updateRevealByViewport();
  updateParallax();
  updateSectionDepth();
}

// -----------------------------
// SCROLL / SWIPE NAVIGATION
// -----------------------------
window.addEventListener(
  'wheel',
  (e) => {
    if (mainContent.classList.contains('locked')) return;
    if (isProgrammaticScroll) return;

    updateOnScroll();

    if (wheelLock) return;
    if (Math.abs(e.deltaY) < 40) return;

    wheelLock = true;

    if (e.deltaY > 0) {
      goToNextSection();
    } else {
      goToPrevSection();
    }

    setTimeout(() => {
      wheelLock = false;
    }, 850);
  },
  { passive: true }
);

window.addEventListener(
  'touchstart',
  (e) => {
    if (!e.changedTouches || !e.changedTouches.length) return;
    touchStartY = e.changedTouches[0].clientY;
    touchStartX = e.changedTouches[0].clientX;
  },
  { passive: true }
);

window.addEventListener(
  'touchend',
  (e) => {
    if (mainContent.classList.contains('locked')) return;
    if (isProgrammaticScroll) return;
    if (!e.changedTouches || !e.changedTouches.length) return;

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;

    const diffY = touchStartY - touchEndY;
    const diffX = touchStartX - touchEndX;

    // ล็อกซ้ายขวา ไม่ให้ horizontal swipe มาป่วน
    if (Math.abs(diffX) > Math.abs(diffY)) return;
    if (Math.abs(diffY) < 50) return;

    if (diffY > 0) {
      goToNextSection();
    } else {
      goToPrevSection();
    }
  },
  { passive: true }
);

window.addEventListener('keydown', (e) => {
  if (mainContent.classList.contains('locked')) return;
  if (isProgrammaticScroll) return;

  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault();
    goToNextSection();
  }

  if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault();
    goToPrevSection();
  }
});

// -----------------------------
// ALWAYS START FROM FIRST PAGE
// -----------------------------
window.addEventListener('load', () => {
  resetToFirstSection();
  updateNavByScroll();
  updateRevealByViewport();
});

window.addEventListener('pageshow', () => {
  resetToFirstSection();
  updateNavByScroll();
});

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

// -----------------------------
// COUNTDOWN
// -----------------------------
// วันงานจริง: 17 เมษายน 2026 เวลา 18:00 น. ประเทศไทย
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

// -----------------------------
// RSVP
// -----------------------------
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
    (attendance === 'No' || paxSelect.value !== '');

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
    }, 2500);
  }
});

// -----------------------------
// COPY / OPEN CHAT
// -----------------------------
copyAccountBtn?.addEventListener('click', () => {
  const openChatUrl =
    'https://line.me/ti/g2/hJcYpgcTd5nx5b6lqSgsQ7KLDhPlTvjrlMOQUg?utm_source=invitation&utm_medium=QR_code&utm_campaign=default';

  window.open(openChatUrl, '_blank');

  if (copyToast) {
    copyToast.textContent = 'กำลังเปิด OpenChat';
    copyToast.style.display = 'block';
    setTimeout(() => {
      copyToast.style.display = 'none';
    }, 1800);
  }
});

// -----------------------------
// GALLERY
// -----------------------------
thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    const newSrc = thumb.dataset.src;
    if (!newSrc || !galleryMain) return;

    thumbs.forEach((t) => t.classList.remove('active'));
    thumb.classList.add('active');

    galleryMain.style.opacity = '0.35';

    setTimeout(() => {
      galleryMain.src = newSrc;
      galleryMain.onload = () => {
        galleryMain.style.opacity = '1';
      };
    }, 180);
  });
});

// -----------------------------
// LIVE SCROLL EFFECTS
// -----------------------------
window.addEventListener(
  'scroll',
  () => {
    updateOnScroll();
  },
  { passive: true }
);

window.addEventListener(
  'resize',
  () => {
    updateOnScroll();
  },
  { passive: true }
);
