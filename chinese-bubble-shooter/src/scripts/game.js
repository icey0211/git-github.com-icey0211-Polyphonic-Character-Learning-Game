console.log('✅ game.js 文件已加载！');

import { getRandomInt } from './utils.js';
import { checkCollision } from './collision.js';

console.log('✅ 模块导入成功！');

class Game {
    constructor() {
        console.log('🎮 Game 构造函数开始执行');
        
        this.canvas = document.getElementById('gameCanvas');
        console.log('Canvas 元素:', this.canvas);
        
        if (!this.canvas) {
            console.error('❌ 找不到 gameCanvas 元素！');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 600;
        this.canvas.height = 600;
        
        this.bubbles = [];
        this.shooterBubble = null;
        this.shooterQueue = [];
        this.angle = -90;
        this.score = 0;
        this.level = 1;
        this.lives = 3; // 新增：初始生命值为3
        this.isGameOver = false;
        this.isPaused = false;
        this.isGameStarted = false;
        this.characters = [];
        this.allLevels = [];
        this.currentCharacter = null;
        this.currentLevelTheme = '';
        
        this.bubbleRadius = 30;
        this.redLineY = 400;
        
        console.log('✅ Game 对象初始化完成');
        this.init();
    }

    async init() {
        console.log('🚀 init() 方法开始执行');
        await this.loadCharacters();
        this.setupEventListeners();
        this.showGameRules(); // 先显示规则
        console.log('✅ 初始化完成');
    }

    // 新增：显示游戏规则（第一步）
    showGameRules() {
        console.log('📖 显示游戏规则');
        const rulesElement = document.getElementById('game-rules');
        const startScreenElement = document.getElementById('start-screen');
        
        if (rulesElement) {
            rulesElement.style.display = 'block';
            
            // 点击任意位置进入开始画面
            rulesElement.addEventListener('click', () => {
                console.log('👆 规则面板被点击，进入开始画面');
                rulesElement.style.display = 'none';
                this.showStartScreen();
            });
        }
        
        if (startScreenElement) {
            startScreenElement.style.display = 'none';
        }
    }
    
    // 新增：显示开始游戏画面（第二步）
    showStartScreen() {
        console.log('🎮 显示开始游戏画面');
        const startScreenElement = document.getElementById('start-screen');
        
        if (startScreenElement) {
            startScreenElement.style.display = 'block';
            
            // 添加进入动画
            startScreenElement.style.animation = 'fadeInScale 0.5s ease-out';
        }
    }

    async loadCharacters() {
        console.log('📚 开始加载字符数据...');
        try {
            const response = await fetch('data/characters.json');
            console.log('Fetch 响应:', response);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('获取到的数据:', data);
            
            // 检查数据结构
            if (data.levels && Array.isArray(data.levels)) {
                this.allLevels = data.levels;
                this.loadLevelCharacters(this.level);
                console.log('✅ 多关卡数据加载成功:', this.allLevels);
            } else if (data.characters && Array.isArray(data.characters)) {
                // 旧格式兼容
                this.allLevels = [{
                    level: 1,
                    theme: "基础多音字",
                    characters: data.characters
                }];
                this.loadLevelCharacters(this.level);
                console.log('✅ 单关卡数据加载成功（兼容模式）');
            } else {
                throw new Error('数据格式不正确');
            }
        } catch (error) {
            console.error('❌ 加载字符数据失败:', error);
            // 使用备用数据
            this.allLevels = [
                {
                    level: 1,
                    theme: "基础多音字",
                    characters: [
                        { character: "给", pinyin: ["gěi", "jǐ"] },
                        { character: "行", pinyin: ["xíng", "háng"] },
                        { character: "重", pinyin: ["zhòng", "chóng"] },
                        { character: "好", pinyin: ["hǎo", "hào"] },
                        { character: "发", pinyin: ["fā", "fà"] }
                    ]
                }
            ];
            this.loadLevelCharacters(this.level);
            console.log('⚠️ 使用备用数据:', this.allLevels);
        }
    }
    
    loadLevelCharacters(level) {
        console.log('🎯 加载关卡', level, '的字符');
        const levelData = this.allLevels.find(l => l.level === level);
        
        if (levelData) {
            this.characters = levelData.characters;
            this.currentLevelTheme = levelData.theme;
            console.log(`✅ 加载关卡 ${level} - ${levelData.theme}`, this.characters);
        } else {
            // 循环使用关卡
            const cycleLevel = ((level - 1) % this.allLevels.length) + 1;
            const cycleData = this.allLevels.find(l => l.level === cycleLevel);
            this.characters = cycleData.characters;
            this.currentLevelTheme = cycleData.theme + ' (循环)';
            console.log(`🔄 循环到关卡 ${cycleLevel} - ${cycleData.theme}`);
        }
    }

    showInstructions() {
        console.log('📖 显示游戏说明');
        const instructionsElement = document.getElementById('instructions');
        console.log('instructions 元素:', instructionsElement);
        if (instructionsElement) {
            instructionsElement.style.display = 'block';
        }
    }

    setupEventListeners() {
        console.log('🎛️ 设置事件监听器');
        
        // 开始游戏按钮
        const startButton = document.getElementById('start-button');
        console.log('开始按钮元素:', startButton);
        
        if (startButton) {
            const newButton = startButton.cloneNode(true);
            startButton.parentNode.replaceChild(newButton, startButton);
            
            newButton.addEventListener('click', () => {
                console.log('🎮 ========== 开始游戏按钮被点击！==========');
                // 隐藏开始画面
                const startScreenElement = document.getElementById('start-screen');
                if (startScreenElement) {
                    startScreenElement.style.display = 'none';
                }
                this.startGame();
            });
            console.log('✅ 开始按钮事件已绑定');
        }

        // 左右控制按钮
        const leftButton = document.getElementById('left-button');
        const rightButton = document.getElementById('right-button');
        
        if (leftButton) {
            leftButton.addEventListener('click', () => {
                if (!this.isPaused && this.isGameStarted) {
                    this.angle = Math.max(this.angle - 5, -170);
                    console.log('⬅️ 左转，当前角度:', this.angle);
                }
            });
        }
        
        if (rightButton) {
            rightButton.addEventListener('click', () => {
                if (!this.isPaused && this.isGameStarted) {
                    this.angle = Math.min(this.angle + 5, -10);
                    console.log('➡️ 右转，当前角度:', this.angle);
                }
            });
        }
        
        // 发射按钮
        const shootButton = document.getElementById('shoot-button');
        if (shootButton) {
            shootButton.addEventListener('click', () => {
                if (!this.isPaused && this.isGameStarted) {
                    console.log('🎯 发射！');
                    this.shoot();
                }
            });
        }
        
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.isPaused && this.isGameStarted) {
                if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                    this.angle = Math.max(this.angle - 5, -170);
                } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                    this.angle = Math.min(this.angle + 5, -10);
                } else if (e.key === ' ') {
                    e.preventDefault();
                    this.shoot();
                }
            }
        });
        
        console.log('✅ 所有事件监听器设置完成');
    }

    startGame() {
        console.log('🎮 ========== startGame() 开始执行 ==========');
        
        this.isGameOver = false;
        this.isGameStarted = true;
        this.lives = 3;
        
        this.updateLivesDisplay();
        
        console.log('开始加载关卡字符...');
        this.loadLevelCharacters(this.level);
        
        console.log('创建初始泡泡...');
        this.createInitialBubbles();
        
        console.log('创建射击器队列...');
        this.createShooterQueue();
        
        console.log('生成射击器泡泡...');
        this.spawnShooterBubble();
        
        console.log('启动游戏循环...');
        this.gameLoop();
        
        console.log('✅ ========== startGame() 执行完成 ==========');
    }

    createInitialBubbles() {
        const rows = 3;
        const cols = 6;
        const offsetX = 80;
        const offsetY = 50;
        const spacing = 8;
        
        this.bubbles = [];
        const bubblesData = [];
        
        console.log('当前关卡字符:', this.characters);
        
        this.characters.forEach(char => {
            char.pinyin.forEach(pinyin => {
                bubblesData.push({
                    character: char.character,
                    pinyin: pinyin,
                    color: this.getColorForChar(char.character)
                });
            });
        });
        
        for (let i = bubblesData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bubblesData[i], bubblesData[j]] = [bubblesData[j], bubblesData[i]];
        }
        
        const totalBubbles = rows * cols;
        bubblesData.splice(totalBubbles);
        
        let index = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (index >= bubblesData.length) break;
                
                const data = bubblesData[index];
                const x = offsetX + col * (this.bubbleRadius * 2 + spacing);
                const y = offsetY + row * (this.bubbleRadius * 2 + spacing);
                
                this.bubbles.push({
                    x: x,
                    y: y,
                    radius: this.bubbleRadius,
                    pinyin: data.pinyin,
                    character: data.character,
                    color: data.color,
                    type: 'pinyin'
                });
                
                index++;
            }
        }
        
        console.log('✅ 创建了', this.bubbles.length, '个泡泡');
    }

    createShooterQueue() {
        this.shooterQueue = [];
        const pinyinBubbles = this.bubbles.filter(b => b.type === 'pinyin');
        
        const characterStats = {};
        
        pinyinBubbles.forEach(bubble => {
            if (!characterStats[bubble.character]) {
                characterStats[bubble.character] = {
                    count: 0,
                    bubbles: [],
                    avgY: 0
                };
            }
            characterStats[bubble.character].count++;
            characterStats[bubble.character].bubbles.push(bubble);
        });
        
        for (let char in characterStats) {
            const totalY = characterStats[char].bubbles.reduce((sum, b) => sum + b.y, 0);
            characterStats[char].avgY = totalY / characterStats[char].count;
        }
        
        const sortedByPosition = Object.keys(characterStats).sort((a, b) => {
            return characterStats[b].avgY - characterStats[a].avgY;
        });
        
        sortedByPosition.forEach(char => {
            const count = characterStats[char].count;
            for (let i = 0; i < count; i++) {
                this.shooterQueue.push(char);
            }
        });
        
        const groupSize = 6;
        for (let i = 0; i < this.shooterQueue.length; i += groupSize) {
            const group = this.shooterQueue.slice(i, i + groupSize);
            for (let j = group.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [group[j], group[k]] = [group[k], group[j]];
            }
            for (let j = 0; j < group.length; j++) {
                this.shooterQueue[i + j] = group[j];
            }
        }
        
        console.log('✅ 智能射击器队列创建完成，共', this.shooterQueue.length, '个汉字');
    }

    spawnShooterBubble() {
        const existingPinyinBubbles = this.bubbles.filter(b => b.type === 'pinyin');
        
        if (existingPinyinBubbles.length === 0) {
            console.log('拼音泡泡已空，生成新的泡泡');
            this.createInitialBubbles();
            this.createShooterQueue();
            return this.spawnShooterBubble();
        }
        
        let characterToShoot;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            if (this.shooterQueue.length === 0) {
                console.log('队列已空，重新生成队列');
                this.createShooterQueue();
            }
            
            characterToShoot = this.shooterQueue.shift();
            const hasMatchingPinyin = existingPinyinBubbles.some(b => b.character === characterToShoot);
            
            if (hasMatchingPinyin) {
                break;
            }
            
            attempts++;
        }
        
        if (!characterToShoot || attempts >= maxAttempts) {
            const availableChars = [...new Set(existingPinyinBubbles.map(b => b.character))];
            characterToShoot = availableChars[getRandomInt(0, availableChars.length - 1)];
        }
        
        const char = this.characters.find(c => c.character === characterToShoot);
        this.currentCharacter = char;
        
        const currentCharElement = document.getElementById('current-character');
        if (currentCharElement) {
            currentCharElement.textContent = char.character;
        }
        
        this.shooterBubble = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            radius: this.bubbleRadius,
            character: char.character,
            color: this.getColorForChar(char.character),
            vx: 0,
            vy: 0,
            isMoving: false,
            type: 'character'
        };
        
        console.log('生成射击器泡泡:', char.character, '队列剩余:', this.shooterQueue.length);
    }

    showNextCharacterHint() {
        if (this.shooterQueue.length > 0) {
            const nextChar = this.shooterQueue[0];
            console.log('💡 下一个汉字提示:', nextChar);
        }
    }

    getColorForChar(char) {
        const colors = {
            '给': '#FF6B6B', '行': '#4ECDC4', '重': '#45B7D1',
            '好': '#FFA07A', '发': '#98D8C8', '长': '#F7DC6F',
            '难': '#BB8FCE', '乐': '#85C1E2', '还': '#F8B739',
            '看': '#EC7063', '相': '#52BE80', '调': '#5DADE2',
            '背': '#F1948A', '便': '#73C6B6', '处': '#F39C12',
            '传': '#8E44AD', '弹': '#16A085', '当': '#E74C3C',
            '更': '#3498DB', '号': '#E67E22', '间': '#2ECC71',
            '觉': '#9B59B6', '降': '#1ABC9C', '劲': '#34495E',
            '空': '#F39C12', '累': '#D35400', '落': '#C0392B',
            '没': '#27AE60', '蒙': '#2980B9', '泊': '#8E44AD',
            '铺': '#D35400', '曲': '#16A085', '塞': '#C0392B',
            '散': '#F39C12', '省': '#2C3E50'
        };
        return colors[char] || '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    levelComplete() {
        this.isGameStarted = false;
        const currentLevelScore = this.score;
        this.level++;
        this.loadLevelCharacters(this.level);
        document.getElementById('level').textContent = `关卡: ${this.level}`;
        
        const levelCompleteElement = document.getElementById('level-complete');
        if (levelCompleteElement) {
            levelCompleteElement.innerHTML = `
                <h2>关卡 ${this.level - 1} 完成! 🎉</h2>
                <div id="level-stats">
                    <p>主题: ${this.currentLevelTheme || '基础多音字'}</p>
                    <p>本关得分: ${currentLevelScore}</p>
                    <p>下一关: ${this.level} - ${this.currentLevelTheme}</p>
                    <p>目标分数: ${this.level * 50}</p>
                </div>
                <button id="next-level-button-temp" class="action-button">进入下一关 →</button>
            `;
            levelCompleteElement.style.display = 'block';
            
            document.getElementById('next-level-button-temp').addEventListener('click', () => {
                levelCompleteElement.style.display = 'none';
                this.startNextLevel();
            });
        }
    }

    startNextLevel() {
        this.bubbles = [];
        this.shooterQueue = [];
        this.missEffects = []; // 清空错误提示
        this.isGameStarted = true;
        this.isGameOver = false;
        this.lives = 3; // 每关重置生命值
        this.updateLivesDisplay();
        this.createInitialBubbles();
        this.createShooterQueue();
        this.spawnShooterBubble();
    }

    shoot() {
        if (!this.shooterBubble.isMoving && !this.isGameOver) {
            const speed = 10;
            this.shooterBubble.vx = speed * Math.cos(this.angle * Math.PI / 180);
            this.shooterBubble.vy = speed * Math.sin(this.angle * Math.PI / 180);
            this.shooterBubble.isMoving = true;
        }
    }

    update() {
        if (this.isGameOver || this.isPaused || !this.isGameStarted) return;

        if (this.shooterBubble && this.shooterBubble.isMoving) {
            this.shooterBubble.x += this.shooterBubble.vx;
            this.shooterBubble.y += this.shooterBubble.vy;

            if (this.shooterBubble.x <= this.bubbleRadius || 
                this.shooterBubble.x >= this.canvas.width - this.bubbleRadius) {
                this.shooterBubble.vx *= -1;
            }

            for (let bubble of this.bubbles) {
                if (checkCollision(this.shooterBubble, bubble)) {
                    this.handleCollision(bubble);
                    return;
                }
            }

            if (this.shooterBubble.y <= this.bubbleRadius) {
                this.bubbles.push({
                    x: this.shooterBubble.x,
                    y: this.bubbleRadius,
                    radius: this.bubbleRadius,
                    character: this.shooterBubble.character,
                    color: this.shooterBubble.color,
                    type: 'character'
                });
                this.shooterBubble.isMoving = false;
                this.spawnShooterBubble();
            }
        }

        this.checkGameOver();
    }

    handleCollision(targetBubble) {
        if (this.checkMatch(this.shooterBubble.character, targetBubble.pinyin)) {
            // ✅ 正确匹配
            const index = this.bubbles.indexOf(targetBubble);
            if (index > -1) {
                this.bubbles.splice(index, 1);
                this.score += 10;
                document.getElementById('score').textContent = `分数: ${this.score}`;
                console.log('✅ 匹配正确！得分 +10');
                
                // 检查是否达到关卡目标分数
                if (this.score >= this.level * 50) {
                    console.log('🎉 达到目标分数，关卡完成！');
                    this.levelComplete();
                    return;
                }
                
                // 重新优化队列
                const remainingPinyin = this.bubbles.filter(b => b.type === 'pinyin').length;
                if (remainingPinyin > 0 && remainingPinyin % 6 === 0) {
                    this.createShooterQueue();
                }
                
                // 如果拼音泡泡全部消除，生成新的
                if (remainingPinyin === 0) {
                    console.log('所有拼音泡泡消除，生成新的');
                    this.createInitialBubbles();
                    this.createShooterQueue();
                }
            }
        } else {
            // ❌ 错误匹配 - 扣除生命值
            console.log('❌ 匹配错误！');
            
            // 扣除生命值
            this.lives--;
            this.updateLivesDisplay();
            console.log('💔 生命值 -1，剩余生命:', this.lives);
            
            // 显示错误提示动画
            this.showMissEffect(this.shooterBubble.x, this.shooterBubble.y);
            
            // 检查是否生命值耗尽
            if (this.lives <= 0) {
                console.log('💀 生命值耗尽，游戏结束！');
                this.isGameOver = true;
                this.isGameStarted = false;
                this.showGameOver();
                return;
            }
            
            // 错误的泡泡添加到屏幕上
            this.bubbles.push({
                x: this.shooterBubble.x,
                y: this.shooterBubble.y,
                radius: this.bubbleRadius,
                character: this.shooterBubble.character,
                color: this.shooterBubble.color,
                type: 'character'
            });
            
            // 所有泡泡下降
            this.bubbles.forEach(b => {
                b.y += 10;
            });
        }
        
        this.shooterBubble.isMoving = false;
        this.spawnShooterBubble();
    }
    
    // 新增：更新生命值显示
    updateLivesDisplay() {
        const livesElement = document.getElementById('lives');
        if (livesElement) {
            // 使用爱心图标显示生命值
            const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
            livesElement.textContent = `生命: ${hearts}`;
            
            // 生命值低时闪烁警告
            if (this.lives === 1) {
                livesElement.style.animation = 'livesWarning 0.5s ease-in-out infinite';
                livesElement.style.color = '#ff4444';
            } else if (this.lives === 2) {
                livesElement.style.animation = 'none';
                livesElement.style.color = '#ffa500';
            } else {
                livesElement.style.animation = 'none';
                livesElement.style.color = 'white';
            }
        }
    }
    
    // 新增：显示错误提示效果
    showMissEffect(x, y) {
        // 创建临时的错误提示元素（可选）
        if (!this.missEffects) {
            this.missEffects = [];
        }
        
        this.missEffects.push({
            x: x,
            y: y,
            alpha: 1.0,
            scale: 1.0,
            time: 0
        });
    }
    
    // 新增：在 render 中绘制错误提示效果
    renderMissEffects() {
        if (!this.missEffects || this.missEffects.length === 0) return;
        
        this.ctx.save();
        
        // 绘制每个错误提示
        for (let i = this.missEffects.length - 1; i >= 0; i--) {
            const effect = this.missEffects[i];
            
            // 更新动画参数
            effect.time += 0.05;
            effect.alpha = Math.max(0, 1 - effect.time);
            effect.scale = 1 + effect.time * 2;
            effect.y -= 2; // 向上飘动
            
            // 绘制 "X" 标记
            this.ctx.globalAlpha = effect.alpha;
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = `bold ${40 * effect.scale}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('✖', effect.x, effect.y);
            
            // 绘制 "MISS" 文字
            this.ctx.font = `bold ${20 * effect.scale}px Arial`;
            this.ctx.fillText('MISS', effect.x, effect.y + 40);
            
            // 移除已完成的效果
            if (effect.alpha <= 0) {
                this.missEffects.splice(i, 1);
            }
        }
        
        this.ctx.restore();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        this.drawStars();
        this.drawShooterBase();
        this.bubbles.forEach(bubble => this.drawBubble(bubble));
        
        // 绘制错误提示效果
        this.renderMissEffects();
        
        if (this.shooterBubble) {
            this.drawBubble(this.shooterBubble);
            if (!this.shooterBubble.isMoving) {
                this.drawAimLine();
            }
        }
    }

    drawBubble(bubble) {
        const gradient = this.ctx.createRadialGradient(
            bubble.x, bubble.y, bubble.radius * 0.3,
            bubble.x, bubble.y, bubble.radius
        );
        gradient.addColorStop(0, bubble.color);
        gradient.addColorStop(0.7, bubble.color);
        gradient.addColorStop(1, this.adjustColorBrightness(bubble.color, -30));
        
        this.ctx.beginPath();
        this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        const highlightGradient = this.ctx.createRadialGradient(
            bubble.x - 10, bubble.y - 10, 0,
            bubble.x - 10, bubble.y - 10, bubble.radius * 0.6
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(bubble.x - 10, bubble.y - 10, bubble.radius * 0.6, 0, Math.PI * 2);
        this.ctx.fillStyle = highlightGradient;
        this.ctx.fill();

        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 6;
        
        if (bubble.type === 'pinyin' && bubble.pinyin) {
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText(bubble.pinyin, bubble.x, bubble.y);
        } else if (bubble.character) {
            this.ctx.font = 'bold 28px Arial';
            this.ctx.fillText(bubble.character, bubble.x, bubble.y);
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    adjustColorBrightness(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    drawAimLine() {
        this.ctx.save();
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.shooterBubble.x, this.shooterBubble.y);
        
        const length = 500;
        const endX = this.shooterBubble.x + length * Math.cos(this.angle * Math.PI / 180);
        const endY = this.shooterBubble.y + length * Math.sin(this.angle * Math.PI / 180);
        
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 8;
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.shooterBubble.x, this.shooterBubble.y);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([15, 10]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        const pulseSize = 12 + Math.sin(Date.now() / 200) * 3;
        const endGradient = this.ctx.createRadialGradient(endX, endY, 0, endX, endY, pulseSize);
        endGradient.addColorStop(0, 'rgba(255, 100, 100, 0.9)');
        endGradient.addColorStop(0.5, 'rgba(255, 100, 100, 0.5)');
        endGradient.addColorStop(1, 'rgba(255, 100, 100, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(endX, endY, pulseSize, 0, Math.PI * 2);
        this.ctx.fillStyle = endGradient;
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawShooterBase() {
        if (!this.shooterBubble) return;
        
        const baseY = this.canvas.height - 30;
        const baseWidth = 150;
        const baseHeight = 40;
        const baseX = this.canvas.width / 2;
        
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(baseX, baseY + 35, baseWidth / 2, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        const baseGradient = this.ctx.createLinearGradient(
            baseX - baseWidth / 2, baseY - baseHeight / 2,
            baseX - baseWidth / 2, baseY + baseHeight / 2
        );
        baseGradient.addColorStop(0, '#4a5568');
        baseGradient.addColorStop(0.5, '#2d3748');
        baseGradient.addColorStop(1, '#1a202c');
        
        this.ctx.fillStyle = baseGradient;
        this.ctx.beginPath();
        this.ctx.roundRect(
            baseX - baseWidth / 2,
            baseY - baseHeight / 2,
            baseWidth,
            baseHeight,
            10
        );
        this.ctx.fill();
        
        this.ctx.restore();
    }

    restart() {
        this.bubbles = [];
        this.shooterQueue = [];
        this.missEffects = [];
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.isGameOver = false;
        this.isGameStarted = false;
        this.angle = -90;
        this.loadLevelCharacters(1);
        document.getElementById('score').textContent = `分数: 0`;
        document.getElementById('level').textContent = `关卡: 1`;
        this.updateLivesDisplay();
        document.getElementById('game-over').style.display = 'none';
        const levelCompleteElement = document.getElementById('level-complete');
        if (levelCompleteElement) {
            levelCompleteElement.style.display = 'none';
        }
    }

    startNextLevel() {
        this.bubbles = [];
        this.shooterQueue = [];
        this.missEffects = []; // 清空错误提示
        this.isGameStarted = true;
        this.isGameOver = false;
        this.lives = 3; // 每关重置生命值
        this.updateLivesDisplay();
        this.createInitialBubbles();
        this.createShooterQueue();
        this.spawnShooterBubble();
    }

    checkMatch(character, pinyin) {
        const charData = this.characters.find(c => c.character === character);
        return charData && charData.pinyin.includes(pinyin);
    }

    checkGameOver() {
        for (let bubble of this.bubbles) {
            const bubbleBottom = bubble.y + bubble.radius;
            
            if (bubbleBottom >= this.redLineY) {
                this.isGameOver = true;
                this.isGameStarted = false;
                this.showGameOver();
                return;
            }
        }
    }

    showGameOver() {
        const gameOverElement = document.getElementById('game-over');
        if (gameOverElement) {
            gameOverElement.innerHTML = `
                <h2>游戏结束! 💔</h2>
                <div id="final-score">最终分数: ${this.score}</div>
                <div id="final-stats">
                    <p>完成关卡: ${this.level - 1}</p>
                    <p>最高关卡: ${this.level}</p>
                </div>
                <button id="restart-button-temp" class="action-button">重新开始</button>
                <button id="menu-button-temp" class="action-button secondary">返回菜单</button>
            `;
            gameOverElement.style.display = 'block';
            
            document.getElementById('restart-button-temp').addEventListener('click', () => {
                gameOverElement.style.display = 'none';
                this.restart();
                this.startGame();
            });
            
            document.getElementById('menu-button-temp').addEventListener('click', () => {
                gameOverElement.style.display = 'none';
                this.restart();
                this.showStartScreen(); // 返回开始画面
            });
        }
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1e3c72');
        gradient.addColorStop(1, '#2a5298');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // 新增：绘制星星效果（改为雪花效果）
    drawStars() {
        // 初始化星星（只在第一次调用时）
        if (!this.stars) {
            this.stars = [];
            for (let i = 0; i < 80; i++) { // 减少数量从 100 到 80
                this.stars.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: Math.random() * 2.5 + 0.5, // 稍微大一点的雪花
                    speed: Math.random() * 0.2 + 0.1, // 更慢的下落速度（从 0.5+0.2 改为 0.2+0.1）
                    opacity: Math.random() * 0.6 + 0.3, // 初始透明度
                    twinkleSpeed: Math.random() * 0.02 + 0.01, // 更慢的闪烁速度
                    horizontalDrift: (Math.random() - 0.5) * 0.3 // 添加水平飘动
                });
            }
        }
        
        // 绘制和更新星星
        this.stars.forEach(star => {
            // 更柔和的闪烁效果
            star.opacity += (Math.random() - 0.5) * star.twinkleSpeed;
            star.opacity = Math.max(0.2, Math.min(0.8, star.opacity)); // 限制透明度范围
            
            // 绘制雪花（改为更柔和的白色）
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 添加微弱的光晕效果
            if (star.opacity > 0.5) {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${(star.opacity - 0.5) * 0.3})`;
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // 雪花缓慢下落 + 左右飘动
            star.y += star.speed;
            star.x += star.horizontalDrift;
            
            // 边界检测 - 重新从顶部生成
            if (star.y > this.canvas.height) {
                star.y = -10;
                star.x = Math.random() * this.canvas.width;
            }
            
            // 左右边界检测
            if (star.x < 0 || star.x > this.canvas.width) {
                star.x = Math.random() * this.canvas.width;
                star.y = -10;
            }
        });
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

console.log('📝 准备创建 Game 实例...');
const game = new Game();
console.log('✅ Game 实例已创建:', game);