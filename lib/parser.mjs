import {parse} from 'node-html-parser';
import {full_encode} from './EtherealCipher.mjs';

const prependEth = (url, baseurl) => {
    if (url.startsWith('data:')) {
        return url;
    }
    if (url.startsWith('/eth/')) {
        return url;
    }
    if (url.startsWith('/') && !url.startsWith('/eth/')) {
        return `/eth/${full_encode(baseurl + url)}`;
    }
    return `/eth/${full_encode(url)}`;
};

export async function html_parser(data, baseurl) {
    try {
        const root = parse(data, {
            lowerCaseTagName: false,
            script: false,
            style: false
        });


        const urlAttributes = ['href', 'src', 'srcset', 'action', 'content', 'http-equiv', 'formaction'];
        const selector = urlAttributes.map(attr => `[${attr}]`).join(', ');

        const elementsWithUrls = root.querySelectorAll(selector);

        elementsWithUrls.forEach((element) => {
            urlAttributes.forEach((attr) => {
                if (element.hasAttribute(attr)) {
                    const originalValue = element.getAttribute(attr);
                    element.setAttribute(attr, prependEth(originalValue, baseurl));
                }
            });
        });

        return root.toString();
    } catch (error) {
        console.error('Error parsing HTML:', error.message);
        return null;
    }
}

export async function css_parser(data, baseurl) {
    try {
        return data.replace(/(?<=url\("?'?)[^"']\S*[^"'](?="?'?\);?)/g, match => {
            return prependEth(match, baseurl);
        });
    } catch (error) {
        console.error('Error parsing CSS:', error.message);
        return null;
    }
}

export async function js_parser(data, baseurl) {
    try {
        return data.replace(/(?<=['"`])(https?:\/\/[^'"\s]+|\/[^'"\s]+)(?=['"`])/g, match => {
            return prependEth(match, baseurl);
        });
    } catch (error) {
        console.error('Error parsing JS:', error.message);
        return null;
    }
}