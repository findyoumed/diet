class DietOnApp {
  constructor() {
    this.storage = new window.StorageManager();
    this.ui = new window.UIManager(this.storage);
  }

  init() {
    this.renderCoreHeaderNav();
    this.renderCoreLandingCategoryNav();
    this.initSidebarNav();

    const page = this.detectPage();
    if (page === "community") this.renderCommunity();
    if (page === "post") this.renderPostDetail();
    if (page === "write") this.renderWrite();
    if (page === "auth") this.renderAuth();
  }

  initSidebarNav() {
    const $ = window.jQuery;
    if (!$) return;

    this.renderCoreSidebarNav();

    const navSelector = "#mw5 .sidebar .sidebar_nav .nav_main";
    const $navItems = $(navSelector);
    if (!$navItems.length) return;

    $navItems.each(function () {
      const $main = $(this);
      const $sub = $main.next(".nav_sub");
      if (!$sub.length) return;

      if ($sub.find(".selected").length || $main.hasClass("active")) {
        $main.addClass("active");
        $sub.show();
      }
    });

    $(document).off("click.dietonSidebarNav", navSelector);
    if (window.__dietonSidebarNavClick) {
      document.removeEventListener("click", window.__dietonSidebarNavClick, true);
    }

    window.__dietonSidebarNavClick = function (event) {
      const main = event.target.closest(navSelector);
      if (!main) return;

      const sub = main.nextElementSibling;
      if (!sub || !sub.classList.contains("nav_sub")) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const $main = $(main);
      const $sub = $(sub);
      $main.toggleClass("active");
      $sub.stop(true, true).slideToggle(180);
    };

    document.addEventListener("click", window.__dietonSidebarNavClick, true);
  }

  renderCoreSidebarNav() {
    const sidebar = document.querySelector("#mw5 .sidebar .sidebar_nav");
    if (!sidebar) return;

    const menuGroups = this.getCoreMenuGroups();

    sidebar.innerHTML = menuGroups.map((group, index) => `
      <div class="nav${index + 1}">
        <div class="nav_main">
          <div class="subject">${group.title}</div>
          <div class="i_arrow_bottom_black_20"></div>
        </div>
        <div class="nav_sub">
          ${group.items.map((item) => `
            <div class="sub_list${this.isCurrentSidebarItem(item.href) ? " selected" : ""}">
              <a href="${item.href}">${item.label}</a>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  renderCoreHeaderNav() {
    const menuGroups = this.getCoreMenuGroups();
    const gnbList = document.querySelector("#gnbNavbar > .inner > ul");
    const allMenuList = document.querySelector("#headerAllMenuPopup .all-menu-content > ul");
    if (gnbList) {
      gnbList.innerHTML = menuGroups.map((group, index) => this.renderHeaderMenuGroup(group, index)).join("");
    }
    if (allMenuList) {
      allMenuList.innerHTML = menuGroups.map((group, index) => this.renderHeaderMenuGroup(group, index)).join("");
    }
  }

  renderCoreLandingCategoryNav() {
    const categoryList = document.querySelector("#mw5 .index_category_box > ul");
    if (!categoryList) return;

    const iconClasses = [
      "i_board_story",
      "i_board_mobal",
      "i_board_review_pic",
      "i_board_dr_novid",
      "i_board_shampoo",
      "i_board_job",
      "i_board_care"
    ];

    categoryList.innerHTML = this.getCoreMenuGroups().map((group, index) => {
      const primaryHref = group.items[0]?.href || "./community.html";
      return `
        <li>
          <a href="${primaryHref}">
            <span class="i_new_red"></span>
            <div class="icon${index === 1 || index === 5 ? " pick" : ""}">
              <span class="${iconClasses[index] || "i_board_story"}"></span>
            </div>
            <p class="nav_title">${group.title}</p>
          </a>
        </li>
      `;
    }).join("");
  }

  renderHeaderMenuGroup(group, index) {
    const primaryHref = group.items[0]?.href || "./community.html";
    return `
      <li data-overlaps="${index + 1}">
        <a href="${primaryHref}">${group.title}</a>
        <div class="sub">
          <ul>
            ${group.items.map((item) => `
              <li><a href="${item.href}" target="_self">${item.label}</a></li>
            `).join("")}
          </ul>
        </div>
      </li>
    `;
  }

  getCoreMenuGroups() {
    return [
      {
        title: "다이어트 톡톡",
        items: [
          { label: "다이어트수다", href: "./community.html?category=diet-talk" },
          { label: "고민/상담", href: "./community.html?category=diet-qa" },
          { label: "인바디 질문", href: "./community.html?category=inbody" }
        ]
      },
      {
        title: "위고비/마운자로",
        items: [
          { label: "위고비/마운자로톡톡", href: "./community.html?category=graft" },
          { label: "지방흡입/시술톡", href: "./community.html?category=smp" },
          { label: "다이어트 보조제톡", href: "./community.html?category=drug" }
        ]
      },
      {
        title: "다이어트 후기",
        items: [
          { label: "다이어트후기", href: "./community.html?category=photo-review" },
          { label: "성공스토리", href: "./community.html?category=success-story" }
        ]
      },
      {
        title: "병원/의사 찾기",
        items: [
          { label: "병원/의사 찾기", href: "./search.html?type=clinic" },
          { label: "전문의 상담", href: "./search.html?type=expert" }
        ]
      },
      {
        title: "다이어트 뉴스",
        items: [
          { label: "다이어트 뉴스", href: "./news" },
          { label: "전문가 칼럼", href: "./community.html?category=column" },
          { label: "초보자 가이드/FAQ", href: "./community.html?category=faq" }
        ]
      },
      {
        title: "홍보 및 나눔게시판",
        items: [
          { label: "홍보 및 무료배포", href: "./community.html?category=publicity" },
          { label: "벼룩시장/모임", href: "./community.html?category=market" }
        ]
      },
      {
        title: "공지/등업/문의",
        items: [
          { label: "공지사항", href: "./community.html?category=notice" },
          { label: "등업신청", href: "./community.html?category=level-up" },
          { label: "운영및제안", href: "./community.html?category=inquiry" }
        ]
      }
    ];
  }

  isCurrentSidebarItem(href) {
    const link = new URL(href, window.location.href);
    const current = new URL(window.location.href);
    if (link.pathname !== current.pathname) return false;

    for (const [key, value] of link.searchParams.entries()) {
      if (current.searchParams.get(key) !== value) return false;
    }

    if (!link.search) {
      return !current.search;
    }
    return true;
  }

  detectPage() {
    const path = window.location.pathname;
    if (path.includes("my.html")) return "auth";
    if (path.includes("write.html")) return "write";
    if (path.includes("post.html")) return "post";
    if (path.includes("community.html")) return "community";
    if (path.includes("index.html") || path === "/") return "home";
    return "other";
  }

  async renderWrite() {
    const form = document.getElementById("dietonWriteForm");
    const btn = document.getElementById("writeSubmitBtn");
    const categoryEl = document.getElementById("writeCategory");
    const titleEl = document.getElementById("writeTitle");
    const contentEl = document.getElementById("writeContent");
    if (!btn || !categoryEl || !titleEl || !contentEl) return;

    const params = new URLSearchParams(window.location.search);
    const editId = params.get("id");
    let editingPost = null;

    if (editId) {
      try {
        editingPost = await this.storage.getThreadDetailAsync(editId, { skipViewIncrement: true });
        if (editingPost) {
          categoryEl.value = editingPost.category_tag || categoryEl.value;
          titleEl.value = editingPost.title || "";
          contentEl.value = editingPost.content || "";
          btn.textContent = "수정완료";
          document.querySelector(".dieton-write-page h2").textContent = "글수정";
        }
      } catch (error) {
        console.error(error);
        alert("수정할 게시글을 불러오지 못했습니다.");
      }
    }

    const handleSubmit = async (event) => {
      event.preventDefault();
      const category = categoryEl.value;
      const title = titleEl.value.trim();
      const content = contentEl.value.trim();

      if (!title || !content) {
        alert("제목과 내용을 모두 입력해 주세요.");
        return;
      }

      btn.disabled = true;
      btn.textContent = editId ? "수정 중..." : "등록 중...";

      try {
        let saved;
        if (editId) {
          saved = await this.storage.updateThreadAsync(editId, { title, content, category_tag: category });
        } else {
          saved = await this.storage.createThreadAsync(title, content, "다이어터", category, null);
        }
        alert(editId ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다.");
        window.__DIETON_LAST_SAVED_POST = saved;
        if (window.__DIETON_CRUD_QA_NO_REDIRECT) return;
        window.location.href = saved?.id ? `post.html?id=${encodeURIComponent(saved.id)}` : "community.html";
      } catch (error) {
        console.error(error);
        alert((editId ? "수정" : "등록") + " 중 오류가 발생했습니다: " + error.message);
        btn.disabled = false;
        btn.textContent = editId ? "수정완료" : "작성완료";
      }
    };

    if (form) form.addEventListener("submit", handleSubmit);
    btn.addEventListener("click", handleSubmit);
  }

  renderAuth() {
    const params = new URLSearchParams(window.location.search);
    const staticPage = params.get("page");
    if (staticPage && this.renderInfoPage(staticPage)) return;

    const btnLogin = document.getElementById("btnLogin");
    const btnSignup = document.getElementById("btnSignup");
    if (!btnLogin || !btnSignup || !window.supabase) return;

    btnSignup.addEventListener("click", async () => {
      const email = document.getElementById("authEmail").value.trim();
      const password = document.getElementById("authPassword").value.trim();
      if (!email || !password) return alert("이메일과 비밀번호를 모두 입력해 주세요.");

      try {
        btnSignup.disabled = true;
        btnSignup.textContent = "가입 중...";
        const { error } = await window.supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("회원가입이 완료되었습니다. 로그인해 주세요.");
      } catch (error) {
        alert("가입 실패: " + error.message);
      } finally {
        btnSignup.disabled = false;
        btnSignup.textContent = "회원가입";
      }
    });

    btnLogin.addEventListener("click", async () => {
      const email = document.getElementById("authEmail").value.trim();
      const password = document.getElementById("authPassword").value.trim();
      if (!email || !password) return alert("이메일과 비밀번호를 모두 입력해 주세요.");

      try {
        btnLogin.disabled = true;
        btnLogin.textContent = "로그인 중...";
        const { error } = await window.supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        alert("로그인 성공");
        window.location.href = "index.html";
      } catch (error) {
        alert("로그인 실패: " + error.message);
      } finally {
        btnLogin.disabled = false;
        btnLogin.textContent = "로그인";
      }
    });
  }

  renderInfoPage(pageKey) {
    const pages = this.getInfoPages();
    const page = pages[pageKey];
    const content = document.querySelector(".my-content");
    const sidebar = document.querySelector(".my-sidebar");
    if (!page || !content) return false;

    document.title = `${page.title} | DietOn`;
    if (sidebar) {
      sidebar.innerHTML = `
        <div class="my-sidebar-title">고객지원</div>
        ${Object.entries(pages).map(([key, item]) => `
          <a class="${key === pageKey ? "is-active" : ""}" href="my.html?page=${key}">${item.title} <span>›</span></a>
        `).join("")}
      `;
    }

    content.innerHTML = `
      <div class="my-content-head">
        <div>
          <h1>${page.title}</h1>
          <p>${page.description}</p>
        </div>
      </div>
      <article class="my-info-page">${page.body}</article>
    `;
    return true;
  }

  getInfoPages() {
    return {
      company: {
        title: "DietOn소개",
        description: "대한민국 1등 다이어트 커뮤니티 DietOn을 소개합니다.",
        body: `
          <h2>건강한 감량 경험을 연결하는 커뮤니티</h2>
          <p>DietOn은 다이어트 고민, 체중 관리 기록, 비만치료제 후기, 식단과 운동 정보를 함께 나누는 커뮤니티입니다.</p>
          <p>회원들이 직접 남긴 경험과 질문을 중심으로 실질적인 정보를 찾고 비교할 수 있도록 게시판, 검색, 기록 관리 기능을 제공합니다.</p>
          <table class="my-info-table">
            <tbody>
              <tr><th>서비스명</th><td>DietOn</td></tr>
              <tr><th>운영 목적</th><td>다이어트 정보 공유, 후기 열람, 커뮤니티 활동, 기록 관리</td></tr>
              <tr><th>주요 콘텐츠</th><td>위고비/마운자로, 여성다이어트, 산후다이어트, 식단&보조제, 지방흡입/시술, 성공사례</td></tr>
              <tr><th>문의</th><td>dietonhelp@gmail.com</td></tr>
            </tbody>
          </table>
        `
      },
      press: {
        title: "보도자료",
        description: "DietOn의 주요 소식과 서비스 업데이트를 안내합니다.",
        body: `
          <h2>DietOn 보도자료</h2>
          <p>DietOn은 다이어트 관련 정보 접근성을 높이고, 커뮤니티 기반의 건강 관리 경험을 확장하기 위해 서비스를 개선하고 있습니다.</p>
          <h3>주요 소식</h3>
          <ul>
            <li>다이어트수다, 고민상담, 후기 게시판 중심의 커뮤니티 서비스 운영</li>
            <li>체중, 식단, 운동 흐름을 기록하는 다이어트 기록 기능 제공</li>
            <li>위고비/마운자로, 비만치료제, 식단&보조제 등 주제별 정보 탐색 강화</li>
          </ul>
          <div class="my-info-notice">보도자료 및 취재 문의는 광고및제휴문의 페이지의 연락처로 접수해 주세요.</div>
        `
      },
      inquiry: {
        title: "광고및제휴문의",
        description: "광고, 제휴, 운영 문의 접수 안내입니다.",
        body: `
          <h2>광고 및 제휴 문의</h2>
          <p>DietOn은 다이어트, 건강관리, 병원/클리닉, 식단/운동, 커머스 분야의 제휴 제안을 검토합니다.</p>
          <table class="my-info-table">
            <tbody>
              <tr><th>문의 메일</th><td><a href="mailto:dietonhelp@gmail.com">dietonhelp@gmail.com</a></td></tr>
              <tr><th>검토 항목</th><td>브랜드 소개, 제휴 목적, 노출 희망 영역, 진행 일정, 담당자 연락처</td></tr>
              <tr><th>유의 사항</th><td>의료, 의약품, 건강기능식품 광고는 관련 법령과 플랫폼 정책을 기준으로 검토합니다.</td></tr>
            </tbody>
          </table>
          <div class="my-info-notice">커뮤니티 운영 제안이나 게시글 관련 문의는 운영및제안 게시판을 이용해 주세요.</div>
        `
      },
      "manager-policy": {
        title: "게시물관리정책",
        description: "커뮤니티 게시물 운영 기준과 조치 절차를 안내합니다.",
        body: `
          <h2>게시물 관리 기준</h2>
          <p>DietOn은 회원이 안전하게 정보를 나눌 수 있도록 게시물과 댓글을 관리합니다.</p>
          <h3>제한될 수 있는 게시물</h3>
          <ul>
            <li>허위 정보, 과장 광고, 검증되지 않은 의료 효과를 단정하는 내용</li>
            <li>개인정보, 명예훼손, 욕설, 차별, 혐오 표현이 포함된 내용</li>
            <li>상업적 홍보, 반복 게시, 자동화 도구를 이용한 스팸성 게시물</li>
            <li>저작권, 초상권 등 제3자의 권리를 침해하는 자료</li>
          </ul>
          <h3>운영 조치</h3>
          <p>정책 위반 게시물은 사전 통지 없이 숨김, 이동, 삭제될 수 있으며, 반복 위반 시 서비스 이용이 제한될 수 있습니다.</p>
        `
      },
      privacy: {
        title: "개인정보처리방침",
        description: "DietOn의 개인정보 처리 기준을 안내합니다.",
        body: `
          <h2>개인정보 처리 안내</h2>
          <p>DietOn은 서비스 제공에 필요한 범위에서 개인정보를 처리하며, 관련 법령에 따라 안전하게 관리합니다.</p>
          <table class="my-info-table">
            <tbody>
              <tr><th>수집 항목</th><td>이메일, 닉네임, 비밀번호 인증 정보, 게시글/댓글 활동 정보, 서비스 이용 기록</td></tr>
              <tr><th>이용 목적</th><td>회원 식별, 게시판 운영, 기록 관리, 문의 응대, 서비스 품질 개선</td></tr>
              <tr><th>보유 기간</th><td>회원 탈퇴 또는 목적 달성 시까지 보관하며, 법령상 보관 의무가 있는 경우 해당 기간 동안 보관합니다.</td></tr>
              <tr><th>문의</th><td>dietonhelp@gmail.com</td></tr>
            </tbody>
          </table>
          <div class="my-info-notice">본 클론 페이지는 실제 법적 고지를 대체하지 않으며, 서비스 운영 시에는 정식 약관 검토가 필요합니다.</div>
        `
      },
      terms: {
        title: "이용약관",
        description: "DietOn 서비스 이용 조건을 안내합니다.",
        body: `
          <h2>서비스 이용약관</h2>
          <p>회원은 DietOn을 이용함으로써 본 약관과 운영정책을 준수하는 데 동의합니다.</p>
          <h3>회원의 의무</h3>
          <ul>
            <li>타인의 계정 또는 개인정보를 부정하게 사용하지 않습니다.</li>
            <li>불법 정보, 허위 정보, 권리 침해 콘텐츠를 게시하지 않습니다.</li>
            <li>커뮤니티 질서를 해치는 반복 홍보, 도배, 자동화 활동을 하지 않습니다.</li>
          </ul>
          <h3>서비스 운영</h3>
          <p>DietOn은 안정적인 서비스 제공을 위해 기능을 변경하거나 점검할 수 있으며, 운영정책 위반 시 이용을 제한할 수 있습니다.</p>
        `
      },
      "point-policy": {
        title: "포인트정책",
        description: "DietOn 커뮤니티 활동 포인트 적립과 사용 기준입니다.",
        body: `
          <h2>포인트 적립 및 이용 기준</h2>
          <p>포인트는 커뮤니티 활동 참여를 돕기 위한 내부 보상 수단이며, 현금으로 환급되지 않습니다.</p>
          <table class="my-info-table">
            <tbody>
              <tr><th>적립 대상</th><td>게시글 작성, 댓글 작성, 이벤트 참여 등 운영자가 정한 활동</td></tr>
              <tr><th>차감 대상</th><td>정책 위반 게시물 삭제, 부정 적립, 이벤트 취소, 운영 기준 위반</td></tr>
              <tr><th>사용 제한</th><td>비정상 이용이 확인될 경우 포인트 지급이 보류되거나 회수될 수 있습니다.</td></tr>
              <tr><th>소멸 기준</th><td>장기 미접속, 회원 탈퇴, 서비스 종료 등 운영정책에 따라 소멸될 수 있습니다.</td></tr>
            </tbody>
          </table>
        `
      }
    };
  }

  async renderCommunity() {
    const listContainer = document.getElementById("dieton-post-list");
    if (!listContainer) return;

    listContainer.innerHTML = '<div style="padding:50px; text-align:center;">게시글을 불러오는 중입니다...</div>';

    try {
      const posts = await this.storage.getThreadsAsync();
      this.ui.renderPostList(listContainer, this.filterRenderablePosts(posts));
    } catch (error) {
      console.error(error);
      this.ui.renderPostList(listContainer, this.filterRenderablePosts(this.storage.getPosts()));
    }
  }

  filterRenderablePosts(posts) {
    return (Array.isArray(posts) ? posts : []).filter((post) => {
      const title = String(post.title || "").trim();
      return title.length > 2 && !title.startsWith("CRUD QA") && !/^test$/i.test(title);
    });
  }

  async renderPostDetail() {
    const params = new URLSearchParams(window.location.search);
    let postId = params.get("id");
    const mount = this.ui.ensurePostDetailMount();
    if (!postId) {
      const posts = this.filterRenderablePosts(await this.storage.getThreadsAsync());
      postId = posts[0]?.id || null;
      if (!postId) {
        mount.innerHTML = '<div style="padding:40px;text-align:center;">게시글이 없습니다.</div>';
        return;
      }
    }

    mount.innerHTML = '<div style="padding:50px;text-align:center;">게시글을 불러오는 중입니다...</div>';

    try {
      const post = await this.storage.getThreadDetailAsync(postId);
      if (!post) {
        mount.innerHTML = '<div style="padding:40px;text-align:center;">게시글을 찾을 수 없습니다.</div>';
        return;
      }
      this.ui.renderPostDetail(post);
    } catch (error) {
      console.error(error);
      mount.innerHTML = '<div style="padding:40px;text-align:center;">게시글을 불러오는 중 오류가 발생했습니다.</div>';
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new DietOnApp();
  window.app.init();
});
