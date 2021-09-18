const express = require("express")
const axios = require("axios")
const cors = require("cors")
const Redis = require('redis')

const client = Redis.createClient()
const DEFAULT_EXPIRATION = 10
const app = express()

app.use(express.urlencoded({extended: true}))
app.use(cors())

keys = 'photos'

function cache(req, res, next) {
    client.get(keys, (err, photos) => {
        if (err) throw err;
        if (photos) {
            console.log("cache hit!");
            res.send(photos)
        } else {
            console.log("cache miss!");
            next();
        }
    });
}

app.get("/", cache, async(req, res) => {
    axios.get("https://jsonplaceholder.typicode.com/photos")
        .then(function (stuffToSend) {
            const data = JSON.stringify(stuffToSend.data);
            client.setex(keys, DEFAULT_EXPIRATION, data);
            res.send({
                data: stuffToSend.data
            });
        });
})

// Setup server port
var port = process.env.PORT || 8080;

// Launch app to listen to specified port
app.listen(port, function () {
    console.log("Running cs3219-taskf on port " + port);
});