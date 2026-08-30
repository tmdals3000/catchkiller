window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

// Stabilize viewport-height sections (e.g. .splash) against in-app browser
// chrome (KakaoTalk, Instagram, etc.) whose bottom bar slides in/out while
// scrolling. Their WebViews often lack real support for `svh`, so `100vh`
// silently falls back to the old, resize-on-toolbar-toggle behavior there.
// Measuring innerHeight once and only re-measuring on a real width change
// (rotation/resize) — never on a height-only change (toolbar show/hide) —
// keeps --vh, and anything sized from it, from jumping around.
function setStableVH() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
setStableVH();
let lastViewportWidth = window.innerWidth;
window.addEventListener('resize', () => {
  if (window.innerWidth !== lastViewportWidth) {
    lastViewportWidth = window.innerWidth;
    setStableVH();
  }
});

const SCRAMBLE_CHARS = '_!X$0-+*#';

function getScrambleChar(prevChar) {
  let char;
  do {
    char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
  } while (char === prevChar);
  return char;
}

function runScramble(el, text, speed, onDone, onTick) {
  const phase1Steps = text.length * 2;
  const phase2Steps = text.length * 2;
  let startTime = null;
  let lastStep = -1;

  function finish() {
    el.textContent = text;
    if (onTick) onTick(text.length);
    onDone();
  }

  function renderPhase1(step) {
    const currentLength = Math.min(step + 1, text.length);
    const chars = [];
    for (let i = 0; i < currentLength; i++) {
      chars.push(getScrambleChar(chars[i - 1]));
    }
    for (let i = currentLength; i < text.length; i++) chars.push(' ');
    el.textContent = chars.join('');
    if (onTick) onTick(0);
  }

  function renderPhase2(step) {
    const revealedCount = Math.floor(step / 2);
    const chars = [];
    for (let i = 0; i < revealedCount && i < text.length; i++) chars.push(text[i]);
    if (revealedCount < text.length) {
      chars.push(step % 2 === 0 ? '_' : getScrambleChar());
    }
    for (let i = chars.length; i < text.length; i++) chars.push(getScrambleChar());
    el.textContent = chars.join('');
    if (onTick) onTick(revealedCount);
  }

  el.textContent = ' '.repeat(text.length);

  function frame(now) {
    if (startTime === null) startTime = now;
    const totalStep = Math.floor((now - startTime) / speed);

    if (totalStep >= phase1Steps + phase2Steps) {
      finish();
      return;
    }
    if (totalStep !== lastStep) {
      lastStep = totalStep;
      if (totalStep < phase1Steps) renderPhase1(totalStep);
      else renderPhase2(totalStep - phase1Steps);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function setupIntroScramble() {
  const overlay = document.getElementById('introOverlay');
  const el = document.getElementById('introText');
  const elKr = document.getElementById('introTextKr');
  if (!overlay || !el || !elKr) return;

  const krText = '캐치킬러';
  // revealedCount thresholds in "CATCH KILLER" -> how many kr syllables to show
  const krMilestones = [
    { at: 3, count: 1 },  // CAT -> 캐
    { at: 5, count: 2 },  // CATCH -> 캐치
    { at: 10, count: 3 }, // CATCH KILL -> 캐치킬
    { at: 12, count: 4 }, // CATCH KILLER -> 캐치킬러
  ];

  function updateKr(revealedCount) {
    let target = 0;
    krMilestones.forEach((m) => { if (revealedCount >= m.at) target = m.count; });
    const chars = [];
    for (let i = 0; i < target; i++) chars.push(krText[i]);
    for (let i = target; i < krText.length; i++) chars.push(getScrambleChar());
    elKr.textContent = chars.join('');
  }

  function onDone() {
    setTimeout(() => {
      overlay.classList.add('intro-done');
      document.body.classList.add('intro-revealed');
      setTimeout(() => overlay.remove(), 700);
    }, 500);
  }

  runScramble(el, 'CATCH KILLER', 30, onDone, updateKr);
}
setupIntroScramble();

function checkViewportZoom() {
  if (!window.visualViewport) return;
  if (Math.abs(window.visualViewport.scale - 1) > 0.02) {
    window.location.reload();
  }
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    setTimeout(checkViewportZoom, 80);
  }
});
window.addEventListener('focus', () => {
  setTimeout(checkViewportZoom, 80);
});

const SUSPECTS = [
  { id: 'a', name: '최준영' },
  { id: 'b', name: '이채린' },
  { id: 'c', name: '차승협' },
];

const KEY_MYVOTE = 'catchkiller_myvote';

// No vote server: the tally lives only in the browser. Start from a fixed
// baseline so the bars read like a real poll, then fold in this visitor's own
// pick locally. Nothing is sent anywhere and no data is collected.
const BASELINE_VOTES = { a: 43, b: 58, c: 36 };

let votes = { ...BASELINE_VOTES };
let myVote = localStorage.getItem(KEY_MYVOTE) || null;
let selected = myVote;

const hamburger = document.querySelector('.hamburger');
const dropdownMenu = document.querySelector('.dropdown-menu');

function closeMenu() {
  hamburger.classList.remove('open');
  dropdownMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

if (hamburger && dropdownMenu) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdownMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  dropdownMenu.querySelectorAll('.menu-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && e.target !== hamburger) closeMenu();
  });
}

