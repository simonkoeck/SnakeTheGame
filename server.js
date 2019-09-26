var express = require("express");
var app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/singleplayer.html");
})

require("greenlock-express")
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
    .listen(80, 443);