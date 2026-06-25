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

  withTimeout(promise, label, ms = 2500) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`${label} timed out`)), ms);
      })
    ]);
  }

  getUserProfile() {
    return this.read(this.keys.profile, null);
  }

  saveUserProfile(profile) {
    this.write(this.keys.profile, profile);
  }

  getHealthRecords() {
    return this.read(this.keys.healthRecords, {});
  }

  saveHealthRecord(date, weightKg, medicineTaken) {
    const records = this.getHealthRecords();
    records[date] = { weight_kg: Number(weightKg), medicine_taken: Boolean(medicineTaken) };
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

  normalizeThread(post) {
    const now = new Date().toISOString();
    const comments = Array.isArray(post.comments) ? post.comments : [];
    return {
      id: String(post.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      title: String(post.title || ""),
      content: String(post.content || ""),
      category_tag: String(post.category_tag || "다이어트수다"),
      nickname: String(post.nickname || "다이어터"),
      created_at: post.created_at || now,
      updated_at: post.updated_at || post.created_at || now,
      views: Number(post.views || 0),
      like_count: Number(post.like_count || 0),
      comment_count: Number(post.comment_count || comments.length || 0),
      image: post.image || null,
      comments
    };
  }

  getPosts() {
    const posts = this.read(this.keys.posts, null);
    if (Array.isArray(posts)) return posts.map((post) => this.normalizeThread(post));
    const seeded = DEFAULT_POSTS.map((post) => this.normalizeThread(post));
    this.write(this.keys.posts, seeded);
    return seeded;
  }

  savePost(post) {
    const normalized = this.normalizeThread(post);
    const posts = this.getPosts();
    posts.unshift(normalized);
    this.write(this.keys.posts, posts);
    return normalized;
  }

  updatePost(postId, updater) {
    const posts = this.getPosts();
    const index = posts.findIndex((post) => String(post.id) === String(postId));
    if (index < 0) return null;
    posts[index] = this.normalizeThread(updater(posts[index]));
    this.write(this.keys.posts, posts);
    return posts[index];
  }

  getLocalThread(id) {
    return this.getPosts().find((post) => String(post.id) === String(id)) || null;
  }

  isLocalId(id) {
    return String(id).startsWith("local-") || String(id).startsWith("post-");
  }

  async getThreadsAsync(categoryTag = null) {
    if (window.supabaseClient) {
      try {
        let query = window.supabaseClient.from("diet_threads").select("*").order("created_at", { ascending: false });
        if (categoryTag && categoryTag !== "all") query = query.eq("category_tag", categoryTag);
        const { data, error } = await this.withTimeout(query, "Supabase list");
        if (error) throw error;
        if (Array.isArray(data) && data.length) return data.map((post) => this.normalizeThread(post));
      } catch (error) {
        console.warn("Supabase list failed; using local posts.", error);
      }
    }

    const posts = this.getPosts();
    return categoryTag && categoryTag !== "all"
      ? posts.filter((post) => post.category_tag === categoryTag)
      : posts;
  }

  async getThreadDetailAsync(id, options = {}) {
    if (window.supabaseClient && !this.isLocalId(id)) {
      try {
        if (!options.skipViewIncrement) {
          await this.withTimeout(window.supabaseClient.rpc("increment_view_count", { row_id: id }), "Supabase view increment").catch(async () => {
            const { data } = await window.supabaseClient.from("diet_threads").select("views").eq("id", id).single();
            if (data) {
              await window.supabaseClient.from("diet_threads").update({ views: Number(data.views || 0) + 1 }).eq("id", id);
            }
          });
        }

        const { data: thread, error: threadError } = await this.withTimeout(window.supabaseClient
          .from("diet_threads")
          .select("*")
          .eq("id", id)
          .single(), "Supabase detail");
        if (threadError) throw threadError;

        const { data: comments, error: commentsError } = await this.withTimeout(window.supabaseClient
          .from("diet_comments")
          .select("*")
          .eq("thread_id", id)
          .order("created_at", { ascending: true }), "Supabase comments");
        if (commentsError) throw commentsError;

        return this.normalizeThread({ ...thread, comments: comments || [] });
      } catch (error) {
        console.warn("Supabase detail failed; using local post.", error);
      }
    }

    const post = this.getLocalThread(id);
    if (!post) return null;
    if (options.skipViewIncrement) return post;
    return this.updatePost(post.id, (current) => ({ ...current, views: Number(current.views || 0) + 1 }));
  }

  async createThreadAsync(title, content, nickname = "다이어터", categoryTag = "다이어트수다", image = null) {
    const post = this.normalizeThread({ title, content, nickname, category_tag: categoryTag, image });
    if (window.supabaseClient) {
      try {
        const { data, error } = await this.withTimeout(window.supabaseClient
          .from("diet_threads")
          .insert([{
            title: post.title,
            content: post.content,
            category_tag: post.category_tag,
            nickname: post.nickname,
            image: post.image,
            created_at: post.created_at
          }])
          .select()
          .single(), "Supabase create");
        if (error) throw error;
        return this.normalizeThread(data);
      } catch (error) {
        console.warn("Supabase create failed; saving locally.", error);
      }
    }
    return this.savePost(post);
  }

  async updateThreadAsync(id, fields) {
    const updates = {
      title: fields.title,
      content: fields.content,
      category_tag: fields.category_tag,
      updated_at: new Date().toISOString()
    };

    if (window.supabaseClient && !this.isLocalId(id)) {
      try {
        const { data, error } = await this.withTimeout(window.supabaseClient
          .from("diet_threads")
          .update(updates)
          .eq("id", id)
          .select()
          .single(), "Supabase update");
        if (error) throw error;
        return this.normalizeThread(data);
      } catch (error) {
        console.warn("Supabase update failed; updating locally.", error);
      }
    }

    const updated = this.updatePost(id, (post) => ({ ...post, ...updates }));
    if (!updated) throw new Error("게시글을 찾을 수 없습니다.");
    return updated;
  }

  async deleteThreadAsync(id) {
    if (window.supabaseClient && !this.isLocalId(id)) {
      try {
        const { error } = await this.withTimeout(window.supabaseClient.from("diet_threads").delete().eq("id", id), "Supabase delete");
        if (error) throw error;
        return true;
      } catch (error) {
        console.warn("Supabase delete failed; deleting locally.", error);
      }
    }

    const posts = this.getPosts().filter((post) => String(post.id) !== String(id));
    this.write(this.keys.posts, posts);
    return true;
  }

  async createCommentAsync(postId, content, nickname = "다이어터") {
    const comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      thread_id: postId,
      content,
      nickname,
      created_at: new Date().toISOString()
    };

    if (window.supabaseClient && !this.isLocalId(postId)) {
      try {
        const { data, error } = await this.withTimeout(window.supabaseClient
          .from("diet_comments")
          .insert([comment])
          .select()
          .single(), "Supabase comment create");
        if (error) throw error;
        window.supabaseClient.from("diet_threads").select("comment_count").eq("id", postId).single().then(({ data: thread }) => {
          if (thread) {
            window.supabaseClient.from("diet_threads").update({ comment_count: Number(thread.comment_count || 0) + 1 }).eq("id", postId).then();
          }
        });
        return data;
      } catch (error) {
        console.warn("Supabase comment failed; saving locally.", error);
      }
    }

    const updated = this.updatePost(postId, (post) => {
      const comments = Array.isArray(post.comments) ? post.comments.slice() : [];
      comments.push(comment);
      return { ...post, comments, comment_count: comments.length };
    });
    if (!updated) throw new Error("게시글을 찾을 수 없습니다.");
    return comment;
  }

  async deleteCommentAsync(postId, commentId) {
    if (window.supabaseClient && !this.isLocalId(postId)) {
      try {
        const { error } = await this.withTimeout(window.supabaseClient.from("diet_comments").delete().eq("id", commentId), "Supabase comment delete");
        if (error) throw error;
        return true;
      } catch (error) {
        console.warn("Supabase comment delete failed; deleting locally.", error);
      }
    }

    const updated = this.updatePost(postId, (post) => {
      const comments = (post.comments || []).filter((comment) => String(comment.id) !== String(commentId));
      return { ...post, comments, comment_count: comments.length };
    });
    if (!updated) throw new Error("게시글을 찾을 수 없습니다.");
    return true;
  }
}

