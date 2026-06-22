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
}

const DEFAULT_POSTS = [
  {
    id: "post-1",
    title: "위고비 3주차 식욕 변화와 감량 후기 공유합니다",
    content: "처음 일주일은 속이 더부룩했지만 야식 생각이 크게 줄었습니다. 현재 3.2kg 감량했고 물 섭취와 단백질을 의식적으로 챙기는 중입니다.",
    category_tag: "treatment",
    nickname: "식욕잠금",
    like_count: 42,
    comment_count: 8,
    views: 4219,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    comments: [{ nickname: "유지어터", content: "단백질 챙기는 게 진짜 중요하더라고요." }]
  },
  {
    id: "post-2",
    title: "오늘 저녁 식단 인증, 닭가슴살 샐러드로 버텼어요",
    content: "야근 때문에 배달 temptation이 왔지만 준비해둔 샐러드로 마무리했습니다. 드레싱은 반만 넣으니 훨씬 낫네요.",
    category_tag: "meal",
    nickname: "샐러드장인",
    like_count: 28,
    comment_count: 5,
    views: 1203,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    comments: []
  },
  {
    id: "post-3",
    title: "체지방률 31%에서 24%까지, 5개월 비포&애프터",
    content: "무리한 절식 대신 점심 탄수화물 양을 줄이고 주 3회 근력운동을 했습니다. 숫자보다 허리둘레 변화가 더 크게 느껴져요.",
    category_tag: "review",
    nickname: "천천히빼자",
    like_count: 93,
    comment_count: 21,
    views: 1844,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    comments: []
  },
  {
    id: "post-4",
    title: "삭센다 중단 후 요요가 걱정되는데 유지 방법 있을까요?",
    content: "중단 2주차부터 식욕이 올라오는 느낌입니다. 비슷한 경험 있으신 분들 유지 루틴 공유 부탁드려요.",
    category_tag: "side_effect",
    nickname: "유지중",
    like_count: 17,
    comment_count: 6,
    views: 788,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    comments: []
  },
  {
    id: "post-5",
    title: "복부 지방흡입 상담 다녀왔는데 병원 고를 때 뭘 봐야 하나요?",
    content: "가격 차이가 커서 고민입니다. 후관리와 마취 방식, 압박복 관리까지 체크하면 될까요?",
    category_tag: "general",
    nickname: "라인고민",
    like_count: 11,
    comment_count: 4,
    views: 506,
    image: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=520&q=80",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 31).toISOString(),
    comments: []
  }
];

window.StorageManager = StorageManager;
