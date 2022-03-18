import { Label as LabelRoot } from '@radix-ui/react-label';
import { ComponentProps, FC, KeyboardEventHandler, ReactNode, useCallback, useMemo } from 'react';
import { styled } from 'lib/theme';

const LabelText = styled('p', {
    flexShrink: 0,
    fontWeight: 'bold',
    fontSize: '.9rem',
    margin: '.3rem .2rem',
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
    onEnter?: () => void;
    leftDecoration?: ReactNode;
}

export const Input: FC<InputProps>
    = ({ label, leftDecoration, id, onEnter, onKeyPress, ...rest }) => {
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
                <InputWrapper>
                    {leftDecoration && (
                        <InputDecoration htmlFor={id}>{leftDecoration}</InputDecoration>
                    )}
                    <ClearInput {...rest} onKeyPress={onEnterKeyPress} id={id} />
                </InputWrapper>
            </LabelRoot>
        );
    };