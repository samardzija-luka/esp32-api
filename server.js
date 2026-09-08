const http = require("http");
const {
    saveMeasurement,
    getMeasurements
} = require("./db");

const server = http.createServer((req, res) => {

    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
// Speed test - download// SPEED TEST DOWNLOAD
if (req.method === "GET" && path === "/speedtest/download") {

    const size = 10 * 1024 * 1024; // 10 MB
    const chunk = Buffer.alloc(64 * 1024);

    for (let i = 0; i < chunk.length; i++) {
        chunk[i] = i & 255;
    }

    res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Length": size,
        "Cache-Control": "no-store",
        "Connection": "close"
    });

    let sent = 0;

    function send() {

        while (sent < size) {

            const length = Math.min(
                chunk.length,
                size - sent
            );

            if (!res.write(chunk.subarray(0, length))) {
                res.once("drain", send);
                return;
            }

            sent += length;
        }

        res.end();
    }

    send();
    return;
}
    // ESP32 šalje podatke
    if (req.method === "POST" && path === "/log") {

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {

            const params = new URLSearchParams(body);

            const datum = params.get("datum");
            const vrijeme = params.get("vrijeme");
            const download = params.get("download");
            const upload = params.get("upload");

            console.log("Primljeni podaci:");
            console.log("Datum:", datum);
            console.log("Vrijeme:", vrijeme);
            console.log("Download:", download);
            console.log("Upload:", upload);

            saveMeasurement(datum, vrijeme, download, upload)
                .then(() => {

                    console.log("Podaci uspjesno sacuvani u Supabase.");

                    res.writeHead(200, {
                        "Content-Type": "application/json; charset=utf-8",
                        "Access-Control-Allow-Origin": "*"
                    });

                    res.end(JSON.stringify({
                        status: "ok",
                        message: "Podaci sacuvani"
                    }));

                })
                .catch(error => {

                    console.error("Greska pri cuvanju:", error.message);

                    res.writeHead(500, {
                        "Content-Type": "application/json; charset=utf-8",
                        "Access-Control-Allow-Origin": "*"
                    });

                    res.end(JSON.stringify({
                        status: "error",
                        message: "Greska pri cuvanju podataka"
                    }));
                });
        });

        return;
    }

    // Web stranica traži podatke
    if (req.method === "GET" && path === "/data") {

        console.log("GET /data - citanje podataka iz Supabase");

        getMeasurements()
            .then(data => {

                console.log("Podaci uspjesno procitani.");

                res.writeHead(200, {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": "*"
                });

                res.end(data);

            })
            .catch(error => {

                console.error("Greska pri citanju:", error.message);

                res.writeHead(500, {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": "*"
                });

                res.end(JSON.stringify({
                    status: "error",
                    message: "Greska pri citanju podataka"
                }));
            });

        return;
    }

    // Test
    res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("ESP32 API OK");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
