const tulipContainer = document.getElementById('tulips');

for (let i = 0; i < 30; i++) {
  const tulip = document.createElement('div');
  tulip.className = 'tulip';
  tulip.style.left = `${Math.random() * 100}vw`;
  tulip.style.animationDuration = `${4 + Math.random() * 6}s`;
  tulipContainer.appendChild(tulip);
}

const style2 = document.createElement('style');
style2.textContent = `
  .tulip {
    width: 15px;
    height: 15px;
    background: radial-gradient(ellipse at center, #ff66cc 0%, #ffb6c1 100%);
    position: absolute;
    top: -20px;
    border-radius: 50% 50% 0 0;
    transform: rotate(45deg);
    animation: tulipRain linear infinite;
  }

  @keyframes tulipRain {
    0% { top: -20px; opacity: 1; }
    100% { top: 100vh; opacity: 0; }
  }
`;
document.head.appendChild(style2);
