class DietOnApp {
  constructor() {
    this.storage = new window.StorageManager();
    this.ui = new window.UIManager(this.storage);
  }

  init() {
    const page = this.detectPage();
    if (page === "community") this.renderCommunity();
    if (page === "post") this.renderPostDetail();
    if (page === "write") this.renderWrite();
    if (page === "auth") this.renderAuth();
  }

  detectPage() {
    const path = window.location.pathname;
    if (path.includes('my.html')) return 'auth';
    if (path.includes('write.html')) return 'write';
    if (path.includes('post.html')) return 'post';
    if (path.includes('community.html')) return 'community';
    if (path.includes('index.html') || path === '/' || path.endsWith('/다이어트/')) return 'home';
    return 'other';
  }

  renderWrite() {
    const btn = document.getElementById('writeSubmitBtn');
    if (!btn) return;
    
    btn.addEventListener('click', async () => {
        const category = document.getElementById('writeCategory').value;
        const title = document.getElementById('writeTitle').value.trim();
        const content = document.getElementById('writeContent').value.trim();
        
        if (!title || !content) {
            return alert('제목과 내용을 모두 입력해주세요.');
        }
        
        try {
            btn.innerText = '등록 중...';
            btn.disabled = true;
            await this.storage.createThreadAsync(title, content, '다이어터', category, null);
            alert('게시글이 성공적으로 등록되었습니다.');
            window.location.href = 'community.html';
        } catch (e) {
            alert('등록 중 에러가 발생했습니다: ' + e.message);
            btn.innerText = '작성완료';
            btn.disabled = false;
        }
    });
  }

  renderAuth() {
    const btnLogin = document.getElementById('btnLogin');
    const btnSignup = document.getElementById('btnSignup');
    
    if (!btnLogin || !btnSignup) return;

    btnSignup.addEventListener('click', async () => {
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value.trim();
        if (!email || !password) return alert('이메일과 비밀번호를 모두 입력하세요.');

        try {
            btnSignup.disabled = true;
            btnSignup.innerText = '가입 중...';
            const { data, error } = await window.supabase.auth.signUp({
                email,
                password
            });
            if (error) throw error;
            alert('회원가입이 완료되었습니다! 로그인해주세요.');
        } catch (e) {
            alert('가입 실패: ' + e.message);
        } finally {
            btnSignup.disabled = false;
            btnSignup.innerText = '회원가입';
        }
    });

    btnLogin.addEventListener('click', async () => {
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value.trim();
        if (!email || !password) return alert('이메일과 비밀번호를 모두 입력하세요.');

        try {
            btnLogin.disabled = true;
            btnLogin.innerText = '로그인 중...';
            const { data, error } = await window.supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            alert('로그인 성공!');
            window.location.href = 'index.html';
        } catch (e) {
            alert('로그인 실패: ' + e.message);
        } finally {
            btnLogin.disabled = false;
            btnLogin.innerText = '로그인';
        }
    });
  }

  async renderCommunity() {
    const listContainer = document.getElementById("dieton-post-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = '<div style="padding:50px; text-align:center;">게시글을 불러오는 중입니다...</div>';
    
    try {
      const posts = await this.storage.getThreadsAsync();
      const cleanPosts = posts.filter((post) => {
        const title = String(post.title || "").trim();
        return title.length > 2 && !/^(test|테스트|s)$/i.test(title);
      });
      this.ui.renderPostList(listContainer, cleanPosts.length ? cleanPosts : this.storage.getPosts());
    } catch (e) {
      this.ui.renderPostList(listContainer, this.storage.getPosts());
    }
  }

  async renderPostDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    if (!postId) return;

    try {
      const post = await this.storage.getThreadDetailAsync(postId);
      if (post) {
        this.ui.renderPostDetail(post);
      }
    } catch (e) {
      console.error(e);
      alert('게시글을 불러오는 중 오류가 발생했습니다.');
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new DietOnApp();
  window.app.init();
});
