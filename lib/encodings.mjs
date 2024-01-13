//hex encode and decode

export const hexEncode = (text) => {
    const encryptedMessage = Buffer.concat([Buffer.from('RXRoZXJhbFByb3h5AAAAAA', "base64"), Buffer.from(text)]); // Value in buffer.from is just 'EtheralProxy' + Padding coverted to a ascii buffer to base64.
    return encryptedMessage.toString("hex");
};

export const hexDecode = (text) => {
    const decryptedMessage = Buffer.from(text, "hex").slice(
        16,
        text.length,
    );
    return decryptedMessage.toString();
};

//wtf encode and decode

export const WTFencode = (value) => {
    const charShiftLength = Math.ceil(Math.random() * 10);
    const charShiftData = ((n) => {
        let out = "";
        for (let i = 0; i < n; i++) out += Math.ceil(Math.random() * 9);
        return parseInt(out);
    })(charShiftLength);

    const str = encodeURIComponent(value);
    const sections = str.match(new RegExp(`.{1,${charShiftLength}}`, "g"));

    let out = "";
    for (let i in sections) {
        for (let j in sections[i].split("")) {
            out += String.fromCharCode(
                sections[i][j].charCodeAt(0) +
                parseInt(charShiftData.toString()[j])
            );
        }
    }

    return encodeURIComponent(
        `${
            charShiftLength < 10 ? `0${charShiftLength}` : charShiftLength
        }${charShiftData}${out}`
    );
};


export const WTFdecode = (value) => {
    const charShiftLength = parseInt(value.substring(0, 2));
    const charShiftData = parseInt(value.substring(2, charShiftLength + 2));

    const str = decodeURIComponent(
        value.substring(charShiftLength + 2, value.length)
    );
    const sections = str.match(new RegExp(`.{1,${charShiftLength}}`, "g"));

    let out = "";
    for (let i in sections) {
        for (let j in sections[i].split("")) {
            out += String.fromCharCode(
                sections[i][j].charCodeAt(0) -
                parseInt(charShiftData.toString()[j])
            );
        }
    }

    return decodeURIComponent(out);
};

// custom cipher

export function EthEncode(input) {
    const replace_spaces = (input_string) => input_string.replace(/ /g, "_");

    const btw_encode = (text) => {
        text += '$';
        let transformed_string = "";
        for (let i = 0; i < text.length; i++) {
            let rotation = text.slice(i) + text.slice(0, i);
            transformed_string += rotation[rotation.length - 1];
        }
        return transformed_string;
    };

    const encode = (input_str) => {
        let Supportedcharacters = Array.from(new Set([...input_str, '/', ':', '+', '$', '!', '-']));

        if (input_str.split('').every(char => Supportedcharacters.includes(char))) {
            if (!input_str) {
                return input_str;
            }

            let result = [];
            let count = 1;

            for (let i = 1; i < input_str.length; i++) {
                if (input_str[i] === input_str[i - 1]) {
                    count += 1;
                } else {
                    if (count > 1) {
                        result.push(`${input_str[i - 1]}*${count}`);
                    } else {
                        result.push(input_str[i - 1]);
                    }
                    count = 1;
                }
            }

            if (count > 1) {
                result.push(`${input_str[input_str.length - 1]}*${count}`);
            } else {
                result.push(input_str[input_str.length - 1]);
            }

            return result.join('');
        } else {
            return input_str;
        }
    };

    return encodeURIComponent(encode(btw_encode(replace_spaces(input))));
}

export function EthDecode(input) {
    const replace_under = (input_string) => input_string.replace(/_/g, " ");

    const btw_decode = (data) => {
        let table = Array.from({length: data.length}, () => '');
        for (let i = 0; i < data.length; i++) {
            table = Array.from({length: table.length}, (_, i) => data[i] + table[i]).sort();
        }
        let original_string = table.find(row => row.endsWith('$'));
        return original_string.slice(0, -1);
    };

    const decode = (text) => {
        let result = "";
        let i = 0;
        while (i < text.length) {
            if (text[i] === '*') {
                if (i + 1 < text.length && !isNaN(text[i + 1])) {
                    let char_to_repeat = text[i - 1];
                    let num_repeats = parseInt(text[i + 1]);
                    result += char_to_repeat.repeat(num_repeats - 1);
                    i += 2;
                } else {
                    result += '*';
                    i += 1;
                }
            } else {
                result += text[i];
                i += 1;
            }
        }

        return result;
    };

    return replace_under(btw_decode(decode(decodeURIComponent(input))));
}
