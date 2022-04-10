import { Label as LabelRoot } from '@radix-ui/react-label';
import { ComponentProps, FC, KeyboardEventHandler, ReactNode, useCallback, useMemo } from 'react';
import { styled } from 'lib/theme';

const LabelText = styled('p', {
    flexShrink: 0,
    fontWeight: 'bold',
    fontSize: '.9rem',
    margin: '0 .2rem .3rem .2rem',
    variants: {
        error: {
            true: {
                color: '$red500'
            }
        }
    }
});
const InputWrapper = styled(LabelRoot, {
    fontWeight: 'normal',
    display: 'flex',
    borderRadius: '1rem',
    backgroundColor: '$bg100',
    border: '.125rem solid $secondaryText',
    fontSize: '1rem',
    '&:focus-within': {
        borderColor: '$blue500',
    },
    variants: {
        invalid: {
            true: {
                borderColor: '$red500',
            }
        }
    }
});

const InputDecoration = styled(LabelRoot, {
    display: 'flex',
    alignItems: 'center',
    paddingX: '.5rem',
    color: '$secondaryText',
});
const ClearInput = styled('input', {
    outline: 'none',
    backgroundColor: 'transparent',
    lineHeight: '2.5rem',
    color: '$text',
    paddingX: '.5rem',
    fontSize: 'inherit',
    flexGrow: 1,
});

export interface InputProps extends ComponentProps<typeof ClearInput> {
    label?: ReactNode;
    error?: string | null;
    onEnter?: () => void;
    leftDecoration?: ReactNode;
}

export const Input: FC<InputProps>
    = ({ label, error, leftDecoration, id, onEnter, onKeyPress, ...rest }) => {
        const onEnterKeyPress: KeyboardEventHandler<HTMLInputElement> = useCallback((e) => {
            if (onEnter && e.key == 'Enter') {
                onEnter();
                e.preventDefault();
            } else {
                onKeyPress?.(e);
            }
        }, [onEnter]);

        return (
            <LabelRoot htmlFor={id}>
                <LabelText>{label}</LabelText>
                <InputWrapper invalid={!!error}>
                    {leftDecoration && (
                        <InputDecoration htmlFor={id}>{leftDecoration}</InputDecoration>
                    )}
                    <ClearInput {...rest} aria-invalid={!!error} onKeyPress={onEnterKeyPress} id={id} />
                </InputWrapper>
                {error && <LabelText error>{error}</LabelText>}
            </LabelRoot>
        );
    };

export const Note = styled('p', {
    color: '$secondaryText',
    fontSize: '.8rem',
    lineHeight: '1em',
});