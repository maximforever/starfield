var canvas = document.getElementById("canvas");
var ctx;

var stars = [];
var numStars = 1000;

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var center = {
    x: WIDTH/2,
    y: HEIGHT/2
}

var animationSpeed = 10;

console.log(WIDTH + ", " + HEIGHT);

canvas.width =  WIDTH;
canvas.height =  HEIGHT;

// SETUP CODE


init();                                                 // launch

function init(){
    ctx = canvas.getContext("2d");

    for(var i = 0; i < numStars; i++){
        createStar();
    }


    setInterval(draw, animationSpeed);
}


function draw(){
    rect(0,0, WIDTH, HEIGHT, "black");
    circle(WIDTH/2, HEIGHT/2, 2, "red");
    text("star count: " + stars.length, 100, 50)


    for(var i = 0; i < stars.length; i++){
        var star = stars[i];


        var distanceToCenter = Math.sqrt(Math.pow(WIDTH/2-star.x,2) + Math.pow(HEIGHT/2-star.y, 2));
        var maxDistance = Math.sqrt(Math.pow(WIDTH/2,2) + Math.pow(HEIGHT/2, 2));

    //    star.size = distanceToCenter/maxDistance * 3;


        circle(star.x, star.y, star.size,  "rgba(250, 250, 250, 1");
    //    circle(star.x, star.y, star.size,  "rgba(250, 250, 250, " + (0.3 + star.size/6) + ")");
        //line(star.x, star.y, WIDTH/2, HEIGHT/2)
    //    star.size *= distanceToCenter/600;



        /* move star */

        var deltaX = (star.x - WIDTH/2)/distanceToCenter;
        var deltaY = (star.y - HEIGHT/2)/distanceToCenter;

        star.y += deltaY;
        star.x += deltaX;
     
        if(star.x < 0 || star.x > WIDTH || star.y < 0 || star.y > HEIGHT){

            var sign = Math.random();
            if(sign < 0.5){
                sign = -1;
            } else {
                sign = 1
            }

            star.x = WIDTH/2 + Math.random()*WIDTH*sign/100;
            star.y = HEIGHT/2 + Math.random()*HEIGHT*sign/100
/*
            star.x = WIDTH * Math.random();
            star.y = HEIGHT * Math.random();*/
        } 
    }
}


function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);                 // creates a rectangle the size of the entire canvas that clears the area
}


// APP CODE


function createStar(){
    var x = Math.random()*WIDTH;
    var y = Math.random()*HEIGHT;

    var thisStar = new Star(x, y);

    stars.push(thisStar);
}


function Star(x, y){
    this.x = x;
    this.y = y;
    this.size = 1;
}


// LIBRARY CODE

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
    ctx.font = "15px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
}

function line(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

/* other functions */

function randBetween(min, max){
    return Math.random() * (max - min) + min;
}






