// [LOG: 20260623_2148] Safe script analytics disabling and dynamic image variety mapping
const fs = require('fs');
const path = require('path');

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];
const baseDir = 'd:\\work\\diet';

console.log('Starting final alignment fixes, image diversification, and analytical deactivation...');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Localize Notice Banner Script reference
  content = content.replace(/https:\/\/dieton\.com\/new\/js\/banner\/banner_graftover_notice\.inc\.js(\?\d+)?/g, '/new/js/banner/banner_graftover_notice.inc.js');

  // 2. Video Banner alignment styling in HTML (margin: 0 auto; display: block;)
  content = content.replace(/(class="[^"]*video_banner[^"]*"[^>]*>\s*<img[^>]*src="images\/custom\/banner[^"]*"[^>]*style=")([^"]*)(")/gi, (match, before, styleContent, after) => {
    let newStyle = styleContent;
    if (!newStyle.includes('display:')) {
      newStyle += '; display: block';
    } else {
      newStyle = newStyle.replace(/display:\s*[^;]+/g, 'display: block');
    }
    if (!newStyle.includes('margin:')) {
      newStyle += '; margin: 0 auto';
    } else {
      newStyle = newStyle.replace(/margin:\s*[^;]+/g, 'margin: 0 auto');
    }
    return before + newStyle + after;
  });

  // 3. Deactivate Google Tag Manager (GTM)
  content = content.replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/gi, '<!-- Google Tag Manager (Disabled) -->');
  content = content.replace(/<noscript><iframe src="https:\/\/www\.googletagmanager\.com[\s\S]*?<\/iframe><\/noscript>/gi, '<!-- GTM iframe (Disabled) -->');

  // 4. Deactivate Naver Premium Log Analytics (using non-greedy boundary-safe regex)
  content = content.replace(/<script[^>]*src="[^"]*wcslog\.js"[^>]*><\/script>/gi, '<!-- Naver wcslog (Disabled) -->');
  content = content.replace(/<script[^>]*>(?:(?!<\/script>)[\s\S])*?(?:wcs_add|wcs\.inflow|wcs_do)(?:(?!<\/script>)[\s\S])*?<\/script>/gi, '<!-- Naver analytics block (Disabled) -->');

  // 5. Deactivate Kakao Pixel SDK (using boundary-safe regex)
  content = content.replace(/<script[^>]*src="https:\/\/t1\.kakaocdn\.net(?:(?!<\/script>)[\s\S])*?<\/script>/gi, '<!-- Kakao Pixel SDK (Disabled) -->');
  content = content.replace(/<script[^>]*>(?:(?!<\/script>)[\s\S])*?Kakao\.init(?:(?!<\/script>)[\s\S])*?<\/script>/gi, '<!-- Kakao init (Disabled) -->');

  // 6. Deactivate DietOn Analytical banner.js (MIME error source)
  content = content.replace(/<script[^>]*src="https:\/\/dieton\.com\/new\/js\/common\/banner\.js"[^>]*><\/script>/gi, '<!-- DietOn banner.js (Disabled) -->');

  // 7. Image Diversification (Avoiding duplication)
  let avatarCount = 0;
  content = content.replace(/images\/custom\/avatar\.png/gi, () => {
    avatarCount++;
    const idx = (avatarCount % 6); // 0 to 5
    return idx === 0 ? 'images/custom/avatar.png' : `images/custom/avatar${idx + 1}.png`;
  });

  let productCount = 0;
  content = content.replace(/images\/custom\/product\.png/gi, () => {
    productCount++;
    const idx = (productCount % 6); // 0 to 5
    return idx === 0 ? 'images/custom/product.png' : `images/custom/product${idx + 1}.png`;
  });

  let bannerCount = 0;
  content = content.replace(/images\/custom\/banner\.png/gi, () => {
    bannerCount++;
    const idx = (bannerCount % 3); // 0 to 2
    return idx === 0 ? 'images/custom/banner.png' : `images/custom/banner${idx + 1}.png`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully patched: ${file} (Avatars: ${avatarCount}, Products: ${productCount}, Banners: ${bannerCount})`);
}

console.log('All final fixes, deactivations, and image distributions have been completed successfully.');
