// حلقة دائمة للبالونات مع إيقاف
let _balloonsInterval = null;
let _balloonsContainer = null;

function startBalloons() {
    if (_balloonsInterval) return; // تعمل بالفعل
    _balloonsContainer = document.createElement('div');
    _balloonsContainer.className = 'balloons-container';
    document.body.appendChild(_balloonsContainer);

    function addBalloon() {
        const balloon = document.createElement('div');
        balloon.className = `balloon balloon-${(Math.floor(Math.random()*6)+1)}`;
        const startX = Math.random() * (window.innerWidth - 100);
        const startY = window.innerHeight + Math.random() * 100;
        balloon.style.left = `${startX}px`;
        balloon.style.bottom = `-${startY}px`;
        const duration = 5 + Math.random() * 5;
        balloon.style.animation = `float ${duration}s ease-in-out infinite, rise ${duration * 2}s linear`;
        _balloonsContainer.appendChild(balloon);
        // إزالة البالون بعد انتهاء دورته تقريباً لتفادي تراكم العناصر
        setTimeout(() => balloon.remove(), duration * 2000 + 2000);
    }

    // أضف بعض البالونات فوراً
    for (let i = 0; i < 12; i++) addBalloon();
    // أضف بالونات جديدة باستمرار
    _balloonsInterval = setInterval(() => addBalloon(), 600);
}

function stopBalloons() {
    if (_balloonsInterval) {
        clearInterval(_balloonsInterval);
        _balloonsInterval = null;
    }
    if (_balloonsContainer) {
        _balloonsContainer.remove();
        _balloonsContainer = null;
    }
}

// إضافة نمط CSS للحركة الصاعدة
const style = document.createElement('style');
style.textContent = `
    @keyframes rise {
        from {
            transform: translateY(100vh) rotate(0deg);
        }
        to {
            transform: translateY(-100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// تحديث دالة startCelebration لتشمل البالونات (توافقياً)
function startCelebration() {
    startFireworks();
    startBalloons();
}

// إتاحة الدوال عالمياً
window.startBalloons = startBalloons;
window.stopBalloons = stopBalloons;