import { styled } from 'lib/theme';
import { FC, memo, ReactNode, useMemo, useState } from 'react';
import checkURL from 'res/check.svg';

const ToggleLabelWrapper = styled('label', {
    display: 'flex',
    gap: '.5rem',
    userSelect: 'none',
    'input': {
        display: 'none',
    }
});

const CheckboxToggle = styled('p', {
    display: 'block',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '.5rem',
    backgroundColor: '$bg200',
    backgroundPosition: 'center',
    border: '.125rem solid $secondaryText',
    'input:checked + &': {
        backgroundColor: '$blue400',
        backgroundImage: `url('${checkURL}')`
    }
});

interface ToggleProps {
    toggled?: boolean;
    disabled?: boolean;
    label?: ReactNode;
    onToggle?: (toggled: boolean) => void;
}

export const Toggle = memo<ToggleProps>(({ toggled, disabled, label, onToggle }) => (
    <ToggleLabelWrapper>
        <input
            type="checkbox"
            checked={toggled}
            onChange={(e) => onToggle?.(e.target.checked)}
            disabled={disabled}
        />
        <CheckboxToggle />
        <span>{label}</span>
    </ToggleLabelWrapper>
));

interface UseToggle {
    toggled: boolean;
    setToggled: (toggled: boolean) => void;
    props: ToggleProps;
}

export function useToggle(defaultState: boolean = false): UseToggle {
    const [toggled, setToggled] = useState(defaultState);

    const props: ToggleProps = useMemo(() => ({
        toggled,
        onToggle: (toggled) => setToggled(toggled),
    }), [toggled]);

    return {
        toggled, setToggled, props
    };
}