var db = firebase.database();                 // firebase database

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var stars = [];
var enemies = [];
var bonuses = [];
var numStars = 500;

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

canvas.width =  WIDTH;
canvas.height =  HEIGHT;

var pause = false;

var lastX, lastY;

var center = {
    x: WIDTH/2,
    y: HEIGHT/2
}

var animationSpeed = 50;
var desiredAnimationSpeed = 50;
var animationCycle;
var frame = 0;

var currentLevel;

var gameStart;

/* audio */

var soundtrack = new Audio('assets/StarfieldDraft1.mp3');

var zapMP3 = new Audio('assets/zap.mp3');
var hitMP3 = new Audio('assets/hit1.mp3');
var hurtMP3 = new Audio('assets/hit2.mp3');
var thumpMP3 = new Audio('assets/thump.mp3');

var hpMP3 = new Audio('assets/hp.mp3');
var berserkMP3 = new Audio('assets/berserk.mp3');
var hyperspeedMP3 = new Audio('assets/hyperspeed.mp3');
var bulletsMP3 = new Audio('assets/bullets.mp3');
var shieldMP3 = new Audio('assets/shield.mp3');

var hyperCollectMP3 = new Audio('assets/hyperCollect.mp3');
var berserkCollectMP3 = new Audio('assets/berserkCollect.mp3');
var shieldCollectMP3 = new Audio('assets/shieldCollect.mp3');


var queenSpawned = false;
var enemySpawnRate = 0.01;
var bonusSpawnRate = 0.005;
var leaderboardUp = false;

var player;

function Player(){
    this.hp = 100;
    this.targetHP = 100;                                                  // this slows down the animation, allowing the player to see HP change
    this.bulletCount = 12;
    this.enemiesDefeated = 0;
    this.enemiesMissed = 0;
    this.level = 1;                                                       // level only goes up when the queen is killed
    this.isChampion = false;
    this.powerUps = {
        berserk: {
            count : 0,
            active : false,
            expires : Date. now()
        },
        shield: {
            count : 0,
            active : false,
            expires : Date. now()
        },
        hyperspeed: {
            count : 0,
            active : false,
            expires : Date. now()
        }
    }
}


var enemyData = {
    pawn: {
        color: "red",
        damage: 20,
        hp: 100
    },
    queen: {
        color: "#8771B6",
        damage: 35,
        hp: 200
    }
}


/* game stats */


/* SET UP BONUSES*/

var bonusPot = [];
var berserk = 25;
var hp = 10;
var extraBullets = 45;
var hyperspeed = 10;
var shield = 10;

for(var i = 0; i < berserk; i++) { bonusPot.push("berserk") }
for(var i = 0; i < hp; i++) { bonusPot.push("hp") }
for(var i = 0; i < extraBullets; i++) { bonusPot.push("extraBullets") }
for(var i = 0; i < hyperspeed; i++) { bonusPot.push("hyperspeed") }
for(var i = 0; i < shield; i++) { bonusPot.push("shield") }




// SETUP

pause = true;
init();                                                 // launch

function init(){

    $("#again").hide();

    soundtrack.currentTime = 0;                         // reset the soundtrack, but don't play it yet.

    soundtrack.loop = true;

    queenSpawned = false;
    leaderboardUp = false;
    stars = [];
    enemies = [];
    bonuses = [];
    frame = 0;

    currentLevel = "level1";

    gameStart = Date.now();

    clearTimeout(animationCycle);

    player = new Player();

    if(stars.length == 0 ){
        for(var i = 0; i < numStars; i++){
            createStar();
        }
    }

    console.log(stars);

    console.log("animationSpeed " + animationSpeed);

    animationCycle = setTimeout(function(){ requestAnimationFrame(draw) }, animationSpeed);

    // setTimeout(draw, animationSpeed);
}


