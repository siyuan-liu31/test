interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  color: string;
}

interface Player extends GameObject {
  health: number;
  maxHealth: number;
}

interface Enemy extends GameObject {
  health: number;
  lastShot: number;
}

interface Bullet extends GameObject {
  damage: number;
  isPlayerBullet: boolean;
}

interface Particle extends GameObject {
  life: number;
  maxLife: number;
}

interface PowerUp extends GameObject {
  type: 'health' | 'speed' | 'damage';
  collected: boolean;
}

interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  particles: Particle[];
  powerUps: PowerUp[];
  score: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
  lastEnemySpawn: number;
  keys: { [key: string]: boolean };
}

export class SpaceShooterGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private gameSpeed: number = 1;
  private sounds: { [key: string]: HTMLAudioElement } = {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    this.initializeGame();
    this.setupEventListeners();
    this.loadSounds();
  }

  private initializeGame(): void {
    this.gameState = {
      player: {
        x: this.canvas.width / 2 - 25,
        y: this.canvas.height - 80,
        width: 50,
        height: 60,
        vx: 0,
        vy: 0,
        color: '#00ff00',
        health: 100,
        maxHealth: 100
      },
      enemies: [],
      bullets: [],
      particles: [],
      powerUps: [],
      score: 0,
      level: 1,
      gameOver: false,
      paused: false,
      lastEnemySpawn: 0,
      keys: {}
    };
  }

  private loadSounds(): void {
    // 创建简单的音效（如果需要的话）
    // 这里暂时跳过音效实现
  }

  private setupEventListeners(): void {
    // 键盘事件
    document.addEventListener('keydown', (e) => {
      this.gameState.keys[e.key.toLowerCase()] = true;
      
      if (e.key === ' ' && !this.gameState.gameOver) {
        e.preventDefault();
        this.shootPlayerBullet();
      }
      
      if (e.key === 'p' || e.key === 'Escape') {
        this.togglePause();
      }
      
      if (e.key === 'r' && this.gameState.gameOver) {
        this.restart();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.gameState.keys[e.key.toLowerCase()] = false;
    });

    // 鼠标事件
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.gameState.gameOver && !this.gameState.paused) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        this.gameState.player.x = mouseX - this.gameState.player.width / 2;
        this.gameState.player.x = Math.max(0, Math.min(this.canvas.width - this.gameState.player.width, this.gameState.player.x));
      }
    });

    this.canvas.addEventListener('click', () => {
      if (!this.gameState.gameOver && !this.gameState.paused) {
        this.shootPlayerBullet();
      }
    });
  }

  private shootPlayerBullet(): void {
    const now = Date.now();
    const shootCooldown = 150; // 毫秒
    
    if (now - (this.gameState.player as any).lastShot < shootCooldown) return;
    (this.gameState.player as any).lastShot = now;

    this.gameState.bullets.push({
      x: this.gameState.player.x + this.gameState.player.width / 2 - 2,
      y: this.gameState.player.y,
      width: 4,
      height: 15,
      vx: 0,
      vy: -800,
      color: '#ffff00',
      damage: 25,
      isPlayerBullet: true
    });
  }

  private shootEnemyBullet(enemy: Enemy): void {
    const now = Date.now();
    if (now - enemy.lastShot < 1000 + Math.random() * 2000) return;
    enemy.lastShot = now;

    this.gameState.bullets.push({
      x: enemy.x + enemy.width / 2 - 2,
      y: enemy.y + enemy.height,
      width: 4,
      height: 10,
      vx: 0,
      vy: 300,
      color: '#ff0000',
      damage: 20,
      isPlayerBullet: false
    });
  }

  private spawnEnemy(): void {
    const now = Date.now();
    const spawnRate = Math.max(500, 2000 - this.gameState.level * 100);
    
    if (now - this.gameState.lastEnemySpawn < spawnRate) return;
    this.gameState.lastEnemySpawn = now;

    const enemyTypes = [
      { width: 40, height: 30, health: 25, color: '#ff4444', speed: 100 },
      { width: 60, height: 40, health: 50, color: '#ff8844', speed: 80 },
      { width: 80, height: 50, health: 75, color: '#ff44ff', speed: 60 }
    ];

    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    this.gameState.enemies.push({
      x: Math.random() * (this.canvas.width - type.width),
      y: -type.height,
      width: type.width,
      height: type.height,
      vx: (Math.random() - 0.5) * 100,
      vy: type.speed + this.gameState.level * 20,
      color: type.color,
      health: type.health,
      lastShot: now
    });
  }

  private spawnPowerUp(x: number, y: number): void {
    if (Math.random() < 0.3) { // 30% 概率掉落道具
      const types: PowerUp['type'][] = ['health', 'speed', 'damage'];
      const type = types[Math.floor(Math.random() * types.length)];
      const colors = { health: '#00ff00', speed: '#00ffff', damage: '#ffff00' };

      this.gameState.powerUps.push({
        x,
        y,
        width: 20,
        height: 20,
        vx: 0,
        vy: 150,
        color: colors[type],
        type,
        collected: false
      });
    }
  }

  private createExplosion(x: number, y: number, count: number = 10): void {
    for (let i = 0; i < count; i++) {
      this.gameState.particles.push({
        x: x + Math.random() * 20 - 10,
        y: y + Math.random() * 20 - 10,
        width: 4,
        height: 4,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`,
        life: 60,
        maxLife: 60
      });
    }
  }

  private updatePlayer(deltaTime: number): void {
    const speed = 400;
    
    // 键盘控制
    if (this.gameState.keys['a'] || this.gameState.keys['arrowleft']) {
      this.gameState.player.x -= speed * deltaTime;
    }
    if (this.gameState.keys['d'] || this.gameState.keys['arrowright']) {
      this.gameState.player.x += speed * deltaTime;
    }
    if (this.gameState.keys['w'] || this.gameState.keys['arrowup']) {
      this.gameState.player.y -= speed * deltaTime;
    }
    if (this.gameState.keys['s'] || this.gameState.keys['arrowdown']) {
      this.gameState.player.y += speed * deltaTime;
    }

    // 边界检查
    this.gameState.player.x = Math.max(0, Math.min(this.canvas.width - this.gameState.player.width, this.gameState.player.x));
    this.gameState.player.y = Math.max(0, Math.min(this.canvas.height - this.gameState.player.height, this.gameState.player.y));
  }

  private updateEnemies(deltaTime: number): void {
    for (let i = this.gameState.enemies.length - 1; i >= 0; i--) {
      const enemy = this.gameState.enemies[i];
      
      enemy.x += enemy.vx * deltaTime;
      enemy.y += enemy.vy * deltaTime;

      // 边界反弹
      if (enemy.x <= 0 || enemy.x >= this.canvas.width - enemy.width) {
        enemy.vx *= -1;
      }

      // 射击
      this.shootEnemyBullet(enemy);

      // 移除超出边界的敌人
      if (enemy.y > this.canvas.height + 50) {
        this.gameState.enemies.splice(i, 1);
      }
    }
  }

  private updateBullets(deltaTime: number): void {
    for (let i = this.gameState.bullets.length - 1; i >= 0; i--) {
      const bullet = this.gameState.bullets[i];
      
      bullet.x += bullet.vx * deltaTime;
      bullet.y += bullet.vy * deltaTime;

      // 移除超出边界的子弹
      if (bullet.y < -50 || bullet.y > this.canvas.height + 50) {
        this.gameState.bullets.splice(i, 1);
        continue;
      }

      // 检查碰撞
      if (bullet.isPlayerBullet) {
        // 玩家子弹与敌人碰撞
        for (let j = this.gameState.enemies.length - 1; j >= 0; j--) {
          const enemy = this.gameState.enemies[j];
          if (this.checkCollision(bullet, enemy)) {
            enemy.health -= bullet.damage;
            this.createExplosion(bullet.x, bullet.y, 5);
            this.gameState.bullets.splice(i, 1);

            if (enemy.health <= 0) {
              this.gameState.score += 100;
              this.spawnPowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
              this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 15);
              this.gameState.enemies.splice(j, 1);
            }
            break;
          }
        }
      } else {
        // 敌人子弹与玩家碰撞
        if (this.checkCollision(bullet, this.gameState.player)) {
          this.gameState.player.health -= bullet.damage;
          this.createExplosion(bullet.x, bullet.y, 8);
          this.gameState.bullets.splice(i, 1);

          if (this.gameState.player.health <= 0) {
            this.gameState.gameOver = true;
          }
        }
      }
    }
  }

  private updateParticles(deltaTime: number): void {
    for (let i = this.gameState.particles.length - 1; i >= 0; i--) {
      const particle = this.gameState.particles[i];
      
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.life--;

      if (particle.life <= 0) {
        this.gameState.particles.splice(i, 1);
      }
    }
  }

  private updatePowerUps(deltaTime: number): void {
    for (let i = this.gameState.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.gameState.powerUps[i];
      
      powerUp.y += powerUp.vy * deltaTime;

      // 检查与玩家碰撞
      if (this.checkCollision(powerUp, this.gameState.player)) {
        this.collectPowerUp(powerUp);
        this.gameState.powerUps.splice(i, 1);
        continue;
      }

      // 移除超出边界的道具
      if (powerUp.y > this.canvas.height + 50) {
        this.gameState.powerUps.splice(i, 1);
      }
    }
  }

  private collectPowerUp(powerUp: PowerUp): void {
    switch (powerUp.type) {
      case 'health':
        this.gameState.player.health = Math.min(this.gameState.player.maxHealth, this.gameState.player.health + 30);
        break;
      case 'speed':
        // 临时速度提升效果
        break;
      case 'damage':
        // 临时伤害提升效果
        break;
    }
    this.gameState.score += 50;
  }

  private checkCollision(obj1: GameObject, obj2: GameObject): boolean {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }

  private checkLevelUp(): void {
    const scoreThreshold = this.gameState.level * 1000;
    if (this.gameState.score >= scoreThreshold) {
      this.gameState.level++;
    }
  }

  private render(): void {
    // 清空画布
    this.ctx.fillStyle = '#000011';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制星空背景
    this.drawStars();

    // 绘制玩家
    this.drawPlayer();

    // 绘制敌人
    this.gameState.enemies.forEach(enemy => this.drawEnemy(enemy));

    // 绘制子弹
    this.gameState.bullets.forEach(bullet => this.drawBullet(bullet));

    // 绘制粒子效果
    this.gameState.particles.forEach(particle => this.drawParticle(particle));

    // 绘制道具
    this.gameState.powerUps.forEach(powerUp => this.drawPowerUp(powerUp));

    // 绘制UI
    this.drawUI();

    // 绘制暂停或游戏结束界面
    if (this.gameState.paused) {
      this.drawPauseScreen();
    }
    
    if (this.gameState.gameOver) {
      this.drawGameOverScreen();
    }
  }

  private drawStars(): void {
    this.ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 7) % this.canvas.width;
      const y = (i * 13 + Date.now() * 0.01) % this.canvas.height;
      const size = Math.sin(i) * 2 + 1;
      this.ctx.globalAlpha = Math.sin(Date.now() * 0.003 + i) * 0.5 + 0.5;
      this.ctx.fillRect(x, y, size, size);
    }
    this.ctx.globalAlpha = 1;
  }

  private drawPlayer(): void {
    const player = this.gameState.player;
    
    // 绘制飞船主体
    this.ctx.fillStyle = player.color;
    this.ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 绘制引擎火焰
    this.ctx.fillStyle = '#ff4444';
    const flameHeight = 15 + Math.sin(Date.now() * 0.01) * 5;
    this.ctx.fillRect(player.x + 10, player.y + player.height, 10, flameHeight);
    this.ctx.fillRect(player.x + 30, player.y + player.height, 10, flameHeight);
  }

  private drawEnemy(enemy: Enemy): void {
    this.ctx.fillStyle = enemy.color;
    this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // 绘制血条
    const barWidth = enemy.width;
    const barHeight = 4;
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(enemy.x, enemy.y - 8, barWidth, barHeight);
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(enemy.x, enemy.y - 8, (enemy.health / 100) * barWidth, barHeight);
  }

  private drawBullet(bullet: Bullet): void {
    this.ctx.fillStyle = bullet.color;
    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    
    // 添加光晕效果
    this.ctx.shadowColor = bullet.color;
    this.ctx.shadowBlur = 10;
    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    this.ctx.shadowBlur = 0;
  }

  private drawParticle(particle: Particle): void {
    const alpha = particle.life / particle.maxLife;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = particle.color;
    this.ctx.fillRect(particle.x, particle.y, particle.width, particle.height);
    this.ctx.globalAlpha = 1;
  }

  private drawPowerUp(powerUp: PowerUp): void {
    this.ctx.save();
    this.ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
    this.ctx.rotate(Date.now() * 0.005);
    this.ctx.fillStyle = powerUp.color;
    this.ctx.fillRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);
    this.ctx.restore();
  }

  private drawUI(): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    
    // 分数
    this.ctx.fillText(`Score: ${this.gameState.score}`, 10, 30);
    
    // 等级
    this.ctx.fillText(`Level: ${this.gameState.level}`, 10, 60);
    
    // 血量条
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    const healthBarX = this.canvas.width - healthBarWidth - 10;
    const healthBarY = 10;
    
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    this.ctx.fillStyle = '#ff0000';
    const healthWidth = (this.gameState.player.health / this.gameState.player.maxHealth) * healthBarWidth;
    this.ctx.fillRect(healthBarX, healthBarY, healthWidth, healthBarHeight);
    
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.fillText('Health', healthBarX, healthBarY - 5);
  }

  private drawPauseScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press P to continue', this.canvas.width / 2, this.canvas.height / 2 + 50);
    this.ctx.textAlign = 'left';
  }

  private drawGameOverScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${this.gameState.score}`, this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText(`Level Reached: ${this.gameState.level}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
    this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
    this.ctx.textAlign = 'left';
  }

  private gameLoop = (currentTime: number): void => {
    if (this.gameState.paused) {
      this.animationId = requestAnimationFrame(this.gameLoop);
      return;
    }

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (!this.gameState.gameOver) {
      // 更新游戏逻辑
      this.updatePlayer(deltaTime);
      this.updateEnemies(deltaTime);
      this.updateBullets(deltaTime);
      this.updateParticles(deltaTime);
      this.updatePowerUps(deltaTime);
      
      // 生成敌人
      this.spawnEnemy();
      
      // 检查升级
      this.checkLevelUp();
    }

    // 渲染
    this.render();

    if (!this.gameState.gameOver || this.gameState.paused) {
      this.animationId = requestAnimationFrame(this.gameLoop);
    }
  };

  public start(): void {
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.gameLoop);
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public togglePause(): void {
    this.gameState.paused = !this.gameState.paused;
    if (!this.gameState.paused && !this.gameState.gameOver) {
      this.lastTime = performance.now();
      this.animationId = requestAnimationFrame(this.gameLoop);
    }
  }

  public restart(): void {
    this.stop();
    this.initializeGame();
    this.start();
  }

  public getScore(): number {
    return this.gameState.score;
  }

  public isGameOver(): boolean {
    return this.gameState.gameOver;
  }
} 