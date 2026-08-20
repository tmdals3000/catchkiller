window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
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
const API_VOTES = '/api/votes';

let votes = { a: 0, b: 0, c: 0 };
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

  let suppressClick = false;

  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      if (i === currentIndex) {
        card.classList.toggle('flipped');
        startAuto();
        return;
      }
      goTo(i);
      startAuto();
    });
  });

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
        suppressClick = true;
        dx < 0 ? next() : prev();
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
  const chars = [];
  const accentStart = original.indexOf('용의자');
  const accentEnd = accentStart === -1 ? -1 : accentStart + '용의자'.length;
  Array.from(original).forEach((ch, i) => {
    if (ch === ' ') {
      el.appendChild(document.createTextNode(' '));
      return;
    }
    const span = document.createElement('span');
    span.className = 'reveal-char' + (i >= accentStart && i < accentEnd ? ' reveal-char-danger' : '');
    span.textContent = ch;
    el.appendChild(span);
    chars.push(span);
  });

  let ticking = false;
  function update() {
    ticking = false;
    const rect = el.getBoundingClientRect();
    const start = window.innerHeight * 0.7;
    const end = start - window.innerHeight * 0.18;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));

    chars.forEach((span) => {
      span.style.opacity = String(progress);
      span.style.transform = `translateY(${10 * (1 - progress)}px)`;
    });
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

voteBtn.addEventListener('click', async () => {
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
  try {
    const res = await fetch(API_VOTES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspectId: selected, previousSuspectId: myVote }),
    });
    if (!res.ok) throw new Error(`vote failed: ${res.status}`);
    const tally = await res.json();
    votes = tally.votes;
    myVote = selected;
    localStorage.setItem(KEY_MYVOTE, myVote);
    resetBarsForRefill();
  } catch (err) {
    console.error(err);
    voteStatus.textContent = '투표 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
  } finally {
    voteBtn.disabled = false;
    render();
  }
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

  voteFooterLeft.textContent = voted ? `TOTAL ${total} VOTES` : '투표 후 실시간 현황이 공개됩니다';

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

async function init() {
  try {
    const res = await fetch(API_VOTES);
    if (res.ok) votes = (await res.json()).votes;
  } catch (err) {
    console.error(err);
  }
  render();
}

init();