function draw(){

    clear();


    if (player.powerUps.hyperspeed.active && player.hp > 0){
        rect(0 ,0, WIDTH, HEIGHT, "rgb(" + Math.floor(Math.random()*255) + ", "  + Math.floor(Math.random()*255) + ", "  + Math.floor(Math.random()*255));             // draw background
        rect(0 ,0, WIDTH, HEIGHT, "gray");             // draw background
    } else {
        rect(0 ,0, WIDTH, HEIGHT, "black");             // draw background
    }
    



    if(player.hp > 0){
        
    //    circle(center.x, center.y, 3, "yellow");

        drawStarfield();
        drawOpponents();
        drawBonuses();
        drawBullets();
        drawHealthBar();
       
        if(!pause){
            
            if(player.powerUps.shield.active){
                rect(0, 0, WIDTH, HEIGHT, "rgba(250, 247, 143, 0.2)")
            }

            drawStatusWindow();
            drawBonusWindow();

            // spawn opponents and bonuses randomly

            if(Math.random() < enemySpawnRate && !queenSpawned){

                    var type = "pawn";

                    if(player.enemiesDefeated > 0 && player.enemiesDefeated%5 == 0){
                        type = "queen"
                    }

                    spawnEnemy(type);
            }

            // use level files to generate enemies at specific times
/*
            levelStep(currentLevel);               

            if(Math.random() < bonusSpawnRate){
                    spawnBonus();
            }

            // draw and update frame
            text(frame + " (" + currentLevel[currentLevel.length-1] + ")", (WIDTH - 120), 80, 40, "blue", false);
            frame++;

*/ 
            /* check for bonus expiration */

            if(player.powerUps.hyperspeed.active && player.powerUps.hyperspeed.expires <= Date.now())   { 
                player.powerUps.hyperspeed.active = false; 
                desiredAnimationSpeed *= 1/2;
            }
            if(player.powerUps.shield.active && player.powerUps.shield.expires <= Date.now())   { player.powerUps.shield.active = false }
            if(player.powerUps.berserk.active && player.powerUps.berserk.expires <= Date.now())   { player.powerUps.berserk.active = false }

        }


        if(desiredAnimationSpeed < animationSpeed) { animationSpeed -= 5 }
        if(desiredAnimationSpeed > animationSpeed) { animationSpeed += 2 }

        if(!pause){
            animationCycle = setTimeout(function(){ requestAnimationFrame(draw) }, animationSpeed);
        }
        
    } else {
        
        clearTimeout(animationCycle);
        soundtrack.pause();

        
        text("Game Over", center.x, center.y-15, 40, "red", true)
        text("Enemies killed: " + player.enemiesDefeated, center.x, center.y+15, 20, "red", true);

        var gameLength = Math.floor((Date.now() - gameStart)/1000);

        var accuracyRating = Math.floor(player.enemiesDefeated/(player.enemiesDefeated + player.enemiesMissed)*10000)/100
        var rightNow = Date();
        var gameData = {
            accuracy: accuracyRating,
            kills: player.enemiesDefeated,
            level: player.level,
            length: gameLength,
            date: rightNow
        }

        recordGameResult(gameData);

        console.log("leaderboardUp: " + leaderboardUp);
        console.log("player.isChampion: " + player.isChampion);

        if(!player.isChampion){
            isTopTen(gameData.kills, gameData.accuracy, function(result){
                if(result){
                    leaderboardUp = true;
                    console.log("made top 10!");
                    getLeaderboard(function(){
                        $("#leaderboard").show();
                        $("#total-kills").text(player.enemiesDefeated);
                        $("#add-leader").show();
                    });
                } else if (!leaderboardUp) {
                    clearTimeout(animationCycle);             // shouldn't need to do this twice, but it needs to be done!
                    console.log("Not top ten, sorry!");
                    $("#again").show();
                }
            })
        } 
    }
}

/* DRAWING FUNCTIONS */

function drawStarfield(){

    for(var i = 0; i < stars.length; i++){
        var star = stars[i];

        /*
            We want stars that are closer to us (star.z is smaller) to move towards us more quickly. At the same time, we want them to appear bigger.
            So, star.z affects two measurements - how much the X and Y changes, and how big the star appears.
            X and Y change by 1/2000th time the distance * 1 for every count of distance (at 10ms refresh - 100 times a second); so 1/20th
            Size changes from 0.2px + a small increment per every unit of distance, up to ~ 4px
        */

        // make changes to x, y, z, coordinates
        star.size = 0.2 + 0.038*star.z;                              // a star is always at least 0.2 px in diameter + some fraction of 3.8, based on distance

        star.x += (star.x - center.x)/2000 * star.z;                // I'm not sure why /2000 works best.
        star.y += (star.y - center.y)/2000 * star.z;

        star.z++;

        // draw star

        var color = "rgba(250, 250, 250, ";

        if(player.powerUps.hyperspeed.active){
            color = "rgba(20, 20, 20, ";
        }


        circle(star.x, star.y, star.size, color + (0.2 + 0.008*star.z) + ")", false);         // I get random star size changes if I move this anywhere else

        if(star.x > WIDTH || star.x < 0 || star.y > HEIGHT || star.y < 0){
            star.x = Math.random()* WIDTH;
            star.y = Math.random()* HEIGHT;
            star.z = randBetween(1, 20);
        }
    }
}

