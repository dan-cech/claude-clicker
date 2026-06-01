let cookies = 0;
let cookiesSecond = 0;
let cookiesClick = 1;

let grannyCount = 0;
let factoryCount = 0;
let clickUpgradeCount = 0;

let shopUnlocked = false;
let slotUnlocked = false;

// ── DOM refs ──
let cookieBtn       = document.getElementById("btn-susenka");
let grannyBtn       = document.getElementById("btn-babicka");
let factoryBtn      = document.getElementById("btn-tovarna");
let clickUpgradeBtn = document.getElementById("btn-upgrade-click");
let textSkore       = document.getElementById("skore");
let perClickText    = document.getElementById("per-click");

let shopPanel        = document.getElementById("shop-panel");
let leftPanel        = document.querySelector(".left-panel");
let infoUpgradeClick = document.getElementById("info-upgrade-click");
let infoBabicka      = document.getElementById("info-babicka");
let infoTovarna      = document.getElementById("info-tovarna");

const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", function() {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

let rainContainer = document.getElementById("rain-container");
let slotMachine   = document.getElementById("slot-machine");
let reelEls     = [document.getElementById("reel-0"), document.getElementById("reel-1"), document.getElementById("reel-2")];
let spinBtn     = document.getElementById("spin-btn");
let betInput    = document.getElementById("bet-input");
let betDownBtn  = document.getElementById("bet-down");
let betUpBtn    = document.getElementById("bet-up");
let slotResult  = document.getElementById("slot-result");

// ── Unlock checks ──
function tryUnlockShop() {
    if (!shopUnlocked && cookies >= 10) {
        shopUnlocked = true;
        shopPanel.classList.add("visible");
        leftPanel.classList.add("shop-active");
    }
}

function tryUnlockSlot() {
    if (!slotUnlocked && cookies >= 50) {
        slotUnlocked = true;
        slotMachine.classList.add("visible");
    }
}

// ── Main clicker ──
cookieBtn.addEventListener("click", function(e) {
    cookies += cookiesClick;
    textSkore.textContent = Math.floor(cookies);
    tryUnlockShop();
    tryUnlockSlot();

    // float indicator
    const indicator = document.createElement("div");
    indicator.textContent = "+" + cookiesClick;
    indicator.className = "float-indicator";
    indicator.style.left = e.clientX + "px";
    indicator.style.top = e.clientY + "px";
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 800);

    // glow flash on image
    cookieBtn.classList.remove("flash");
    void cookieBtn.offsetWidth;
    cookieBtn.classList.add("flash");
    cookieBtn.addEventListener("animationend", () => cookieBtn.classList.remove("flash"), { once: true });

    // ripple ring from cursor
    const ripple = document.createElement("div");
    ripple.className = "click-ripple";
    ripple.style.left = e.clientX + "px";
    ripple.style.top = e.clientY + "px";
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    // logo burst at 5+ tokens/click
    if (cookiesClick >= 5) {
        const count = Math.min(6 + Math.floor((cookiesClick - 20) / 20), 12);
        for (let i = 0; i < count; i++) spawnBurst(e.clientX, e.clientY);
    }
});

// ── Shop buttons ──
grannyBtn.addEventListener("click", function() {
    if (cookies >= 10) {
        grannyCount++;
        cookiesSecond += 1;
        cookies -= 10;
        textSkore.textContent = Math.floor(cookies);
        infoBabicka.textContent = "Owned: " + grannyCount + " · +" + grannyCount + "/s";
        floatBuyText(grannyBtn, "+1/s");
    }
});

factoryBtn.addEventListener("click", function() {
    if (cookies >= 50) {
        factoryCount++;
        cookiesSecond += 10;
        cookies -= 50;
        textSkore.textContent = Math.floor(cookies);
        infoTovarna.textContent = "Owned: " + factoryCount + " · +" + (factoryCount * 10) + "/s";
        floatBuyText(factoryBtn, "+10/s");
    }
});

let clickUpgradeCost = 25;
clickUpgradeBtn.addEventListener("click", function() {
    if (cookies >= clickUpgradeCost) {
        cookies -= clickUpgradeCost;
        cookiesClick++;
        clickUpgradeCount++;
        clickUpgradeCost = Math.floor(clickUpgradeCost * 2);
        clickUpgradeBtn.textContent = "⚡ Buy More RAM — " + clickUpgradeCost + " tokens (+1/click)";
        perClickText.textContent = "+" + cookiesClick + " per click";
        textSkore.textContent = Math.floor(cookies);
        infoUpgradeClick.textContent = "Owned: " + clickUpgradeCount + " · +" + cookiesClick + "/click";
        floatBuyText(clickUpgradeBtn, "+1/click");
    }
});

// ── Passive income ──
setInterval(function() {
    cookies += cookiesSecond / 10;
    textSkore.textContent = Math.floor(cookies);
    tryUnlockShop();
    tryUnlockSlot();
    tryStartRain();
}, 100);

// ── Vaněk rain ──
let rainActive = false;

function tryStartRain() {
    if (!rainActive && cookiesSecond >= 1000) {
        rainActive = true;
        setInterval(spawnVanek, 250);
    }
}

