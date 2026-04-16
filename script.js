const sections = [...document.querySelectorAll('[data-section]')];
const navItems = [...document.querySelectorAll('.nav-item')];
const revealEls = [...document.querySelectorAll('.reveal')];
const inviteOverlay = document.getElementById('inviteOverlay');
const openInvitationBtn = document.getElementById('openInvitationBtn');
const mainContent = document.getElementById('mainContent');
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');
const attendanceSelect = document.getElementById('attendanceSelect');
const paxSelect = document.getElementById('paxSelect');
const submitBtn = document.getElementById('submitBtn');
const rsvpForm = document.getElementById('rsvpForm');
const thankYouMessage = document.getElementById('thankYouMessage');
const copyAccountBtn = document.getElementById('copyAccountBtn');
const copyToast = document.getElementById('copyToast');
const accountNumber = document.getElementById('accountNumber');
const galleryMain = document.getElementById('galleryMain');
const thumbs = [...document.querySelectorAll('.thumb')];

let currentSectionIndex = 0;
let musicPlaying = false;

function showSection(index) {
  currentSectionIndex = Math.max(0, Math.min(index, sections.length - 1));

  sections.forEach((section, i) => {
    section.classList.toggle('active', i === currentSectionIndex);
    section.classList.toggle('section-visible', i === currentSectionIndex);
    section.classList.toggle('hidden-section', i !== currentSectionIndex);
  });

  const activeSection = sections[currentSectionIndex];
  const activeId = activeSection.id;

  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('href') === `#${activeId}`);
  });

  activeSection.querySelectorAll('.reveal').forEach((el, idx) => {
    setTimeout(() => el.classList.add('show'), 50 + idx * 40);
  });

  history.replaceState(null, '', `#${activeId}`);
}

function nextSection() {
  if (currentSectionIndex < sections.length - 1) showSection(currentSectionIndex + 1);
}

function prevSection() {
  if (currentSectionIndex > 0) showSection(currentSectionIndex - 1);
}

function initHash() {
  const hash = window.location.hash.replace('#', '');
  const foundIndex = sections.findIndex(sec => sec.id === hash);
  showSection(foundIndex >= 0 ? foundIndex : 0);
}

openInvitationBtn.addEventListener('click', async () => {
  inviteOverlay.classList.add('hidden');
  mainContent.classList.remove('locked');
  try {
    await bgm.play();
    musicPlaying = true;
    musicIcon.textContent = 'pause';
  } catch (_) {}
  setTimeout(() => inviteOverlay.style.display = 'none', 850);
  initHash();
});

musicBtn.addEventListener('click', async () => {
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

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const target = item.getAttribute('href').replace('#', '');
    const index = sections.findIndex(sec => sec.id === target);
    if (index >= 0) showSection(index);
  });
});

let wheelLocked = false;
window.addEventListener('wheel', (e) => {
  if (mainContent.classList.contains('locked')) return;
  if (wheelLocked) return;
  wheelLocked = true;
  if (e.deltaY > 10) nextSection();
  if (e.deltaY < -10) prevSection();
  setTimeout(() => wheelLocked = false, 700);
}, { passive: true });

let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (mainContent.classList.contains('locked')) return;
  const touchEndY = e.changedTouches[0].clientY;
  const diff = touchStartY - touchEndY;
  if (Math.abs(diff) < 50) return;
  if (diff > 0) nextSection();
  else prevSection();
}, { passive: true });

const weddingDate = new Date('2026-01-18T11:00:00+08:00').getTime();
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

function updateCountdown() {
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
  const attendance = attendanceSelect.value;
  if (attendance === 'Yes') {
    paxSelect.disabled = false;
  } else {
    paxSelect.disabled = true;
    paxSelect.value = '';
  }

  const ready = attendance && (attendance === 'No' || paxSelect.value);
  submitBtn.disabled = !ready;
  submitBtn.classList.toggle('enabled', ready);
}

attendanceSelect.addEventListener('change', updateRSVPState);
paxSelect.addEventListener('change', updateRSVPState);

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  thankYouMessage.style.display = 'block';
});

copyAccountBtn?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(accountNumber.textContent.trim());
    copyToast.style.display = 'block';
    setTimeout(() => copyToast.style.display = 'none', 1800);
  } catch (_) {}
});

thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    thumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    galleryMain.src = thumb.dataset.src;
  });
});

window.addEventListener('keydown', (e) => {
  if (mainContent.classList.contains('locked')) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') nextSection();
  if (e.key === 'ArrowUp' || e.key === 'PageUp') prevSection();
});