function drawOpponents(){
    for(var i = 0; i < enemies.length; i++){
        var enemy = enemies[i];
        if(enemy.visible && enemy.hp > 0){            
            // make changes to x, y, z, coordinates
            enemy.size = 3 + 0.2*enemy.z;                              // a star is always at least 0.2 px in diameter + some fraction of 3.8, based on distance

            enemy.x += (enemy.x - center.x)/4000 * enemy.z; 
            enemy.y += (enemy.y - center.y)/4000 * enemy.z;                

            // health bar

            enemy.z++;

            // draw enemy

            rect(enemy.x, enemy.y, enemy.size, enemy.size, enemy.color);

            console.log("enemy.type " + enemy.type);

            // health bar
            if(enemy.type == "queen"){
                var fullQueenHP = enemyData.queen.hp;
                rect(enemy.x, enemy.y-enemy.size/2, enemy.size, enemy.size/5, "red");
                rect(enemy.x, enemy.y-enemy.size/2, enemy.size * (enemy.hp/fullQueenHP), enemy.size/5, "#00D010");
            } else {
                rect(enemy.x, enemy.y-enemy.size/2, enemy.size, enemy.size/5, "red");
                rect(enemy.x, enemy.y-enemy.size/2, enemy.size * (enemy.hp/100), enemy.size/5, "#00D010");
            }
            

            if(enemy.x > WIDTH || enemy.x < 0 || enemy.y > HEIGHT || enemy.y < 0){
                enemy.visible = false;

                if(enemy.hp > 0){

                    if(player.powerUps.shield.active){
                        thumpMP3.currentTime = 0;
                        thumpMP3.play();
                    } else {
                        hurtMP3.currentTime = 0;
                        hurtMP3.play();
                        player.targetHP -= enemy.damage;                          // this eases the animation
                        player.enemiesMissed++;
                        rect(0,0, WIDTH, HEIGHT, "red");
                    }

                    if(enemy.type == "queen") { 
                        queenSpawned = false;
                        player.enemiesDefeated++;                              // if the queen gets through, we still need to go up a level
                        // increaseLevel();                                     // WHY?? 

                    }
                }
            }

        } else {
            enemies.splice(i, 1)
        }
    }
}

function drawBonuses(){
    for(var i = 0; i < bonuses.length; i++){
        var bonus = bonuses[i];
        if(bonus.visible){            
            // make changes to x, y, z, coordinates
            bonus.size = 2 + 0.06*bonus.z;                              // a bonus is always at least 0.2 px in diameter + some fraction of 3.8, based on distance

            bonus.x += (bonus.x - center.x)/2000 * bonus.z;                // I'm not sure why /2000 works best.
            bonus.y += (bonus.y - center.y)/2000 * bonus.z;

            bonus.z++;


            var color = "blue";

            switch(bonus.type){
                case "hp":
                    color = "#68D73A";
                    break;
                case "hyperspeed":
                    color = "#DEDE00";
                    break;
                case "extraBullets":
                    color = "#078CC7";
                    break;
                case "berserk":
                    color = "#6C1F7F";
                    break;
                case "shield":
                    color = "#F34F4E";
                    break;
            }


            // draw bonus
            circle(bonus.x, bonus.y, bonus.size, color, true);         // I get random star size changes if I move this anywhere else

            if(bonus.x > WIDTH || bonus.x < 0 || bonus.y > HEIGHT || bonus.y < 0){
                bonus.visible = false;
            }

        } else {
            bonuses.splice(i, 1)
        }
    }
}

function drawBullets(){
    for(var j = 0; j < player.bulletCount; j++ ){

        var color = "red";

        if(player.powerUps.berserk.active){
            color = "#6C1F7F"
        }

        circle((30+30*j), HEIGHT - 20, 6, color, true);

    }
}

