// إضافة صوت الألعاب النارية
function playFireworkSound() {
    const sounds = [
        'https://www.soundjay.com/misc/sounds/firework-explosion-1.mp3',
        'https://www.soundjay.com/misc/sounds/firework-explosion-2.mp3',
        'https://www.soundjay.com/misc/sounds/firework-explosion-3.mp3'
    ];
    const audio = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
    audio.volume = 0.4;
    audio.play().catch(e => console.log('Could not play audio'));
}

function createFirework(x, y) {
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.style.left = `${x}px`;
    firework.style.top = `${y}px`;
    document.body.appendChild(firework);

    // تشغيل الصوت
    playFireworkSound();

    // إنشاء الجزيئات مع ألوان أكثر
    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#FFFFFF', '#7CFC00', '#00BFFF', '#FF4500'];
    const shapes = ['shape-square', 'shape-diamond', 'shape-star', 'shape-triangle', ''];
    const particles = 70; // زيادة عدد الجزيئات
    const spread = 360;

    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        particle.className = `firework-particle ${shape}`;
        const angle = (i * spread) / particles;
        const velocity = 40 + Math.random() * 90;
        const xDistance = Math.cos(angle * Math.PI / 180) * velocity;
        const yDistance = Math.sin(angle * Math.PI / 180) * velocity;
        
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.setProperty('--x', `${xDistance}px`);
        particle.style.setProperty('--y', `${yDistance}px`);
        particle.style.setProperty('--size', `${6 + Math.random() * 10}px`);
        particle.style.setProperty('--dur', `${1 + Math.random() * 0.8}s`);
        
        firework.appendChild(particle);
    }

    // إزالة الألعاب النارية بعد انتهاء التأثير
    setTimeout(() => {
        firework.remove();
    }, 1000);
}

// حلقة مستمرة للألعاب النارية حتى الإيقاف
let _fwInterval = null;
let _fwBgEl = null;

function startFireworks() {
    if (_fwInterval) return; // تعمل بالفعل
    // إنشاء خلفية الاحتفال (مرة واحدة)
    _fwBgEl = document.createElement('div');
    _fwBgEl.className = 'celebration-bg';
    document.body.appendChild(_fwBgEl);

    _fwInterval = setInterval(() => {
        const mode = Math.floor(Math.random() * 3);
        let x, y;
        if (mode === 0) {
            x = window.innerWidth * (0.3 + Math.random() * 0.4);
            y = window.innerHeight * (0.15 + Math.random() * 0.3);
        } else if (mode === 1) {
            const side = Math.random() < 0.5 ? 0 : window.innerWidth;
            x = side + (side === 0 ? 50 : -50);
            y = window.innerHeight * Math.random() * 0.6;
        } else {
            x = window.innerWidth * 0.5 + (Math.random() - 0.5) * 300;
            y = window.innerHeight * 0.75 + Math.random() * 50;
        }
        createFirework(x, y);
    }, 250);
}

function stopFireworks() {
    if (_fwInterval) {
        clearInterval(_fwInterval);
        _fwInterval = null;
    }
    if (_fwBgEl) {
        _fwBgEl.remove();
        _fwBgEl = null;
    // إزالة جميع الألعاب النارية النشطة
    const activeFireworks = document.querySelectorAll('.firework');
    activeFireworks.forEach(fw => fw.remove());
    }
}

// إتاحة الدوال عالمياً
window.startFireworks = startFireworks;
window.stopFireworks = stopFireworks;