import { styled, transitions } from 'lib/theme';
import { FC } from 'react';
import { CSSTransition } from 'react-transition-group';

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
    backgroundColor: '$$p50',
});

const Collapse = transitions({
    always: {
        transition: 'opacity .2s .2s',
    },
    enterStart: {
        opacity: 0,
    },
    enterEnd: {
        opacity: 1,
    },
});

interface PlayerCardActionsProps {
    active: boolean;
    onDeleteClick: () => void;
}
export const PlayerCardActions: FC<PlayerCardActionsProps> = ({ active, onDeleteClick }) => {
    return (
        <Collapse in={active} unmountOnExit timeout={400}>
            <StyledPlayerCardActions>
                <PlayerCardAction onClick={ev => {
                    onDeleteClick();
                    ev.stopPropagation();
                }}>
                    <MdTrash />
                </PlayerCardAction>
            </StyledPlayerCardActions>
        </Collapse>
    );
};