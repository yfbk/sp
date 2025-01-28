// 时钟功能
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateClock, 1000);
updateClock();

// 搜索功能
function searchGoogle() {
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, '_blank');
    }
}

function searchBaidu() {
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm) {
        window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(searchTerm)}`, '_blank');
    }
}

// 水滴效果
document.querySelectorAll('.glass-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        let x = e.clientX - e.target.offsetLeft;
        let y = e.clientY - e.target.offsetTop;
        
        let ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// 处理图标加载失败的情况
document.querySelectorAll('.nav-item img').forEach(img => {
    img.onerror = function() {
        // 如果图标加载失败，尝试使用 Google 的 favicon 服务
        const url = new URL(this.closest('a').href);
        this.src = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
    };
});

// 选项卡切换功能
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // 移除所有活动状态
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // 添加新的活动状态
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// 烟花效果
class Firework {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.rockets = [];
        this.numberOfParticles = 80; // 增加粒子数量
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createRocket(x, y) {
        const targetY = y - 100; // 爆炸点
        this.rockets.push({
            x,
            y: y + 100, // 起始点
            targetY,
            vy: -8, // 上升速度
            color: `hsl(${Math.random() * 360}, 100%, 70%)`
        });
    }

    createParticles(x, y) {
        const colors = [
            '#FFD700', // 金色
            '#FF69B4', // 粉色
            '#00FFFF', // 青色
            '#FF4500', // 橙红色
            '#7FFF00', // 黄绿色
            '#FF1493'  // 深粉色
        ];
        
        for (let i = 0; i < this.numberOfParticles; i++) {
            const angle = (Math.PI * 2 * i) / this.numberOfParticles;
            const velocity = 3 + Math.random() * 3;
            const life = 120 + Math.random() * 30;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life,
                maxLife: life,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 2 + Math.random() * 2,
                trail: [] // 添加尾迹数组
            });
        }
    }

    animate() {
        // 创建半透明效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 更新火箭
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const rocket = this.rockets[i];
            rocket.y += rocket.vy;

            // 绘制火箭尾迹
            this.ctx.beginPath();
            this.ctx.moveTo(rocket.x, rocket.y);
            this.ctx.lineTo(rocket.x, rocket.y + 10);
            this.ctx.strokeStyle = rocket.color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // 到达目标高度时爆炸
            if (rocket.y <= rocket.targetY) {
                this.createParticles(rocket.x, rocket.y);
                this.rockets.splice(i, 1);
            }
        }

        // 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // 更新位置
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // 重力效果
            p.vx *= 0.99; // 空气阻力
            p.vy *= 0.99;
            p.life--;

            // 更新尾迹
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 5) {
                p.trail.shift();
            }

            // 绘制尾迹
            this.ctx.beginPath();
            this.ctx.moveTo(p.trail[0]?.x || p.x, p.trail[0]?.y || p.y);
            p.trail.forEach(point => {
                this.ctx.lineTo(point.x, point.y);
            });
            this.ctx.strokeStyle = p.color;
            this.ctx.lineWidth = p.size / 2;
            this.ctx.stroke();

            // 绘制粒子
            const alpha = p.life / p.maxLife;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        this.ctx.globalAlpha = 1;

        if (this.particles.length > 0 || this.rockets.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    launch(x, y) {
        // 发射多个火箭
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createRocket(
                    x + (Math.random() - 0.5) * 100,
                    y
                );
                if (!this.particles.length && !this.rockets.length) {
                    this.animate();
                }
            }, i * 200);
        }
    }
}

// 初始化效果
const firework = new Firework(document.getElementById('fireworks'));

// 添加头像点击事件
document.querySelector('.avatar').addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    firework.launch(x, y);
}); 