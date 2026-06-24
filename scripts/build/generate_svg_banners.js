const fs = require('fs');
const path = require('path');

const imgDir = 'd:\\work\\다이어트\\images\\custom';
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

const banners = [
    {
        filename: 'banner2.svg', width: 1200, height: 80,
        color1: '#4facfe', color2: '#00f2fe',
        title: '전문 다이어트 상담센터 👨‍⚕️', subtitle: '맞춤형 식단부터 처방까지 한 번에결!',
        icon: '🏥'
    },
    {
        filename: 'banner3.svg', width: 1200, height: 80,
        color1: '#43e97b', color2: '#38f9d7',
        title: '위고비 / 마운자로 처방 가능 병원 찾기 💉', subtitle: '내 주변 가장 가까운 비만치료 전문 병원',
        icon: '📍'
    },
    {
        filename: 'side_banner.svg', width: 250, height: 311,
        color1: '#fa709a', color2: '#fee140',
        title: '산후다이어트', subtitle: '건강하게\n예전 몸매로',
        icon: '🤱'
    },
    {
        filename: 'side_banner2.svg', width: 250, height: 311,
        color1: '#fccb90', color2: '#d57eeb',
        title: '비만치료\n성공후기', subtitle: '생생한 100%\n리얼 후기',
        icon: '📸'
    },
    {
        filename: 'side_banner_tall.svg', width: 239, height: 628,
        color1: '#a18cd1', color2: '#fbc2eb',
        title: '베스트 보조제\n단독 특가', subtitle: '다이어트 성공을\n위한 부스터',
        icon: '💊'
    }
];

for (let b of banners) {
    let svg = '';
    
    if (b.width > 500) {
        // Horizontal banners
        svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${b.width} ${b.height}" width="${b.width}" height="${b.height}">
    <defs>
        <linearGradient id="bg_${b.filename}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${b.color1}" />
            <stop offset="100%" stop-color="${b.color2}" />
        </linearGradient>
    </defs>
    <rect width="${b.width}" height="${b.height}" rx="10" fill="url(#bg_${b.filename})"/>
    <text x="100" y="45" font-family="sans-serif" font-weight="bold" font-size="30" fill="#ffffff" dominant-baseline="middle">
        ${b.title}
    </text>
    <text x="${b.width - 150}" y="45" font-family="sans-serif" font-size="22" fill="#ffffff" text-anchor="end" dominant-baseline="middle" opacity="0.9">
        ${b.subtitle}
    </text>
    <circle cx="50" cy="40" r="25" fill="#ffffff" opacity="0.2"/>
    <text x="50" y="44" font-size="30" text-anchor="middle" dominant-baseline="middle">${b.icon}</text>
</svg>
`;
    } else {
        // Vertical banners
        let subtitleLines = b.subtitle.split('\n');
        let titleLines = b.title.split('\n');
        
        let titleHtml = titleLines.map((t, i) => `<text x="${b.width/2}" y="${150 + (i*35)}" font-family="sans-serif" font-weight="bold" font-size="28" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${t}</text>`).join('');
        let subtitleHtml = subtitleLines.map((t, i) => `<text x="${b.width/2}" y="${b.height - 80 + (i*25)}" font-family="sans-serif" font-size="18" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" opacity="0.9">${t}</text>`).join('');
        
        svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${b.width} ${b.height}" width="${b.width}" height="${b.height}">
    <defs>
        <linearGradient id="bg_${b.filename}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${b.color1}" />
            <stop offset="100%" stop-color="${b.color2}" />
        </linearGradient>
    </defs>
    <rect width="${b.width}" height="${b.height}" rx="10" fill="url(#bg_${b.filename})"/>
    
    <circle cx="${b.width/2}" cy="70" r="40" fill="#ffffff" opacity="0.2"/>
    <text x="${b.width/2}" y="74" font-size="50" text-anchor="middle" dominant-baseline="middle">${b.icon}</text>
    
    ${titleHtml}
    ${subtitleHtml}
</svg>
`;
    }
    
    fs.writeFileSync(path.join(imgDir, b.filename), svg.trim());
}

console.log('Generated 5 distinct SVG banners.');