const castScheduleBtns = document.querySelectorAll('[data-cast-schedule-trigger]');
const castScheduleModal = document.getElementById('castScheduleModal');
const castScheduleClose = document.getElementById('castScheduleClose');

if (castScheduleBtns.length && castScheduleModal) {
  function openCastSchedule() {
    castScheduleModal.classList.add('open');
    castScheduleModal.setAttribute('aria-hidden', 'false');
  }
  function closeCastSchedule() {
    castScheduleModal.classList.remove('open');
    castScheduleModal.setAttribute('aria-hidden', 'true');
  }
  castScheduleBtns.forEach((btn) => btn.addEventListener('click', openCastSchedule));
  castScheduleModal.addEventListener('click', closeCastSchedule);
  if (castScheduleClose) {
    castScheduleClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCastSchedule();
    });
  }
  const castScheduleDonateText = document.getElementById('castScheduleDonateText');
  if (castScheduleDonateText) {
    castScheduleDonateText.addEventListener('click', (e) => e.stopPropagation());
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCastSchedule();
  });
}

const donateOpenBtns = document.querySelectorAll('[data-donate-trigger]');
const donateModal = document.getElementById('donateModal');
const donateClose = document.getElementById('donateClose');
const donateBackdrop = document.getElementById('donateBackdrop');
const donateCopyBtn = document.getElementById('donateCopyBtn');
const donateAccountText = document.getElementById('donateAccountText');

if (donateOpenBtns.length && donateModal) {
  function openDonate() {
    donateModal.classList.add('open');
    donateModal.setAttribute('aria-hidden', 'false');
  }
  function closeDonate() {
    donateModal.classList.remove('open');
    donateModal.setAttribute('aria-hidden', 'true');
  }
  donateOpenBtns.forEach((btn) => {
    btn.addEventListener('click', openDonate);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDonate();
      }
    });
  });
  if (donateClose) donateClose.addEventListener('click', closeDonate);
  if (donateBackdrop) donateBackdrop.addEventListener('click', closeDonate);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDonate();
  });
}

if (donateCopyBtn && donateAccountText) {
  donateCopyBtn.addEventListener('click', async () => {
    const text = donateAccountText.textContent.trim();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const temp = document.createElement('textarea');
        temp.value = text;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.focus();
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      donateCopyBtn.textContent = '복사됨';
      donateCopyBtn.classList.add('copied');
      setTimeout(() => {
        donateCopyBtn.textContent = '복사';
        donateCopyBtn.classList.remove('copied');
      }, 1500);
    } catch (err) {
      donateCopyBtn.textContent = '복사 실패';
      setTimeout(() => { donateCopyBtn.textContent = '복사'; }, 1500);
    }
  });
}

