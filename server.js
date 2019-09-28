var express = require("express");
var app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/singleplayer.html");
})

app.get("/multiplayer", (req, res) => {
    res.sendFile(__dirname + "/views/multiplayer.html");
})

var glx = require("greenlock-express").create({
    server: "https://acme-v02.api.letsencrypt.org/directory",
    // Note: If at first you don't succeed, stop and switch to staging:
    // https://acme-staging-v02.api.letsencrypt.org/directory
    version: "draft-11", // Let's Encrypt v2 (ACME v2)

    // If you wish to replace the default account and domain key storage plugin
    store: require("le-store-certbot"),
    email: "simon.koeck@hak-feldkirch.at",
    agreeTos: true,
    // Contribute telemetry data to the project
    telemetry: true,

    // the default servername to use when the client doesn't specify
    // (because some IoT devices don't support servername indication)
    servername: "snakethegame.tk"
});

var listener = glx.listen(5000, 5001, function () {
    console.log("Listening on port 80 for ACME challenges and 443 for express app.");
});

//MULTIPLAYER
var clients = [];
var food = [];
food[0] = rndCordFood();
var game = {
    score: 0
};
var io = require("socket.io")(listener);
io.on('connection', (socket) => {
    //START DATA
    socket.emit("newfood", food[0]);
    socket.emit("scoreboard", game);
    socket.on("startinfos", function (data) {
        clients.push(data);
    });
    socket.on("playermoved", (data) => {
        for (var i = 0; i < clients.length; i++) {
            if (clients[i][0].socketId == socket.id) {
                clients[i] = data;
                socket.broadcast.emit("playermoved", clients[i]);
            }
        }
    })
    socket.on("disconnect", function () {
        for (var i = 0; i < clients.length; i++) {
            if (clients[i][0].socketId == socket.id) {
                socket.broadcast.emit("playermoved", { socketId: clients[i][0].socketId, action: "disconnect" });
                clients.splice(i, 1);
            }
        }
    });
    socket.on("innerevent", function (data) {
        if (data.action == "score") {
            game.score += data.val;
        }
        io.emit("scoreboard", game);
        food[0] = rndCordFood();
        io.emit("newfood", food[0]);
    });
});

function rndCordFood() {
    var obj = {};
    var rnd1 = Math.floor(Math.random() * (300 - 30));
    for (var i = 0; i < 15; i++) {
        if (rnd1 % 15 == 0) break;
        rnd1++;
    }
    var rnd2 = Math.floor(Math.random() * (300 - 30));
    for (var j = 0; j < 15; j++) {
        if (rnd2 % 15 == 0) break;
        rnd2++;
    }
    obj.x = rnd1;
    obj.y = rnd2;
    return obj;
}