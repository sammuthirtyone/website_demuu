const heartsContainer = document.getElementById('hearts');

for (let i = 0; i < 25; i++) {
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.style.left = `${Math.random() * 100}vw`;
  heart.style.animationDuration = `${3 + Math.random() * 5}s`;
  heartsContainer.appendChild(heart);
}

const style = document.createElement('style');
style.textContent = `
  .heart {
    width: 20px;
    height: 20px;
    background: pink;
    position: absolute;
    top: -30px;
    transform: rotate(45deg);
    animation: floatDown linear infinite;
  }
  .heart::before, .heart::after {
    content: '';
    width: 20px;
    height: 20px;
    background: pink;
    position: absolute;
    border-radius: 50%;
  }
  .heart::before {
    top: -10px;
    left: 0;
  }
  .heart::after {
    left: -10px;
    top: 0;
  }
  @keyframes floatDown {
    0% { top: -30px; opacity: 1; }
    100% { top: 100vh; opacity: 0; }
  }
`;
document.head.appendChild(style);