function setupShowcaseCarousel(root, autoMs) {
  const cards = Array.from(root.querySelectorAll('.suspect-showcase-card'));
  const total = cards.length;
  let currentIndex = Math.floor(total / 2);

  function render() {
    cards.forEach((card, i) => {
      let pos = (i - currentIndex) % total;
      if (pos > Math.floor(total / 2)) pos -= total;
      if (pos < -Math.floor(total / 2)) pos += total;

      const isCenter = pos === 0;
      const isAdjacent = Math.abs(pos) === 1;

      card.style.transform = `translateX(${pos * 38}%) scale(${isCenter ? 1 : isAdjacent ? .8 : .7}) rotateY(${pos * -10}deg)`;
      card.style.zIndex = isCenter ? 10 : isAdjacent ? 5 : 1;
      card.style.opacity = isCenter ? 1 : isAdjacent ? .4 : 0;
      card.style.filter = isCenter ? 'blur(0px)' : 'blur(4px)';
      card.style.visibility = Math.abs(pos) > 1 ? 'hidden' : 'visible';

      if (!isCenter) card.classList.remove('flipped');
    });
  }

  function next() {
    currentIndex = (currentIndex + 1) % total;
    render();
  }

  function prev() {
    currentIndex = (currentIndex - 1 + total) % total;
    render();
  }

  function goTo(i) {
    currentIndex = ((i % total) + total) % total;
    render();
  }

  let timer = null;
  function stopAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  function startAuto() {
    if (!autoMs) return;
    stopAuto();
    timer = setInterval(next, autoMs);
  }

  root.querySelector('.suspect-showcase-nav.prev').addEventListener('click', () => {
    prev();
    startAuto();
  });
  root.querySelector('.suspect-showcase-nav.next').addEventListener('click', () => {
    next();
    startAuto();
  });

  const stage = root.querySelector('.suspect-showcase-stage');
  if (stage) {
    let startX = 0;
    let startY = 0;
    let dragging = false;

    stage.addEventListener('pointerdown', (e) => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        dx < 0 ? next() : prev();
        startAuto();
        return;
      }

      // Pointer capture (set on `stage` above) retargets e.target on
      // subsequent pointer events to the capturing element itself, so
      // e.target.closest(...) can't find the actual card underneath.
      // Hit-test by coordinates instead, which ignores capture entirely.
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const target = hit && hit.closest && hit.closest('.suspect-showcase-card');
      const i = target ? cards.indexOf(target) : -1;
      if (i !== -1) {
        if (i === currentIndex) {
          target.classList.toggle('flipped');
        } else {
          goTo(i);
        }
        startAuto();
      }
    });

    stage.addEventListener('pointercancel', () => {
      dragging = false;
    });
  }

  render();
  startAuto();

  // The scale()/rotateY() transforms above can be computed against a stale
  // size on first paint, especially on mobile before images finish loading and
  // the surrounding layout settles. Force a reflow once everything has actually
  // finished loading so the transforms recompute against final layout.
  function forceReflow() {
    root.style.display = 'none';
    void root.offsetHeight;
    root.style.display = '';
  }
  if (document.readyState === 'complete') {
    forceReflow();
  } else {
    window.addEventListener('load', forceReflow, { once: true });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAuto();
    } else {
      startAuto();
      forceReflow();
    }
  });
}

document.querySelectorAll('.suspect-showcase').forEach((root) => setupShowcaseCarousel(root, 5000));

function setupTextReveal() {
  const el = document.querySelector('.reveal-text');
  if (!el) return;

  const original = el.textContent;
  el.textContent = '';
  const accentStart = original.indexOf('용의자');
  const accentEnd = accentStart === -1 ? -1 : accentStart + '용의자'.length;
  let i = 0;
  Array.from(original).forEach((ch, rawIndex) => {
    if (ch === ' ') {
      el.appendChild(document.createTextNode(' '));
      return;
    }
    const danger = rawIndex >= accentStart && rawIndex < accentEnd;
    const span = document.createElement('span');
    span.className = 'reveal-char' + (danger ? ' reveal-char-danger' : '');
    span.textContent = ch;
    span.style.animationDelay = (i * 0.03) + 's';
    el.appendChild(span);
    i += 1;
  });

  let triggered = false;
  let ticking = false;
  function update() {
    ticking = false;
    if (triggered) return;
    const rect = el.getBoundingClientRect();
    const start = window.innerHeight * 0.8;
    const end = start - window.innerHeight * 0.18;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));

    if (progress > 0) {
      triggered = true;
      el.classList.add('revealed');
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}
setupTextReveal();

const ballotEls = {};
document.querySelectorAll('.ballot').forEach((el) => {
  ballotEls[el.dataset.id] = el;
  el.addEventListener('click', () => {
    selected = el.dataset.id;
    render();
  });
});

