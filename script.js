let tokens = 0;
let tokensPerSecond = 0;
let tokensPerClick = 1;

let serverCount = 0;
let dataCenterCount = 0;
let ramCount = 0;
let gpuCount = 0;
let quantumCount = 0;
let neuralCount = 0;
let superCount = 0;

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

let gpuBtn      = document.getElementById("btn-gpu");
let quantumBtn  = document.getElementById("btn-quantum");
let neuralBtn   = document.getElementById("btn-neural");
let superBtn    = document.getElementById("btn-super");
let infoGpu     = document.getElementById("info-gpu");
let infoQuantum = document.getElementById("info-quantum");
let infoNeural  = document.getElementById("info-neural");
let infoSuper   = document.getElementById("info-super");

const sfxClick       = new Audio("sounds/click.mp3");
const sfxBuy         = new Audio("sounds/buy.mp3");
const sfxDoubleBonus = new Audio("sounds/doubleBonus.mp3");
const sfxJackpot     = new Audio("sounds/jackpot.mp3");
const bgMusic        = new Audio("sounds/mechaSonic.mp3");
bgMusic.loop   = true;
bgMusic.volume = 0.5;

let isMuted   = false;
let sfxVolume = 1.0;
let bgVolume  = 0.5;
let musicStarted = false;

function playSfx(audio) {
    if (isMuted) return;
    audio.currentTime = 0;
    audio.volume = sfxVolume;
    audio.play();
}

function startMusicOnce() {
    if (musicStarted) return;
    musicStarted = true;
    if (!isMuted) bgMusic.play();
}

document.addEventListener("click", startMusicOnce, { once: true });

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
    playSfx(sfxClick);
    const earned = tokensPerClick * tokenMultiplier;
    tokens += earned;
    scoreText.textContent = Math.floor(tokens);
    tryUnlockShop();
    tryUnlockSlot();
    checkReveal();

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

let gpuPrice     = 500;
let quantumPrice = 1000;
let neuralPrice  = 5000;
let superPrice   = 20000;

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

gpuBtn.addEventListener("click", function() {
    if (tokens >= gpuPrice) {
        gpuCount++;
        tokensPerSecond += 50;
        tokens -= gpuPrice;
        gpuPrice = Math.ceil(gpuPrice * 1.15);
        scoreText.textContent = Math.floor(tokens);
        gpuBtn.textContent = "GPU Cluster — " + gpuPrice + " tokens (+50/s)";
        infoGpu.textContent = "Owned: " + gpuCount + " · +" + (gpuCount * 50) + "/s";
        perSecondText.textContent = "+" + tokensPerSecond + " per second";
        floatBuyText(gpuBtn, "+50/s");
    }
});

quantumBtn.addEventListener("click", function() {
    if (tokens >= quantumPrice) {
        quantumCount++;
        tokensPerClick += 5;
        tokens -= quantumPrice;
        quantumPrice = Math.ceil(quantumPrice * 1.3);
        scoreText.textContent = Math.floor(tokens);
        quantumBtn.textContent = "Quantum Processor — " + quantumPrice + " tokens (+5/click)";
        infoQuantum.textContent = "Owned: " + quantumCount + " · +" + (quantumCount * 5) + "/click";
        perClickText.textContent = "+" + tokensPerClick + " per click";
        floatBuyText(quantumBtn, "+5/click");
    }
});

neuralBtn.addEventListener("click", function() {
    if (tokens >= neuralPrice) {
        neuralCount++;
        tokensPerSecond += 100;
        tokens -= neuralPrice;
        neuralPrice = Math.ceil(neuralPrice * 1.5);
        scoreText.textContent = Math.floor(tokens);
        neuralBtn.textContent = "Neural Network — " + neuralPrice + " tokens (+100/s)";
        infoNeural.textContent = "Owned: " + neuralCount + " · +" + (neuralCount * 100) + "/s";
        perSecondText.textContent = "+" + tokensPerSecond + " per second";
        floatBuyText(neuralBtn, "+100/s");
    }
});

superBtn.addEventListener("click", function() {
    if (tokens >= superPrice) {
        superCount++;
        tokensPerClick += 20;
        tokens -= superPrice;
        superPrice = Math.ceil(superPrice * 2);
        scoreText.textContent = Math.floor(tokens);
        superBtn.textContent = "Superintelligence — " + superPrice + " tokens (+20/click)";
        infoSuper.textContent = "Owned: " + superCount + " · +" + (superCount * 20) + "/click";
        perClickText.textContent = "+" + tokensPerClick + " per click";
        floatBuyText(superBtn, "+20/click");
    }
});

// ── Reveal hidden upgrades ──
const REVEAL_THRESHOLDS = {
    "slot-tovarna": 50,
    "slot-gpu":     500,
    "slot-quantum": 1000,
    "slot-neural":  5000,
    "slot-super":   20000,
};

function checkReveal() {
    for (const [id, threshold] of Object.entries(REVEAL_THRESHOLDS)) {
        const slot = document.getElementById(id);
        if (slot && slot.classList.contains("mystery") && tokens >= threshold) {
            slot.classList.remove("mystery");
        }
    }
}

