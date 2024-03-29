import { styled, useBreakpoint } from "lib/theme";
import { Children, createContext, FC, ReactElement, ReactNode, useCallback, useContext, useMemo, useState } from "react";

import MdPeople from '~icons/ic/baseline-people';

import * as Tabs from '@radix-ui/react-tabs';
import { HEADER_HEIGHT } from '../Header';
import { NOOP } from 'lib/utils';

const Sidebar = styled(Tabs.Root, {
    display: 'flex',
    flexGrow: 1,
    flexShrink: 0,
    maxWidth: '100%',
    '@lg': {
        width: '100%',
        maxWidth: '24rem',
    }
});
const SidebarTabs = styled(Tabs.List, {
    display: 'flex',
    backgroundColor: '$bg200',
    flexDirection: 'column',
    width: '3rem',
    flexShrink: 0,
});
const SidebarTab = styled(Tabs.Trigger, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '4rem',
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderWidth: '0 .125rem',
    transition: 'border-color 0.2s, color 0.2s, background-color .2s',

    '&[data-state=active]': {
        borderLeftColor: '$blue600',
        color: '$blue600',
        backgroundColor: '$blue100',
    }
});

export const Content = styled('main', {
    flexGrow: 1,
    overflowY: 'auto',
    paddingTop: HEADER_HEIGHT,
    maxWidth: '100%',
    width: '100%',
    height: '100%',
});
const PanelContent = styled(Tabs.Content, Content, {
    '@lg': {
        paddingTop: 0,
    }
});

interface PanelProps {
    icon: ReactNode;
    name: string;
    children?: ReactNode;
}
export const Panel: FC<PanelProps> = () => null;

const PaneledLayout = styled('div', {
    display: 'flex',
    maxWidth: '100%',
    width: '100%',
    height: '100%',
});

export type PanelElement = ReactElement<PanelProps>;

interface PaneledProps {
    mainView: ReactNode;
    children?: PanelElement[] | PanelElement;
}

type GoTo = (tab: string) => void;
const PaneledGoToContext = createContext<GoTo>(NOOP);

export const usePanelGoTo = () => useContext(PaneledGoToContext);

export const Paneled = ({ mainView, children }: PaneledProps) => {
    const lg = useBreakpoint('lg');

    const [tabs, content, first] = useMemo(() => {
        const views: (PanelProps & { id: string; })[] = [];
        if (!lg) views.push({
            id: "-1",
            icon: <MdPeople />,
            name: "Vista principal",
            children: mainView,
        });
        Children.forEach(children, (child, i) => {
            if (child)
                views.push({ ...child.props, id: i.toString() });
        });

        const first = views[0]?.id ?? "";

        return [
            views.map(v => <SidebarTab key={v.id} value={v.id} aria-label={v.name}>{v.icon}</SidebarTab>),
            views.map(v => <PanelContent key={v.id} value={v.id}>{v.children}</PanelContent>),
            first,
        ];
    }, [lg, mainView, children]);

    const [tab, setTab] = useState(first);

    const goTo = useCallback((tab: string) => {
        if ((tab === "-1") !== lg)
            setTab(tab);
    }, [lg]);

    return (
        <PaneledLayout>
            <PaneledGoToContext.Provider value={goTo}>
                {lg && <Content>{mainView}</Content>}
                <Sidebar value={tab} onValueChange={setTab} orientation="vertical" defaultValue={first}>
                    {content}
                    <SidebarTabs>
                        {tabs}
                    </SidebarTabs>
                </Sidebar>
            </PaneledGoToContext.Provider>
        </PaneledLayout>
    );
};