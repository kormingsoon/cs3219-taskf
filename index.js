const express = require("express")
const axios = require("axios")
const cors = require("cors")
const Redis = require('redis')

const client = Redis.createClient()
const DEFAULT_EXPIRATION = 3600
const app = express()

app.use(express.urlencoded({extended: true}))
app.use(cors())

function cache(req, res, next) {
    client.get('photos', (err, data) => {
        if (err) throw err;

        if (data) {
            console.log("Redis cache!");
            res.send(data)
        } else {
            next();
        }
    });
}

app.get("/", cache, async(req, res) => {
    axios.get("https://jsonplaceholder.typicode.com/photos")
        .then(function (respond) {
            const data = JSON.stringify(respond.data);

            client.setex('photos', 10, data);

            res.send({
                data: respond.data
            });
        });
})

// Setup server port
var port = process.env.PORT || 8080;

// Launch app to listen to specified port
app.listen(port, function () {
    console.log("Running cs3219-taskf on port " + port);
});