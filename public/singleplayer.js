var canvas;
var ctx;
var snake;
var portals = [];
var canGoThroughWalls = true;
var props;
var game;
var food;

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    snake = [
        { x: canvas.width / 2, y: canvas.height / 2, active: true },
        { x: canvas.width / 2, y: canvas.height / 2, active: true }
    ];
    props = {
        canvas: {
            bgColor: "#3D3E3F"
        },

        snake: {
            tailColor: "#2C2D2D",
            headColor: "white",
            bordorColor: "black"
        },
        food: {
            color: "grey"
        },
        fonts: {
            font: "14px Roboto Mono"
        }
    };
    game = {
        dir: "RIGHT",
        stage: 1,
        speed: 140,
        score: 0,
        blockIndex: canvas.width / 20,
        secrets: {
            lsdMode: false
        }
    };
    game.interval = setInterval(play, game.speed);
    food = [{ x: game.blockIndex * 12, y: game.blockIndex * 4 }];
}

function play() {
    movement();
    logic();
    draw();
    secrets();
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBG();
    drawSnake();
    drawFood();
    drawScoreboard();
}
function drawScoreboard() {
    ctx.font = props.fonts.font;
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + game.score, 8, 17);
}
function drawSnake() {
    for (var i = 0; i < snake.length; i++) {
        if (snake[i].active == true) {
            if (i === 0) {
                ctx.fillStyle = props.snake.headColor;
            } else {
                ctx.fillStyle = props.snake.tailColor;
            }
            ctx.fillRect(
                snake[i].x + 1,
                snake[i].y + 1,
                game.blockIndex - 3,
                game.blockIndex - 3
            );
            ctx.strokeStyle = props.snake.bordorColor;
            ctx.strokeRect(
                snake[i].x + 1,
                snake[i].y + 1,
                game.blockIndex - 3,
                game.blockIndex - 3
            );
        }
    }
}

function movement() {
    var tails = [];
    tails = snake;
    for (var i = tails.length - 1; i > 0; i--) {
        snake[i].x = tails[i - 1].x;
        snake[i].y = tails[i - 1].y;
    }
    switch (game.dir) {
        case "LEFT":
            snake[0].x -= game.blockIndex;
            break;
        case "RIGHT":
            snake[0].x += game.blockIndex;
            break;
        case "TOP":
            snake[0].y -= game.blockIndex;
            break;
        case "DOWN":
            snake[0].y += game.blockIndex;
            break;
        default:
            break;
    }
}
function drawFood() {
    for (var i = 0; i < food.length; i++) {
        ctx.fillStyle = props.food.color;
        ctx.fillRect(
            food[i].x + 1,
            food[i].y + 1,
            game.blockIndex - 3,
            game.blockIndex - 3
        );
    }
}
function logic() {
    for (var i = 1; i < snake.length; i++) {
        if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
            gameOver();
        }
    }
    //RESPAWN SNAKE ON THE OTHER SIDE
    if (canGoThroughWalls) {
        if (snake[0].x >= canvas.width) {
            snake[0].x = 0;
        } else if (snake[0].x < 0) {
            snake[0].x = canvas.width;
        }
        if (snake[0].y >= canvas.height) {
            snake[0].y = 0;
        } else if (snake[0].y < 0) {
            snake[0].y = canvas.height;
        }
    } else {
        //IF YOU CANNOT GO THROUGH WALLS YOULL DIE!
        if (snake[0].x >= canvas.width) {
            gameOver();
        } else if (snake[0].x < 0) {
            gameOver();
        }
        if (snake[0].y >= canvas.height) {
            gameOver();
        } else if (snake[0].y < 0) {
            gameOver();
        }
    }

    //IF ATE A FOOD
    for (var i = 0; i < food.length; i++) {
        if (snake[0].active == true) {
            if (snake[0].x == food[i].x && snake[0].y == food[i].y) {
                let res = rndCordFood();
                food[i].x = res.x;
                food[i].y = res.y;
                game.score += 10;
                checkSecrets();
                snake.push({ x: snake[i].x, y: snake[i].y, active: true });
            }
        }
    }

    //COLLIDED WITH PORTAL
    for (var i = 0; i < portals.length; i++) {
        if (snake[0].x == portals[i].x && snake[0].y == portals[i].y) {
            document.removeEventListener("keydown", keyHandler, false);
            game.portalAnim.enabled = true;
        }
    }
}
function gameOver() {
    clearInterval(game.interval);
    if (game.score > localStorage.getItem("highscore")) {
        localStorage.setItem("highscore", game.score);
    }
    alert("Game over! Your score: " + game.score);
    document.location.reload();
}

