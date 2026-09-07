const http = require("http");

const server = http.createServer((req, res) => {

    if (req.method === "POST" && req.url === "/log") {

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {

            console.log("Primljeni podaci:");
            console.log(body);

            res.writeHead(200, {
                "Content-Type": "text/plain; charset=utf-8"
            });

            res.end("PODACI PRIMLJENI");
        });

    } else {

        res.writeHead(200, {
            "Content-Type": "text/plain; charset=utf-8"
        });

        res.end("ESP32 API OK");
    }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
