import React from 'react'

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    console.info('Loading WhyDidYouRender')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const whyDidYouRender = require('@welldone-software/why-did-you-render')
    whyDidYouRender(React, {
        trackAllPureComponents: true,
        include: [/./],
        // Optionally configure:
        // trackHooks: true,
        // collapseGroups: true,
        // logOnDifferentValues: true,
    })
}