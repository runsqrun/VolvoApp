const screens = {
  discover: document.getElementById('screen-discover'),
  buy: document.getElementById('screen-buy'),
  more: document.getElementById('screen-more'),
  drive: document.getElementById('screen-drive')
};

const floatingCta = document.getElementById('floating-cta');
const toMoreBtn = document.getElementById('to-more-btn');
const backBtn = document.getElementById('back-btn');

let activeScreen = 'discover';
let lastScrollY = 0;

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle('active', key === name);
  });
  activeScreen = name;

  if (name !== 'more') {
    floatingCta.classList.remove('show');
  } else {
    lastScrollY = window.scrollY;
  }

  window.scrollTo({ top: 0, behavior: 'auto' });
}

document.querySelectorAll('[data-target]').forEach((element) => {
  element.addEventListener('click', () => {
    showScreen(element.getAttribute('data-target'));
  });
});

toMoreBtn.addEventListener('click', () => {
  showScreen('more');
});

backBtn.addEventListener('click', () => {
  showScreen('buy');
});

window.addEventListener(
  'scroll',
  () => {
    if (activeScreen !== 'more') return;

    const current = window.scrollY;
    const direction = current - lastScrollY;

    if (direction < -2 && current > 120) {
      floatingCta.classList.add('show');
    }

    if (direction > 2) {
      floatingCta.classList.remove('show');
    }

    lastScrollY = current;
  },
  { passive: true }
);

showScreen('discover');

/* ── 车型解读 tab switching ── */
document.querySelectorAll('.mr-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mr-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.mr-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('panel-' + tab.getAttribute('data-tab'));
    if (panel) panel.classList.add('active');
  });
});

/* ── 车主权益 tab switching ── */
document.querySelectorAll('.ob-tabs .v-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ob-tabs .v-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.ob-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('ob-' + tab.getAttribute('data-ob'));
    if (panel) panel.classList.add('active');
  });
});

/* ══════════════════════════════════════
   智能选车 Sheet + Chat Logic
   ══════════════════════════════════════ */
