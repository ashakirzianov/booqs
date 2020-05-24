import React from 'react';
import Link from 'next/link';
import { Booq, feedHref } from '../app';
import { headerHeight, meter } from 'controls/theme';
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
            <BooqContent booq={booq} />
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
