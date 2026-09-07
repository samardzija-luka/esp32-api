const https = require("https");

function supabaseRequest(path, method = "GET", data = null) {
    return new Promise((resolve, reject) => {

        const body = data ? JSON.stringify(data) : "";

        const url = new URL(
            process.env.SUPABASE_URL + path
        );

        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: {
                "Content-Type": "application/json",
                "apikey": process.env.SUPABASE_KEY,
                "Authorization": "Bearer " + process.env.SUPABASE_KEY
            }
        };

        if (body) {
            options.headers["Content-Length"] = Buffer.byteLength(body);
        }

        const request = https.request(options, response => {

            let responseBody = "";

            response.on("data", chunk => {
                responseBody += chunk.toString();
            });

            response.on("end", () => {

                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(responseBody);
                } else {
                    reject(
                        new Error(
                            `Supabase HTTP ${response.statusCode}: ${responseBody}`
                        )
                    );
                }
            });
        });

        request.on("error", reject);

        if (body) {
            request.write(body);
        }

        request.end();
    });
}

function saveMeasurement(datum, vrijeme, brzina) {
    return supabaseRequest(
        "/rest/v1/wifi_measurements",
        "POST",
        {
            datum: datum,
            vrijeme: vrijeme,
            brzina: Number(brzina)
        }
    );
}

function getMeasurements() {
    return supabaseRequest(
        "/rest/v1/wifi_measurements?select=*&order=datum.desc, vrijeme.desc&limit=100"
    );
}

module.exports = {
    saveMeasurement,
    getMeasurements
};