function drawHealthBar(){
    rect(20, 20, WIDTH - 40, 20, "red");

    if(player.hp > 100){
        player.hp = 100;
        player.targetHP = 100;
    }

    if(player.targetHP < player.hp){
        player.hp--;
    } 

    if (player.targetHP > player.hp){
        player.hp++
    }

    rect(20, 20, (WIDTH - 40)*(player.hp/100), 20, "#00D010");


    /* draw hyperspeed and berserker bar */

    var hyperWidth = (player.powerUps.hyperspeed.expires - Date.now())/1000*10;
    var berserkWidth = (player.powerUps.berserk.expires - Date.now())/1000*10;

    if (hyperWidth > (WIDTH - 40)/2) { hyperWidth = (WIDTH - 40)/2}
    if (berserkWidth > (WIDTH - 40)/2) { berserkWidth = (WIDTH - 40)/2}

    if(hyperWidth <= 0){ hyperWidth = 0 }
    if(berserkWidth <= 0){ berserkWidth = 0 }

    if(player.powerUps.hyperspeed.active){ rect(20,  45, hyperWidth, 5, "#DEDE00") }
    if(player.powerUps.berserk.active){ rect((WIDTH - 20 - berserkWidth),  45, berserkWidth, 5, "#6C1F7F") }  

}

function drawStatusWindow(){

    rect(20, 60, 200, 60, "rgba(230, 230, 230, 0.7)");
    text("Enemies killed: " + player.enemiesDefeated, 30, 85, 18, "black", false);
    text("Level: " + player.level, 30, 105, 18, "black", false);

}

function drawBonusWindow(){

    rect(20, 140, 200, 140, "rgba(230, 230, 230, 0.7)");

    text("Berserk", 30, 165, 18, "black", false);
    text("[A] or [']", 160, 165, 15, "black", false);
    for(var i = 0; i < player.powerUps.berserk.count; i++){
        circle((35+15*i), 180, 5, "#6C1F7F", true);
    }

    text("Hyperspeed", 30, 205, 18, "black", false);
    text("[S] or [;]", 160, 205, 15, "black", false);
    for(var i = 0; i < player.powerUps.hyperspeed.count; i++){
        circle((35+15*i), 220, 5, "#DEDE00", true);
    }

    text("Shield", 30, 245, 18, "black", false);
    text("[D] or [L]", 160, 245, 15, "black", false);
    for(var i = 0; i < player.powerUps.shield.count; i++){
        circle((35+15*i), 260, 5, "#F34F4E", true);
    }
 
}



function createStar(){

    var xCoord = center.x + (Math.random()-0.5) * WIDTH;
    var yCoord = center.y +(Math.random()-0.5) * HEIGHT;

    var zCoord = Math.floor(randBetween(1,50));

    var newStar = new Star(xCoord, yCoord, zCoord);

    stars.push(newStar);    
}

function spawnEnemy(type){
    var xCoord = WIDTH/2 + (Math.random()-0.5)*200;
    var yCoord = HEIGHT/2 + (Math.random()-0.5)*200;

    if(type == "queen") { queenSpawned = true }
    
    var newEnemy = new Enemy(xCoord, yCoord, type);
    enemies.push(newEnemy);    
}

function spawnBonus(){
    var xCoord = WIDTH/2 + (Math.random()-0.5)*100;
    var yCoord = HEIGHT/2 + (Math.random()-0.5)*100;
    var type = bonusPot[Math.floor(Math.random()*bonusPot.length)];
    var newBonus = new Bonus(xCoord, yCoord, type);
    bonuses.push(newBonus);    
}


/* GAME FUNCTIONS */

function increaseLevel(){
    player.level++;
    bonusSpawnRate *= 1.1;
    enemySpawnRate *= 1.1;
    console.log("new enemy rate: " + enemySpawnRate);
    console.log("new bonus rate: " + bonusSpawnRate);
}




function shoot(x, y){
    if(player.bulletCount > 0){
        circle(x, y, 5, "#FFE800");



        player.bulletCount--;
        zapMP3.currentTime = 0;
        zapMP3.play();

        for(var i = 0; i < enemies.length; i++){

            var enemy = enemies[i];
            if(enemy.visible){

                if(getDistance(x, y, enemy.x, enemy.y) <= enemy.size){
                    // console.log("HIT!");
                    rect(enemy.x, enemy.y, enemy.size, enemy.size, "yellow");

                    if(player.powerUps.berserk.active){
                        enemy.hp -= 40;
                    } else {
                        enemy.hp -= 20;
                    }

                    setTimeout(function(){
                        hitMP3.currentTime = 0;
                        hitMP3.play();
                    }, 100)
                    
                    
                    if(enemy.hp <= 0){
                        var newBullets = Math.floor(randBetween(3, 8));
                        player.bulletCount += newBullets;

                        if(player.bulletCount > 20 ) { player.bulletCount = 20 }

                        if(enemy.type == "queen") { 
                            queenSpawned = false;
                            player.bulletCount = 20; 
                            increaseLevel();
                            spawnBonus();
                            spawnBonus();
                        }

                        player.enemiesDefeated++;

                    }
                }
            }
        }

    } else {
        console.log("no bullets!");
    }
}

