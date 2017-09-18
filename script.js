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

var center = {
    x: WIDTH/2,
    y: HEIGHT/2
}

var animationSpeed = 50;
var desiredAnimationSpeed = 50;

var player = {
    hp: 100, 
    targetHP: 100,                                                  // this eases the animation
    bulletCount: 12,
    enemiesDefeated: 0,
    powerUps: {
        berserk: {
            active: false,
            expires: Date. now()
        },
        shield: {
            active: false,
            expires: Date. now()
        },
        hyperspeed: {
            active: false,
            expires: Date. now()
        }
    }
}

/* game stats */


/* SET UP BONUSES*/

var bonusPot = [];
var berserk = 25;
var hp = 25;
var extraBullets = 40;
var hyperspeed = 10;

for(var i = 0; i < berserk; i++) { bonusPot.push("berserk") }
for(var i = 0; i < hp; i++) { bonusPot.push("hp") }
for(var i = 0; i < extraBullets; i++) { bonusPot.push("extraBullets") }
for(var i = 0; i < hyperspeed; i++) { bonusPot.push("hyperspeed") }




// SETUP

init();                                                 // launch

function init(){

    for(var i = 0; i < numStars; i++){
        createStar();
    }
    console.log(stars);

    setTimeout(draw, animationSpeed);
}


function draw(){

    if (player.powerUps.hyperspeed.active && player.hp > 0){
        rect(0 ,0, WIDTH, HEIGHT, "gray");             // draw background
    } else {
        rect(0 ,0, WIDTH, HEIGHT, "black");             // draw background
    }
    



    if(player.hp > 0){
        
    //    circle(center.x, center.y, 3, "yellow");

        drawStarfield();
        drawStatusWindow();
        drawOpponents();
        drawBonuses();


        /* draw game elements */
        // draw bullets

        for(var j = 0; j < player.bulletCount; j++ ){

            var color = "red";

            if(player.powerUps.berserk.active){
                color = "#6C1F7F"
            }

            circle((30+30*j), HEIGHT - 20, 6, color);

        }

        if(Math.random() < 0.01){
                spawnEnemy();
        }

        if(Math.random() < 0.01){
                spawnBonus();
        }

        /* draw health bar */

        rect(20, 20, WIDTH - 40, 20, "red");
        if(player.hp > 0){

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

            rect(20, 20, (WIDTH - 40)*(player.hp/100), 20, "green");


        /* check for bonus expirtion */



        if(player.powerUps.hyperspeed.active && player.powerUps.hyperspeed.expires <= Date.now())   { 
            player.powerUps.hyperspeed.active = false; 
            desiredAnimationSpeed *= 1/2;
        }
        if(player.powerUps.shield.active && player.powerUps.shield.expires <= Date.now())   { player.powerUps.shield.active = false }
        if(player.powerUps.berserk.active && player.powerUps.berserk.expires <= Date.now())   { player.powerUps.berserk.active = false }




        }
    } else {
        text("Game Over", center.x-15, center.y-15, 30, "red", true)
        text("Enemies killed: " + player.enemiesDefeated, center.x-15, center.y+30, 15, "red", true)
    }




    if(desiredAnimationSpeed < animationSpeed) { animationSpeed -= 5 }
    if(desiredAnimationSpeed > animationSpeed) { animationSpeed += 2 }


    setTimeout(draw, animationSpeed);


}

function drawStarfield(){
    /* draw starfield*/

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


        circle(star.x, star.y, star.size, color + (0.2 + 0.008*star.z) + ")");         // I get random star size changes if I move this anywhere else

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

            // health bar

            enemy.z++;

            // draw enemy

            rect(enemy.x, enemy.y, enemy.size, enemy.size, "red");

            // health bar
            rect(enemy.x, enemy.y-enemy.size/2, enemy.size, enemy.size/5, "red");
            rect(enemy.x, enemy.y-enemy.size/2, enemy.size * (enemy.hp/100), enemy.size/5, "green");

            if(enemy.x > WIDTH || enemy.x < 0 || enemy.y > HEIGHT || enemy.y < 0){
                enemy.visible = false;

                if(enemy.hp > 0){
                    player.targetHP -= 20;                          // this eases the animation
                    rect(0,0, WIDTH, HEIGHT, "red");
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
                    color = "#0B8B60";
                    break;
                case "berserk":
                    color = "#6C1F7F";
                    break;
            }


            // draw bonus
            circle(bonus.x, bonus.y, bonus.size, color);         // I get random star size changes if I move this anywhere else

            if(bonus.x > WIDTH || bonus.x < 0 || bonus.y > HEIGHT || bonus.y < 0){
                bonus.visible = false;
            }

        } else {
            bonuses.splice(i, 1)
        }
    }
}

