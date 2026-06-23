const fs = require('fs');
const sm = fs.readFileSync('d:\\work\\다이어트\\js\\managers\\StorageManager.js', 'utf8');
const HOUR = 1000 * 60 * 60;
let postsStr = sm.substring(sm.indexOf('const DEFAULT_POSTS = ['), sm.indexOf('];', sm.indexOf('const DEFAULT_POSTS = [')) + 2);
postsStr = postsStr.replace('const DEFAULT_POSTS', 'var DEFAULT_POSTS');
eval(postsStr);
const posts = DEFAULT_POSTS;
const sql = 'INSERT INTO public.diet_threads (title, content, category_tag, nickname, like_count, comment_count, views, image) VALUES \n' + 
    posts.map(p => '(' + [p.title, p.content, p.category_tag, p.nickname, p.like_count, p.comment_count, p.views, p.image].map(v => typeof v === 'string' ? "'" + v.replace(/'/g, "''") + "'" : (v === undefined ? 'NULL' : v)).join(', ') + ')').join(',\n') + ';';
fs.writeFileSync('d:\\work\\다이어트\\insert_dummy.sql', sql);
