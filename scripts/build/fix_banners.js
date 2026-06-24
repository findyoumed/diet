const fs = require('fs');

const files = ['index.html', 'search.html', 'community.html', 'post.html', 'record.html', 'write.html'];

for (let file of files) {
    let path = 'd:\\work\\다이어트\\' + file;
    if (!fs.existsSync(path)) continue;
    
    let content = fs.readFileSync(path, 'utf8');
    
    // 1. Middle list banner (max-width:826px)
    content = content.replace(/<img src="images\/custom\/banner[0-9]*\.png" alt="다이어트 배너" style="width:100%; max-width:826px;/g, 
                              '<img src="images/custom/wide_banner.png" alt="다이어트 배너" style="width:100%; max-width:826px;');

    // 2. Search popup banner (height:158px) -> search.html:933
    content = content.replace(/<img src="images\/custom\/banner3\.png" alt="" style="width:auto;height:158px;/g, 
                              '<img src="images/custom/side_banner.png" alt="" style="width:auto;height:158px;');

    // 3. Right side banners
    // "다이어트의사 찾기"
    content = content.replace(/<img src="images\/custom\/banner[0-9]*\.png" alt="다이어트의사 찾기"\/>/g, 
                              '<img src="images/custom/side_banner.png" alt="다이어트의사 찾기"/>');
    
    // "실시간 비대면 견적받기"
    content = content.replace(/<img src="images\/custom\/banner[0-9]*\.png" alt="실시간 비대면 견적받기">/g, 
                              '<img src="images/custom/side_banner2.png" alt="실시간 비대면 견적받기">');

    // "앱 다운로드"
    content = content.replace(/<img src="images\/custom\/banner[0-9]*\.png" alt="앱 다운로드">/g, 
                              '<img src="images/custom/side_banner_tall.png" alt="앱 다운로드">');
                              
    fs.writeFileSync(path, content);
}
console.log('HTML files updated for correct banner sizes.');
