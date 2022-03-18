import { styled } from 'lib/theme';

const BaseTitle = styled('p', {
    fontFamily: '$title',
    lineHeight: '1.1em',
    fontWeight: 'bold',
    variants: {
        s: {
            true: {
                color: '$secondaryText',
            }
        },
        n: {
            true: {
                fontWeight: 'normal',
            }
        },
    }
});

export const Title1 = styled('h1', BaseTitle, { fontSize: '4rem' });
export const Title2 = styled('h2', BaseTitle, { fontSize: '3.5rem' });
export const Title3 = styled('h3', BaseTitle, { fontSize: '3rem' });
export const Title4 = styled('h4', BaseTitle, { fontSize: '2.5rem' });
export const Title5 = styled('h5', BaseTitle, { fontSize: '2rem' });
export const Title6 = styled('h6', BaseTitle, { fontSize: '1.5rem' });
