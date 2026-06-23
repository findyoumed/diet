class StorageManager {
  constructor() {
    this.keys = {
      profile: "diet_on_profile",
      posts: "diet_on_posts",
      healthRecords: "diet_on_health_records",
      meals: "diet_on_meals",
      points: "diet_on_point_transactions"
    };
  }

  getUserProfile() {
    return this.read(this.keys.profile, null);
  }

  saveUserProfile(profile) {
    this.write(this.keys.profile, profile);
  }

  getPosts() {
    const posts = this.read(this.keys.posts, null);
    if (posts) return posts;
    this.write(this.keys.posts, DEFAULT_POSTS);
    return DEFAULT_POSTS;
  }

  savePost(post) {
    const posts = this.getPosts();
    posts.unshift(post);
    this.write(this.keys.posts, posts);
    return post;
  }

  updatePost(postId, updater) {
    const posts = this.getPosts();
    const index = posts.findIndex((post) => post.id === postId);
    if (index < 0) return null;
    posts[index] = updater(posts[index]);
    this.write(this.keys.posts, posts);
    return posts[index];
  }

  getHealthRecords() {
    return this.read(this.keys.healthRecords, {});
  }

  saveHealthRecord(date, weightKg, medicineTaken) {
    const records = this.getHealthRecords();
    records[date] = {
      weight_kg: Number(weightKg),
      medicine_taken: Boolean(medicineTaken)
    };
    this.write(this.keys.healthRecords, records);
    return records[date];
  }

  getMealLogs() {
    return this.read(this.keys.meals, []);
  }

  saveMealLog(meal) {
    const meals = this.getMealLogs();
    meals.unshift(meal);
    this.write(this.keys.meals, meals);
    return meal;
  }

  getPointTransactions() {
    return this.read(this.keys.points, []);
  }

  savePointTransaction(transaction) {
    const transactions = this.getPointTransactions();
    transactions.unshift(transaction);
    this.write(this.keys.points, transactions);

    const profile = this.getUserProfile();
    if (profile) {
      profile.points = (profile.points || 0) + transaction.points;
      this.saveUserProfile(profile);
    }
    return transaction;
  }

  read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ===========================================================================
  // [LOG: 20260623_2050] Supabase DB 연동 완료 (CRUD)
  // ===========================================================================

  async getThreadsAsync(categoryTag = null) {
    if (!window.supabaseClient) throw new Error("Supabase is not initialized.");
    let query = window.supabaseClient.from('diet_threads').select('*').order('created_at', { ascending: false });
    if (categoryTag && categoryTag !== "all") {
      query = query.eq('category_tag', categoryTag);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getThreadDetailAsync(id) {
    if (!window.supabaseClient) throw new Error("Supabase is not initialized.");
    
    // 조회수 증가
    await window.supabaseClient.rpc('increment_view_count', { row_id: id }).catch(() => {
        // RPC가 없으면 직접 업데이트 시도 (조회수 중복 가능성 무시)
        window.supabaseClient.from('diet_threads').select('views').eq('id', id).single().then(({data}) => {
            if(data) window.supabaseClient.from('diet_threads').update({ views: data.views + 1 }).eq('id', id).then();
        });
    });

    const { data: thread, error: tError } = await window.supabaseClient
      .from('diet_threads')
      .select('*')
      .eq('id', id)
      .single();
      
    if (tError) throw tError;

    const { data: comments, error: cError } = await window.supabaseClient
      .from('diet_comments')
      .select('*')
      .eq('thread_id', id)
      .order('created_at', { ascending: true });
      
    if (cError) throw cError;

    thread.comments = comments || [];
    return thread;
  }

  async createThreadAsync(title, content, categoryTag, nickname) {
    if (!window.supabaseClient) throw new Error("Supabase is not initialized.");
    const { data, error } = await window.supabaseClient
      .from('diet_threads')
      .insert([{ 
        title, 
        content, 
        category_tag: categoryTag, 
        nickname: nickname || "익명",
        created_at: new Date().toISOString()
      }])
      .select();
      
    if (error) throw error;
    return data[0];
  }

  async deleteThreadAsync(id) {
    if (!window.supabaseClient) throw new Error("Supabase is not initialized.");
    const { error } = await window.supabaseClient
      .from('diet_threads')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  }

  async createCommentAsync(postId, content, nickname) {
    if (!window.supabaseClient) throw new Error("Supabase is not initialized.");
    const { data, error } = await window.supabaseClient
      .from('diet_comments')
      .insert([{ 
        thread_id: postId, 
        content, 
        nickname: nickname || "익명",
        created_at: new Date().toISOString()
      }])
      .select();
      
    if (error) throw error;

    // 댓글 수 증가 (클라이언트 사이드 추정치)
    window.supabaseClient.from('diet_threads').select('comment_count').eq('id', postId).single().then(({data: tData}) => {
        if(tData) window.supabaseClient.from('diet_threads').update({ comment_count: tData.comment_count + 1 }).eq('id', postId).then();
    });

    return data[0];
  }

  async deleteCommentAsync(postId, commentId) {
    if (!window.supabaseClient) throw new Error("Supabase is not initialized.");
    const { error } = await window.supabaseClient
      .from('diet_comments')
      .delete()
      .eq('id', commentId);
      
    if (error) throw error;
    
    // 댓글 수 감소
    window.supabaseClient.from('diet_threads').select('comment_count').eq('id', postId).single().then(({data: tData}) => {
        if(tData && tData.comment_count > 0) window.supabaseClient.from('diet_threads').update({ comment_count: tData.comment_count - 1 }).eq('id', postId).then();
    });

    return true;
  }
}

const HOUR = 1000 * 60 * 60;
const DEFAULT_POSTS = [
  {
    id: "post-1",
    title: "마운자로 5mg 8주차, 누적 7.4kg 감량 후기 (용량 적응기 포함)",
    content: "2.5mg로 시작해 4주마다 증량했습니다. 첫 주는 메스꺼움이 있었지만 기름진 음식만 피하니 견딜 만했어요. 8주차 누적 7.4kg 빠졌고, 가장 큰 변화는 '음식 생각이 머릿속에서 사라진' 느낌입니다. 단백질과 물만 잘 챙기면 근손실은 크게 없었어요.",
    category_tag: "treatment",
    nickname: "마운자로러",
    like_count: 128,
    comment_count: 34,
    views: 8421,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - HOUR * 3).toISOString(),
    comments: [
      { nickname: "유지어터", content: "용량 적응기 설명 정말 도움됐어요. 저도 2.5mg 적응 중입니다." },
      { nickname: "단백질사수", content: "근손실 없으려면 하루 단백질 몇 g 드셨나요?" }
    ]
  },
  {
    id: "post-2",
    title: "위고비 vs 마운자로, 두 개 다 써본 솔직 비교",
    content: "위고비(세마글루타이드)를 4개월, 이후 마운자로(터제파타이드)로 바꿔 3개월째입니다. 식욕 억제는 마운자로가 체감상 더 강했고, 위고비는 메스꺼움이 더 오래갔어요. 다만 사람마다 반응이 달라서 처방받는 곳에서 충분히 상담받는 걸 추천합니다.",
    category_tag: "treatment",
    nickname: "둘다써봄",
    like_count: 96,
    comment_count: 27,
    views: 6310,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - HOUR * 6).toISOString(),
    comments: [{ nickname: "고민중", content: "딱 제가 궁금했던 비교네요. 감사합니다!" }]
  },
  {
    id: "post-3",
    title: "체지방률 31%에서 24%까지, 5개월 비포&애프터",
    content: "무리한 절식 대신 점심 탄수화물 양을 줄이고 주 3회 근력운동을 했습니다. 숫자보다 허리둘레 변화가 더 크게 느껴져요. 약과 병행하면서도 운동은 꼭 챙겼습니다.",
    category_tag: "review",
    nickname: "천천히빼자",
    like_count: 213,
    comment_count: 41,
    views: 9844,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - HOUR * 10).toISOString(),
    comments: []
  },
  {
    id: "post-4",
    title: "94kg → 71kg 비포&애프터 사진 인증합니다 (6개월)",
    content: "마운자로 + 식단 기록을 병행했습니다. 가장 효과 본 건 '먹은 걸 전부 기록'한 거예요. 무의식적으로 먹던 간식이 눈에 보이니 자연스럽게 줄더라고요. 인바디 변화도 같이 올립니다.",
    category_tag: "review",
    nickname: "23키로뺀사람",
    like_count: 187,
    comment_count: 52,
    views: 7720,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - HOUR * 14).toISOString(),
    comments: []
  },
  {
    id: "post-5",
    title: "오늘 저녁 식단 인증, 닭가슴살 샐러드로 버텼어요",
    content: "야근 때문에 배달 생각이 굴뚝같았지만 준비해둔 샐러드로 마무리했습니다. 드레싱은 반만 넣으니 훨씬 낫네요. 위고비 맞고 나선 양도 자연스럽게 줄었어요.",
    category_tag: "meal",
    nickname: "샐러드장인",
    like_count: 64,
    comment_count: 12,
    views: 2203,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - HOUR * 18).toISOString(),
    comments: []
  },
  {
    id: "post-6",
    title: "위고비 맞는 날 단백질 식단 (하루 120g 채우는 법)",
    content: "식욕이 줄다 보니 오히려 단백질이 부족해지기 쉬워요. 그릭요거트, 두부, 계란, 닭가슴살로 끼니당 30g씩 나눠 먹습니다. 적게 먹어도 영양은 챙겨야 근손실을 막을 수 있어요.",
    category_tag: "meal",
    nickname: "단백질사수",
    like_count: 71,
    comment_count: 9,
    views: 1890,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - HOUR * 22).toISOString(),
    comments: []
  },
  {
    id: "post-7",
    title: "삭센다 중단 후 요요가 걱정되는데 유지 방법 있을까요?",
    content: "중단 2주차부터 식욕이 올라오는 느낌입니다. 비슷한 경험 있으신 분들 유지 루틴 공유 부탁드려요. 천천히 감량할 걸 그랬나 후회도 됩니다.",
    category_tag: "side_effect",
    nickname: "유지중",
    like_count: 33,
    comment_count: 18,
    views: 2788,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - HOUR * 27).toISOString(),
    comments: []
  },
  {
    id: "post-8",
    title: "마운자로 메스꺼움/변비 부작용, 이렇게 버텼습니다",
    content: "증량 직후 3~4일이 가장 힘들었어요. 기름진 음식·과식을 피하고, 물을 평소보다 많이 마시고, 식이섬유(차전자피)를 챙기니 변비가 한결 나아졌습니다. 너무 심하면 증량을 미루는 것도 방법이에요.",
    category_tag: "side_effect",
    nickname: "부작용극복",
    like_count: 58,
    comment_count: 23,
    views: 3410,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - HOUR * 33).toISOString(),
    comments: []
  },
  {
    id: "post-9",
    title: "위고비 처방, 비대면으로 받아도 괜찮을까요?",
    content: "직장 때문에 병원 방문이 어려워 비대면 처방을 알아보고 있습니다. 정품 여부랑 배송, 가격대가 궁금한데 실제로 받아보신 분 후기 부탁드려요.",
    category_tag: "side_effect",
    nickname: "처방고민",
    like_count: 19,
    comment_count: 15,
    views: 1506,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - HOUR * 38).toISOString(),
    comments: []
  },
  {
    id: "post-10",
    title: "복부 지방흡입 상담 다녀왔는데 병원 고를 때 뭘 봐야 하나요?",
    content: "가격 차이가 커서 고민입니다. 후관리와 마취 방식, 압박복 관리까지 체크하면 될까요? 약으로 전체적으로 빼고 부분만 시술 고민 중입니다.",
    category_tag: "general",
    nickname: "라인고민",
    like_count: 24,
    comment_count: 11,
    views: 1206,
    image: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - HOUR * 44).toISOString(),
    comments: []
  },
  {
    id: "post-11",
    title: "간헐적 단식 16:8 + 위고비 병행, 시너지 있나요?",
    content: "공복 시간을 늘리면서 약 효과를 같이 보려는데, 저혈당 걱정도 됩니다. 두 가지 병행하시는 분들 컨디션 어떠신지 궁금해요.",
    category_tag: "general",
    nickname: "공복러",
    like_count: 27,
    comment_count: 14,
    views: 1633,
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - HOUR * 50).toISOString(),
    comments: []
  },
  {
    id: "post-12",
    title: "정체기 3주째, 마운자로 용량 유지 vs 증량 고민",
    content: "5mg에서 체중이 2주 넘게 멈췄습니다. 운동량을 늘려야 할지, 증량을 해야 할지 고민이에요. 정체기 뚫은 경험담 공유해주시면 감사하겠습니다.",
    category_tag: "treatment",
    nickname: "정체기탈출",
    like_count: 41,
    comment_count: 19,
    views: 2950,
    image: "https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - HOUR * 57).toISOString(),
    comments: []
  }
];

window.StorageManager = StorageManager;
