import React from 'react';
import Link from 'next/link';
import { Booq, feedHref, BooqAnchor, booqHref, usePalette } from '../app';
import { headerHeight, meter, radius } from 'controls/theme';
import { IconButton } from 'controls/Buttons';
import { Popovers } from 'controls/Popover';
import { BooqContent } from './BooqContent';
import { TocButton } from './Toc';
import { BookmarkButton } from './Bookmark';
import { Themer } from './Themer';
import { SignIn } from './SignIn';

const contentWidth = '50rem';
export function BooqScreen({ booq }: {
    booq: Booq,
}) {
    return <div className='container'>
        <Header />
        <div className='booq'>
            <AnchorButton
                booqId={booq.id}
                anchor={booq.fragment.previous}
                title='Previous'
            />
            <BooqContent booq={booq} />
            <AnchorButton
                booqId={booq.id}
                anchor={booq.fragment.next}
                title='Next'
            />
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-flow: column;
                align-items: center;
            }
            .booq {
                display: flex;
                flex-flow: column;
                align-items: center;
                width: 100%;
                max-width: ${contentWidth};
            }
            `}</style>
    </div>;
}

function Header() {
    return <nav className='container'>
        <div className='left'>
            <div className='button'><FeedButton /></div>
            <div className='button'><TocButton /></div>
        </div>
        <div className='right'>
            <div className='button'><BookmarkButton /></div>
            <Popovers>
                {
                    singleton => <>
                        <div className='button'><Themer singleton={singleton} /></div>
                        <div className='button'><SignIn singleton={singleton} /></div>
                    </>
                }
            </Popovers>
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: space-between;
                height: ${headerHeight};
                position: fixed;
                top: 0; left: 0; right: 0;
                pointer-events: none;
            }
            .left, .right {
                display: flex;
                flex-flow: row nowrap;
            }
            .left {
                justify-content: flex-start;
            }
            .right {
                justify-content: flex-end;
            }
            .button {
                margin: 0 ${meter.regular};
                pointer-events: auto;
            }
            `}</style>
    </nav>;
}

function FeedButton() {
    return <Link href={feedHref()}>
        <a><IconButton
            icon='back'
        /></a>
    </Link>;
}

function AnchorButton({ booqId, anchor, title }: {
    booqId: string,
    anchor?: BooqAnchor,
    title: string,
}) {
    const { dimmed, highlight } = usePalette();
    if (!anchor) {
        return null;
    }
    return <div className='container'>
        <Link href={booqHref(booqId, anchor.path)}>
            <a className='content'>
                {anchor.title ?? title}
            </a>
        </Link>
        <style jsx>{`
            .container {
                display: flex;
                height: ${headerHeight};
                align-items: center;
            }
            .content {
                display: flex;
                align-items: center;
                flex: 1;
                color: ${dimmed};
                border: 2px solid ${dimmed};
                border-radius: ${radius};
                text-decoration: none;
                padding: ${meter.regular};
            }
            .content:hover {
                color: ${highlight};
            }
            `}</style>
    </div>;
}
