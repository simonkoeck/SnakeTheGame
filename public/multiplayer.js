var canvas;
var ctx;
var snake;
var portals = [];
var canGoThroughWalls = true;
var props;
var game;
var food;
var enemies = [];
var socket;
function init() {

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    snake = [
        { x: canvas.width / 2, y: canvas.height / 2, active: true, username: "" },
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
    food = [];

    //CONNET TO SERVER
    var username = prompt("Username: ");
    while (username == "") {
        username = prompt("Type in something!");
    }
    console.log("Connecting to server...");
    socket = io();
    snake[0].username = username;
    socket.on('connect', function () {
        snake[0].socketId = socket.id;
        console.log("connected to server");
        console.log("SocketId: " + socket.id);
        socket.emit("startinfos", snake);
    });

}

function play() {
    movement();
    logic();
    draw();
    secrets();
    socketevents();
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBG();
    drawSnake();
    drawFood();
    drawScoreboard();
    drawEnemies();
}
function drawScoreboard() {
    ctx.font = props.fonts.font;
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + game.score, 8, 17);
    ctx.font = props.fonts.font;
    ctx.fillStyle = "white";
    ctx.fillText("Playing as: " + snake[0].username, 8, 33);
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
function drawEnemies() {
    for (var j = 0; j < enemies.length; j++) {
        //DRAW BODY
        for (var i = 0; i < enemies[j].length; i++) {
            if (enemies[j][i].active == true) {
                if (i === 0) {
                    ctx.fillStyle = props.snake.headColor;
                } else {
                    ctx.fillStyle = props.snake.tailColor;
                }
                ctx.fillRect(
                    enemies[j][i].x + 1,
                    enemies[j][i].y + 1,
                    game.blockIndex - 3,
                    game.blockIndex - 3
                );
                ctx.strokeStyle = props.snake.bordorColor;
                ctx.strokeRect(
                    enemies[j][i].x + 1,
                    enemies[j][i].y + 1,
                    game.blockIndex - 3,
                    game.blockIndex - 3
                );
            }
        }
        //DRAW USERNAME
        ctx.font = props.fonts.font;
        ctx.fillStyle = "white";
        ctx.fillText(enemies[j][0].username, enemies[j][0].x + 10, enemies[j][0].y - 10);
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
                food.splice(i, 1);
                socket.emit("innerevent", { action: "score", val: 10 });
                checkSecrets();
                snake.push({ x: snake[i].x, y: snake[i].y, active: true });
            }
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

function checkSecrets() {
    //NO SECRETS IN MULTILAYER
}

function secrets() {
}


//SOCKET
function socketevents() {
    //SEND CURRENT POSITION TO SERVER
    socket.emit("playermoved", snake);
    //GET POSITION OF OTHER CLIENTS
    socket.on("playermoved", function (enemy) {
        if (enemy.action == "disconnect") {
            //IF A CLIENT DISCONNECTED
            for (var i = 0; i < enemies.length; i++) {
                if (enemies[i][0].socketId == enemy.socketId) {
                    enemies.splice(i, 1);
                    return;
                }
            }
        } else {
            for (var i = 0; i < enemies.length; i++) {
                if (enemies[i][0].socketId == enemy[0].socketId) {
                    enemies[i] = enemy;
                    return;
                }
            }
            enemies.push(enemy);
        }
    });
    //GET CURRENT SCORE
    socket.on("scoreboard", function (data) {
        game.score = data.score;
    });
    //NEW FOOD
    socket.on("newfood", function (data) {
        var obj = {
            x: data.x,
            y: data.y
        }
        food[0] = obj;
    });
    //IF DISCONNECTED
    socket.on("disconnect", function () {
        document.location.reload();
    });
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


