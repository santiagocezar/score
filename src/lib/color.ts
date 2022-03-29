import rgba from 'color-rgba';
import tinycolor from 'tinycolor2';

function memoizeIsLight() {
    // true if light (contrasts with black)
    const memo = new Map<string, boolean>();

    return function (color: string) {
        if (memo.has(color)) {
            return memo.get(color) ?? false;
        } else {
            const components = rgba(color) ?? [0, 0, 0, 0];

            const [r, g, b] = components.map(c => {
                c /= 255.;
                return c <= 0.03928
                    ? c / 12.92
                    : Math.pow(((c + 0.055) / 1.055), 2.4);
            });

            const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const light = L > 0.179;

            memo.set(color, light);

            return light;
        }
    };
}

export const isLight = memoizeIsLight();

type Values = '10' | '30' | '40' | '50' | '70' | '90';
export type Palette = {
    [key in `$$p${Values}` | '$$contrast']: string;
};

function createPaletteFromParsed(color: tinycolor.Instance): Palette {
    const { h, s } = color.toHsl();
    const lum = (l: number) => tinycolor({ h, s: s * (Math.sin(l * Math.PI)), l });
    const hex = (l: number) => lum(l).toHexString();
    const mid = lum(.6);

    return {
        $$p10: hex(.97),
        $$p30: hex(.9),
        $$p40: hex(.75),
        $$p50: mid.toHexString(),
        $$p70: hex(.3),
        $$p90: hex(.1),
        $$contrast: mid.getLuminance() > 0.179 ? 'black' : 'white',
    };
}

export function createPalette(color: string) {
    const value = createPalette.memory.get(color);
    if (value !== undefined) {
        return value;
    } else {
        const palette = createPaletteFromParsed(tinycolor(color));
        createPalette.memory.set(color, palette);
        return palette;
    }
}
export module createPalette {
    export var memory = new Map<string, Palette>();
}

export function createPalettes() {
    const palette: Palette[] = [];
    for (let h = 0; h < 360; h += 30) {
        palette.push(createPaletteFromParsed(tinycolor({ h, s: .6, l: .5 })));
    }
    return palette;
}

export const palettes = createPalettes();
export const bw: Palette = {
    $$p10: '#fff',
    $$p30: '#ddd',
    $$p40: '#aaa',
    $$p50: '#888',
    $$p70: '#444',
    $$p90: '#000',
    $$contrast: 'white',
};