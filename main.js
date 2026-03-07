const screens = {
  discover: document.getElementById('screen-discover'),
  buy: document.getElementById('screen-buy'),
  more: document.getElementById('screen-more'),
  drive: document.getElementById('screen-drive'),
  compare: document.getElementById('screen-compare')
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
    { name: 'XC90', price: '¥429,900起', tag: '旗舰七座', subtitle: '进口旗舰大六座', powerTag: '轻混/混动', desc: '旗舰级豪华七座SUV，宽敞空间满足全家出行', img: './assets/car-model-transparent.png', keywords: ['家庭','七座','大空间','SUV','旗舰','豪华','露营','长途'],
      specs: {
        '整车尺寸': { '长/宽/高(mm)': '4953/1958/1776', '轴距(mm)': '2984', '后备箱容积(L)': '262-1816' },
        '动力系统': { '发动机类型': '2.0T 涡轮增压', '最大功率(kW/hp)': '210/286', '最大扭矩(N·m)': '420', '变速器': '8挡手自一体' },
        '电驱系统': { '电池类型': '18.8 kWh 锂电池', '电机功率(kW/hp)': '107/145', '充电时间(0-80%)': '32分钟' },
        '综合性能': { 'WLTC纯电续航(km)': '71', 'CLTC综合续航(km)': '860', '最高速度(km/h)': '180', '0-100km/h(s)': '5.9' },
        '底盘悬架': { '驱动模式': '四驱', '悬架': '前-双叉臂/后-多连杆' },
        '智能安全': { '主动安全': '紧急制动+碰撞预警+车道保持', '被动安全': '笼式车身+全车8气囊' },
      }
    },
    { name: 'XC60', price: '¥259,900起', tag: '豪华中型', subtitle: '新北欧豪华SUV', powerTag: '混动/轻混', desc: '北欧豪华中型SUV，兼顾驾驶乐趣与实用性', img: './assets/car-model-transparent.png', keywords: ['通勤','中型','SUV','运动','日常','城市','均衡'],
      specs: {
        '整车尺寸': { '长/宽/高(mm)': '4708/1902/1658', '轴距(mm)': '2865', '后备箱容积(L)': '483-1410' },
        '动力系统': { '发动机类型': '2.0T 涡轮增压', '最大功率(kW/hp)': '184/250', '最大扭矩(N·m)': '350', '变速器': '8挡手自一体' },
        '电驱系统': { '电池类型': '18.8 kWh 锂电池', '电机功率(kW/hp)': '107/145', '充电时间(0-80%)': '32分钟' },
        '综合性能': { 'WLTC纯电续航(km)': '74', 'CLTC综合续航(km)': '900', '最高速度(km/h)': '180', '0-100km/h(s)': '6.5' },
        '底盘悬架': { '驱动模式': '前驱/四驱可选', '悬架': '前-双叉臂/后-多连杆' },
        '智能安全': { '主动安全': '紧急制动+碰撞预警+车道保持', '被动安全': '笼式车身+前排双气囊+侧气帘' },
      }
    },
    { name: 'XC40', price: '¥201,900起', tag: '都市精选', subtitle: '都市豪华纯正SUV', powerTag: '轻混', desc: '紧凑型都市SUV，灵活穿梭城市每一天', img: './assets/car-model-transparent.png', keywords: ['通勤','城市','紧凑','SUV','年轻','都市','小型','经济'],
      specs: {
        '整车尺寸': { '长/宽/高(mm)': '4440/1863/1652', '轴距(mm)': '2702', '后备箱容积(L)': '452-1328' },
        '动力系统': { '发动机类型': '1.5T 涡轮增压', '最大功率(kW/hp)': '129/175', '最大扭矩(N·m)': '265', '变速器': '7挡双离合' },
        '电驱系统': { '电池类型': '-', '电机功率(kW/hp)': '-', '充电时间(0-80%)': '-' },
        '综合性能': { 'WLTC纯电续航(km)': '-', 'CLTC综合续航(km)': '-', '最高速度(km/h)': '180', '0-100km/h(s)': '8.4' },
        '底盘悬架': { '驱动模式': '前驱', '悬架': '前-麦弗逊/后-多连杆' },
        '智能安全': { '主动安全': '紧急制动+碰撞预警+车道辅助', '被动安全': '笼式车身+前排双气囊+侧气帘' },
      }
    },
    { name: 'S90',  price: '¥267,900起', tag: '北欧旗舰', subtitle: '北欧豪华旗舰型轿车', powerTag: '轻混/混动', desc: '沃尔沃旗舰轿车，优雅气度商务之选', img: './assets/car-model-transparent.png', keywords: ['商务','轿车','旗舰','优雅','豪华','舒适'],
      specs: {
        '整车尺寸': { '长/宽/高(mm)': '5090/1879/1450', '轴距(mm)': '3061', '后备箱容积(L)': '500' },
        '动力系统': { '发动机类型': '2.0T 涡轮增压', '最大功率(kW/hp)': '184/250', '最大扭矩(N·m)': '350', '变速器': '8挡手自一体' },
        '电驱系统': { '电池类型': '-', '电机功率(kW/hp)': '-', '充电时间(0-80%)': '-' },
        '综合性能': { 'WLTC纯电续航(km)': '-', 'CLTC综合续航(km)': '-', '最高速度(km/h)': '230', '0-100km/h(s)': '7.2' },
        '底盘悬架': { '驱动模式': '前驱', '悬架': '前-双叉臂/后-多连杆' },
        '智能安全': { '主动安全': '紧急制动+碰撞预警+车道保持', '被动安全': '笼式车身+全车6气囊' },
      }
    },
    { name: 'S60',  price: '¥306,900起', tag: '运动轿车', subtitle: '北欧运动豪华轿车', powerTag: '轻混/混动', desc: '北欧豪华运动轿车，彰显个性驾驶品味', img: './assets/car-model-transparent.png', keywords: ['运动','轿车','驾驶','个性','年轻','通勤','城市'],
      specs: {
        '整车尺寸': { '长/宽/高(mm)': '4761/1850/1437', '轴距(mm)': '2872', '后备箱容积(L)': '442' },
        '动力系统': { '发动机类型': '2.0T 涡轮增压', '最大功率(kW/hp)': '184/250', '最大扭矩(N·m)': '350', '变速器': '8挡手自一体' },
        '电驱系统': { '电池类型': '-', '电机功率(kW/hp)': '-', '充电时间(0-80%)': '-' },
        '综合性能': { 'WLTC纯电续航(km)': '-', 'CLTC综合续航(km)': '-', '最高速度(km/h)': '230', '0-100km/h(s)': '6.9' },
        '底盘悬架': { '驱动模式': '前驱', '悬架': '前-双叉臂/后-多连杆' },
        '智能安全': { '主动安全': '紧急制动+碰撞预警+车道辅助', '被动安全': '笼式车身+前排双气囊+侧气帘' },
      }
    },
    { name: 'V60',  price: '¥298,900起', tag: '旅行生活', subtitle: '动感豪华旅行车', powerTag: '轻混', desc: '北欧豪华旅行车，承载自由生活方式', img: './assets/car-model-transparent.png', keywords: ['旅行','自驾','露营','户外','生活','家庭','装载'],
      specs: {
        '整车尺寸': { '长/宽/高(mm)': '4761/1850/1427', '轴距(mm)': '2872', '后备箱容积(L)': '529-1441' },
        '动力系统': { '发动机类型': '2.0T 涡轮增压', '最大功率(kW/hp)': '184/250', '最大扭矩(N·m)': '350', '变速器': '8挡手自一体' },
        '电驱系统': { '电池类型': '-', '电机功率(kW/hp)': '-', '充电时间(0-80%)': '-' },
        '综合性能': { 'WLTC纯电续航(km)': '-', 'CLTC综合续航(km)': '-', '最高速度(km/h)': '230', '0-100km/h(s)': '7.1' },
        '底盘悬架': { '驱动模式': '前驱', '悬架': '前-双叉臂/后-多连杆' },
        '智能安全': { '主动安全': '紧急制动+碰撞预警+车道保持', '被动安全': '笼式车身+前排双气囊+侧气帘' },
      }
    },
    { name: 'C40',  price: '¥289,900起', tag: '纯电轿跑', subtitle: '纯电轿跑SUV', powerTag: '纯电', desc: '纯电轿跑SUV，引领未来出行新方式', img: './assets/car-model-transparent.png', keywords: ['纯电','电动','环保','轿跑','未来','科技','年轻'],
      specs: {
        '整车尺寸': { '长/宽/高(mm)': '4440/1873/1591', '轴距(mm)': '2702', '后备箱容积(L)': '413-1205' },
        '动力系统': { '发动机类型': '纯电驱动', '最大功率(kW/hp)': '-', '最大扭矩(N·m)': '-', '变速器': '单速固定齿比' },
        '电驱系统': { '电池类型': '69 kWh 三元锂电池', '电机功率(kW/hp)': '170/231', '充电时间(0-80%)': '27分钟' },
        '综合性能': { 'WLTC纯电续航(km)': '420', 'CLTC综合续航(km)': '530', '最高速度(km/h)': '180', '0-100km/h(s)': '7.4' },
        '底盘悬架': { '驱动模式': '前驱', '悬架': '前-麦弗逊/后-多连杆' },
        '智能安全': { '主动安全': '紧急制动+碰撞预警+车道保持', '被动安全': '笼式车身+全车6气囊' },
      }
    },
    { name: 'EX30', price: '¥200,800起', tag: '纯电入门', subtitle: '北欧高智感纯电SUV', powerTag: '纯电', desc: '小巧纯电SUV，城市通勤的绿色之选', img: './assets/car-model-transparent.png', keywords: ['纯电','电动','通勤','城市','小型','经济','入门','环保'],
      specs: {
        '整车尺寸': { '长/宽/高(mm)': '4233/1836/1549', '轴距(mm)': '2650', '后备箱容积(L)': '318-904' },
        '动力系统': { '发动机类型': '纯电驱动', '最大功率(kW/hp)': '-', '最大扭矩(N·m)': '-', '变速器': '单速固定齿比' },
        '电驱系统': { '电池类型': '51 kWh 磷酸铁锂', '电机功率(kW/hp)': '200/272', '充电时间(0-80%)': '25分钟' },
        '综合性能': { 'WLTC纯电续航(km)': '344', 'CLTC综合续航(km)': '400', '最高速度(km/h)': '180', '0-100km/h(s)': '5.3' },
        '底盘悬架': { '驱动模式': '后驱', '悬架': '前-麦弗逊/后-多连杆' },
        '智能安全': { '主动安全': '紧急制动+碰撞预警+车道辅助', '被动安全': '笼式车身+前排双气囊+侧气帘' },
      }
    },
  ];

  // Expose carDB globally for compare page
  window.__volvoCarDB = carDB;

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

  /* ── Compare intent detection ── */
  function isCompareIntent(text) {
    const kw = ['怎么选','对比','比较','区别','差异','哪个好','哪款好','vs','VS','pk','PK','选哪个','还是'];
    return kw.some(k => text.includes(k));
  }

  /* ── Build compare entry card (replaces reco cards for compare intent) ── */
  function buildCompareEntryHTML(cars) {
    const names = cars.map(c => c.name);
    let html = '<div class="ss-bubble">为您找到了以下车型，可以直接对比参数配置：</div>';
    html += '<div class="ss-compare-entry">';
    html += '<div class="ss-compare-cars">';
    cars.forEach(car => {
      html += '<div class="ss-compare-car-chip">'
        + '<img src="' + car.img + '" alt="' + car.name + '" />'
        + '<span>' + car.name + '</span>'
        + '<span class="ss-compare-car-price">' + car.price + '</span>'
        + '</div>';
    });
    html += '</div>';
    html += '<button class="ss-compare-go-btn" data-cars="' + names.join(',') + '">开始对比 →</button>';
    html += '</div>';
    html += '<div class="ss-bubble">点击"开始对比"查看详细参数对比，或继续描述您的需求。</div>';
    html += '<div class="ss-actions">'
      + '<button class="ss-act" data-act="regen" title="重新生成"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 8a5.5 5.5 0 0 1-9.38 3.9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M2.5 8a5.5 5.5 0 0 1 9.38-3.9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M2.5 13V10h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 3v3h-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      + '<button class="ss-act" data-act="like" title="赞同"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 14H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2m0 7V7m0 7h6.65a2 2 0 0 0 1.98-1.72l.67-4.5A1 1 0 0 0 13.31 6H10V3.5a1.5 1.5 0 0 0-1.5-1.5h-.1a.6.6 0 0 0-.56.39L5.97 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      + '<button class="ss-act" data-act="dislike" title="不赞同"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11 2h2a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2m0-7V9m0-7H4.35a2 2 0 0 0-1.98 1.72l-.67 4.5A1 1 0 0 0 2.69 10H6v2.5A1.5 1.5 0 0 0 7.5 14h.1a.6.6 0 0 0 .56-.39L10.03 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      + '</div>';
    return html;
  }

  function buildRecoHTML(cars) {
    let html = '<div class="ss-bubble">根据您的需求，为您推荐以下车型：</div>';
    html += '<div class="ss-reco-cards">';
    cars.forEach(car => {
      html += '<div class="ss-reco-card" data-car="' + car.name + '">'
        + '<div class="ss-reco-card-img"><img src="' + car.img + '" alt="' + car.name + '" /></div>'
        + '<div class="ss-reco-card-body">'
        + '<p class="ss-reco-card-name">' + car.name + '</p>'
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
      const compare = isCompareIntent(text);
      const html = compare ? buildCompareEntryHTML(cars) : buildRecoHTML(cars);
      const aiDiv = addMsg(html, 'ai');
      body.scrollTop = body.scrollHeight;

      if (compare) {
        // Bind compare button
        const goBtn = aiDiv.querySelector('.ss-compare-go-btn');
        if (goBtn) {
          goBtn.addEventListener('click', () => {
            const names = goBtn.getAttribute('data-cars').split(',');
            closeSheet();
            openCompare(names);
          });
        }
      } else {
        // Bind card clicks
        aiDiv.querySelectorAll('.ss-reco-card').forEach(card => {
          card.addEventListener('click', () => {
            closeSheet();
            showScreen('more');
          });
        });
      }

      // Bind regen
      aiDiv.querySelector('[data-act="regen"]').addEventListener('click', () => {
        aiDiv.remove();
        const t2 = addTyping();
        setTimeout(() => {
          t2.remove();
          const newCars = matchCars(text);
          const newCompare = isCompareIntent(text);
          const newHtml = newCompare ? buildCompareEntryHTML(newCars) : buildRecoHTML(newCars);
          const newDiv = addMsg(newHtml, 'ai');
          body.scrollTop = body.scrollHeight;

          if (newCompare) {
            const btn = newDiv.querySelector('.ss-compare-go-btn');
            if (btn) btn.addEventListener('click', () => {
              closeSheet();
              openCompare(btn.getAttribute('data-cars').split(','));
            });
          } else {
            newDiv.querySelectorAll('.ss-reco-card').forEach(c => {
              c.addEventListener('click', () => { closeSheet(); showScreen('more'); });
            });
          }
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

/* ═══════════════════════════════════════════════
   Compare Page Logic  (车型对比)
   ═══════════════════════════════════════════════ */
(function () {
  const compareScreen = document.getElementById('screen-compare');
  const carRowEl = document.getElementById('cmp-car-row');
  const bodyEl = document.getElementById('cmp-body');
  const tableEl = document.getElementById('cmp-table');
  const backBtn = document.getElementById('cmp-back');
  const pickerOverlay = document.getElementById('cmp-picker-overlay');
  const pickerList = document.getElementById('cmp-picker-list');
  const pickerClose = document.getElementById('cmp-picker-close');
  if (!compareScreen) return;

  let selectedCars = []; // array of car objects (max 3)
  const MAX_CARS = 3;
  const LABEL_W = 90;   // px – fixed label column width
  const COL_MIN = 100;   // px – min width per car column

  function getCarDB() {
    return window.__volvoCarDB || [];
  }

  /* ── Open compare screen ── */
  window.openCompare = function (carNames) {
    const db = getCarDB();
    selectedCars = carNames
      .map(n => db.find(c => c.name === n))
      .filter(Boolean)
      .slice(0, MAX_CARS);

    // Hide all other screens
    Object.values(screens).forEach(s => s && s.classList.remove('active'));
    document.querySelector('.bottom-tab')?.classList.add('hidden');
    compareScreen.classList.add('active');

    render();
  };

  function closeCompare() {
    compareScreen.classList.remove('active');
    document.querySelector('.bottom-tab')?.classList.remove('hidden');
    showScreen('buy');
  }

  backBtn.addEventListener('click', closeCompare);

  /* ── Render everything ── */
  function render() {
    // Set table min-width: label + N columns (always 3 slots shown)
    const cols = Math.max(selectedCars.length, MAX_CARS);
    tableEl.style.minWidth = (LABEL_W + cols * COL_MIN) + 'px';
    renderCarRow();
    renderSpecTable();
  }

  /* ── Car selector row ── */
  function renderCarRow() {
    let html = '<div class="cmp-car-row-spacer"></div>';
    selectedCars.forEach((car, idx) => {
      html += '<div class="cmp-car-slot">'
        + '<button class="cmp-car-slot-remove" data-idx="' + idx + '">&times;</button>'
        + '<img src="' + car.img + '" alt="' + car.name + '" />'
        + '<span class="cmp-car-slot-name">' + car.name + '</span>'
        + '<span class="cmp-car-slot-price">' + car.price + '</span>'
        + '</div>';
    });
    if (selectedCars.length < MAX_CARS) {
      html += '<div class="cmp-add-slot" id="cmp-add-btn">'
        + '<div class="cmp-add-circle">+</div>'
        + '<span class="cmp-add-label">添加车型</span>'
        + '</div>';
    }
    carRowEl.innerHTML = html;

    // Bind remove
    carRowEl.querySelectorAll('.cmp-car-slot-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        selectedCars.splice(idx, 1);
        render();
      });
    });

    // Bind add
    const addBtn = document.getElementById('cmp-add-btn');
    if (addBtn) addBtn.addEventListener('click', openPicker);
  }

  /* ── Spec table ── */
  function renderSpecTable() {
    if (selectedCars.length === 0) {
      bodyEl.innerHTML = '<div style="padding:40px 16px;text-align:center;color:#999;font-size:14px;">请添加车型开始对比</div>';
      return;
    }

    // Collect all spec sections from first car (all cars share same schema)
    const sectionNames = Object.keys(selectedCars[0].specs);
    let html = '';

    sectionNames.forEach(section => {
      html += '<div class="cmp-section-title">' + section + '</div>';
      const keys = Object.keys(selectedCars[0].specs[section]);
      keys.forEach(key => {
        html += '<div class="cmp-row">';
        html += '<div class="cmp-row-label">' + key + '</div>';
        html += '<div class="cmp-row-values">';

        const values = selectedCars.map(car => car.specs[section][key] || '-');
        // Determine best value for highlighting
        const bestIdx = findBestValue(key, values);

        values.forEach((val, vi) => {
          const hl = (bestIdx === vi && selectedCars.length > 1) ? ' highlight' : '';
          html += '<div class="cmp-row-val' + hl + '">' + val + '</div>';
        });

        html += '</div></div>';
      });
    });

    bodyEl.innerHTML = html;
  }

  /* Determine which value is "best" for highlighting: bigger is better for most numeric specs */
  function findBestValue(key, values) {
    // Skip non-comparable fields
    const skipKeys = ['发动机类型','变速器','电池类型','驱动模式','悬架','主动安全','被动安全','长/宽/高(mm)'];
    if (skipKeys.some(sk => key.includes(sk))) return -1;

    // Extract numeric values
    const nums = values.map(v => {
      if (v === '-') return null;
      const m = v.replace(/,/g, '').match(/[\d.]+/);
      return m ? parseFloat(m[0]) : null;
    });

    // If all null or all same, no highlight
    const valids = nums.filter(n => n !== null);
    if (valids.length < 2) return -1;
    if (new Set(valids).size === 1) return -1;

    // 0-100: lower is better. Charging time: lower is better.
    const lowerBetter = key.includes('0-100') || key.includes('充电时间');
    let bestVal = lowerBetter ? Infinity : -Infinity;
    let bestIdx = -1;

    nums.forEach((n, i) => {
      if (n === null) return;
      if (lowerBetter ? n < bestVal : n > bestVal) {
        bestVal = n;
        bestIdx = i;
      }
    });

    return bestIdx;
  }

  /* ── Car picker ── */
  function openPicker() {
    const db = getCarDB();
    const selectedNames = selectedCars.map(c => c.name);
    let html = '';
    db.forEach(car => {
      const alreadySelected = selectedNames.includes(car.name);
      html += '<div class="cmp-picker-card' + (alreadySelected ? ' disabled' : '') + '" data-name="' + car.name + '">'
        + '<div class="cmp-picker-card-info">'
        + '<div class="cmp-picker-card-name">' + car.name + '</div>'
        + (car.subtitle ? '<div class="cmp-picker-card-subtitle">' + car.subtitle + '</div>' : '')
        + (car.powerTag ? '<span class="cmp-picker-card-tag">' + car.powerTag + '</span>' : '')
        + '<div class="cmp-picker-card-price">' + car.price + '</div>'
        + '</div>'
        + '<img class="cmp-picker-card-img" src="' + car.img + '" alt="' + car.name + '" />'
        + (alreadySelected ? '<span class="cmp-picker-card-check">✓</span>' : '')
        + '</div>';
    });
    pickerList.innerHTML = html;
    pickerOverlay.classList.add('open');

    // Bind picks
    pickerList.querySelectorAll('.cmp-picker-card:not(.disabled)').forEach(item => {
      item.addEventListener('click', () => {
        const name = item.getAttribute('data-name');
        const car = db.find(c => c.name === name);
        if (car && selectedCars.length < MAX_CARS) {
          selectedCars.push(car);
          closePicker();
          render();
        }
      });
    });
  }

  function closePicker() {
    pickerOverlay.classList.remove('open');
  }

  pickerClose.addEventListener('click', closePicker);
  // Close sheet when tapping backdrop
  pickerOverlay.addEventListener('click', (e) => {
    if (e.target === pickerOverlay) closePicker();
  });
})();