function checkForBonus(x, y){
    for(var i = 0; i < bonuses.length; i++){
        var bonus = bonuses[i]
        if(bonus.visible){

            if(getDistance(x, y, bonus.x, bonus.y) <= bonus.size){

                bonus.visible = false;

                if(bonus.type == "hp"){
                    hpMP3.currentTime = 0;
                    hpMP3.play();
                    player.targetHP += 20;
                } else if (bonus.type == "extraBullets"){
                    bulletsMP3.currentTime = 0;
                    bulletsMP3.play();
                    player.bulletCount += 5;
                    if(player.bulletCount > 20) { player.bulletCount = 20 }
                } else if (bonus.type == "berserk" && player.powerUps.berserk.count < 10){
                    berserkCollectMP3.currentTime = 0;
                    berserkCollectMP3.play();
                    player.powerUps.berserk.count++;                                // active for 15 seconds - stored for later use
                } else if (bonus.type == "hyperspeed" && player.powerUps.hyperspeed.count < 10){
                    hyperCollectMP3.currentTime = 0;
                    hyperCollectMP3.play();
                    player.powerUps.hyperspeed.count++;
                } else if (bonus.type == "shield" && player.powerUps.shield.count < 10){
                    shieldCollectMP3.currentTime = 0;
                    shieldCollectMP3.play();
                    player.powerUps.shield.count++;
                }
            
            }
        }
    }
}



/* OBJECT CONSTRUCTORS */


function Star(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = 1;
    this.prevCoord = {
        x: 0,
        y: 0
    };
}

function Enemy(x, y, type){
    this.x = x;
    this.y = y;
    this.z = Math.floor(randBetween(20,50));
    this.size = 1;
    this.type = type
    this.hp = enemyData[type].hp;
    this.color = enemyData[type].color;
    this.damage = enemyData[type].damage
    this.defeated = false;
    this.visible = true;
}

function Bonus(x, y, type){
    this.x = x;
    this.y = y;
    this.z = Math.floor(randBetween(10,40));
    this.size = 1;
    this.type = type;
    this.weight = 0;
    this.visible = true;
}


/* LISTENERS */

$("#canvas").on("mousedown", function(e){
//    console.log("[" + e.pageX + ", " + e.pageY + "]");
    if(!pause && player.hp > 0){ shoot(e.pageX, e.pageY) }
});

$("body").on("keydown", function(e){
    if(e.which == 32 && player.hp > 0){
        if(!pause){ shoot(lastX, lastY) }
    }

    /* bonus key events */
    if(!pause && player.hp > 0){
        if(e.which == 65 || e.which == 222){         // 83 68 70        75 76 186
            console.log("berserk!");
            if(player.powerUps.berserk.count > 0){
                player.powerUps.berserk.count--;
                berserkMP3.currentTime = 0;
                berserkMP3.play();
                if(player.powerUps.berserk.active){
                    player.powerUps.berserk.expires += 15000;
                } else {
                    player.powerUps.berserk.active = true;
                    player.powerUps.berserk.expires = Date.now() + 15000;
                }
            }
        }

        if(e.which == 83 || e.which == 186){         //  68 70        75 76 
            console.log("hyperspeed!");
            if(player.powerUps.hyperspeed.count > 0){
                player.powerUps.hyperspeed.count--;
                hyperspeedMP3.currentTime = 0;
                hyperspeedMP3.play();
                if(player.powerUps.hyperspeed.active){
                    player.powerUps.hyperspeed.expires += 15000;
                } else {
                    player.powerUps.hyperspeed.active = true;
                    player.powerUps.hyperspeed.expires = Date.now() + 15000;
                    desiredAnimationSpeed *= 2;
                }
            }
        }

        if(e.which == 68 || e.which == 76){         //  70        75 
            console.log("shield!");
            if(player.powerUps.shield.count > 0){
                player.powerUps.shield.count--;
                shieldMP3.currentTime = 0;
                shieldMP3.play();
                if(player.powerUps.shield.active){
                    player.powerUps.shield.expires += 10000;
                } else {
                    player.powerUps.shield.active = true;
                    player.powerUps.shield.expires = Date.now() + 10000;
                }
            }
        }

    }

    if((e.which == 80 || e.which == 27) && player.hp > 0){
        console.log(pause);
        if(pause){
            pause = false;
            $("#intro").hide();

            $("#leaderboard").hide();
            $("#about").hide();
            // soundtrack.play();

            draw();
        } else {
            $("#intro").show();
            pause = true;
            soundtrack.pause();
        }
    } 

});

