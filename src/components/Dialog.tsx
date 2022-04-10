import React, { ComponentProps, FC, memo, ReactNode } from 'react';
import { DialogContent, DialogOverlay, Dialog as DialogRoot, DialogTrigger, DialogClose } from '@radix-ui/react-dialog';
import { styled } from 'lib/theme';

import MdClose from '~icons/ic/baseline-close';
import { bw, Palette } from 'lib/color';

export { Dialog as DialogRoot, DialogTrigger, DialogClose } from '@radix-ui/react-dialog';

export const Overlay = styled(DialogOverlay, {
    backgroundColor: '#0008',
    position: 'fixed',
    inset: 0,
    zIndex: '$modal',
});

export const Container = styled(DialogContent, {
    backgroundColor: '$bg100',
    overflow: 'hidden',
    boxShadow: '$e3',
    borderRadius: '1rem',
    display: 'flex',
    flexDirection: 'column',
    width: 'calc(100vw - 2rem)',
    maxWidth: '30rem',
    maxHeight: 'calc(100vh - 8rem)',
    position: 'fixed',
    top: '4rem',
    left: '50%',
    transform: 'translate(-50%, 0)',
    zIndex: '$modal',
    fontSize: '1rem',
    fontWeight: 'normal',
});

export const Content = styled('main', {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
});

export const ContentPadded = styled(Content, {
    padding: '1rem',
});

export const TITLE_BAR_HEIGHT = '3rem';

export const TitleBar = styled('header', {
    backgroundColor: '$$p30',
    color: '$$p90',
    boxSizing: 'content-box',
    display: 'flex',
    userSelect: 'none',
    alignItems: 'center',
    fontWeight: 'bold',
    height: TITLE_BAR_HEIGHT,
    overflow: 'hidden',

    'h3': {
        textAlign: 'center',
        flexGrow: 1,
    },

    '.u-icon': {
        color: '$$p50',
        boxSizing: 'content-box',
        padding: '.25rem',
        borderRadius: '2rem',
        backgroundColor: '$$p90',
    }
});

export const CloseButton = styled(DialogClose, {
    padding: '0 .75rem',
    alignSelf: 'stretch',
});

export interface DialogProps extends ComponentProps<typeof Content> {
    titlebar: ReactNode,
    palette?: Palette,
    open: boolean,
    onOpenChange?: (open: boolean) => void;
    trigger?: ReactNode,
}

export const Dialog: FC<DialogProps> =
    memo(({ titlebar, palette = bw, trigger, open, onOpenChange, ...rest }) => (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <Overlay />

            <Container>
                <TitleBar css={palette}>
                    <h3>{titlebar}</h3>
                    <CloseButton>
                        <MdClose />
                    </CloseButton>
                </TitleBar>
                <ContentPadded  {...rest} />
            </Container>
        </DialogRoot>
    ));

Dialog.displayName = "Dialog";