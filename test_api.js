const https = require('https');
require('dotenv').config();

const apiKey = process.env.REACT_APP_API_KEY;
const model = 'gemini-1.5-flash-latest';
const version = 'v1';

// We need to parse the key from the .env file content manually or ensure dotenv is installed.
// Since I can't be sure dotenv is installed in the environment where I run node, 
// I will just hardcode the key for this test script based on what I read, 
// OR I will read the .env file manually.
// To be safe and identical to the app, I will read the file.

const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const keyMatch = envContent.match(/REACT_APP_API_KEY=(.*)/);
const key = keyMatch ? keyMatch[1].trim() : null;

if (!key) {
    console.error("Could not find API KEY in .env");
    process.exit(1);
}

console.log("Testing with Key:", key.substring(0, 5) + "...");

const testModel = (ver, mod) => {
    const options = {
        method: 'POST',
        hostname: 'generativelanguage.googleapis.com',
        path: `/${ver}/models/${mod}:generateContent?key=${key}`,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
            const body = Buffer.concat(chunks).toString();
            console.log(`Response for ${mod} (${ver}): Status ${res.statusCode}`);
            if (res.statusCode !== 200) {
                console.error("Error Body:", body);
            } else {
                console.log("Success! Response snippet:", body.substring(0, 100));
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.write(JSON.stringify({
        contents: [{
            parts: [{ text: "Hello" }]
        }]
    }));
    req.end();
};

testModel('v1beta', 'gemini-flash-latest');

const listModels = (ver) => {
    const options = {
        method: 'GET',
        hostname: 'generativelanguage.googleapis.com',
        path: `/${ver}/models?key=${key}`,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
            const body = Buffer.concat(chunks).toString();
            console.log(`Models for ${ver}: Status ${res.statusCode}`);
            if (res.statusCode === 200) {
                try {
                    const data = JSON.parse(body);
                    if (data.models) {
                        console.log("Available models:");
                        data.models.forEach(m => {
                            if (m.name.includes("flash")) {
                                console.log(` - ${m.name}`);
                            }
                        });
                    } else {
                        console.log("No models field in response");
                    }
                } catch (e) {
                    console.error("Error parsing JSON:", e);
                }
            } else {
                console.error("Error Body:", body);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.end();
};
