const fs = require('fs');

let c = fs.readFileSync('d:\\work\\다이어트\\post.html', 'utf8');

const sIdx = c.indexOf('<div class="mw_basic_view_subject">');
if (sIdx > -1) {
    const endSIdx = c.indexOf('</div>', sIdx) + 6;
    c = c.substring(0, sIdx) + '<h1 id="dieton-post-title" class="mw_basic_view_subject" style="margin:20px 0; font-size:24px; font-weight:bold;"></h1>' + c.substring(endSIdx);
}

const infoIdx = c.indexOf('<div class="mw_basic_view_info">');
if (infoIdx > -1) {
    const endInfoIdx = c.indexOf('</div><!--info-->', infoIdx) + 17;
    c = c.substring(0, infoIdx) + '<div id="dieton-post-info" class="mw_basic_view_info"></div>' + c.substring(endInfoIdx);
}

const cIdx = c.indexOf('<div class="mw_basic_view_content">');
if (cIdx > -1) {
    const endCIdx = c.indexOf('</div><!--view_content-->', cIdx);
    if(endCIdx > -1) {
        c = c.substring(0, cIdx) + '<div id="dieton-post-content" class="mw_basic_view_content" style="min-height:300px; margin:20px 0;"></div>\n' + c.substring(endCIdx);
    }
}

const cmtIdx = c.indexOf('<!-- 댓글 리스트 -->');
if(cmtIdx > -1) {
    const endCmtIdx = c.indexOf('<!-- //댓글 리스트 -->', cmtIdx);
    if(endCmtIdx > -1) {
        c = c.substring(0, cmtIdx) + '<!-- 댓글 리스트 -->\n<div id="dieton-comments-list"></div>\n' + c.substring(endCmtIdx);
    }
}

fs.writeFileSync('d:\\work\\다이어트\\post.html', c);
console.log('post.html prepared.');