const voteBtn = document.querySelector('.vote-btn');
const voteStatus = document.querySelector('.vote-status');
const voteFooterLeft = document.querySelector('.vote-footer-left');

function resetBarsForRefill() {
  const fills = document.querySelectorAll('.ballot-fill');
  fills.forEach((fill) => {
    fill.style.transition = 'none';
    fill.style.width = '0%';
  });
  void document.body.offsetHeight;
  fills.forEach((fill) => {
    fill.style.transition = '';
  });
}

voteBtn.addEventListener('click', () => {
  if (!selected) {
    document.querySelector('.ballots').classList.remove('nudge');
    voteBtn.classList.remove('shake');
    void voteBtn.offsetWidth;
    document.querySelector('.ballots').classList.add('nudge');
    voteBtn.classList.add('shake');
    voteStatus.textContent = '용의자를 먼저 선택해주세요';
    voteStatus.style.color = 'var(--danger2)';
    return;
  }
  if (selected === myVote) return;
  voteBtn.disabled = true;

  // Vote-changing, not vote-stacking: pull the previous pick back down first.
  if (myVote && myVote !== selected) {
    votes[myVote] = Math.max(0, (votes[myVote] || 0) - 1);
  }
  votes[selected] = (votes[selected] || 0) + 1;
  myVote = selected;
  localStorage.setItem(KEY_MYVOTE, myVote);
  resetBarsForRefill();

  voteBtn.disabled = false;
  render();
});

function render() {
  const voted = !!myVote;
  const total = SUSPECTS.reduce((sum, s) => sum + (votes[s.id] || 0), 0);
  const maxCount = Math.max(...SUSPECTS.map((s) => votes[s.id] || 0));
  const leader = voted && total > 0 ? SUSPECTS.find((s) => (votes[s.id] || 0) === maxCount).id : null;

  SUSPECTS.forEach((s) => {
    const isLeader = leader === s.id;

    const el = ballotEls[s.id];
    const count = votes[s.id] || 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const mine = myVote === s.id;
    const isSelected = selected === s.id;

    el.classList.toggle('selected', isSelected);

    const dot = el.querySelector('.ballot-dot');
    dot.textContent = mine ? '✓' : (isSelected ? '●' : '');
    dot.style.borderColor = isSelected ? 'var(--accent)' : 'var(--line)';
    dot.style.background = mine ? 'var(--accent)' : 'transparent';
    dot.style.color = mine ? '#0c0b0a' : 'var(--accent)';

    el.querySelector('.ballot-fill').style.width = voted ? pct + '%' : '0%';
    el.querySelector('.ballot-fill').style.background = mine
      ? 'linear-gradient(90deg,var(--danger),var(--danger2))'
      : isLeader
        ? 'linear-gradient(90deg,var(--accent-deep),var(--accent))'
        : 'linear-gradient(90deg,var(--line),var(--accent-deep))';

    const pctText = el.querySelector('.pct-text');
    pctText.textContent = '??';
    pctText.style.color = mine ? 'var(--danger2)' : isLeader ? 'var(--accent)' : 'var(--ink-soft)';
    el.querySelector('.pct-unit').textContent = '%';
    el.querySelector('.pct-count').textContent = '??표';
  });

  voteFooterLeft.textContent = voted ? 'total ??? votes' : '투표 후 실시간 현황이 공개됩니다';

  if (voted) {
    const me = SUSPECTS.find((s) => s.id === myVote);
    voteStatus.textContent = `당신의 범인 → ${me.name}`;
    voteStatus.style.color = 'var(--accent)';
  } else if (selected) {
    const se = SUSPECTS.find((s) => s.id === selected);
    voteStatus.textContent = `${se.name} 선택됨`;
    voteStatus.style.color = 'var(--ink-dim)';
  } else {
    voteStatus.textContent = '용의자를 선택하세요';
    voteStatus.style.color = 'var(--ink-dim)';
  }

  const canCommit = !!selected && selected !== myVote;
  voteBtn.classList.toggle('can-commit', canCommit);
  voteBtn.textContent = voted ? (canCommit ? '투표 변경' : '투표 완료') : '투표하기';
}

function init() {
  // Returning visitor who already voted: reflect their pick in the baseline.
  if (myVote && votes[myVote] != null) {
    votes[myVote] += 1;
  }
  render();
}

init();
