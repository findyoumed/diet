class UIManager {
  constructor(storage) {
    this.storage = storage;
  }

  renderCommon(activePage) {
    this.renderHeader(activePage);
    this.renderSidebar();
  }

  renderHeader(activePage) {
    const header = document.getElementById("siteHeader");
    if (!header) return;

    const profile = this.storage.getUserProfile();
    const menus = [
      ["home", "다이어트핫픽", "index.html"],
      ["community", "다이어트톡톡", "community.html"],
      ["treatment", "비만치료톡", "community.html?tag=treatment"],
      ["review", "비포&애프터", "community.html?tag=review"],
      ["meal", "식단인증", "community.html?tag=meal"],
      ["record", "식단&칼로리", "record.html"],
      ["general", "체형/시술", "community.html?tag=general"],
      ["expert", "전문가상담", "my.html"],
      ["clinic", "병원찾기", "my.html"]
    ];

    header.innerHTML = `
      <div class="top-bar">
        <div class="top-inner">
          <a class="logo" href="index.html">DietOn</a>
          <form class="search-box" id="globalSearchForm">
            <input id="globalSearchInput" type="search" placeholder="'위고비' 궁금하다면 지금 검색하세요">
          </form>
          <div class="top-meta">
            <a href="my.html?setup=1">실시간 비대면 <span>견적받기</span> &gt;</a>
            <span>현재 접속자 <strong>1,854</strong>명</span>
          </div>
          <div class="auth-links">
            ${profile
              ? `<a href="my.html">${profile.nickname}님</a><a href="#" data-action="logout">로그아웃</a>`
              : `<a href="my.html?setup=1">로그인</a><a href="my.html?setup=1">회원가입</a>`}
          </div>
        </div>
      </div>
      <nav class="gnb">
        <ul class="gnb-inner">
          ${menus.map(([id, label, url]) => `<li class="${this.isActive(activePage, id) ? "active" : ""}"><a href="${url}">${label}</a></li>`).join("")}
        </ul>
      </nav>
    `;

    const searchForm = document.getElementById("globalSearchForm");
    searchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = document.getElementById("globalSearchInput").value.trim();
      if (query) location.href = `community.html?search=${encodeURIComponent(query)}`;
    });

    header.querySelector("[data-action='logout']")?.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem("diet_on_profile");
      location.href = "index.html";
    });
  }

  renderSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    const profile = this.storage.getUserProfile();
    const posts = this.storage.getPosts().slice(0, 5);
    const profileHtml = profile
      ? `
        <div class="side-widget">
          <div class="profile-mini">
            <div class="avatar">${profile.nickname.slice(0, 1)}</div>
            <div><strong>${profile.nickname}님</strong><br><span>${profile.points || 0}P 보유</span></div>
          </div>
          <div class="profile-data">
            <span>키 <strong>${profile.height_cm}cm</strong></span>
            <span>목표 체중 <strong>${profile.target_weight_kg}kg</strong></span>
            <span>BMI <strong>${this.calculateBMI(profile.height_cm, profile.target_weight_kg)}</strong></span>
          </div>
        </div>`
      : `
        <div class="login-box">
          <input type="text" value="diet@dieton.kr" aria-label="아이디">
          <input type="password" value="123456" aria-label="비밀번호">
          <button class="btn primary" onclick="location.href='my.html?setup=1'">로그인</button>
          <div class="post-meta" style="margin-top:8px;"><a href="my.html?setup=1">회원가입</a><span>|</span><a href="my.html?setup=1">아이디/비번 찾기</a></div>
        </div>`;

    sidebar.innerHTML = `
      ${profileHtml}
      <div class="side-widget">
        <h3 class="side-title">다이어트 NOW</h3>
        <div class="rank-list">
          ${posts.map((post, index) => `<a href="post.html?id=${post.id}"><b>${index + 1}</b><span>${post.title}</span></a>`).join("")}
        </div>
      </div>
      <div class="side-widget">
        <h3 class="side-title">빠른 메뉴</h3>
        <div class="side-menu">
          <a href="record.html">식단 다이어리 쓰기</a>
          <a href="record.html">오늘 몸무게 입력</a>
          <a href="community.html?tag=treatment">비만치료 후기 보기</a>
          <a href="community.html?tag=side_effect">요요/부작용 상담</a>
        </div>
      </div>
      <a class="side-widget" href="my.html?setup=1" style="display:block;background:linear-gradient(135deg,var(--main),var(--green));color:#fff;text-align:center;">
        <strong>맞춤 감량 플랜 상담</strong><br>
        <span style="font-size:12px;opacity:.85;">목표 체중까지 필요한 루틴 확인</span>
      </a>
      <div class="ad-box">AD<br>DietOn 파트너 배너</div>
    `;
  }

  renderWeightChart(canvasId, records) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;
    const labels = Object.keys(records).sort().slice(-30);
    const values = labels.map((date) => records[date].weight_kg);

    if (window.weightChart) window.weightChart.destroy();
    window.weightChart = new Chart(canvas, {
      type: "line",
      data: {
        labels: labels.map((date) => date.slice(5)),
        datasets: [{
          data: values,
          borderColor: "#4c00ee",
          backgroundColor: "rgba(76,0,238,.08)",
          tension: .25,
          fill: true,
          pointBackgroundColor: labels.map((date) => records[date].medicine_taken ? "#ff6600" : "#4c00ee")
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  renderCalorieChart(canvasId, meals) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;
    const totals = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    meals.forEach((meal) => { totals[meal.mealType] += Number(meal.calories || 0); });

    if (window.calorieChart) window.calorieChart.destroy();
    window.calorieChart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["아침", "점심", "저녁", "간식"],
        datasets: [{ data: Object.values(totals), backgroundColor: ["#4c00ee", "#1f9d66", "#ff6600", "#ffc247"] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, cutout: "64%" }
    });
  }

  isActive(activePage, menuId) {
    if (activePage === menuId) return true;
    if (activePage === "post" && menuId === "community") return true;
    return false;
  }

  calculateBMI(heightCm, weightKg) {
    if (!heightCm || !weightKg) return "N/A";
    const heightM = Number(heightCm) / 100;
    return (Number(weightKg) / (heightM * heightM)).toFixed(1);
  }
}

window.UIManager = UIManager;
