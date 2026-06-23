const fs = require('fs');

const files = ['index.html', 'community.html', 'post.html', 'my.html', 'record.html', 'write.html', 'search.html'];

for (let file of files) {
    if (!fs.existsSync('d:\\work\\다이어트\\' + file)) continue;
    let content = fs.readFileSync('d:\\work\\다이어트\\' + file, 'utf8');

    // Replace the video block with a simple image block
    const videoRegex = /<video id="myVideo"[\s\S]*?<\/video>/gi;
    content = content.replace(videoRegex, '<img src="images/custom/banner.png" alt="다이어트 배너" style="width:100%; max-width:826px; border: 1px solid #fff; border-radius: 8px;">');
    
    fs.writeFileSync('d:\\work\\다이어트\\' + file, content);
}
console.log('Fixed myVideo tags.');
