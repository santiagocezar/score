import { styled } from 'lib/theme';

export const Card = styled('div', {
    backgroundColor: '$bg100',
    boxShadow: '$e1 ',
    borderRadius: '.5rem',
    variants: {
        elevation: {
            0: { boxShadow: '$e0' },
            1: { boxShadow: '$e1' },
            2: { boxShadow: '$e2' },
            3: { boxShadow: '$e3' },
            4: { boxShadow: '$e4' },
            5: { boxShadow: '$e5' },
        },
    }
});