(() => {
  const overlay = document.getElementById('smart-overlay');
  const sheet   = document.getElementById('smart-sheet');
  const closeBtn = document.getElementById('ss-close');
  const input   = document.getElementById('ss-input');
  const sendBtn = document.getElementById('ss-send');
  const body    = document.getElementById('ss-body');
  const openBtn = document.getElementById('smart-pick-btn');

  // Volvo car knowledge base for recommendations
  const carDB = [
    { name: 'XC90', price: '¥638,900起', tag: '旗舰七座', desc: '旗舰级豪华七座SUV，宽敞空间满足全家出行', img: './assets/hero-car.png', keywords: ['家庭','七座','大空间','SUV','旗舰','豪华','露营','长途'] },
    { name: 'XC60', price: '¥399,900起', tag: '豪华中型', desc: '北欧豪华中型SUV，兼顾驾驶乐趣与实用性', img: './assets/hero-car.png', keywords: ['通勤','中型','SUV','运动','日常','城市','均衡'] },
    { name: 'XC40', price: '¥269,900起', tag: '都市精选', desc: '紧凑型都市SUV，灵活穿梭城市每一天', img: './assets/hero-car.png', keywords: ['通勤','城市','紧凑','SUV','年轻','都市','小型','经济'] },
    { name: 'S90',  price: '¥449,900起', tag: '北欧旗舰', desc: '沃尔沃旗舰轿车，优雅气度商务之选', img: './assets/hero-car.png', keywords: ['商务','轿车','旗舰','优雅','豪华','舒适'] },
    { name: 'S60',  price: '¥329,900起', tag: '运动轿车', desc: '北欧豪华运动轿车，彰显个性驾驶品味', img: './assets/hero-car.png', keywords: ['运动','轿车','驾驶','个性','年轻','通勤','城市'] },
    { name: 'V60',  price: '¥369,900起', tag: '旅行生活', desc: '北欧豪华旅行车，承载自由生活方式', img: './assets/hero-car.png', keywords: ['旅行','自驾','露营','户外','生活','家庭','装载'] },
    { name: 'C40',  price: '¥289,900起', tag: '纯电轿跑', desc: '纯电轿跑SUV，引领未来出行新方式', img: './assets/hero-car.png', keywords: ['纯电','电动','环保','轿跑','未来','科技','年轻'] },
    { name: 'EX30', price: '¥209,900起', tag: '纯电入门', desc: '小巧纯电SUV，城市通勤的绿色之选', img: './assets/hero-car.png', keywords: ['纯电','电动','通勤','城市','小型','经济','入门','环保'] },
  ];

  function openSheet() {
    overlay.classList.add('open');
    sheet.classList.add('open');
    setTimeout(() => input.focus(), 400);
  }

  function closeSheet() {
    overlay.classList.remove('open');
    sheet.classList.remove('open');
  }

  openBtn.addEventListener('click', openSheet);
  closeBtn.addEventListener('click', closeSheet);
  overlay.addEventListener('click', closeSheet);

  function addMsg(html, type) {
    const div = document.createElement('div');
    div.className = 'ss-msg ss-msg-' + type;
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'ss-msg ss-msg-ai ss-typing';
    div.innerHTML = '<div class="ss-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function matchCars(text) {
    const scored = carDB.map(car => {
      let score = 0;
      car.keywords.forEach(kw => { if (text.includes(kw)) score += 1; });
      // boost SUV if mentioned
      if (text.match(/suv/i) && car.keywords.includes('SUV')) score += 2;
      // boost family / 家 related
      if ((text.includes('家') || text.includes('孩子') || text.includes('老人')) && car.keywords.includes('家庭')) score += 2;
      // boost if car name mentioned directly
      if (text.toUpperCase().includes(car.name)) score += 5;
      return { ...car, score };
    });
    scored.sort((a, b) => b.score - a.score);
    // Return top 3, but at least 2 even if no match
    const results = scored.slice(0, 3);
    if (results[0].score === 0) {
      // No matches, recommend popular ones
      return [carDB[1], carDB[0], carDB[6]]; // XC60, XC90, C40
    }
    return results;
  }

  function buildRecoHTML(cars) {
    let html = '<div class="ss-bubble">根据您的需求，为您推荐以下车型：</div>';
    html += '<div class="ss-reco-cards">';
    cars.forEach(car => {
      html += '<div class="ss-reco-card" data-car="' + car.name + '">'
        + '<div class="ss-reco-card-img"><img src="' + car.img + '" alt="' + car.name + '" /></div>'
        + '<div class="ss-reco-card-body">'
        + '<p class="ss-reco-card-name">沃尔沃 ' + car.name + '</p>'
        + '<p class="ss-reco-card-price">' + car.price + '</p>'
        + '<span class="ss-reco-card-tag">' + car.tag + '</span>'
        + '<button class="ss-reco-card-go">查看详情 →</button>'
        + '</div></div>';
    });
    html += '</div>';
    html += '<div class="ss-bubble">点击卡片即可查看车型详情，您也可以继续描述需求进一步筛选。</div>';
    html += '<div class="ss-actions">'
      + '<button class="ss-act" data-act="regen" title="重新生成"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 8a5.5 5.5 0 0 1-9.38 3.9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M2.5 8a5.5 5.5 0 0 1 9.38-3.9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M2.5 13V10h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 3v3h-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      + '<button class="ss-act" data-act="like" title="赞同"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 14H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2m0 7V7m0 7h6.65a2 2 0 0 0 1.98-1.72l.67-4.5A1 1 0 0 0 13.31 6H10V3.5a1.5 1.5 0 0 0-1.5-1.5h-.1a.6.6 0 0 0-.56.39L5.97 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      + '<button class="ss-act" data-act="dislike" title="不赞同"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11 2h2a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2m0-7V9m0-7H4.35a2 2 0 0 0-1.98 1.72l-.67 4.5A1 1 0 0 0 2.69 10H6v2.5A1.5 1.5 0 0 0 7.5 14h.1a.6.6 0 0 0 .56-.39L10.03 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      + '</div>';
    return html;
  }

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    addMsg('<div class="ss-bubble">' + text + '</div>', 'user');
    input.value = '';

    const typing = addTyping();

    setTimeout(() => {
      typing.remove();
      const cars = matchCars(text);
      const aiDiv = addMsg(buildRecoHTML(cars), 'ai');
      body.scrollTop = body.scrollHeight;

      // Bind card clicks
      aiDiv.querySelectorAll('.ss-reco-card').forEach(card => {
        card.addEventListener('click', () => {
          closeSheet();
          showScreen('more');
        });
      });

      // Bind action icons
      aiDiv.querySelector('[data-act="regen"]').addEventListener('click', () => {
        aiDiv.remove();
        const t2 = addTyping();
        setTimeout(() => {
          t2.remove();
          const newDiv = addMsg(buildRecoHTML(matchCars(text)), 'ai');
          body.scrollTop = body.scrollHeight;
          newDiv.querySelectorAll('.ss-reco-card').forEach(c => {
            c.addEventListener('click', () => { closeSheet(); showScreen('more'); });
          });
          bindActions(newDiv, text);
        }, 1000 + Math.random() * 600);
      });
      bindActions(aiDiv, text);
    }, 1200 + Math.random() * 800);
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) handleSend();
  });

  function bindActions(container, userText) {
    container.querySelectorAll('.ss-act[data-act="like"], .ss-act[data-act="dislike"]').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.ss-act').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // Suggestion bubble clicks
  const sugWrap = document.getElementById('ss-suggestions');
  sugWrap.querySelectorAll('.ss-sug').forEach((btn) => {
    btn.addEventListener('click', () => {
      input.value = btn.textContent;
      sugWrap.classList.add('hidden');
      handleSend();
    });
  });
})();