const HOUR = 1000 * 60 * 60;
const DEFAULT_POSTS = [
  {
    id: "post-1",
    title: "위고비 8주차, 체중과 식단 기록 공유합니다",
    content: "처음에는 식욕 조절이 가장 크게 느껴졌고, 4주차부터는 식단 기록을 병행했습니다. 물 섭취와 단백질을 챙기니 컨디션이 훨씬 안정적이었습니다.",
    category_tag: "위고비/마운자로톡톡",
    nickname: "다이어터01",
    like_count: 128,
    comment_count: 2,
    views: 8421,
    image: "images/custom/product2.png",
    created_at: new Date(Date.now() - HOUR * 3).toISOString(),
    comments: [
      { id: "comment-1", nickname: "건강루틴", content: "식단 기록 방식이 궁금합니다.", created_at: new Date(Date.now() - HOUR * 2).toISOString() },
      { id: "comment-2", nickname: "단백질챙김", content: "단백질 섭취량도 같이 보면 좋겠네요.", created_at: new Date(Date.now() - HOUR).toISOString() }
    ]
  },
  {
    id: "post-2",
    title: "정체기 때 운동 루틴을 바꿔본 후기",
    content: "유산소만 하다가 근력 운동을 주 3회로 늘렸습니다. 체중 변화는 느렸지만 눈바디 변화가 먼저 왔습니다.",
    category_tag: "다이어트수다",
    nickname: "루틴러",
    like_count: 76,
    comment_count: 1,
    views: 3120,
    image: "images/custom/product5.png",
    created_at: new Date(Date.now() - HOUR * 12).toISOString(),
    comments: [
      { id: "comment-3", nickname: "홈트중", content: "근력 루틴 자세히 알려주세요.", created_at: new Date(Date.now() - HOUR * 11).toISOString() }
    ]
  },
  {
    id: "post-3",
    title: "저녁 폭식 줄이는 데 도움 된 방법",
    content: "오후 간식을 단백질 위주로 바꾸고, 저녁 식사 전 물을 먼저 마시는 습관을 들였습니다. 작은 변화지만 야식 빈도가 줄었습니다.",
    category_tag: "다이어트톡톡",
    nickname: "습관개선",
    like_count: 54,
    comment_count: 0,
    views: 1984,
    image: "images/custom/product3.png",
    created_at: new Date(Date.now() - HOUR * 28).toISOString(),
    comments: []
  }
];

window.StorageManager = StorageManager;
