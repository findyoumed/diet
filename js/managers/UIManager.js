class UIManager {
  constructor(storage) {
    this.storage = storage;
  }

  // ===========================================================================
  // [LOG: 20260623_2115] Phase 7: DOM 바인딩 - 커뮤니티 리스트
  // ===========================================================================
  renderPostList(container, posts) {
    let html = '';
    
    // 테이블 레이아웃 그대로 활용
    html += '<table width="100%" cellpadding="0" cellspacing="0" class="mw_basic_list_table">';
    html += '<colgroup><col width="80"><col width=""><col width="120"><col width="80"><col width="50"><col width="50"></colgroup>';
    
    // 테이블 헤더
    html += `
        <tr class="mw_basic_list_tr mw_basic_list_tr_head">
            <td class="mw_basic_list_head mw_basic_list_head_num"><span class="media-list-head-text">번호</span></td>
            <td class="mw_basic_list_head mw_basic_list_head_subject"><span class="media-list-head-text">제목</span></td>
            <td class="mw_basic_list_head mw_basic_list_head_name"><span class="media-list-head-text">글쓴이</span></td>
            <td class="mw_basic_list_head mw_basic_list_head_datetime"><span class="media-list-head-text">날짜</span></td>
            <td class="mw_basic_list_head mw_basic_list_head_hit"><span class="media-list-head-text">조회</span></td>
            <td class="mw_basic_list_head mw_basic_list_head_good"><span class="media-list-head-text">추천</span></td>
        </tr>
    `;

    posts.forEach((post, i) => {
      const date = new Date(post.created_at);
      const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const num = posts.length - i;
      
      html += `
        <tr class="mw_basic_list_tr mw_basic_list_tr_data ">
            <td class="mw_basic_list_num media-no-text">\${num}</td>
            <td class="mw_basic_list_subject">
                <div class="list_wrap">
                    <div class="list_left">
                        <div class="mw_basic_list_subject_desc">
                            <a href="post.html?id=\${post.id}">
                                <strong>\${post.title}</strong>
                            </a>
                        </div>
                        <div class="info">
                            <div class="mw_basic_list_name media-no-text">
                                <button type="button" class="btn_usermenu">
                                  <img src="https://daedamo.com/new/img/icon/5.svg" alt="Grade Icon" />
                                  <span>\${post.nickname}</span>
                                </button>
                            </div>
                            <div class="mw_basic_list_datetime media-no-text">\${dateStr}</div>
                            <div class="mw_basic_list_hit media-no-text">조회 \${post.views || 0}</div>
                            <div class="mw_basic_list_good media-no-text"><span class="i_good_gray_16"></span>&nbsp;\${post.like_count || 0}</div>
                        </div>
                    </div>
                    <div class="list_right">
                        \${post.image ? \`<div class="thumb"><img src="\${post.image}" style="width:50px; height:50px; object-fit:cover;"></div>\` : ''}
                        <div class='list_cmt'>
                            <span class='i_comment_black'></span> \${post.comment_count || 0}
                        </div>
                    </div>
                </div>
                <div><div colspan=8 class="mw_basic_line_color" height="1"></div></div>
            </td>
            <td class="mw_basic_list_name media-on-text">
                <button type="button" class="btn_usermenu">
                  <img src="https://daedamo.com/new/img/icon/5.svg" alt="Grade Icon" />
                  <span>\${post.nickname}</span>
                </button>
            </td>
            <td class="mw_basic_list_datetime media-on-text">\${dateStr}</td>
            <td class="mw_basic_list_hit media-on-text">\${post.views || 0}</td>
            <td class="mw_basic_list_good media-on-text">\${post.like_count || 0}</td>
        </tr>
      `;
    });

    html += '</table>';
    
    // 글쓰기 버튼 추가
    html += `
        <div style="text-align:right; margin-top:15px;">
            <a href="write.html" style="display:inline-block; padding:10px 25px; background:#1e88e5; color:#fff; font-weight:bold; border-radius:4px; text-decoration:none;">글쓰기</a>
        </div>
    `;

    container.innerHTML = html;
  }

  // ===========================================================================
  // [LOG: 20260623_2120] Phase 7: DOM 바인딩 - 포스트 상세
  // ===========================================================================
  renderPostDetail(post) {
    const titleEl = document.getElementById("dieton-post-title");
    const infoEl = document.getElementById("dieton-post-info");
    const contentEl = document.getElementById("dieton-post-content");
    const commentsEl = document.getElementById("dieton-comments-list");

    if (titleEl) {
        titleEl.innerHTML = \`<span style="color:#1e88e5; margin-right:5px;">[\${post.category_tag}]</span> \${post.title}\`;
    }

    if (infoEl) {
        const dateStr = new Date(post.created_at).toLocaleString();
        infoEl.innerHTML = \`
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:15px;">
                <div>
                    <img src="https://daedamo.com/new/img/icon/5.svg" alt="Grade Icon" style="vertical-align:middle;"/>
                    <span style="font-weight:bold; margin-right:15px;">\${post.nickname}</span>
                    <span style="color:#888; font-size:13px;">\${dateStr}</span>
                </div>
                <div style="color:#888; font-size:13px;">
                    조회 <b style="color:#333;">\${post.views || 0}</b> | 
                    댓글 <b style="color:#333;">\${post.comment_count || 0}</b> | 
                    추천 <b style="color:#333;">\${post.like_count || 0}</b>
                </div>
            </div>
        \`;
    }

    if (contentEl) {
        let contentHtml = '';
        if (post.image) {
            contentHtml += \`<div style="text-align:center; margin-bottom:20px;"><img src="\${post.image}" style="max-width:100%; border-radius:8px;"></div>\`;
        }
        contentHtml += \`<div style="font-size:16px; line-height:1.8; color:#333;">\${post.content.replace(/\\n/g, '<br>')}</div>\`;
        contentEl.innerHTML = contentHtml;
    }

    if (commentsEl) {
        let commentsHtml = \`<h4 style="font-size:18px; font-weight:bold; margin-bottom:15px; padding-top:20px; border-top:2px solid #333;">댓글 \${post.comments.length}개</h4>\`;
        commentsHtml += \`<ul style="list-style:none; padding:0; margin:0;">\`;
        post.comments.forEach(cmt => {
            const cDate = new Date(cmt.created_at).toLocaleString();
            commentsHtml += \`
                <li style="padding:15px 0; border-bottom:1px solid #f1f1f1;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <div>
                            <img src="https://daedamo.com/new/img/icon/5.svg" alt="Grade" style="vertical-align:middle; width:16px;"/>
                            <b style="font-size:14px; margin-left:5px;">\${cmt.nickname}</b>
                        </div>
                        <div style="font-size:12px; color:#999;">\${cDate}</div>
                    </div>
                    <div style="font-size:14px; line-height:1.6; color:#444;">\${cmt.content.replace(/\\n/g, '<br>')}</div>
                </li>
            \`;
        });
        commentsHtml += \`</ul>\`;
        
        // 댓글 쓰기 폼
        commentsHtml += \`
            <div style="margin-top:20px; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                <textarea id="newCommentInput" placeholder="댓글을 남겨주세요." style="width:100%; height:80px; padding:10px; border:1px solid #ddd; border-radius:4px; box-sizing:border-box; resize:none; outline:none;"></textarea>
                <div style="text-align:right; margin-top:10px;">
                    <button onclick="submitComment('\${post.id}')" style="background:#1e88e5; color:white; border:none; padding:10px 20px; border-radius:4px; cursor:pointer; font-weight:bold;">등록</button>
                </div>
            </div>
        \`;
        commentsEl.innerHTML = commentsHtml;

        // 글로벌 함수 바인딩
        window.submitComment = async (postId) => {
            const input = document.getElementById('newCommentInput');
            const text = input.value.trim();
            if(!text) return alert('댓글 내용을 입력하세요.');
            
            try {
                await window.app.storage.createCommentAsync(postId, text, '다이어터');
                window.app.renderPostDetail(); // 리렌더링
            } catch(e) {
                alert('에러: ' + e.message);
            }
        };
    }
  }
}
window.UIManager = UIManager;