$("#canvas").on("mousemove", function(e){
    checkForBonus(e.pageX, e.pageY);
    lastX = e.pageX;
    lastY = e.pageY;
});

$("#start").on("click", function(){
    pause = false;
    $("#intro").hide();
    // soundtrack.play();
    draw();
});

$("#again").on("click", function(){
    console.log("RESTARTING!");
    $(this).hide();
    $("#leaderboard").hide();
    init();
});

$("#close-leaderboard").on("click", function(){
    console.log("closing leaderboard! " + player.hp)
    $("#leaderboard").hide();
    leaderboardUp = false;
    if(player.hp <= 0) { 
        console.log("should be showing the button to play again");
        $("#again").show();
    }
    if(!player.isChampion) { player.isChampion = true }
    
});

$("#close-about").on("click", function(){
    $("#about").hide();
});

$("#show-leaderboard").on("click", function(){
    updateLeaderboardView();
    $("#leaderboard").show();
    $("#about").hide();
    leaderboardUp = true;
    $("#again").hide();
});

$("#show-about").on("click", function(){
    $("#about").show();
    $("#leaderboard").hide();
    leaderboardUp = true;
});

$("#add").on("click", function(){
    var text = $("#new-leader-name").val().trim()
    if(text){
        console.log("adding: " + text);
        
        var accuracyRating = Math.floor(player.enemiesDefeated/(player.enemiesDefeated + player.enemiesMissed)*10000)/100
        var rightNow = Date();
        var newLeader = {
            accuracy: accuracyRating,
            kills: player.enemiesDefeated,
            level: player.level,
            name: text,
            date: rightNow
        }

        addToLeaderboard(newLeader);
    }
});

soundtrack.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);



// LIBRARY CODE

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);                 // creates a rectangle the size of the entire canvas that clears the area
}

function circle(x,y,r, color, stroke) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, false);               // start at 0, end at Math.PI*2
    ctx.closePath();
    ctx.fillStyle = color;

    if(stroke){
        if(player.powerUps.hyperspeed.active){
            ctx.strokeStyle = "#F9B600";
        } else {
            ctx.strokeStyle = "#0197FF";
        }
        ctx.lineWidth = 2;
    }


    ctx.fill();
}

function rect(x,y,w,h, color) {
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.closePath();

    ctx.strokeStyle = "black";
    ctx.fillStyle = color;
    ctx.stroke();
    ctx.fill();
}

function text(text, x, y, size, color, centerAlign){
    ctx.font =  size + "px Rajdhani";
    ctx.fillStyle = color;

    if(centerAlign){
        ctx.textAlign = "center";
    } else {
        ctx.textAlign = "left";
    }

    ctx.fillText(text, x, y);
}

function line(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.strokeStyle = "rgba(250,250,250, 0.4)";
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

/* other functions */

function randBetween(min, max){
    return Math.random() * (max - min) + min;
}

function getDistance(x1, y1, x2, y2){
    return Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2));
}


/* LEADERBOARD FUNCTIONS */

function updateLeaderboardView(){

    $("#current-leaders").empty();
    leaders = getLeaderboard(function(leaders){

        for(var i = 1; i < leaders.length; i++){
            var leader = leaders[i];

            var leaderDiv = "<div class = 'one-leader'><div class = 'rank'>" + i + ". </div><!-- --><div class = 'name'>" + leader.name + "</div><!-- --><div class = 'kills'>" + leader.kills +"</div><!-- --><div class = 'accuracy'>" + leader.accuracy + "%</div><!-- --><div class = 'level'>" + leader.level + "</div></div>"
            $("#current-leaders").append(leaderDiv);
        }
    });
}

