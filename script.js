let cs = document.getElementById("canvas");
let ctx = cs.getContext("2d");

const bg = new Image();
bg.src = "images/bg.jpg"

let enemies = [];
let fruits = [];
let alive = true;

const gravity = 0.3;
let time = 0;
let spiderTimer = 0;
let fruitTimer = 0;
let fruitInterval = 2500;
let spiderInterval = 2000;
let randomInterval = Math.random() * 2000 + 3000;
let points = 0;

const player = {
    x: 0,
    y: 220,
    width: 64,
    height:64,
    frameX: 0,
    frameY: 1,
    speed: 9,
    moving: false,
    velocity: 0
};

const playerSprite = new Image();
playerSprite.src = "images/player.png";

function drawSprite(img, sX, sY, sW, sH, dX, dY, dW, dH) {
    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH)
}

class Background {
    constructor(gW, gH) {
        this.gW = gW;
        this.gH =gH;
        this.image = document.getElementById('bg');
        this.x = 0;
        this.y = 0;
        this.width = 626;
        this.height = 313;
        this.speed = 3;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    }
    update() {
        this.x -= this.speed;
        if (this.x < 0 - this.width) this.x = 0;
    }
}

const background = new Background(cs.width, cs.height);

class Spider {
    constructor(gW, gH) {
        this.gW = gW;
        this.gH = gH;
        this.width = 61;
        this.height = 45;
        this.image = document.getElementById('spider');
        this.x = 626;
        this.y = 265;
        this.frameX = 0;
        this.frameY = 0;
        this.speed = 4;
        this.delete = false;
    }

    draw() {
        drawSprite(this.image, this.width * this.frameX, this.height * this.frameY, this.width, this.height,
            this.x, this.y,this.width, this.height);
    }
    update() {
        this.x -= this.speed;
        if (this.frameX < 4 ) this.frameX++
        else {
            if (this.frameY === 0) this.frameY = 1
            else this.frameY = 0;

            this.frameX = 0;
        }
        if (this.x < 0 - this.width) {
            this.delete = true;
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Fruit {
    constructor(gW, gH) {
        this.gW = gW;
        this.gH = gH;
        this.x = getRandomInt(50, 550);
        this.y = 0;
        this.width = 45;
        this.height = 45;
        this.image = document.getElementById('fruit');
        this.frameX = 0;
        this.frameY = 0;
        this.speed = 2;
        this.delete = false;
    }

    draw() {
        drawSprite(this.image, this.width * this.frameX, this.height * this.frameY, this.width, this.height,
            this.x, this.y,this.width, this.height);
    }

    update() {
        this.y += this.speed;
        if (player.moving && player.frameY === 1 && this.x >= 300) {
            this.x -= 2;
        }
    }
}

function handleFruits(delta) {
    if (fruitTimer > fruitInterval + randomInterval && player.moving) {
        fruits.push(new Fruit(cs.width, cs.height));
        randomInterval = Math.random() * 1233 + 576;
        fruitTimer = 0;
    } else {
        fruitTimer += delta;
    }

    fruits.forEach(f => {
        f.draw();
        f.update();
    });
    fruits = fruits.filter(f => !f.delete);
}

function drawScore() {
    ctx.fillStyle ='black';
    ctx.font = 'italic 25pt Times New Roman';
    ctx.fillText('Набранные очки: ' + points, 50, 40);
}

function handleSpiders(delta) {
    if (spiderTimer > spiderInterval + randomInterval) {
        enemies.push(new Spider(cs.width, cs.height));
        randomInterval = Math.random() * 4039 + 350;
        spiderTimer = 0;
    } else {
        spiderTimer += delta;
    }
    enemies.forEach(s => {
        s.draw();
        s.update();
    });
    enemies = enemies.filter(s => !s.delete);
}

function animate(stampTime) {
    const delta = stampTime - time;
    time = stampTime
    ctx.clearRect(0,0,cs.width, cs.height);
    background.draw(ctx);
    if (player.moving && player.frameY === 1 && player.x >= 300) {
        background.update();
    }
    drawSprite(playerSprite, player.width * player.frameX, player.height * player.frameY,
        player.width, player.height, player.x, player.y, player.width, player.height);
    drawScore();
    handle(enemies);
    end();
    collision(fruits);
    handleSpiders(delta);
    handleFruits(delta);
    if (alive) requestAnimationFrame(animate);
}
animate(0);

window.addEventListener("keydown", ({ keyCode }) => {
    switch(keyCode) {
        case 65:
            if (!(player.x <= 0)) {
                player.x -= player.speed;
                player.frameY = 0;
                player.moving = true;
            }
            break;
        case 68:
            player.moving = true;
            if (!(player.x >= 300)) {
                player.x += player.speed;
            }
            player.frameY = 1;
            break;
        case 87:
            if (player.velocity === 0) {
                player.velocity -= 7;
                player.moving = false;
            }
            break;
    }
});

window.addEventListener("keyup", ({ keyCode }) => {
    switch(keyCode) {
        case 65:
            player.moving = false;
            break;
        case 68:
            player.moving = false;
            break;
        case 87:
            player.moving = false;
            break;
    }
});

function end() {
    if (points === 20) {
        alive = false;
        let text = document.getElementById('text')
        text.style.display = "block";
        text.innerHTML = "Победа! Вам удалось собрать " + points + " яблок!";
        text.style.background = '#649632';

        let button = document.getElementById('again')
        button.hidden = false;
    }
}

function handle(enemies) {
    //тут проверка на коллизии
    enemies.forEach( s => {
        const dx = s.x - player.x;
        const dy = s.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < s.width / 2.5 + player.width/2.9) {
            alive = false;
            let text = document.getElementById('text')
            text.style.display = "block";
            text.innerHTML = "Игра окончена! К сожалению, вы не собрали 20 яблок...";

            let button = document.getElementById('again')
            button.hidden = false;
        }
    })

    // изменение фреймов спрайта и воздействие гравитации при прыжке
    player.y += player.velocity;
    if (player.frameX < 3 && player.moving) player.frameX++
    else player.frameX = 0;

    if (player.y + player.height + player.velocity <= cs.height) {
        player.velocity += gravity;
    } else player.velocity = 0;
}

function collision(fruits) {
    fruits.forEach( f => {
        const dx = f.x - player.x;
        const dy = f.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < f.width / 2.5 + player.width/2.9) {
            points += 1;
            f.delete = true;
        }
    })
}

function Again() {
    alive = true;
    time = 0;
    spiderTimer = 0;
    spiderInterval = 5000;
    randomInterval = Math.random() * 2000 + 3000;
    points = 0;

    enemies = [];
    fruitInterval = 5000;
    fruitTimer = 0;
    fruits = [];
    player.y = 220;
    player.x = 0;

    animate(0);
    let text = document.getElementById('text')
    text.style.display = 'none';

    let button = document.getElementById('again')
    button.hidden = true;

    background.x = 0;
    background.y = 0;
}