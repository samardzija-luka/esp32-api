const http = require("http");
const {
    saveMeasurement,
    getMeasurements
} = require("./db");

const server = http.createServer((req, res) => {

    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

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
            const brzina = params.get("brzina");

            console.log("Primljeni podaci:");
            console.log("Datum:", datum);
            console.log("Vrijeme:", vrijeme);
            console.log("Brzina:", brzina);

            saveMeasurement(datum, vrijeme, brzina)
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
                        "Content-Type": "application/json; charset=utf-8"
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
