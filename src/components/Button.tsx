import { HTMLProps } from 'react';
import { styled } from 'lib/theme';

export interface ButtonProps extends HTMLProps<HTMLButtonElement> {
    icon?: boolean;
    'inner-className'?: string;
}

export const ButtonGroup = styled('div', {
    display: 'flex',
    alignSelf: 'stretch',
    gap: '.5rem',
    variants: {
        compact: {
            false: {
                '> *': {
                    width: 0,
                    flex: 1,
                },
            },
            true: {
                '> *': {
                    flexShrink: 0,
                }
            }
        }
    },
    defaultVariants: {
        compact: false,
    }
});


export const Button = styled('button', {
    $$inactive: '$colors$bg300',
    $$hover: '$colors$bg200',
    $$pressed: '$colors$bg400',
    $$text: '$colors$text',
    $$disabledText: '$colors$secondaryText',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$$inactive',
    borderColor: '$$hover',
    gap: '4px',
    color: '$$text',
    fontSize: '1rem',
    fontWeight: 'bold',
    paddingX: '1rem',
    borderRadius: '1rem',
    height: '2.5rem',
    lineHeight: '1rem',
    transition: 'background-color .1s',
    '&:hover': {
        backgroundColor: '$$hover',
    },
    '&:active': {
        backgroundColor: '$$pressed',
    },
    '&:disabled': {
        color: '$$disabledText',
        backgroundColor: '$$hover',
        cursor: 'default'
    },

    variants: {
        icon: {
            true: {
                width: '2rem'
            }
        },
        color: {
            red: {
                $$inactive: '$colors$red200',
                $$hover: '$colors$red100',
                $$pressed: '$colors$red300',
                $$text: '$colors$text',
                $$disabledText: '$colors$red400',
            },
            yellow: {
                $$inactive: '$colors$yellow200',
                $$hover: '$colors$yellow100',
                $$pressed: '$colors$yellow300',
                $$text: '$colors$text',
                $$disabledText: '$colors$yellow400',
            },
            blue: {
                $$inactive: '$colors$blue200',
                $$hover: '$colors$blue100',
                $$pressed: '$colors$blue300',
                $$text: '$colors$text',
                $$disabledText: '$colors$blue400',
            },
            green: {
                $$inactive: '$colors$green200',
                $$hover: '$colors$green100',
                $$pressed: '$colors$green300',
                $$text: '$colors$text',
                $$disabledText: '$colors$green400',
            },
            palette: {
                $$inactive: '$$p30',
                $$hover: '$$p10',
                $$pressed: '$$p50',
                $$text: '$$p90',
                $$disabledText: '$$p70',
                borderWidth: '.125rem',
                borderColor: '$$p50',
            },
        },
    }
});