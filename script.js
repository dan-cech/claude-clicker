let tokens = 0;
let tokensPerSecond = 0;
let tokensPerClick = 1;

let serverCount = 0;
let dataCenterCount = 0;
let ramCount = 0;

let shopUnlocked = false;
let slotUnlocked = false;

let tokenMultiplier = 1;
let bonusSecondsLeft = 0;
let bonusInterval = null;

// ── DOM refs ──
let claudeBtn    = document.getElementById("btn-susenka");
let serversBtn   = document.getElementById("btn-babicka");
let dataCenterBtn = document.getElementById("btn-tovarna");
let ramBtn       = document.getElementById("btn-upgrade-click");
let scoreText    = document.getElementById("skore");
let perClickText  = document.getElementById("per-click");
let perSecondText = document.getElementById("per-second");

let shopPanel     = document.getElementById("shop-panel");
let leftPanel     = document.querySelector(".left-panel");
let infoRam       = document.getElementById("info-upgrade-click");
let infoServers   = document.getElementById("info-babicka");
let infoDataCenter = document.getElementById("info-tovarna");

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
    if (!shopUnlocked && tokens >= 10) {
        shopUnlocked = true;
        shopPanel.classList.add("visible");
        leftPanel.classList.add("shop-active");
    }
}

function tryUnlockSlot() {
    if (!slotUnlocked && tokens >= 50) {
        slotUnlocked = true;
        slotMachine.classList.add("visible");
    }
}

// ── Main clicker ──
claudeBtn.addEventListener("click", function(e) {
    const earned = tokensPerClick * tokenMultiplier;
    tokens += earned;
    scoreText.textContent = Math.floor(tokens);
    tryUnlockShop();
    tryUnlockSlot();

    // float indicator
    const indicator = document.createElement("div");
    indicator.textContent = "+" + earned;
    indicator.className = "float-indicator";
    if (tokenMultiplier === 2) indicator.style.color = "#f0c000";
    indicator.style.left = e.clientX + "px";
    indicator.style.top = e.clientY + "px";
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 800);

    // glow flash on image
    claudeBtn.classList.remove("flash");
    void claudeBtn.offsetWidth;
    claudeBtn.classList.add("flash");
    claudeBtn.addEventListener("animationend", () => claudeBtn.classList.remove("flash"), { once: true });

    // ripple ring from cursor
    const ripple = document.createElement("div");
    ripple.className = "click-ripple";
    ripple.style.left = e.clientX + "px";
    ripple.style.top = e.clientY + "px";
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    // logo burst at 5+ tokens/click
    if (tokensPerClick >= 5) {
        const count = Math.min(6 + Math.floor((tokensPerClick - 20) / 20), 12);
        for (let i = 0; i < count; i++) spawnBurst(e.clientX, e.clientY);
    }
});

// ── Shop buttons ──
let serverPrice = 10;
serversBtn.addEventListener("click", function() {
    if (tokens >= serverPrice) {
        serverCount++;
        tokensPerSecond += 1;
        tokens -= serverPrice;
        serverPrice = Math.ceil(serverPrice * 1.1);
        scoreText.textContent = Math.floor(tokens);
        serversBtn.textContent = "Upgrade Servers — " + serverPrice + " tokens";
        infoServers.textContent = "Owned: " + serverCount + " · +" + serverCount + "/s";
        perSecondText.textContent = "+" + tokensPerSecond + " per second";
        floatBuyText(serversBtn, "+1/s");
    }
});

let dataCenterPrice = 50;
dataCenterBtn.addEventListener("click", function() {
    if (tokens >= dataCenterPrice) {
        dataCenterCount++;
        tokensPerSecond += 10;
        tokens -= dataCenterPrice;
        dataCenterPrice = Math.ceil(dataCenterPrice * 1.1);
        scoreText.textContent = Math.floor(tokens);
        dataCenterBtn.textContent = "Upgrade Data Centers — " + dataCenterPrice + " tokens";
        infoDataCenter.textContent = "Owned: " + dataCenterCount + " · +" + (dataCenterCount * 10) + "/s";
        perSecondText.textContent = "+" + tokensPerSecond + " per second";
        floatBuyText(dataCenterBtn, "+10/s");
    }
});

let ramPrice = 25;
ramBtn.addEventListener("click", function() {
    if (tokens >= ramPrice) {
        tokens -= ramPrice;
        tokensPerClick++;
        ramCount++;
        ramPrice = Math.ceil(ramPrice * 1.3);
        ramBtn.textContent = "⚡ Buy More RAM — " + ramPrice + " tokens (+1/click)";
        perClickText.textContent = "+" + tokensPerClick + " per click";
        scoreText.textContent = Math.floor(tokens);
        infoRam.textContent = "Owned: " + ramCount + " · +" + tokensPerClick + "/click";
        floatBuyText(ramBtn, "+1/click");
    }
});

// ── Passive income ──
setInterval(function() {
    tokens += (tokensPerSecond / 10) * tokenMultiplier;
    scoreText.textContent = Math.floor(tokens);
    tryUnlockShop();
    tryUnlockSlot();
    tryStartRain();
}, 100);

