import { styled } from 'lib/theme';
import { ComponentProps } from 'react';
import avatarsURL from 'res/avatars.svg';

const av = (icon: string) => `url(${avatarsURL}#${icon})`;


export const Avatar = styled('div', {
    transition: 'border-color ease .3s, background ease .3s, box-shadow ease .3s',
    display: 'block',
    position: 'absolute',
    left: '-1rem',
    top: '0rem',
    width: '2rem',
    height: '2rem',
    boxSizing: 'border-box',
    borderRadius: '2rem',
    border: '.25rem solid royalblue',
    backgroundRepeat: 'no-repeat',
    backgroundImage: av('human'),
    backgroundColor: 'black',
    backgroundPosition: 'center',

    variants: {
        icon: {
            cancel: {
                position: 'absolute',
                width: '24px',
                height: '24px',
                left: 'calc(100% - 30px)',
                top: '6px',
                border: 'none',
                backgroundImage: av('cancel'),
                backgroundColor: 'transparent',
                boxShadow: 'none',
            },
            from: {
                borderColor: '#c83771',
                backgroundImage: av('out'),
                backgroundColor: '#c83771',
            },
            to: {
                borderColor: '#37abc8',
                backgroundImage: av('in'),
                backgroundColor: '#37abc8',
            },
            confirm: {
                borderColor: '$green800',
                backgroundImage: av('ok'),
                backgroundColor: '$green800',
            },
            add: {
                borderColor: '$bg300',
                backgroundImage: av('add'),
                backgroundColor: '$bg100',
            },
            bank: {
                borderColor: 'gold',
                backgroundImage: av('bank'),
                backgroundColor: 'white',
            },
            property: {
                borderColor: 'darkgrey',
                backgroundImage: av('property'),
                backgroundColor: 'black',
            },
        },
    }
});

type Icon = ComponentProps<typeof Avatar>['icon'];