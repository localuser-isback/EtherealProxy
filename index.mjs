import HyperExpress from 'hyper-express';
import LiveDirectory from 'live-directory';
import cluster from 'node:cluster';
import os from 'node:os';
import process from 'node:process';

import {ethfetch} from './lib/requester.mjs';
import {full_decode} from './lib/EtherealCipher.mjs';

const totalCPUs = os.cpus().length;

const host = '0.0.0.0';
const port = 3000;

const AssetsDirectory = new LiveDirectory('./public/', {
    static: true,
    cache: {
        max_file_count: 200,
        max_file_size: 1024 * 1024 * 2.5,
    },
});

if (cluster.isMaster) {
    console.log(`Number of CPUs is ${totalCPUs}`);
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        console.log("Forking another worker!");
        cluster.fork();
    });

    console.log(`[!] Server is running on port http://${host}:${port}`);
} else {
    MainServer();
}

function MainServer() {
    const app = new HyperExpress.Server();

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        next();
    });

    app.all('/eth/:url', async (req, res) => {
        try {
            const decodedURL = full_decode(req.params.url);
            const URLHostname = new URL(decodedURL).hostname;
            const RequestedURL = decodedURL;
            const requestMethod = req.method;
            const queryParameters = req.query;
            
            let queryString = "";
            if (Object.keys(queryParameters).length > 0) {
                queryString = "?" + Object.entries(queryParameters)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('&');
            }

            const {body, headers} = await ethfetch(RequestedURL, requestMethod, req.headers, `https://${URLHostname}${queryString}`);
            const contentType = headers.get('Content-Type');
            if (contentType && contentType.includes('image')) {
                res.setHeader('Content-Type', contentType);
                const contentLength = headers.get('Content-Length');
                if (contentLength) {
                    res.setHeader('Content-Length', contentLength);
                }
            }
            res.send(body);
        } catch (e) {
            if (e instanceof TypeError) {
                console.error('The provided URL is not valid:', e.message);
                res.status(400).send('Invalid URL');
            } else if (e instanceof DOMException && e.name === 'InvalidCharacterError') {
                console.error('The URL contains invalid characters:', e.message);
                res.status(400).send('Invalid URL character');
            } else {
                console.error('Unexpected error:', e);
                res.status(500).send('Internal Server Error');
            }
        }
    });

    app.listen(port).then(() => console.log(`Worker ${process.pid} is running on port ${port}`));
}