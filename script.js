var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var stars = [];
var enemies = [];
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

var player = {
    hp: 100, 
    bulletCount: 12,
    enemiesDefeated: 0,
    powerUps: {
        berserk: false,
        shield: 0,
        hyperspeed: false
    }
}

/* game stats */




// SETUP

init();                                                 // launch

function init(){

    for(var i = 0; i < numStars; i++){
        createStar();
    }
    console.log(stars);

    setInterval(draw, animationSpeed);
}


function draw(){
    rect(0 ,0, WIDTH, HEIGHT, "black");             // draw background

    circle(center.x, center.y, 3, "yellow");

    drawStarfield();
    drawOpponents();

        /* draw game elements */
/*
        if(Math.random() < 0.05){
            console.log("spawning one!");
            spawnEnemy();
        }
*/
        // draw bullets

        for(var j = 0; j < player.bulletCount; j++ ){

            circle((30+30*j), HEIGHT - 20, 6, "red");

        }

        if(Math.random() < 0.01){
                spawnEnemy();
        }

        /* draw health bar */

        rect(20, 20, WIDTH - 40, 20, "red");
        rect(20, 20, (WIDTH - 40)*(player.hp/100), 20, "green");


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
        circle(star.x, star.y, star.size, "rgba(250, 250, 250, " + (0.2 + 0.008*star.z) + ")");         // I get random star size changes if I move this anywhere else

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
            rect(enemy.x, enemy.y-20, enemy.size, 10, "red");
            rect(enemy.x, enemy.y-20, enemy.size*(enemy.hp/100), 10, "green");

            if(enemy.x > WIDTH || enemy.x < 0 || enemy.y > HEIGHT || enemy.y < 0){
                enemy.visible = false;

                if(enemy.hp > 0){
                    player.hp -= 20;
                    rect(0,0, WIDTH, HEIGHT, "red");
                }
            }

        } else {
            enemies.splice(i, 1)
        }
    }
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
    console.log(enemies);
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

function shoot(x, y){
    if(player.bulletCount > 0){
        circle(x, y, 10, "red");
        player.bulletCount--;


        for(var i = 0; i < enemies.length; i++){

            var enemy = enemies[i];

            if(enemy.visible){

                console.log(x + ", " + y);
                console.log(enemy.x  + ", " + (enemy.x + enemy.size));
                console.log(enemy.y  + ", " + (enemy.y + enemy.size));

                if(x > enemy.x && x < (enemy.x+enemy.size) && y > enemy.y && y < (enemy.y + enemy.size)){
                    console.log("HIT!");
                    enemy.hp -= 20;
                    if(enemy.hp <= 0){
                        var newBullets = Math.floor(randBetween(3, 8));
                        player.bulletCount += newBullets;
                    }
                }


            }
        }



    } else {
        console.log("no bullets!");
    }
}

/* LISTENERS */

$("#canvas").on("mousedown", function(e){
    console.log("[" + e.pageX + ", " + e.pageY + "]");
    shoot(e.pageX, e.pageY);
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

function text(text, x, y){
    ctx.font = "12px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
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

