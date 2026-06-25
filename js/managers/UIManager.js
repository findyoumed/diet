class UIManager {
  constructor(storage) {
    this.storage = storage;
  }

  escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("ko-KR");
  }

  getProductImageForPost(post, fallbackIdx = 1) {
    const text = `${post.title || ""} ${post.category_tag || ""}`.toLowerCase();
    if (text.includes("위고비") || text.includes("마운자로")) return "images/custom/product2.png";
    if (text.includes("식단") || text.includes("폭식") || text.includes("간식")) return "images/custom/product3.png";
    if (text.includes("운동") || text.includes("루틴") || text.includes("근력")) return "images/custom/product5.png";
    if (text.includes("정체기") || text.includes("체중")) return "images/custom/product6.png";
    return fallbackIdx === 1 ? "images/custom/product.png" : `images/custom/product${fallbackIdx}.png`;
  }

  isExternalImage(src) {
    return /^(https?:)?\/\//i.test(String(src || ""));
  }

  renderPostList(container, posts) {
    const items = Array.isArray(posts) ? posts : [];
    let html = '<table width="100%" cellpadding="0" cellspacing="0" class="mw_basic_list_table">';
    html += '<colgroup><col style="width:70px"><col><col style="width:150px"><col style="width:86px"><col style="width:72px"><col style="width:72px"></colgroup>';
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

    if (!items.length) {
      html += '<tr><td colspan="6" style="padding:60px;text-align:center;">등록된 게시글이 없습니다.</td></tr>';
    }

    items.forEach((post, index) => {
      const num = items.length - index;
      const avatarIdx = (index % 6) + 1;
      const avatar = avatarIdx === 1 ? "images/custom/avatar.png" : `images/custom/avatar${avatarIdx}.png`;
      const image = post.image && !this.isExternalImage(post.image)
        ? post.image
        : this.getProductImageForPost(post, (index % 6) + 1);
      html += `
        <tr class="mw_basic_list_tr mw_basic_list_tr_data">
          <td class="mw_basic_list_num media-no-text">${num}</td>
          <td class="mw_basic_list_subject">
            <div class="list_wrap flex_spbtw">
              <div class="list_left">
                <div class="mw_basic_list_subject_desc">
                  <a href="post.html?id=${encodeURIComponent(post.id)}"><strong>${this.escapeHtml(post.title)}</strong></a>
                </div>
                <div class="info">
                  <div class="mw_basic_list_name media-no-text">
                    <button type="button" class="btn_usermenu">
                      <img src="${avatar}" alt="프로필" style="width:16px;height:16px;border-radius:50%;vertical-align:middle;margin-right:3px;" />
                      <span>${this.escapeHtml(post.nickname)}</span>
                    </button>
                  </div>
                  <div class="mw_basic_list_datetime media-no-text">${this.formatDate(post.created_at)}</div>
                  <div class="mw_basic_list_hit media-no-text">조회 ${Number(post.views || 0)}</div>
                  <div class="mw_basic_list_good media-no-text"><span class="i_good_gray_16"></span>&nbsp;${Number(post.like_count || 0)}</div>
                </div>
              </div>
              <div class="list_right">
                <div class="thumb"><img src="${image}" alt="" style="width:50px;height:50px;object-fit:cover;"></div>
                <div class="list_cmt"><span class="i_comment_black"></span> ${Number(post.comment_count || 0)}</div>
              </div>
            </div>
            <div><div colspan="8" class="mw_basic_line_color" height="1"></div></div>
          </td>
          <td class="mw_basic_list_name media-on-text">
            <button type="button" class="btn_usermenu">
              <img src="${avatar}" alt="프로필" style="width:16px;height:16px;border-radius:50%;vertical-align:middle;margin-right:3px;" />
              <span>${this.escapeHtml(post.nickname)}</span>
            </button>
          </td>
          <td class="mw_basic_list_datetime media-on-text">${this.formatDate(post.created_at)}</td>
          <td class="mw_basic_list_hit media-on-text">${Number(post.views || 0)}</td>
          <td class="mw_basic_list_good media-on-text">${Number(post.like_count || 0)}</td>
        </tr>
      `;
    });

    html += "</table>";
    html += `
      <div style="text-align:right;margin-top:15px;">
        <a href="write.html" class="dieton-write-link" style="display:inline-block;padding:10px 25px;background:#1e88e5;color:#fff;font-weight:bold;border-radius:4px;text-decoration:none;">글쓰기</a>
      </div>
    `;
    container.innerHTML = html;
  }

  ensurePostDetailMount() {
    let mount = document.getElementById("dieton-post-detail-app");
    if (mount) return mount;

    const main = document.querySelector(".wrapper .main") || document.querySelector(".main") || document.body;
    mount = document.createElement("div");
    mount.id = "dieton-post-detail-app";
    mount.className = "dieton-post-detail-app";
    mount.style.cssText = "background:#fff;border:1px solid #e1e1e1;border-radius:8px;padding:24px;margin-bottom:20px;";
    main.insertBefore(mount, main.firstChild);
    Array.from(main.children).forEach((child) => {
      if (child !== mount) child.style.display = "none";
    });
    return mount;
  }

  renderPostDetail(post) {
    const mount = this.ensurePostDetailMount();
    const comments = Array.isArray(post.comments) ? post.comments : [];
    const image = post.image && !this.isExternalImage(post.image)
      ? post.image
      : this.getProductImageForPost(post, 2);

    mount.innerHTML = `
      <div class="dieton-post-view">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;border-bottom:2px solid #222;padding-bottom:14px;">
          <h2 id="dieton-post-title" style="font-size:22px;line-height:1.4;margin:0;">
            <span style="color:#1e88e5;margin-right:6px;">[${this.escapeHtml(post.category_tag)}]</span>${this.escapeHtml(post.title)}
          </h2>
          <div class="dieton-post-actions" style="display:flex;gap:8px;white-space:nowrap;">
            <a href="community.html" class="dieton-list-btn" style="padding:8px 12px;border:1px solid #ccc;border-radius:4px;color:#333;text-decoration:none;">목록</a>
            <a href="write.html?id=${encodeURIComponent(post.id)}" class="dieton-edit-btn" style="padding:8px 12px;border:1px solid #1e88e5;border-radius:4px;color:#1e88e5;text-decoration:none;">수정</a>
            <button type="button" class="dieton-delete-btn" data-post-id="${this.escapeHtml(post.id)}" style="padding:8px 12px;border:1px solid #e53935;border-radius:4px;background:#fff;color:#e53935;cursor:pointer;">삭제</button>
          </div>
        </div>
        <div id="dieton-post-info" style="display:flex;justify-content:space-between;gap:16px;color:#666;font-size:13px;padding:14px 0;border-bottom:1px solid #eee;">
          <div><b style="color:#222;">${this.escapeHtml(post.nickname)}</b> <span>${this.formatDateTime(post.created_at)}</span></div>
          <div>조회 <b>${Number(post.views || 0)}</b> | 댓글 <b>${Number(post.comment_count || comments.length)}</b> | 추천 <b>${Number(post.like_count || 0)}</b></div>
        </div>
        <div id="dieton-post-content" style="padding:24px 0;min-height:180px;">
          ${image ? `<div style="text-align:center;margin-bottom:20px;"><img src="${image}" alt="" style="max-width:100%;border-radius:8px;"></div>` : ""}
          <div style="font-size:16px;line-height:1.8;color:#333;">${this.escapeHtml(post.content).replace(/\n/g, "<br>")}</div>
        </div>
        <div id="dieton-comments-list">
          <h3 style="font-size:18px;font-weight:bold;margin:0 0 15px;padding-top:20px;border-top:2px solid #333;">댓글 ${comments.length}개</h3>
          <ul style="list-style:none;padding:0;margin:0;">
            ${comments.map((comment) => `
              <li style="padding:15px 0;border-bottom:1px solid #f1f1f1;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                  <b style="font-size:14px;">${this.escapeHtml(comment.nickname)}</b>
                  <span style="font-size:12px;color:#999;">${this.formatDateTime(comment.created_at)}</span>
                </div>
                <div style="font-size:14px;line-height:1.6;color:#444;">${this.escapeHtml(comment.content).replace(/\n/g, "<br>")}</div>
              </li>
            `).join("")}
          </ul>
          <form id="dietonCommentForm" style="margin-top:20px;background:#f9f9f9;padding:15px;border-radius:8px;border:1px solid #eee;">
            <textarea id="newCommentInput" placeholder="댓글을 입력하세요" style="width:100%;height:80px;padding:10px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;resize:none;outline:none;"></textarea>
            <div style="text-align:right;margin-top:10px;">
              <button type="submit" style="background:#1e88e5;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-weight:bold;">등록</button>
            </div>
          </form>
        </div>
      </div>
    `;

    mount.querySelector(".dieton-delete-btn").addEventListener("click", async () => {
      if (!confirm("이 게시글을 삭제하시겠습니까?")) return;
      await this.storage.deleteThreadAsync(post.id);
      alert("게시글이 삭제되었습니다.");
      window.__DIETON_LAST_DELETED_POST_ID = post.id;
      if (window.__DIETON_CRUD_QA_NO_REDIRECT) return;
      window.location.href = "community.html";
    });

    mount.querySelector("#dietonCommentForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = mount.querySelector("#newCommentInput");
      const text = input.value.trim();
      if (!text) {
        alert("댓글 내용을 입력해 주세요.");
        return;
      }
      await this.storage.createCommentAsync(post.id, text, "다이어터");
      window.app.renderPostDetail();
    });
  }
}

window.UIManager = UIManager;
