const fs = require('fs');

const supabaseUrl = 'https://fhmrxmpyynrkldtydjjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZobXJ4bXB5eW5ya2xkdHlkampmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NTU2MzIsImV4cCI6MjA5NTMzMTYzMn0.phDUxh986QaXFM2mCRIbIwvg-ox4ab8Wy5n4LBuRb1s';

const sm = fs.readFileSync('d:\\work\\다이어트\\js\\managers\\StorageManager.js', 'utf8');
const HOUR = 1000 * 60 * 60;
let postsStr = sm.substring(sm.indexOf('const DEFAULT_POSTS = ['), sm.indexOf('];', sm.indexOf('const DEFAULT_POSTS = [')) + 2);
postsStr = postsStr.replace('const DEFAULT_POSTS', 'var DEFAULT_POSTS');
eval(postsStr);

async function run() {
    const payload = DEFAULT_POSTS.map(p => ({
        title: p.title,
        content: p.content,
        category_tag: p.category_tag,
        nickname: p.nickname,
        like_count: p.like_count,
        comment_count: p.comment_count,
        views: p.views,
        image: p.image
    }));

    const response = await fetch(supabaseUrl + '/rest/v1/diet_threads', {
        method: 'POST',
        headers: {
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        console.error(await response.text());
    } else {
        console.log('Successfully inserted ' + DEFAULT_POSTS.length + ' dummy posts into Supabase via REST!');
    }
}
run();
