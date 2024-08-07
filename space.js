//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

//ship
let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = tileSize; //ship moving speed

//aliens
let alienArray = [];
let alienWidth = tileSize*2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //number of aliens to defeat
let alienVelocityX = 1; //alien moving speed

//bullets
let bulletArray = [];
let bulletVelocityY = -10; //bullet moving speed

let score = 0;
let levelCount = 1;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //used for drawing on the board

    //draw initial ship
    // context.fillStyle="green";
    // context.fillRect(ship.x, ship.y, ship.width, ship.height);

    //load images
    shipImg = new Image();
    shipImg.src = "./Ship.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    populateBoard();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    //alien
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            //if alien touches the borders
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX*2;

                //move all aliens up by one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                let gameOverSound = new Audio('game-over-arcade-6435.mp3');
                gameOverSound.play();
                gameOver = true;
                showGameOver();
            }
        }
    }

    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //bullet collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {

                bullet.used = true;
                alien.health = alien.health - 1;
                if(alien.health <= 0){
                    alien.alive = false;
                    alien.isBoss? score+= 1000 : score += 100; //Adds score depending on if the alien killed was a boss or not.
                    let explosionSound = new Audio('explosion-6055.mp3');
                    explosionSound.play();
                    alienCount--;
                }
            }
        }
    }

    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); //removes the first element of the array
    }

    //next level
    if (alienCount == 0) {
        //increase the number of aliens in columns and rows by 1
        score += alienColumns * alienRows * 100; //bonus points :)
        alienColumns = Math.min(alienColumns + 1, columns/2 -2); //cap at 16/2 -2 = 6
        alienRows = Math.min(alienRows + 1, rows-4);  //cap at 16-4 = 12
        if (alienVelocityX > 0) {
            alienVelocityX += 0.2; //increase the alien movement speed towards the right
        }
        else {
            alienVelocityX -= 0.2; //increase the alien movement speed towards the left
        }

        levelCount++;
        alienArray = [];
        bulletArray = [];

        //Every 3 levels is a boss battle
        if( levelCount % 3 == 0)
            createBoss(50);
        else
            populateBoard();
    }
    //score
    context.fillStyle="white";
    context.font="16px courier";
    context.fillText(score, 5, 20);
    context.fillText("Level ", 390,20 );
    context.fillText(levelCount, 450,20 );
}

function moveShip(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; //move right one tile
    }
}

function createBasicAlien() {
    alienImg = new Image();
    alienImg.src = "./ogAlien.png";
    let alien = {
        img : alienImg,
        width : alienWidth,
        height : alienHeight,
        alive : true,
        health: 1,
        isBoss: false
    }
    return alien;
}

function createPinkAlien() {
    alienImg = new Image();
    alienImg.src = "./PinkAlien.png";
    let alien = {
        img : alienImg,
        width : alienWidth,
        height : alienHeight,
        alive : true,
        health: 3,
        isBoss: false
    }
    return alien;
}

function populateBoard(){
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            pinkChance = Math.floor(Math.random() * 5);
            
            if(pinkChance == 3){
                let alien = createPinkAlien();
                alien.x = alienX + c*alienWidth;
                alien.y = alienY + r*alienHeight;
                alienArray.push(alien);
            }
            else{
                let alien = createBasicAlien();
                alien.x = alienX + c*alienWidth;
                alien.y = alienY + r*alienHeight;
                alienArray.push(alien);
            }
        }
    }
    alienCount = alienArray.length;
}

function createBoss(healthCount){
    healthCount = parseInt(healthCount);
    bossImg = new Image();
    bossImg.src='./Redalien.png';
    let boss = {
        img : bossImg,
        x : alienX,
        y : alienY,
        width : alienWidth*2,
        height : alienHeight*2,
        alive : true,
        health: healthCount,
        isBoss: true
    }

    alienArray.push(boss);
    alienCount = alienArray.length;
}
function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        //shoot
        let bullet = {
            x : ship.x + shipWidth*15/32,
            y : ship.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
        let laserSound = new Audio("blaster-2-81267.mp3");
        laserSound.play();
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

const replaceAt = function(str, index, replacement) {
    return str.substring(0, index) + replacement + str.substring(index + replacement.length);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function showGameOver(){
    let gameOverScreen = document.querySelector('.gameOver');
    let tryAgainBtn = document.querySelector('.tryAgain');
    gameOverScreen.style.display = 'flex';
    gameOverScreen.style.scale = '100%';

    tryAgainBtn.addEventListener('click', e =>{
        if(e.target.tagName == 'H3'){
            location.reload();
        }
    })

    tryAgainBtn.addEventListener('mouseover', async e =>{
        e.target.textContent.toLowerCase();
        let tryAgainStr = e.target.textContent;

        for(let i = 0; i < tryAgainStr.length; i++){
            let letter = tryAgainStr[i];
            letter = letter.toUpperCase();
            tryAgainStr = replaceAt(tryAgainStr, i, letter);
            tryAgainBtn.textContent = tryAgainStr;
            await sleep(200);
        }
    });

    tryAgainBtn.addEventListener('mouseout', e =>{
        e.target.textContent = e.target.textContent.toLowerCase();
    });
}