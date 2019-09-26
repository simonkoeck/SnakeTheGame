var express = require("express");
var app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/singleplayer.html");
})

app.get("/multiplayer", (req, res) => {
    res.sendFile(__dirname + "/views/multiplayer.html");
})

var greenlock = require("greenlock-express")
    .create({
        email: "simon.koeck@hak-feldkirch.at", // The email address of the ACME user / hosting provider
        agreeTos: true, // You must accept the ToS as the host which handles the certs
        configDir: "./certs/", // Writable directory where certs will be saved
        communityMember: true, // Join the community to get notified of important updates
        telemetry: true, // Contribute telemetry data to the project
        store: require('greenlock-store-fs'),
        // Using your express app:
        // simply export it as-is, then include it here
        app: app

        //, debug: true
    })
var listener = greenlock.listen(5000, 5001);

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