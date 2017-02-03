let http = require("http");
let Promise = require("promise");


let readyPromise = new Promise((resolve,reject) => {
	let req = http.get("http://127.0.0.1:4444/wd/hub/static/resource/hub.html",(res) => {
		const statusCode = res.statusCode;
		resolve()
	})

	req.on("error", (e) => {
		reject(new Error("Selenium Server not running?"))
	})
})

readyPromise.then(runTest,(e) => {
	console.log(e);
})


function runTest(argument) {
	console.log("Go!")
}

