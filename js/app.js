class DietOnApp {
  constructor() {
    this.storage = new window.StorageManager();
    this.points = new window.PointManager(this.storage);
    this.ui = new window.UIManager(this.storage);
    this.tags = {
      all: "전체",
      meal: "식단인증",
      review: "비포&애프터",
      treatment: "비만치료",
      side_effect: "요요/부작용",
      general: "자유수다"
    };
  }

  init() {
    const page = document.body.dataset.page;
    this.ui.renderCommon(page);
    if (page === "home") this.renderHome();
    if (page === "community") this.renderCommunity();
    if (page === "post") this.renderPostDetail();
    if (page === "record") this.renderRecord();
    if (page === "my") this.renderMyPage();
  }

  renderHome() {
    const posts = this.storage.getPosts();
    const quickItems = [
      ["my.html?setup=1", "📋", "비대면 견적", "#6a3df0", true],
      ["index.html", "🔥", "다이어트핫픽", "#ff7a59", false],
      ["community.html", "💬", "다이어트톡톡", "#2bb6a8", true],
      ["community.html?tag=treatment", "💊", "비만치료톡", "#4c8bf5", true],
      ["community.html?tag=review", "📷", "비포&애프터", "#e0588a", false],
      ["record.html", "🥗", "식단기록", "#1f9d66", false],
      ["community.html?tag=side_effect", "❓", "요요상담", "#f2a93b", true],
      ["community.html?tag=general", "💉", "체형/시술", "#9b6bf0", false],
      ["my.html", "🩺", "전문가상담", "#5a6fd6", false],
      ["community.html", "📺", "다이어트TV", "#d8584e", false]
    ];
    this.setHtml("quickGrid", quickItems.map(([url, icon, label, color, isNew]) =>
      `<a href="${url}"><i class="quick-icon" style="background:${color}">${icon}${isNew ? '<em class="quick-new">N</em>' : ""}</i><span>${label}</span></a>`
    ).join(""));

    const best = [...posts].sort((a, b) => b.like_count - a.like_count);
    this.setHtml("bestPhotoList", best.slice(0, 4).map((post) => this.photoCard(post)).join(""));
    this.setHtml("bestTextList", best.map((post) => this.textRow(post)).join(""));
    this.setHtml("qnaTextList", posts.filter((post) => ["side_effect", "general"].includes(post.category_tag)).map((post) => this.textRow(post)).join(""));
    this.setHtml("reviewGrid", posts.filter((post) => post.category_tag === "review" || post.image).slice(0, 4).map((post) => this.reviewCard(post)).join(""));
    this.setHtml("treatmentTextList", posts.filter((post) => post.category_tag === "treatment").map((post) => this.textRow(post)).join(""));
  }

  renderCommunity() {
    const params = new URLSearchParams(location.search);
    const currentTag = params.get("tag") || "all";
    const search = params.get("search") || "";

    const tabs = Object.entries(this.tags).map(([tag, label]) => {
      const active = tag === currentTag ? " active" : "";
      return `<a class="btn secondary${active}" href="community.html${tag === "all" ? "" : `?tag=${tag}`}">${label}</a>`;
    }).join("");
    this.setHtml("filterTabs", tabs);

    document.querySelectorAll("[data-action='toggle-write']").forEach((button) => {
      button.addEventListener("click", () => {
        const panel = document.getElementById("writePanel");
        panel.hidden = !panel.hidden;
      });
    });

    document.getElementById("postForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = this.storage.getUserProfile();
      const post = {
        id: `post-${Date.now()}`,
        title: document.getElementById("postTitle").value.trim(),
        content: document.getElementById("postContent").value.trim(),
        category_tag: document.getElementById("postTag").value,
        nickname: profile?.nickname || "익명다이어터",
        like_count: 0,
        comment_count: 0,
        views: 0,
        created_at: new Date().toISOString(),
        comments: []
      };
      this.storage.savePost(post);
      event.target.reset();
      location.href = `post.html?id=${post.id}`;
    });

    let posts = this.storage.getPosts();
    if (currentTag !== "all") posts = posts.filter((post) => post.category_tag === currentTag);
    if (search) {
      const query = search.toLowerCase();
      posts = posts.filter((post) => `${post.title} ${post.content}`.toLowerCase().includes(query));
    }

    this.setHtml("postList", posts.length
      ? posts.map((post, index) => this.postCard(post, index)).join("")
      : `<div class="board-section">검색 결과가 없습니다.</div>`);
  }

  renderPostDetail() {
    const postId = new URLSearchParams(location.search).get("id");
    const post = this.storage.getPosts().find((item) => item.id === postId);
    if (!post) {
      this.setHtml("postDetail", "<p>게시글을 찾을 수 없습니다.</p>");
      return;
    }

    this.setHtml("postDetail", `
      <div class="detail-top">
        <span class="post-tag">${this.tags[post.category_tag] || "게시글"}</span>
        <span class="post-meta">${this.formatDate(post.created_at)}</span>
      </div>
      <h1>${this.escape(post.title)}</h1>
      <div class="detail-author">작성자 <strong>${this.escape(post.nickname)}</strong> · 조회 ${post.views || 0}</div>
      <div class="detail-content">${this.escape(post.content)}</div>
      <div class="like-wrap"><button class="btn primary" id="likeButton">추천 ${post.like_count || 0}</button></div>
    `);
    this.renderComments(post);

    document.getElementById("likeButton")?.addEventListener("click", () => {
      const updated = this.storage.updatePost(post.id, (item) => ({ ...item, like_count: (item.like_count || 0) + 1 }));
      document.getElementById("likeButton").textContent = `추천 ${updated.like_count}`;
    });

    document.getElementById("commentForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.getElementById("commentInput");
      const profile = this.storage.getUserProfile();
      const updated = this.storage.updatePost(post.id, (item) => {
        const comments = item.comments || [];
        comments.push({ nickname: profile?.nickname || "익명다이어터", content: input.value.trim() });
        return { ...item, comments, comment_count: comments.length };
      });
      input.value = "";
      this.renderComments(updated);
    });
  }

  renderComments(post) {
    const comments = post.comments || [];
    this.setText("commentCount", comments.length);
    this.setHtml("commentList", comments.length
      ? comments.map((comment) => `<div class="comment"><strong>${this.escape(comment.nickname)}</strong>${this.escape(comment.content)}</div>`).join("")
      : `<div class="comment">첫 댓글을 남겨보세요.</div>`);
  }

  renderRecord() {
    const today = new Date().toISOString().slice(0, 10);
    const records = this.storage.getHealthRecords();
    const todayRecord = records[today];
    if (todayRecord) {
      document.getElementById("inputWeight").value = todayRecord.weight_kg;
      document.getElementById("inputMedicine").checked = todayRecord.medicine_taken;
    }

    document.getElementById("healthForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      this.storage.saveHealthRecord(today, document.getElementById("inputWeight").value, document.getElementById("inputMedicine").checked);
      this.points.awardRecordPoints("오늘 체중 기록");
      this.renderRecord();
    }, { once: true });

    document.getElementById("mealForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      this.storage.saveMealLog({
        id: `meal-${Date.now()}`,
        date: today,
        mealType: document.getElementById("mealType").value,
        foodName: document.getElementById("foodName").value.trim(),
        calories: Number(document.getElementById("foodCalories").value),
        created_at: new Date().toISOString()
      });
      this.points.awardRecordPoints("식단 기록");
      event.target.reset();
      this.renderRecord();
    }, { once: true });

    const meals = this.storage.getMealLogs().filter((meal) => meal.date === today);
    this.setHtml("mealList", meals.length
      ? meals.map((meal) => `<div class="meal-item"><strong>${this.mealTypeLabel(meal.mealType)} · ${this.escape(meal.foodName)}</strong><span>${meal.calories} kcal</span></div>`).join("")
      : `<div class="meal-item"><strong>오늘 등록된 식단이 없습니다.</strong><span>0 kcal</span></div>`);
    this.ui.renderWeightChart("weightChart", this.storage.getHealthRecords());
    this.ui.renderCalorieChart("calorieChart", meals);
  }

  renderMyPage() {
    const params = new URLSearchParams(location.search);
    const setupMode = params.get("setup") === "1";
    const profile = this.storage.getUserProfile();
    if (setupMode) {
      this.setText("profileTitle", "다이어트온 초기 프로필 설정");
      document.getElementById("pointSection").style.display = "none";
    }
    if (profile) {
      document.getElementById("profileNickname").value = profile.nickname;
      document.getElementById("profileHeight").value = profile.height_cm;
      document.getElementById("profileTargetWeight").value = profile.target_weight_kg;
    }

    document.getElementById("profileForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const oldProfile = this.storage.getUserProfile();
      this.storage.saveUserProfile({
        nickname: document.getElementById("profileNickname").value.trim(),
        height_cm: Number(document.getElementById("profileHeight").value),
        target_weight_kg: Number(document.getElementById("profileTargetWeight").value),
        points: oldProfile?.points || 0,
        created_at: oldProfile?.created_at || new Date().toISOString()
      });
      this.points.awardWelcomePoints();
      location.href = "my.html";
    });

    const latestProfile = this.storage.getUserProfile();
    this.setText("pointTotal", latestProfile?.points || 0);
    this.setHtml("pointRows", this.storage.getPointTransactions().map((tx) => `
      <tr><td>${this.formatDate(tx.created_at)}</td><td>${this.escape(tx.description)}</td><td>+${tx.points}P</td></tr>
    `).join("") || `<tr><td colspan="3">아직 적립 내역이 없습니다.</td></tr>`);
  }

  photoCard(post) {
    return `<a class="photo-card" href="post.html?id=${post.id}"><img src="${this.postImage(post)}" alt=""><strong>${this.escape(post.title)}</strong><span>${this.escape(post.nickname)}</span></a>`;
  }

  reviewCard(post) {
    return `<a class="review-card" href="post.html?id=${post.id}"><img src="${this.postImage(post)}" alt=""><strong>${this.escape(post.title)}</strong><span>${this.formatDate(post.created_at)} · 조회 ${post.views || 0}</span></a>`;
  }

  textRow(post) {
    return `<a class="text-row" href="post.html?id=${post.id}"><span>${this.escape(post.title)}</span><span>${post.views || 0}</span></a>`;
  }

  postCard(post, index) {
    return `
      <a class="post-card" href="post.html?id=${post.id}">
        <div class="rank">${index + 1}</div>
        <div>
          <h3>${this.escape(post.title)}</h3>
          <p>${this.escape(post.content)}</p>
          <div class="post-meta"><span class="post-tag">${this.tags[post.category_tag]}</span><span>${this.escape(post.nickname)}</span><span>${this.formatDate(post.created_at)}</span></div>
        </div>
        <div class="post-counts"><span>추천 ${post.like_count || 0}</span><span>댓글 ${post.comment_count || 0}</span><span>조회 ${post.views || 0}</span></div>
      </a>
    `;
  }

  mealTypeLabel(type) {
    return { breakfast: "아침", lunch: "점심", dinner: "저녁", snack: "간식" }[type] || "식사";
  }

  postImage(post) {
    return post.image || "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=520&q=80";
  }

  formatDate(value) {
    return value ? value.slice(0, 10).replaceAll("-", ".") : "";
  }

  setHtml(id, html) {
    const element = document.getElementById(id);
    if (element) element.innerHTML = html;
  }

  setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  escape(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    })[char]);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.app = new DietOnApp();
  window.app.init();
});