function isTopTen(score, accuracy, callback) {

    console.log(score + ", " + accuracy);

    getLeaderboard(function(leaders){
        console.log("GET TOP TEN");
        console.log("leaders: ");
        console.log(leaders)

        var result = false;

        for(var i = 1; i < leaders.length; i++){
            if(score >= leaders[i].kills) {
                if(score > leaders[i].kills){
                    result = true;
                } else if(score == leaders[i].kills && accuracy > leaders[i].accuracy){
                    result = true;
                }
            }
//                console.log("result: " + result);
        }

        callback(result);
    });

    
}

function addToLeaderboard(newLeader){

    $("#add-leader").hide();

    var newPlace = 1;
    var foundNewSpot = false;

    getLeaderboard(function(leaders){

        for(var i = 1; i < leaders.length; i++){
            if(newLeader.kills >= leaders[i].kills && !foundNewSpot) { 
                if(newLeader.kills == leaders[i].kills && newLeader.accuracy > leaders[i].accuracy){
                    foundNewSpot = true;
                    newPlace = i;        
                } else if(newLeader.kills > leaders[i].kills) {
                    foundNewSpot = true;
                    newPlace = i; 
                }

            }
        }

        for(var j = (leaders.length-1); j > newPlace; j--){
            leaders[j] = leaders[j-1];
        }

        leaders[newPlace] = newLeader;

        player.isChampion = true;

        updateLeaderboard(leaders);

    })

}

/* FIREBASE FUNCTIONS */
writeLastLogin(Date());
addToVisitorCount();

function writeLastLogin(date) {
    db.ref("login").set({
        lastLogin: date
    });
}

function addToVisitorCount(){
    var numVisits;

    db.ref("visitors").once('value').then(function(snapshot) {
        numVisits = Number(snapshot.val().visitors);
        numVisits++;
        db.ref("visitors").set({
            visitors: numVisits
        });
    });
}

function getLeaderboard(callback){
    var leaders;

    db.ref("leaderboard").once('value').then(function(snapshot) {
        leaders = snapshot.val().leaders;
        callback(leaders);
    });
}

function updateLeaderboard(leaderList){
    db.ref("leaderboard").set({
        leaders: leaderList
    });
    updateLeaderboardView();
}


function recordGameResult(player){
    var newGame = db.ref("games").push();
    newGame.set(player);
}


/* test levels */


var enemyCounter = 0;

function levelStep(level){

    level = eval(level);

    if(level.enemies[enemyCounter].time == frame){
        console.log(level.enemies[enemyCounter].type);
        spawnEnemy(level.enemies[enemyCounter].type);

        if(enemyCounter + 1 < level.enemies.length){
            enemyCounter++;
        } else {
            enemyCounter = 0;
            frame = 0;
            var currentLevelNum = parseInt(currentLevel[currentLevel.length-1]);
            currentLevel = "level" + (currentLevelNum+1);
        }
    }
}


var level1 = {
    number: 1, 
    background: "black",
    enemies: [
        {
            time: 60,
            type: "pawn"
        },
        {
            time: 120,
            type: "pawn"
        },
        {
            time: 200,
            type: "pawn"
        },
        {
            time: 220,
            type: "pawn"
        },
        {
            time: 320,
            type: "pawn"
        },
        {
            time: 330,
            type: "pawn"
        },
        {
            time: 420,
            type: "queen"
        }]
}

var level2 = {
    number: 1, 
    background: "black",
    enemies: [
        {
            time: 30,
            type: "pawn"
        },
        {
            time: 80,
            type: "pawn"
        },
        {
            time: 90,
            type: "pawn"
        },
        {
            time: 140,
            type: "pawn"
        },
        {
            time: 145,
            type: "pawn"
        },
        {
            time: 180,
            type: "pawn"
        },
        {
            time: 200,
            type: "pawn"
        },
        {
            time: 240,
            type: "queen"
        },
        {
            time: 300,
            type: "pawn"
        },
        {
            time: 310,
            type: "pawn"
        },
        {
            time: 340,
            type: "pawn"
        },
        {
            time: 345,
            type: "pawn"
        },
        {
            time: 350,
            type: "pawn"
        },
        {
            time: 400,
            type: "queen"
        },
        {
            time: 405,
            type: "queen"
        }]
}
