import {parse} from 'node-html-parser';
import {hexEncode} from './encodings.mjs';
import {parseScript} from 'meriyah';
import {generate} from 'astring';

const prependEth = (url, baseurl) => {
    if (url.startsWith('/eth/')) {
        return url;
    }
    if (url.startsWith('data:')) {
        return url;
    }
    if (url.startsWith('/eth/')) {
        return url;
    }
    if (url.startsWith('//')) {
        return `/eth/${hexEncode('https:' + url)}`;
    }
    if (url.startsWith('/')) {
        return `/eth/${hexEncode(baseurl + url)}`;
    }
    return `/eth/${hexEncode(url)}`;
};


export async function html_parser(data, baseurl) {
    try {
        const root = parse(data);

        const urlAttributes = ['href', 'src', 'srcset', 'action', 'content', 'http-equiv', 'formaction'];
        const selector = urlAttributes.map(attr => `[${attr}]`).join(', ');

        const elementsWithUrls = root.querySelectorAll(selector);
        const scriptTags = root.querySelectorAll('script');

        elementsWithUrls.forEach((element) => {
            urlAttributes.forEach((attr) => {
                if (element.hasAttribute(attr)) {
                    const originalValue = element.getAttribute(attr);
                    element.setAttribute(attr, prependEth(originalValue, baseurl));
                }
            });
        });
        for (const scriptTag of scriptTags) {
            if (scriptTag.hasAttribute('src')) {
                const originalSrc = scriptTag.getAttribute('src');
                scriptTag.setAttribute('src', prependEth(originalSrc, baseurl));
            } else {
                const originalContent = scriptTag.innerHTML;
                scriptTag.innerHTML = await js_parser(originalContent, baseurl);
            }
        }

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
        const ast = parseScript(data, {module: true, next: true});

        function traverseAndUpdate(node) {
            switch (node.type) {
                case 'Literal':
                    if (typeof node.value === 'string') {
                        node.value = prependEth(node.value, baseurl);
                        node.raw = `'${node.value.replace(/'/g, "\\'")}'`;
                    }
                    break;
                case 'TemplateLiteral':
                    node.quasis.forEach(part => {
                        if (part.type === 'TemplateElement') {
                            part.value.raw = prependEth(part.value.raw, baseurl);
                            part.value.cooked = prependEth(part.value.cooked, baseurl);
                        }
                    });
                    break;
                default:
                    for (const key in node) {
                        if (node[key] && typeof node[key] === 'object') {
                            traverseAndUpdate(node[key]);
                        }
                    }
                    break;
            }
        }

        traverseAndUpdate(ast);

        return generate(ast);
    } catch (error) {
        console.error('Error parsing JS:', error.message);
        return data;
    }
}