function drawBG() {
    ctx.fillStyle = props.canvas.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function rndCordFood() {
    var obj = {};
    var rnd1 = Math.floor(Math.random() * (canvas.width - 30));
    for (var i = 0; i < game.blockIndex; i++) {
        if (rnd1 % game.blockIndex == 0) break;
        rnd1++;
    }
    var rnd2 = Math.floor(Math.random() * (canvas.height - 30));
    for (var j = 0; j < game.blockIndex; j++) {
        if (rnd2 % game.blockIndex == 0) break;
        rnd2++;
    }
    obj.x = rnd1;
    obj.y = rnd2;
    for (var i = 0; i < food.length; i++) {
        if (food[i].x == obj.x && food[i].y == obj.y) {
            obj = rndCordFood();
            break;
        }
    }
    if (snake[0].x == rnd1 && snake[0].y == rnd2) {
        obj = rndCordFood();
    }
    for (var i = 0; i < snake.length; i++) {
        if (snake[i].x == obj.x && snake[i].y == obj.y) {
            obj = rndCordFood();
        }
    }
    return obj;
}

function checkSecrets() {
    var highscore = localStorage.getItem("highscore");
    if (game.score > highscore) {
        var newHighscore = document.getElementById("newHighscore");
        if (newHighscore.innerHTML == "") {
            newHighscore.innerHTML = "NEW HIGHSCORE!";
            newHighscore.classList.add("writeEffect");
            setTimeout(function () {
                newHighscore.classList.remove("writeEffect");
            }, 1300);
        }
    }
    if (game.score % 100 == 0 && game.score <= 600) {
        let res = rndCordFood();
        food.push(res);
    }
    if (game.score % 50 == 0 && game.score <= 1000) {
        clearInterval(game.interval);
        game.speed -= 6;
        game.interval = setInterval(play, game.speed);
    }
    if (game.score == 200) {
        canGoThroughWalls = false;
        canvas.style.border = "whitesmoke 4px solid";
        var msg = document.getElementById("msg");
        msg.innerHTML = "DO NOT HIT THE BORDER!";
        msg.classList.add("writeEffect");
        setTimeout(function () {
            msg.classList.remove("writeEffect");
        }, 1700);
        game.secrets.lsdMode = false;
        props.canvas.bgColor = "#3D3E3F";
    }
    if (game.score == 300) {
        canGoThroughWalls = true;
        canvas.style.border = "whitesmoke 2px solid";
        var msg = document.getElementById("msg");
        msg.innerHTML = "";
    }
    //LSD
    if (game.score == 100) {
        var msg = document.getElementById("msg");
        msg.innerHTML = "LSD MODE = ON!";
        msg.classList.add("writeEffect");
        setTimeout(function () {
            msg.classList.remove("writeEffect");
        }, 1400);
        game.secrets.lsdMode = true;
    }
}

function secrets() {
    if (game.secrets.lsdMode == true) {
        props.canvas.bgColor =
            "rgb(" +
            Math.floor(Math.random() * 355) +
            "," +
            Math.floor(Math.random() * 355) +
            "," +
            Math.floor(Math.random() * 355) +
            ")";
    }
}

//EVENTS
document.addEventListener("keydown", keyHandler, false);

function keyHandler(e) {
    if ((e.keyCode == 65 || e.keyCode == 37) && game.dir != "RIGHT") {
        game.dir = "LEFT";
    } else if ((e.keyCode == 68 || e.keyCode == 39) && game.dir != "LEFT") {
        game.dir = "RIGHT";
    } else if ((e.keyCode == 87 || e.keyCode == 38) && game.dir != "DOWN") {
        game.dir = "TOP";
    } else if ((e.keyCode == 83 || e.keyCode == 40) && game.dir != "TOP") {
        game.dir = "DOWN";
    }
}