// ── Vaněk rain ──
let rainActive = false;
let rainInterval = null;

function tryStartRain() {
    if (!rainActive && tokensPerSecond >= 500) {
        rainActive = true;
        rainInterval = setInterval(spawnVanek, 250);
    }
}

function setRainSpeed(spawnMs) {
    if (!rainActive) return;
    clearInterval(rainInterval);
    rainInterval = setInterval(spawnVanek, spawnMs);
}

function spawnVanek() {
    const img = document.createElement("img");
    img.src = "images/claude.png";
    img.className = "vanek-rain";

    const size = 30 + Math.random() * 26;
    img.style.width  = size + "px";
    img.style.height = size + "px";
    img.style.left   = (Math.random() * 96) + "%";

    const duration = tokenMultiplier === 2
        ? 1.0 + Math.random() * 0.8
        : 2.5 + Math.random() * 2;
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
        tokens += returned;
        scoreText.textContent = Math.floor(tokens);
        slotResult.className = "slot-result win";
        slotResult.textContent = a + a + a + "  win +" + profit + " tokens (" + PAYOUTS[a] + "x)";
        spawnJackpotWave();
        const hole = document.getElementById("jackpot-hole");
        hole.classList.remove("glow");
        void hole.offsetWidth;
        hole.classList.add("glow");
    } else if (a === b || b === c || a === c) {
        tokens += bet * 2;
        scoreText.textContent = Math.floor(tokens);
        slotResult.className = "slot-result push";
        slotResult.textContent = "almost — +" + bet + " tokens (2x)";
    } else {
        slotResult.className = "slot-result lose";
        slotResult.textContent = "no match  −" + bet + " tokens";
    }
}

spinBtn.addEventListener("click", function() {
    const bet = getBet();
    if (spinning || tokens < bet) return;

    spinning = true;
    spinBtn.disabled = true;
    slotResult.textContent = "";
    slotResult.className = "slot-result";

    tokens -= bet;
    scoreText.textContent = Math.floor(tokens);

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
    if (tokenMultiplier === 2)
        el.style.filter = "sepia(1) saturate(4) hue-rotate(-10deg) brightness(1.5)";
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

function spawnJackpotParticle(x, y) {
    const el = document.createElement("img");
    el.src = "images/claude.png";
    el.className = "burst-particle";
    const size = 18 + Math.random() * 14;
    el.style.width  = size + "px";
    el.style.height = size + "px";
    document.body.appendChild(el);

    burstParticles.push({
        el,
        x, y,
        vx:   (Math.random() - 0.5) * 2.5,
        vy:   3 + Math.random() * 5,
        rot:  0,
        rotV: (Math.random() - 0.5) * 10,
        frame: 0,
        life:  90 + Math.floor(Math.random() * 30),
    });

    if (!burstAnimActive) {
        burstAnimActive = true;
        requestAnimationFrame(animateBurst);
    }
}

function spawnJackpotWave() {
    const hole = document.getElementById("jackpot-hole");
    const rect = hole.getBoundingClientRect();

    function wave() {
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const x = rect.left + Math.random() * rect.width;
                spawnJackpotParticle(x, rect.top + rect.height / 2);
            }, i * 25);
        }
    }

    wave();
    setTimeout(wave, 350);
    setTimeout(wave, 700);
}

// ── Golden Claude ──

function activateBonus() {
    tokenMultiplier = 2;
    bonusSecondsLeft = 30;

    const timerEl = document.getElementById("bonus-timer");
    timerEl.textContent = "2× bonus — 30s";
    timerEl.classList.add("active");

    document.getElementById("bonus-aura").classList.add("active");
    scoreText.classList.add("bonus");
    rainContainer.classList.add("golden");
    setRainSpeed(80);

    if (bonusInterval) clearInterval(bonusInterval);
    bonusInterval = setInterval(() => {
        bonusSecondsLeft--;
        timerEl.textContent = "2× bonus — " + bonusSecondsLeft + "s";
        if (bonusSecondsLeft <= 0) {
            clearInterval(bonusInterval);
            bonusInterval = null;
            tokenMultiplier = 1;
            timerEl.classList.remove("active");
            document.getElementById("bonus-aura").classList.remove("active");
            scoreText.classList.remove("bonus");
            rainContainer.classList.remove("golden");
            setRainSpeed(250);
        }
    }, 1000);
}

function spawnGoldenClaude() {
    const img = document.createElement("img");
    img.src = "images/claude.png";
    img.className = "golden-claude";

    const size = 55 + Math.random() * 25;
    img.style.width  = size + "px";
    img.style.height = size + "px";
    img.style.left   = (5 + Math.random() * 88) + "%";

    const duration = 6 + Math.random() * 4;
    img.style.animationDuration = duration + "s, 1.2s";

    img.addEventListener("click", () => {
        img.remove();
        activateBonus();
    });

    document.body.appendChild(img);
    setTimeout(() => img.remove(), (duration + 0.2) * 1000);
}

function scheduleGoldenClaude() {
    const delay = 30000 + Math.random() * 60000;
    setTimeout(() => {
        spawnGoldenClaude();
        scheduleGoldenClaude();
    }, delay);
}

scheduleGoldenClaude();
