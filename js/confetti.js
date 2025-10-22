// Extra confetti celebrations using canvas-confetti
(function(){
  let confettiInstance = null;
  function getInstance(){
    if(!confettiInstance){
      const canvas = document.getElementById('confetti-canvas');
      if(!canvas) return null;
      confettiInstance = window.confetti.create(canvas, { resize: true, useWorker: true });
    }
    return confettiInstance;
  }

  function burst(opts){
    const c = getInstance();
    if(!c) return;
    c(Object.assign({
      particleCount: 120,
      spread: 60,
      startVelocity: 55,
      gravity: 0.9,
      ticks: 200,
      scalar: 1,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#FFD700', '#FFA500', '#FF6B6B', '#FFFFFF']
    }, opts||{}));
  }

  function sideCannons(){
    const c = getInstance();
    if(!c) return;
    const duration = 4000;
    const end = Date.now() + duration;
    (function frame(){
      c({
        particleCount: 8,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500', '#FFFFFF']
      });
      c({
        particleCount: 8,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500', '#FFFFFF']
      });
      if(Date.now() < end){ requestAnimationFrame(frame); }
    })();
  }

  function shower(){
    const c = getInstance();
    if(!c) return;
    const duration = 2500;
    const end = Date.now() + duration;
    (function frame(){
      c({
        particleCount: 3,
        startVelocity: 35,
        spread: 80,
        ticks: 160,
        gravity: 1.2,
        origin: { x: Math.random(), y: -0.1 },
        colors: ['#FFD700', '#FFA500', '#FFFFFF']
      });
      if(Date.now() < end){ requestAnimationFrame(frame); }
    })();
  }

  // حلقة مستمرة للكونفيتي مع إمكانية الإيقاف
  let _confettiLoop = null;

  function startConfettiCelebration(){
    if (_confettiLoop) return; // تعمل بالفعل
    // انفجار افتتاحي
    burst({ origin: { x: 0.5, y: 0.6 }, spread: 100, scalar: 1.2 });
    sideCannons();
    shower();
    _confettiLoop = setInterval(() => {
      burst({ origin:{ x: 0.5, y: 0.5 }, spread: 70, scalar: 1 + Math.random()*0.6 });
      if (Math.random() < 0.6) sideCannons();
      if (Math.random() < 0.5) shower();
    }, 3000);
  }

  function stopConfettiCelebration(){
    if (_confettiLoop){
      clearInterval(_confettiLoop);
      _confettiLoop = null;
    }
  }

  window.startConfettiCelebration = startConfettiCelebration;
  window.stopConfettiCelebration = stopConfettiCelebration;
})();
