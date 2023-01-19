'use strict';
const Element = require("./Element");
const express = require("express");
const cors = require("cors");
const path = require('path');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;
const STORE = {};
const app = express();


app.use(cors());

const router = express.Router();
router.get("/get/:key", function(req, res) {
	const { key } = req.params;
	const element = STORE[key];

	return element
		? res.json({ value: element.value })
		: res.status(404).json({ error: "The key wasn't found" });
});

router.get("/set/:key/:value", function(req, res) {
	const { key, value } = req.params;

	if (STORE[key])
		return res.status(409).json({ error: "The key already exists" });

	STORE[key] = new Element(key, value);

	res.json({ value });
});

setInterval(() => {
	for (let key in STORE) if (STORE[key].hasExpired) delete STORE[key];
}, 1000);


app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

app.listen(PORT, function() {
	console.log(`Listening on port ${PORT}!`);
});


module.exports = app;
module.exports.handler = serverless(app);


