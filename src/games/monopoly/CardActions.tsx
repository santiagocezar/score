import { styled, transitions } from 'lib/theme';
import { FC } from 'react';

import MdTrash from '~icons/ic/round-delete';

const PlayerCardAction = styled('button', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 0,
    flex: 1,
});

const StyledPlayerCardActions = styled('div', {
    display: 'flex',
    width: '2rem',
    height: '2rem',
    borderRadius: '2rem',
    overflow: 'hidden',
    backgroundColor: '$$p90',
    color: '$$p10'
});

const Scale = transitions({
    always: {
        transition: 'transform .2s cubic-bezier(0.79,0.14,0.15,0.86)',
    },
    enterStart: {
        transform: 'scale(0)',
    },
    enterEnd: {
        transform: 'scale(1)',
    },
});

interface PlayerCardActionsProps {
    active: boolean;
    onDeleteClick: () => void;
}
export const PlayerCardActions: FC<PlayerCardActionsProps> = ({ active, onDeleteClick }) => {
    return (
        <Scale in={active} unmountOnExit timeout={200}>
            <StyledPlayerCardActions>
                <PlayerCardAction onClick={ev => {
                    onDeleteClick();
                    ev.stopPropagation();
                }}>
                    <MdTrash />
                </PlayerCardAction>
            </StyledPlayerCardActions>
        </Scale>
    );
};