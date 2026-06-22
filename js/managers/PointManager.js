class PointManager {
  constructor(storage) {
    this.storage = storage;
  }

  awardWelcomePoints() {
    const existing = this.storage.getPointTransactions().some((tx) => tx.action === "welcome");
    if (existing) return { points: 0, message: "이미 가입 포인트가 지급되었습니다." };
    this.storage.savePointTransaction({
      id: `point-${Date.now()}`,
      action: "welcome",
      points: 100,
      description: "프로필 설정 완료",
      created_at: new Date().toISOString()
    });
    return { points: 100, message: "가입 포인트 100P가 지급되었습니다." };
  }

  awardRecordPoints(description) {
    this.storage.savePointTransaction({
      id: `point-${Date.now()}`,
      action: "record",
      points: 10,
      description,
      created_at: new Date().toISOString()
    });
  }
}

window.PointManager = PointManager;