// ── Passive income ──
setInterval(function() {
    tokens += (tokensPerSecond / 10) * tokenMultiplier;
    scoreText.textContent = Math.floor(tokens);
    tryUnlockShop();
    tryUnlockSlot();
    tryStartRain();
    checkReveal();
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
        playSfx(sfxJackpot);
        spawnJackpotWave();
        triggerJackpotConfetti();
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

    if (tokenMultiplier === 2 && !(results[0] === results[1] && results[1] === results[2])) {
        if (Math.random() < 1 / 125) {
            const lucky = pickFruit();
            results[0] = results[1] = results[2] = lucky;
        }
    }

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
    playSfx(sfxBuy);
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

// ── Confetti ──

const CONFETTI_COLORS = ['#f0c000', '#ff4444', '#44aaff', '#44ee88', '#ff44cc', '#aa44ff', '#ff8833'];
const confettiParticles = [];
let confettiAnimActive = false;

function animateConfetti() {
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.vx *= 0.98;
        p.vy  = p.vy * 0.98 + 0.35;
        p.x  += p.vx;
        p.y  += p.vy;
        p.rot += p.rotV;
        p.frame++;

        const opacity = p.frame < 40 ? 1 : Math.max(0, 1 - (p.frame - 40) / 40);
        p.el.style.left      = p.x + "px";
        p.el.style.top       = p.y + "px";
        p.el.style.opacity   = opacity;
        p.el.style.transform = `rotate(${p.rot}deg)`;

        if (p.frame >= p.life) {
            p.el.remove();
            confettiParticles.splice(i, 1);
        }
    }
    if (confettiParticles.length > 0) {
        requestAnimationFrame(animateConfetti);
    } else {
        confettiAnimActive = false;
    }
}

function spawnConfettiFromCorner(x, y, dirX) {
    for (let i = 0; i < 40; i++) {
        const el = document.createElement("div");
        el.className = "confetti-piece";
        el.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        el.style.width  = (5 + Math.random() * 6) + "px";
        el.style.height = (10 + Math.random() * 8) + "px";
        document.body.appendChild(el);

        const speed = 9 + Math.random() * 13;
        const angle = (20 + Math.random() * 70) * Math.PI / 180;

        confettiParticles.push({
            el,
            x, y,
            vx:   dirX * Math.cos(angle) * speed,
            vy:   -Math.sin(angle) * speed,
            rot:  Math.random() * 360,
            rotV: (Math.random() - 0.5) * 16,
            frame: 0,
            life:  80 + Math.floor(Math.random() * 40),
        });
    }

    if (!confettiAnimActive) {
        confettiAnimActive = true;
        requestAnimationFrame(animateConfetti);
    }
}

function triggerJackpotConfetti() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    spawnConfettiFromCorner(0, h, 1);
    spawnConfettiFromCorner(w, h, -1);
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

function spawnGoldenBurst(x, y) {
    for (let i = 0; i < 14; i++) {
        const el = document.createElement("img");
        el.src = "images/claude.png";
        el.className = "burst-particle";
        const size = 18 + Math.random() * 18;
        el.style.width  = size + "px";
        el.style.height = size + "px";
        el.style.filter = "sepia(1) saturate(4) hue-rotate(-10deg) brightness(1.5)";
        document.body.appendChild(el);

        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 7;
        burstParticles.push({
            el,
            x, y,
            vx:   Math.cos(angle) * speed,
            vy:   Math.sin(angle) * speed,
            rot:  0,
            rotV: (Math.random() - 0.5) * 14,
            frame: 0,
            life:  70 + Math.floor(Math.random() * 25),
        });
    }

    if (!burstAnimActive) {
        burstAnimActive = true;
        requestAnimationFrame(animateBurst);
    }
}

function spawnGoldenClaude() {
    const size     = 55 + Math.random() * 25;
    const duration = 6  + Math.random() * 4;

    const wrapper = document.createElement("div");
    wrapper.className = "golden-wrapper";
    wrapper.style.width  = size + "px";
    wrapper.style.height = size + "px";
    wrapper.style.left   = (5 + Math.random() * 88) + "%";
    wrapper.style.animationDuration = duration + "s";

    const rays = document.createElement("div");
    rays.className = "golden-rays";
    for (let i = 0; i < 5; i++) {
        const beam = document.createElement("div");
        beam.className = "golden-beam";
        beam.style.transform = `rotate(${i * 72}deg)`;
        rays.appendChild(beam);
    }

    const img = document.createElement("img");
    img.src = "images/claude.png";
    img.className = "golden-claude";

    img.addEventListener("click", (e) => {
        wrapper.remove();
        playSfx(sfxDoubleBonus);
        activateBonus();
        spawnGoldenBurst(e.clientX, e.clientY);
    });

    wrapper.appendChild(rays);
    wrapper.appendChild(img);
    document.body.appendChild(wrapper);
    setTimeout(() => wrapper.remove(), (duration + 0.2) * 1000);
}

function scheduleGoldenClaude() {
    const delay = 30000 + Math.random() * 60000;
    setTimeout(() => {
        spawnGoldenClaude();
        scheduleGoldenClaude();
    }, delay);
}

scheduleGoldenClaude();

// ── Audio controls ──
const muteBtn     = document.getElementById("mute-btn");
const musicSlider = document.getElementById("music-volume");
const sfxSlider   = document.getElementById("sfx-volume");

muteBtn.addEventListener("click", function() {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
    bgMusic.muted = isMuted;
});

musicSlider.addEventListener("input", function() {
    bgVolume = this.value / 100;
    bgMusic.volume = bgVolume;
});

sfxSlider.addEventListener("input", function() {
    sfxVolume = this.value / 100;
});
