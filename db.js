const https = require("https");

function saveMeasurement(datum, vrijeme, brzina) {
    return new Promise((resolve, reject) => {

        const data = JSON.stringify({
            datum: datum,
            vrijeme: vrijeme,
            brzina: Number(brzina)
        });

        const url = new URL(
            process.env.SUPABASE_URL + "/rest/v1/wifi_measurements"
        );

        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": process.env.SUPABASE_KEY,
                "Authorization": "Bearer " + process.env.SUPABASE_KEY,
                "Content-Length": Buffer.byteLength(data),
                "Prefer": "return=minimal"
            }
        };

        const request = https.request(options, response => {

            let body = "";

            response.on("data", chunk => {
                body += chunk.toString();
            });

            response.on("end", () => {

                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve();
                } else {
                    reject(
                        new Error(
                            `Supabase HTTP ${response.statusCode}: ${body}`
                        )
                    );
                }
            });
        });

        request.on("error", reject);

        request.write(data);
        request.end();
    });
}

module.exports = { saveMeasurement };
