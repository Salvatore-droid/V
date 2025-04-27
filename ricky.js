window.requestAnimationFrame =
  window.__requestAnimationFrame ||
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  (function () {
    return function (callback, element) {
      let lastTime = element.__lastTime;
      if (lastTime === undefined) {
        lastTime = 0;
      }
      let currTime = Date.now();
      let timeToCall = Math.max(1, 33 - (currTime - lastTime));
      window.setTimeout(callback, timeToCall);
      element.__lastTime = currTime + timeToCall;
    };
  })();

window.isDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
  (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()
);

let loaded = false;
let init = function () {
  if (loaded) return;
  loaded = true;

  let mobile = window.isDevice;
  let koef = mobile ? 0.5 : 1;
  let canvas = document.getElementById("heart");
  let ctx = canvas.getContext("2d");
  let width = (canvas.width = koef * innerWidth);
  let height = (canvas.height = koef * innerHeight);
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, width, height);

  let heartPosition = function (rad) {
    return [
      Math.pow(Math.sin(rad), 3),
      -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad)),
    ];
  };

  let scaleAndTranslate = function (pos, sx, sy, dx, dy) {
    return [dx + pos[0] * sx, dy + pos[1] * sy];
  };

  window.addEventListener("resize", function () {
    width = canvas.width = koef * innerWidth;
    height = canvas.height = koef * innerHeight;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, width, height);
  });

  let traceCount = mobile ? 20 : 50;
  let pointsOrigin = [];
  let i;
  let dr = mobile ? 0.3 : 0.1;
  for (i = 0; i < Math.PI * 2; i += dr)
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
  for (i = 0; i < Math.PI * 2; i += dr)
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
  for (i = 0; i < Math.PI * 2; i += dr)
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
  let heartPointsCount = pointsOrigin.length;

  let targetPoints = [];
  let pulse = function (kx, ky) {
    for (i = 0; i < pointsOrigin.length; i++) {
      targetPoints[i] = [];
      targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
      targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
    }
  };

  let e = [];
  for (i = 0; i < heartPointsCount; i++) {
    let x = Math.random() * width;
    let y = Math.random() * height;
    e[i] = {
      vx: 0,
      vy: 0,
      R: 2,
      speed: Math.random() + 5,
      q: ~~(Math.random() * heartPointsCount),
      D: 2 * (i % 2) - 1,
      force: 0.2 * Math.random() + 0.7,
      f: "hsla(0," + ~~(40 * Math.random() + 60) + "%," + ~~(60 * Math.random() + 20) + "%,.3)",
      trace: [],
    };
    for (let k = 0; k < traceCount; k++) e[i].trace[k] = { x: x, y: y };
  }

  let config = {
    traceK: 0.4,
    timeDelta: 0.01,
  };

  // Variables for portrait and effects
  let portraitVisible = false;
  let portraitInitialized = false;
  let portraitGlowIntensity = 0;
  let vivianVisible = false;
  
  // Function to draw glowing circles
  function drawGlowingCircles() {
    let circleRadius = mobile ? 30 : 50;
    let glowRadius = 100;
    let leftCircleX = width / 4;
    let rightCircleX = (3 * width) / 4;
    let circleY = height / 2;

    ctx.beginPath();
    ctx.arc(leftCircleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(rightCircleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fill();
  }

  // Function to draw animated stars
  let stars = [];
  function createStars() {
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5,
        alpha: Math.random(),
        speed: Math.random() * 0.05,
      });
    }
  }

  function drawStars() {
    for (let i = 0; i < stars.length; i++) {
      let star = stars[i];
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fill();

      star.alpha += star.speed;
      if (star.alpha <= 0 || star.alpha >= 1) {
        star.speed *= -1;
      }
    }
  }

  // Function to animate "I Love You" text
  let textAlpha = 0;
  let textDirection = 1;
  function drawText() {
    let fontSize = mobile ? 40 : 60;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(255, 0, 0, ${textAlpha})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
    ctx.fillText("I Love You", width / 2, height / 2);

    textAlpha += 0.01 * textDirection;
    if (textAlpha >= 1 || textAlpha <= 0) {
      textDirection *= -1;
    }
  }

  // Function to animate "MiAmor" text
  let vivianAlpha = 0;
  let vivianDirection = 1;
  function drawVivian() {
    if (!vivianVisible) return;

    let fontSize = mobile ? 40 : 60;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(255, 255, 255, ${vivianAlpha})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("MiAmor", width / 2, height / 2 + 80);

    vivianAlpha += 0.01 * vivianDirection;
    if (vivianAlpha >= 1 || vivianAlpha <= 0) {
      vivianDirection *= -1;
    }
  }

  // Function to draw portrait
  function drawPortrait() {
    if (!portraitVisible) return;
    
    const portraitContainer = document.getElementById('portrait-container');
    const portraitImage = document.getElementById('portrait-image');
    
    if (!portraitInitialized) {
      portraitContainer.style.display = 'block';
      portraitInitialized = true;
      
      setTimeout(() => {
        portraitImage.style.opacity = '1';
        portraitImage.style.transform = 'translate(-50%, -50%) scale(1.1)';
      }, 100);
    }
    
    portraitGlowIntensity += 0.01;
    const glowValue = Math.abs(Math.sin(portraitGlowIntensity)) * 0.5 + 0.5;
    portraitImage.style.boxShadow = `0 0 ${30 + glowValue * 70}px rgba(255, ${105 + glowValue * 50}, ${180 + glowValue * 50}, ${0.5 + glowValue * 0.3})`;
    portraitImage.style.transform = `translate(-50%, ${-50 + Math.sin(portraitGlowIntensity * 0.5) * 1}%) scale(${1 + Math.sin(portraitGlowIntensity * 0.7) * 0.05})`;
  }

  // Function to create portrait particles
  function createPortraitParticles() {
    const particleContainer = document.getElementById('particle-container');
    
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.innerHTML = '❤️';
        particle.style.position = 'absolute';
        particle.style.fontSize = `${Math.random() * 20 + 10}px`;
        particle.style.opacity = '0';
        particle.style.transition = 'all 4s linear';
        particle.style.transform = 'translate(-50%, -50%)';
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 50;
        const x = window.innerWidth / 2 + Math.cos(angle) * distance;
        const y = window.innerHeight / 2 + Math.sin(angle) * distance;
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particleContainer.appendChild(particle);
        
        setTimeout(() => {
          particle.style.opacity = '0.7';
          particle.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg) scale(1.5)`;
          
          setTimeout(() => {
            const floatX = x + (Math.random() - 0.5) * 200;
            const floatY = y - Math.random() * 100 - 50;
            particle.style.left = `${floatX}px`;
            particle.style.top = `${floatY}px`;
            particle.style.opacity = '0';
          }, 2000);
        }, i * 300);
      }, i * 200);
    }
  }

  // Timed events
  setTimeout(() => {
    vivianVisible = true;
    
    setTimeout(() => {
      portraitVisible = true;
      createPortraitParticles();
      setInterval(createPortraitParticles, 5000);
    }, 70000);
  }, 35000);

  let time = 0;
  let loop = function () {
    let n = -Math.cos(time);
    pulse((1 + n) * 0.5, (1 + n) * 0.5);
    time += ((Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta);
    ctx.fillStyle = "rgba(0,0,0,.1)";
    ctx.fillRect(0, 0, width, height);

    drawGlowingCircles();
    drawStars();
    drawText();
    drawVivian();
    drawPortrait();

    for (i = e.length; i--; ) {
      var u = e[i];
      var q = targetPoints[u.q];
      var dx = u.trace[0].x - q[0];
      var dy = u.trace[0].y - q[1];
      var length = Math.sqrt(dx * dx + dy * dy);
      if (10 > length) {
        if (0.95 < Math.random()) {
          u.q = ~~(Math.random() * heartPointsCount);
        } else {
          if (0.99 < Math.random()) {
            u.D *= -1;
          }
          u.q += u.D;
          u.q %= heartPointsCount;
          if (0 > u.q) {
            u.q += heartPointsCount;
          }
        }
      }
      u.vx += (-dx / length) * u.speed;
      u.vy += (-dy / length) * u.speed;
      u.trace[0].x += u.vx;
      u.trace[0].y += u.vy;
      u.vx *= u.force;
      u.vy *= u.force;
      for (k = 0; k < u.trace.length - 1; ) {
        let T = u.trace[k];
        let N = u.trace[++k];
        N.x -= config.traceK * (N.x - T.x);
        N.y -= config.traceK * (N.y - T.y);
      }
      ctx.fillStyle = u.f;
      for (k = 0; k < u.trace.length; k++) {
        ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
      }
    }
    ctx.fillStyle = "rgba(255,255,255,1)";
    for (i = u.trace.length + 13; i--; )
      ctx.fillRect(targetPoints[i][0], targetPoints[i][1], 2, 2);

    window.requestAnimationFrame(loop, canvas);
  };

  createStars();
  loop();
};

let s = document.readyState;
if (s === "complete" || s === "loaded" || s === "interactive") init();
else document.addEventListener("DOMContentLoaded", init, false);