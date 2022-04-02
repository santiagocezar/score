import { styled } from 'lib/theme';
import { FC, memo, useMemo, useState } from 'react';
import checkURL from 'res/check.svg';

const ToggleLabelWrapper = styled('label', {
    display: 'block',
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
    'input:checked + &': {
        backgroundColor: '$blue400',
        backgroundImage: `url('${checkURL}')`
    }
});

interface ToggleProps {
    toggled?: boolean;
    disabled?: boolean;
    onToggle?: (toggled: boolean) => void;
}

export const Toggle = memo<ToggleProps>(({ toggled, disabled, onToggle }) => (
    <ToggleLabelWrapper>
        <input
            type="checkbox"
            checked={toggled}
            onChange={(e) => onToggle?.(e.target.checked)}
            disabled={disabled}
        />
        <CheckboxToggle />
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