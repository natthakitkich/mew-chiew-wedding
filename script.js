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

let currentSectionIndex = 0;
let musicPlaying = false;
let wheelLocked = false;
let touchStartY = 0;
let isTransitioning = false;

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function resetReveal(section) {
  section.querySelectorAll('.reveal').forEach((el) => {
    el.classList.remove('show');
  });
}

function playReveal(section) {
  const revealItems = [...section.querySelectorAll('.reveal')];
  revealItems.forEach((el, idx) => {
    setTimeout(() => {
      el.classList.add('show');
    }, 70 + idx * 55);
  });
}

function updateNav(activeId) {
  navItems.forEach((item) => {
    item.classList.toggle('active', item.getAttribute('href') === `#${activeId}`);
  });
}

function scrollPageTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto'
  });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function showSection(index, force = false) {
  if (isTransitioning && !force) return;

  const nextIndex = Math.max(0, Math.min(index, sections.length - 1));
  if (!force && nextIndex === currentSectionIndex && sections[currentSectionIndex]?.classList.contains('active')) {
    return;
  }

  isTransitioning = true;
  currentSectionIndex = nextIndex;

  sections.forEach((section, i) => {
    const isActive = i === currentSectionIndex;
    section.classList.toggle('active', isActive);
    resetReveal(section);
  });

  const activeSection = sections[currentSectionIndex];
  const activeId = activeSection.id;

  updateNav(activeId);
  history.replaceState(null, '', window.location.pathname);

  scrollPageTop();

  requestAnimationFrame(() => {
    playReveal(activeSection);
  });

  setTimeout(() => {
    isTransitioning = false;
  }, 500);
}

function nextSection() {
  if (currentSectionIndex < sections.length - 1) {
    showSection(currentSectionIndex + 1);
  }
}

function prevSection() {
  if (currentSectionIndex > 0) {
    showSection(currentSectionIndex - 1);
  }
}

function forceHomeOnLoad() {
  history.replaceState(null, '', window.location.pathname);
  currentSectionIndex = 0;

  sections.forEach((section, i) => {
    section.classList.toggle('active', i === 0);
    resetReveal(section);
  });

  updateNav('hero');
  scrollPageTop();
}

openInvitationBtn?.addEventListener('click', async () => {
  inviteOverlay.classList.add('hidden');
  mainContent.classList.remove('locked');

  forceHomeOnLoad();

  try {
    await bgm.play();
    musicPlaying = true;
    musicIcon.textContent = 'pause';
  } catch (_) {}

  setTimeout(() => {
    inviteOverlay.style.display = 'none';
    playReveal(sections[0]);
  }, 850);
});

musicBtn?.addEventListener('click', async () => {
  try {
    if (musicPlaying) {
      bgm.pause();
      musicPlaying = false;
      musicIcon.textContent = 'music_note';
    } else {
      await bgm.play();
      musicPlaying = true;
      musicIcon.textContent = 'pause';
    }
  } catch (_) {}
});

navItems.forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    if (mainContent.classList.contains('locked')) return;

    const target = item.getAttribute('href').replace('#', '');
    const index = sections.findIndex((sec) => sec.id === target);

    if (index >= 0) {
      showSection(index);
    }
  });
});

window.addEventListener(
  'wheel',
  (e) => {
    if (mainContent.classList.contains('locked')) return;
    if (wheelLocked || isTransitioning) return;

    const atTop = window.scrollY <= 4;
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    wheelLocked = true;

    if (e.deltaY > 16 && atBottom) nextSection();
    if (e.deltaY < -16 && atTop) prevSection();

    setTimeout(() => {
      wheelLocked = false;
    }, 700);
  },
  { passive: true }
);

window.addEventListener(
  'touchstart',
  (e) => {
    touchStartY = e.changedTouches[0].clientY;
  },
  { passive: true }
);

window.addEventListener(
  'touchend',
  (e) => {
    if (mainContent.classList.contains('locked')) return;
    if (isTransitioning) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) < 60) return;

    const atTop = window.scrollY <= 4;
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    if (diff > 0 && atBottom) nextSection();
    if (diff < 0 && atTop) prevSection();
  },
  { passive: true }
);

window.addEventListener('keydown', (e) => {
  if (mainContent.classList.contains('locked')) return;
  if (isTransitioning) return;

  if (e.key === 'ArrowDown' || e.key === 'PageDown') nextSection();
  if (e.key === 'ArrowUp' || e.key === 'PageUp') prevSection();
});

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

copyAccountBtn?.addEventListener('click', () => {
  if (!copyToast) return;
  copyToast.style.display = 'block';
  setTimeout(() => {
    copyToast.style.display = 'none';
  }, 1800);
});

thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    const newSrc = thumb.dataset.src;
    if (!newSrc || !galleryMain) return;

    thumbs.forEach((t) => t.classList.remove('active'));
    thumb.classList.add('active');
    galleryMain.src = newSrc;
  });
});

window.addEventListener('load', () => {
  forceHomeOnLoad();
});
