import Image from 'next/image'

export function Logo({ size = 'small', style }: {
    size?: 'small' | 'large',
    style?: React.CSSProperties,
}) {
    const sizeConfig = {
        small: { height: '2rem', width: 32, height_px: 32 },
        large: { height: '4rem', width: 64, height_px: 64 }
    }
    
    const config = sizeConfig[size]
    
    return <Image 
        src="/icon.png" 
        alt="BOOQS" 
        width={config.width}
        height={config.height_px}
        style={{
            height: config.height,
            width: 'auto',
            userSelect: 'none',
            ...style,
        }}
    />
}