/* ── 用车页 Carousel ── */
(function () {
  const screen = document.getElementById('screen-drive');
  const track = document.getElementById('drive-track');
  const dotsWrap = document.getElementById('drive-dots');
  if (!screen || !track || !dotsWrap) return;

  const slides = track.querySelectorAll('.drive-slide');
  const dots = dotsWrap.querySelectorAll('.drive-dot');
  const total = slides.length;
  let current = 0; // Start at CLEANZONE (now first slide)
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let dragging = false;
  let isHorizontalSwipe = null;

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, total - 1));
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    // Play/pause video on CLEANZONE slide
    const video = document.getElementById('drive-video');
    if (video) {
      if (current === 0) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }

  // Initialize position
  goTo(current);

  // Touch events for swipe — listen on entire screen
  screen.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    deltaX = 0;
    dragging = true;
    isHorizontalSwipe = null;
    track.style.transition = 'none';
  }, { passive: true });

  screen.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    // Determine swipe direction on first significant movement
    if (isHorizontalSwipe === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isHorizontalSwipe = Math.abs(dx) > Math.abs(dy);
    }

    if (!isHorizontalSwipe) return;

    // Prevent vertical scroll when swiping horizontally
    e.preventDefault();

    deltaX = dx;
    const pct = -current * 100 + (deltaX / track.parentElement.offsetWidth) * 100;
    track.style.transform = `translateX(${pct}%)`;
  }, { passive: false });

  screen.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    const threshold = 50;
    if (isHorizontalSwipe) {
      if (deltaX < -threshold) goTo(current + 1);
      else if (deltaX > threshold) goTo(current - 1);
      else goTo(current);
    }
    isHorizontalSwipe = null;
  });

  // Dot clicks
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });
})();
