var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var stars = [];
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
    rect(0 ,0, WIDTH, HEIGHT, "black");


    circle(center.x, center.y, 3, "yellow");

    for(var i = 0; i < stars.length; i++){
        var star = stars[i];

        /*
            We want stars that are closer to us (star.z is smaller) to move towards us more quickly. At the same time, we want them to appear bigger.
            So, star.z affects two measurements - how much the X and Y changes, and how big the star appears.
            X and Y change by 1/2000th time the distance * 1 for every count of distance (at 10ms refresh - 100 times a second); so 1/20th
            Size changes from 0.5 to 4
        */

        // make changes to x, y, z, coordinates
        star.size = 0.2 + 0.01*star.z;                              // a star is always at least 0.2 px in diameter + some fraction of 3.8, based on distance

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
    
        
/*      circle(star.prevCoord.x, star.prevCoord.y, star.size*0.8, "rgba(250, 250, 250, " + (0.2 + 0.008*star.z) + ")");
        line(star.x, star.y, center.x, center.y)

        var distance = getDistance(star.x, star.y, star.prevCoord.x, star.prevCoord.y);

        text((distance + " [" + star.z + "]"), star.x, star.y - 10);

        star.prevCoord.x = star.x;
        star.prevCoord.y = star.y;*/

    }

}



function createStar(){
/*  var xCoord = Math.random()* WIDTH;
    var yCoord = Math.random()* HEIGHT;
*/

    var xCoord = center.x + (Math.random()-0.5) * WIDTH;
    var yCoord = center.y +(Math.random()-0.5) * HEIGHT;



    var zCoord = Math.floor(randBetween(1,50));

    var newStar = new Star(xCoord, yCoord, zCoord);

    stars.push(newStar);    
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

// LIBRARY CODE

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);                 // creates a rectangle the size of the entire canvas that clears the area
}

function circle(x,y,r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);               // start at 0, end at Math.PI*2
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

