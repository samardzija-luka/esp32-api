const http = require("http");

const server = http.createServer((req, res) => {

    if (req.method === "POST" && req.url === "/log") {

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {

            const params = new URLSearchParams(body);

            const datum = params.get("datum");
            const vrijeme = params.get("vrijeme");
            const brzina = params.get("brzina");

            console.log("Primljeni podaci:");
            console.log("Datum:", datum);
            console.log("Vrijeme:", vrijeme);
            console.log("Brzina:", brzina);

            res.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*"
            });

            res.end(JSON.stringify({
                status: "ok",
                datum: datum,
                vrijeme: vrijeme,
                brzina: brzina
            }));
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
