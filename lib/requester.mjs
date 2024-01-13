import {html_parser, css_parser, js_parser} from './parser.mjs';
import tls from 'tls';

tls.DEFAULT_MIN_VERSION = 'TLSv1.1';
tls.DEFAULT_MAX_VERSION = 'TLSv1.3';
tls.DEFAULT_CIPHERS = 'ECDHE-RSA-AES256-GCM-SHA384:AES256-GREASE:AES128-GREASE:ECDHE-RSA-AES256-GREASE:ECDHE-RSA-AES256-GREASE:RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM:ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH';

export async function ethfetch(URL, requestMethod, userHeaders, baseurl) {
    const requestOptions = {
        method: requestMethod,
        headers: {
            'User-Agent': userHeaders['user-agent']
        }
    };

    try {
        const response = await fetch(URL, requestOptions);
        const contentType = response.headers.get('Content-Type');

        if (contentType) {
            if (contentType.includes('text/css')) {
                return {body: await css_parser(await response.text(), baseurl), headers: response.headers};
            } else if (contentType.includes('text/html')) {
                return {body: await html_parser(await response.text(), baseurl), headers: response.headers};
            } else if (contentType.includes('application/javascript')) {
                return {body: await js_parser(await response.text(), baseurl), headers: response.headers};
            } else if (contentType.includes('image')) {
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                return {body: buffer, headers: response.headers};
            } else {
                return {body: await response.text(), headers: response.headers};
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}