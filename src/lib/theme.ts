import { createStitches } from '@stitches/react';
import { CSSForStitches, extendStitches } from './stitchx';


export const paletteShadow = {
    e2: '0 .15rem .5rem $$p30',
    e3: '0 .4rem 1rem $$p40',
};
const stitches = createStitches({
    utils: {
        paddingX: (v: {}) => ({
            paddingLeft: v,
            paddingRight: v,
        }),
        paddingY: (v: {}) => ({
            paddingTop: v,
            paddingBottom: v,
        }),

        marginX: (v: {}) => ({
            marginLeft: v,
            marginRight: v,
        }),
        marginY: (v: {}) => ({
            marginTop: v,
            marginBottom: v,
        }),
    },
    media: {
        sm: "(min-width: 30em)",
        md: "(min-width: 48em)",
        lg: "(min-width: 62em)",
        xl: "(min-width: 80em)",
        "2xl": "(min-width: 96em)",
    },
    theme: {
        shadows: {
            e0: '0 0 0 1px $colors$shadow',
            e1: '0 .035rem .25rem $colors$shadow',
            e2: '0 .15rem .5rem $colors$shadow',
            e3: '0 .4rem 1rem $colors$shadow',
            e4: '0 .9rem 2rem $colors$shadow',
            e5: '0 1.9rem 4rem $colors$shadow',
        },
        zIndices: {
            'header': 99,
            'modal': 100,
        },
        fonts: {
            'body': '"Manrope", sans-serif',
            'title': '"Poppins", sans-serif',
        },
        colors: {
            bg100: '#fff',
            bg200: '#eee',
            bg300: '#ddd',
            bg400: '#ccc',

            text: '#000',
            textContrast: '#fff',
            secondaryText: '#0008',
            secondaryTextContrast: '#fff8',

            shadow: '#0002',

            red050: '#ffe8f5',
            red100: '#f2c1db',
            red200: '#e59bc1',
            red300: '#d973a7',
            red400: '#cd4c8d',
            red500: '#b33274',
            red600: '#8c265a',
            red700: '#651a40',
            red800: '#3f0e28',
            red900: '#1b0210',

            yellow050: '#fff4da',
            yellow100: '#ffe4ad',
            yellow200: '#ffd67d',
            yellow300: '#ffcc4b',
            yellow400: '#ffc51a',
            yellow500: '#e69d00',
            yellow600: '#b36d00',
            yellow700: '#804500',
            yellow800: '#4e2400',
            yellow900: '#1d0900',

            blue050: '#e4f1ff',
            blue100: '#bed2f6',
            blue200: '#95b4ea',
            blue300: '#6d96df',
            blue400: '#4477d4',
            blue500: '#2b5ebb',
            blue600: '#1f4992',
            blue700: '#14346a',
            blue800: '#081f42',
            blue900: '#000a1c',

            green050: '#eefbe3',
            green100: '#d6edc1',
            green200: '#bddf9d',
            green300: '#a3d378',
            green400: '#8ac652',
            green500: '#71ad39',
            green600: '#57862b',
            green700: '#3e601e',
            green800: '#243b0f',
            green900: '#091500',
        }
    }
});

export type CSS = CSSForStitches<typeof stitches.config>;

export const { useBreakpoint, transitions } = extendStitches(stitches);



export const {
    styled,
    css,
    globalCss,
    keyframes,
    getCssText,
    theme,
    createTheme,
    config,
} = stitches;

export const iconCSS: CSS = {
    width: '24px',
    height: '24px',
    verticalAlign: 'bottom',
    display: 'inline-block',
};

globalCss({
    'html': {
        color: '$text',
        fontFamily: '$body',
        fontSize: '16px',
        backgroundColor: '$bg100',
    },
    'hr': {
        borderBottom: '1px solid $bg200',
        marginY: '.5rem',
    },
    '.u-icon': iconCSS,
    'img': { display: 'block' },
    'h1,h2,h3,h4,h5,h6': { fontWeight: 'bold', fontFamily: '$title' },
    '::selection': {
        color: '$textContrast',
        backgroundColor: '$blue500',
    }
    // 'h1': { fontSize: '3em' },
    // 'h2': { fontSize: '2.5em' },
    // 'h3': { fontSize: '2.1em' },
    // 'h4': { fontSize: '1.8em' },
    // 'h5': { fontSize: '1.6em' },
    // 'h6': { fontSize: '1.4em' },
})();