function drawStatusWindow(){

    rect(20, 60, 200, 100, "rgba(230, 230, 230, 0.7)");
    text("Enemies killed: " + player.enemiesDefeated, 30, 85, 15, "black", false);
/*    text("Animation speed: " + animationSpeed + "ms", 30, 105, 15, "black", false);
    text("Desired speed: " + desiredAnimationSpeed + "ms", 30, 125, 15, "black", false);*/
    
}



function createStar(){

    var xCoord = center.x + (Math.random()-0.5) * WIDTH;
    var yCoord = center.y +(Math.random()-0.5) * HEIGHT;

    var zCoord = Math.floor(randBetween(1,50));

    var newStar = new Star(xCoord, yCoord, zCoord);

    stars.push(newStar);    
}

function spawnEnemy(){
    var xCoord = WIDTH/2 + (Math.random()-0.5)*200;
    var yCoord = HEIGHT/2 + (Math.random()-0.5)*200;
    console.log(xCoord + ", " + yCoord);
    var newEnemy = new Enemy(xCoord, yCoord);
    enemies.push(newEnemy);    
}

function spawnBonus(){
    var xCoord = WIDTH/2 + (Math.random()-0.5)*100;
    var yCoord = HEIGHT/2 + (Math.random()-0.5)*100;
    var type = bonusPot[Math.floor(Math.random()*bonusPot.length)];
    console.log(type);
    var newBonus = new Bonus(xCoord, yCoord, type);
    bonuses.push(newBonus);    
    console.log("spawning bonus");

}

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

function Enemy(x, y){
    this.x = x;
    this.y = y;
    this.z = Math.floor(randBetween(20,50));
    this.size = 1;
    this.hp = 100;
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

function shoot(x, y){
    if(player.bulletCount > 0){
        circle(x, y, 10, "red");
        player.bulletCount--;

        for(var i = 0; i < enemies.length; i++){

            var enemy = enemies[i];
            if(enemy.visible){

                if(getDistance(x, y, enemy.x, enemy.y) <= enemy.size){
                    console.log("HIT!");
                    rect(enemy.x, enemy.y, enemy.size, enemy.size, "yellow")

                    if(player.powerUps.berserk.active){
                        enemy.hp -= 40;
                    } else {
                        enemy.hp -= 20;
                    }
                    
                    if(enemy.hp <= 0){
                        var newBullets = Math.floor(randBetween(3, 8));
                        player.bulletCount += newBullets;
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

                console.log(bonus);

                bonus.visible = false;

                if(bonus.type == "hp"){
                    player.targetHP += 20;
                } else if (bonus.type == "extraBullets"){
                    player.bulletCount += 5;
                    if(player.bulletCount > 20) { player.bulletCount = 20 }
                } else if (bonus.type == "berserk"){
                    player.powerUps.berserk.active = true;
                    player.powerUps.berserk.expires = Date.now() + 15000;            // active for 15 seconds
                } else if (bonus.type == "shield"){
                    player.powerUps.berserk.active = true;
                    player.powerUps.berserk.expires = Date.now() + 15000;            // active for 15 seconds
                } else if (bonus.type == "hyperspeed"){
                    if(!player.powerUps.hyperspeed.active){
                        player.powerUps.hyperspeed.active = true;
                        player.powerUps.hyperspeed.expires = Date.now() + 15000;            // active for 15 seconds
                        desiredAnimationSpeed *= 2;
                    } else {
                        player.powerUps.hyperspeed.expires += 15000;            // active for 15 seconds
                    }
                    
                }
            
                console.log(bonus.type);

            }
        }
    }
}

/* LISTENERS */

$("#canvas").on("mousedown", function(e){
//    console.log("[" + e.pageX + ", " + e.pageY + "]");
    shoot(e.pageX, e.pageY);
});

$("#canvas").on("mousemove", function(e){
    checkForBonus(e.pageX, e.pageY);
});

// LIBRARY CODE

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);                 // creates a rectangle the size of the entire canvas that clears the area
}

function circle(x,y,r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, false);               // start at 0, end at Math.PI*2
    ctx.closePath();
    ctx.fillStyle = color;
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
    ctx.font =  size + "px Arial";
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

