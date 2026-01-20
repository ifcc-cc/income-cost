// 这是一个简单的内存存储，用于模拟 Redis 行为
// 生产环境应替换为真实的 Redis 客户端

class MockRedis {
  private store: Map<string, string> = new Map();

  // 设置 Key-Value，支持过期时间（此处简化，未实现自动过期删除）
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, value);
    // 实际项目中这里可以使用 setTimeout 来模拟过期，
    // 但为了演示稳定性，我们暂不处理自动删除。
    console.log(`[MockRedis] SET ${key} = ${value.substring(0, 10)}...`);
  }

  // 获取值
  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  // 删除 Key
  async del(key: string): Promise<void> {
    this.store.delete(key);
    console.log(`[MockRedis] DEL ${key}`);
  }

  // 检查是否存在
  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }
}

export const redis = new MockRedis();