function spawnVanek() {
    const img = document.createElement("img");
    img.src = "images/claude.png";
    img.className = "vanek-rain";

    const size = 30 + Math.random() * 26;
    img.style.width  = size + "px";
    img.style.height = size + "px";
    img.style.left   = (Math.random() * 96) + "%";

    const duration = 2.5 + Math.random() * 2;
    img.style.animationDuration = duration + "s";

    rainContainer.appendChild(img);
    setTimeout(() => img.remove(), (duration + 0.1) * 1000);
}

// ── Slot machine ──
const FRUITS  = ['🍒', '🍋', '🍊', '🍇', '🍑'];
const PAYOUTS = { '🍒': 8, '🍋': 15, '🍊': 30, '🍇': 75, '🍑': 200 };

let spinning = false;

function getBet() {
    return Math.max(1, parseInt(betInput.value) || 1);
}

function pickFruit() {
    return FRUITS[Math.floor(Math.random() * FRUITS.length)];
}

function spinReel(reelEl, finalFruit, stopAt) {
    let interval = setInterval(() => { reelEl.textContent = pickFruit(); }, 60);
    setTimeout(() => {
        clearInterval(interval);
        reelEl.textContent = finalFruit;
        reelEl.classList.add("landed");
        setTimeout(() => reelEl.classList.remove("landed"), 200);
    }, stopAt);
}

function evaluateSpin(results, bet) {
    const [a, b, c] = results;
    if (a === b && b === c) {
        const returned = PAYOUTS[a] * bet;
        const profit   = returned - bet;
        cookies += returned;
        textSkore.textContent = Math.floor(cookies);
        slotResult.className = "slot-result win";
        slotResult.textContent = a + a + a + "  win +" + profit + " tokens (" + PAYOUTS[a] + "x)";
    } else if (a === b || b === c || a === c) {
        cookies += bet * 2;
        textSkore.textContent = Math.floor(cookies);
        slotResult.className = "slot-result push";
        slotResult.textContent = "almost — +" + bet + " tokens (2x)";
    } else {
        slotResult.className = "slot-result lose";
        slotResult.textContent = "no match  −" + bet + " tokens";
    }
}

spinBtn.addEventListener("click", function() {
    const bet = getBet();
    if (spinning || cookies < bet) return;

    spinning = true;
    spinBtn.disabled = true;
    slotResult.textContent = "";
    slotResult.className = "slot-result";

    cookies -= bet;
    textSkore.textContent = Math.floor(cookies);

    const results = [pickFruit(), pickFruit(), pickFruit()];

    reelEls.forEach((reel, i) => spinReel(reel, results[i], 200 + i * 200));

    setTimeout(() => {
        evaluateSpin(results, bet);
        spinning = false;
        spinBtn.disabled = false;
    }, 200 + 2 * 200 + 200);
});

betDownBtn.addEventListener("click", function() {
    betInput.value = Math.max(1, getBet() - 5);
});

betUpBtn.addEventListener("click", function() {
    betInput.value = getBet() + 5;
});

betInput.addEventListener("blur", function() {
    betInput.value = Math.max(1, parseInt(betInput.value) || 1);
});

// ── Visual effects ──

function floatBuyText(btn, text) {
    const rect = btn.getBoundingClientRect();
    const el = document.createElement("div");
    el.textContent = text;
    el.className = "float-indicator buy";
    el.style.left = (rect.left + rect.width / 2) + "px";
    el.style.top = rect.top + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

// ── Burst particle physics (rAF-based) ──
const burstParticles = [];
let burstAnimActive  = false;

function animateBurst() {
    for (let i = burstParticles.length - 1; i >= 0; i--) {
        const p  = burstParticles[i];
        p.vx    *= 0.97;
        p.vy     = p.vy * 0.97 + 0.28;   // air resistance + gravity each frame
        p.x     += p.vx;
        p.y     += p.vy;
        p.rot   += p.rotV;
        p.frame++;

        const opacity = p.frame < 45 ? 1 : Math.max(0, 1 - (p.frame - 45) / 25);
        const scale   = Math.max(0.05, 1 - (p.frame / p.life) * 0.95);

        p.el.style.left      = p.x + "px";
        p.el.style.top       = p.y + "px";
        p.el.style.opacity   = opacity;
        p.el.style.transform = `translate(-50%,-50%) rotate(${p.rot}deg) scale(${scale})`;

        if (p.frame >= p.life) {
            p.el.remove();
            burstParticles.splice(i, 1);
        }
    }

    if (burstParticles.length > 0) {
        requestAnimationFrame(animateBurst);
    } else {
        burstAnimActive = false;
    }
}

function spawnBurst(x, y) {
    const el   = document.createElement("img");
    el.src     = "images/claude.png";
    el.className = "burst-particle";
    const size = 16 + Math.random() * 16;
    el.style.width  = size + "px";
    el.style.height = size + "px";
    document.body.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 5;
    burstParticles.push({
        el,
        x: x, y: y,
        vx:   Math.cos(angle) * speed,
        vy:   Math.sin(angle) * speed,
        rot:  0,
        rotV: (Math.random() - 0.5) * 12,
        frame: 0,
        life:  62 + Math.floor(Math.random() * 20),
    });

    if (!burstAnimActive) {
        burstAnimActive = true;
        requestAnimationFrame(animateBurst);
    }
}
