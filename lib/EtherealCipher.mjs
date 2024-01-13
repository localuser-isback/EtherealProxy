//custom cipher I wrote about half a year ago for fun, decided to use it for this project bc why not?

export function encode(input_str) {
    let Supportedcharacters = [
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "/", ":", "+", "$", "!", "-", " ",
    ];

    if (input_str.split("").some((char) => Supportedcharacters.includes(char))) {
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

        return result.join("");
    } else {
        return input_str;
    }
}

export function btw_encode(text) {
    text += "$";
    let rotations = Array.from(
        {length: text.length},
        (_, i) => text.slice(i) + text.slice(0, i),
    );
    let sorted_rotations = rotations.sort();
    return sorted_rotations
        .map((rotation) => rotation[rotation.length - 1])
        .join("");
}

export function decode(encoded_str) {
    let decoded_str = "";
    let i = 0;

    while (i < encoded_str.length) {
        let char = encoded_str[i];

        if (char === "*") {
            let nextChar = encoded_str[i + 1];
            let count = parseInt(nextChar, 10);

            if (!isNaN(count)) {
                decoded_str += Array(count).fill(encoded_str[i - 1]).join("");
                i += 2;
            } else {
                decoded_str += char;
                i += 1;
            }
        } else {
            decoded_str += char;
            i += 1;
        }
    }

    return decoded_str;
}


export function btw_decode(data) {
    let table = Array.from({length: data.length}, () => "");
    for (let i = 0; i < data.length; i++) {
        table = Array.from(
            {length: table.length},
            (_, i) => data[i] + table[i],
        ).sort();
    }
    let original_string = table.find((row) => row.endsWith("$"));
    return original_string.slice(0, -1);
}

export function replace_spaces(input_string) {
    return input_string.replace(/ /g, "_");
}

export function replace_under(input_string) {
    return input_string.replace(/_/g, " ");
}

export function full_encode(input) {
    let step1 = replace_spaces(input);
    let step2 = btw_encode(step1);
    return encodeURIComponent(encode(step2));
}

export function full_decode(input) {
    let step4 = decodeURIComponent(input);
    let step5 = btw_decode(step4);
    return replace_under(decode(step5));
}