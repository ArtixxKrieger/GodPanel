import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

function requireAuth(req: any, res: any, next: any) {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

router.post("/admin/login", async (req, res) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, message: "Login successful" });
});

router.get("/admin/me", requireAuth, async (req, res) => {
  res.json({ admin: true, iat: (req as any).admin?.iat });
});

router.get("/admin/dashboard", requireAuth, async (req, res) => {
  try {
    const [
      totalUsersResult,
      totalRevenueResult,
      newSignupsResult,
      totalSalesResult,
      totalExpensesResult,
      bannedUsersResult,
      revenueThisMonthResult,
    ] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM users`),
      db.execute(sql`SELECT COALESCE(SUM(total), 0) as sum FROM sales`),
      db.execute(
        sql`SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '7 days'`
      ),
      db.execute(sql`SELECT COUNT(*) as count FROM sales`),
      db.execute(sql`SELECT COALESCE(SUM(amount), 0) as sum FROM expenses`),
      db.execute(sql`SELECT COUNT(*) as count FROM users WHERE is_banned = true`),
      db.execute(
        sql`SELECT COALESCE(SUM(total), 0) as sum FROM sales WHERE created_at >= DATE_TRUNC('month', NOW())`
      ),
    ]);

    const totalUsers = Number((totalUsersResult.rows[0] as any)?.count ?? 0);
    const totalRevenue = Number((totalRevenueResult.rows[0] as any)?.sum ?? 0);
    const newSignupsThisWeek = Number((newSignupsResult.rows[0] as any)?.count ?? 0);
    const totalSales = Number((totalSalesResult.rows[0] as any)?.count ?? 0);
    const totalExpenses = Number((totalExpensesResult.rows[0] as any)?.sum ?? 0);
    const bannedUsers = Number((bannedUsersResult.rows[0] as any)?.count ?? 0);
    const revenueThisMonth = Number((revenueThisMonthResult.rows[0] as any)?.sum ?? 0);

    const activeStoresResult = await db.execute(
      sql`SELECT COUNT(DISTINCT user_id) as count FROM sales WHERE created_at >= NOW() - INTERVAL '30 days'`
    );
    const activeStores = Number((activeStoresResult.rows[0] as any)?.count ?? 0);

    res.json({
      totalUsers,
      totalRevenue,
      newSignupsThisWeek,
      activeStores,
      totalSales,
      totalExpenses,
      bannedUsers,
      revenueThisMonth,
    });
  } catch (err) {
    req.log.error({ err }, "Dashboard error");
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

router.get("/admin/users", requireAuth, async (req, res) => {
  try {
    const { search, role, banned } = req.query as {
      search?: string;
      role?: string;
      banned?: string;
    };

    let whereClause = sql`1=1`;
    if (search) {
      whereClause = sql`${whereClause} AND (u.name ILIKE ${"%" + search + "%"} OR u.email ILIKE ${"%" + search + "%"})`;
    }
    if (role) {
      whereClause = sql`${whereClause} AND u.role = ${role}`;
    }
    if (banned === "true") {
      whereClause = sql`${whereClause} AND u.is_banned = true`;
    } else if (banned === "false") {
      whereClause = sql`${whereClause} AND (u.is_banned IS NULL OR u.is_banned = false)`;
    }

    const result = await db.execute(sql`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.tenant_id as "tenantId",
        u.is_banned as "isBanned",
        u.created_at as "createdAt",
        s.store_name as "storeName",
        s.business_type as "businessType",
        COALESCE(rev.total, 0) as "revenueTotal",
        (SELECT MAX(sa.created_at) FROM sales sa WHERE sa.user_id = u.id) as "lastActive"
      FROM users u
      LEFT JOIN settings s ON s.user_id = u.id
      LEFT JOIN (
        SELECT user_id, SUM(total) as total FROM sales GROUP BY user_id
      ) rev ON rev.user_id = u.id
      WHERE ${whereClause}
      ORDER BY u.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    req.log.error({ err }, "Users error");
    res.status(500).json({ error: "Failed to load users" });
  }
});

router.post("/admin/users/:userId/ban", requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    await db.execute(sql`UPDATE users SET is_banned = true WHERE id = ${userId}`);
    res.json({ success: true, message: "User banned successfully" });
  } catch (err) {
    req.log.error({ err }, "Ban user error");
    res.status(500).json({ error: "Failed to ban user" });
  }
});

router.post("/admin/users/:userId/unban", requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    await db.execute(sql`UPDATE users SET is_banned = false WHERE id = ${userId}`);
    res.json({ success: true, message: "User unbanned successfully" });
  } catch (err) {
    req.log.error({ err }, "Unban user error");
    res.status(500).json({ error: "Failed to unban user" });
  }
});

router.get("/admin/revenue", requireAuth, async (req, res) => {
  try {
    const period = (req.query.period as string) || "30d";
    const intervalMap: Record<string, string> = {
      "7d": "7 days",
      "30d": "30 days",
      "90d": "90 days",
      "1y": "1 year",
    };
    const interval = intervalMap[period] || "30 days";

    const dataResult = await db.execute(sql`
      SELECT
        DATE(created_at) as date,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as sales
      FROM sales
      WHERE created_at >= NOW() - INTERVAL ${sql.raw(`'${interval}'`)}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    const totalResult = await db.execute(sql`
      SELECT
        COALESCE(SUM(total), 0) as "totalRevenue",
        COUNT(*) as "totalSales",
        CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(total), 0) / COUNT(*) ELSE 0 END as "averageOrderValue"
      FROM sales
      WHERE created_at >= NOW() - INTERVAL ${sql.raw(`'${interval}'`)}
    `);

    const totals = totalResult.rows[0] as any;

    res.json({
      data: dataResult.rows.map((row: any) => ({
        date: row.date instanceof Date ? row.date.toISOString().split("T")[0] : String(row.date),
        revenue: Number(row.revenue),
        sales: Number(row.sales),
      })),
      totalRevenue: Number(totals?.totalRevenue ?? 0),
      totalSales: Number(totals?.totalSales ?? 0),
      averageOrderValue: Number(totals?.averageOrderValue ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "Revenue error");
    res.status(500).json({ error: "Failed to load revenue" });
  }
});

router.get("/admin/revenue/top-stores", requireAuth, async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        u.id as "userId",
        COALESCE(s.store_name, u.name) as "storeName",
        COALESCE(SUM(sa.total), 0) as revenue,
        COUNT(sa.id) as "salesCount",
        s.business_type as "businessType"
      FROM users u
      LEFT JOIN sales sa ON sa.user_id = u.id
      LEFT JOIN settings s ON s.user_id = u.id
      GROUP BY u.id, s.store_name, u.name, s.business_type
      ORDER BY revenue DESC
      LIMIT 10
    `);

    res.json(
      result.rows.map((row: any) => ({
        userId: Number(row.userId),
        storeName: row.storeName || "Unknown",
        revenue: Number(row.revenue),
        salesCount: Number(row.salesCount),
        businessType: row.businessType || null,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Top stores error");
    res.status(500).json({ error: "Failed to load top stores" });
  }
});

router.get("/admin/stores", requireAuth, async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        u.id as "userId",
        COALESCE(s.store_name, u.name) as "storeName",
        u.name as "ownerName",
        u.email as "ownerEmail",
        s.business_type as "businessType",
        s.currency,
        COALESCE(rev.revenue, 0) as revenue,
        COALESCE(rev.sales_count, 0) as "salesCount",
        COALESCE(prod.product_count, 0) as "productCount",
        u.is_banned as "isBanned"
      FROM users u
      LEFT JOIN settings s ON s.user_id = u.id
      LEFT JOIN (
        SELECT user_id, SUM(total) as revenue, COUNT(*) as sales_count FROM sales GROUP BY user_id
      ) rev ON rev.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as product_count FROM products GROUP BY user_id
      ) prod ON prod.user_id = u.id
      ORDER BY revenue DESC
    `);

    res.json(
      result.rows.map((row: any) => ({
        userId: Number(row.userId),
        storeName: row.storeName || "Unknown",
        ownerName: row.ownerName || "",
        ownerEmail: row.ownerEmail || "",
        businessType: row.businessType || null,
        currency: row.currency || null,
        revenue: Number(row.revenue),
        salesCount: Number(row.salesCount),
        productCount: Number(row.productCount),
        isBanned: row.isBanned ?? false,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Stores error");
    res.status(500).json({ error: "Failed to load stores" });
  }
});

router.get("/admin/stores/:userId", requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const [storeResult, productsResult, salesResult, expensesResult, aiResult] =
      await Promise.all([
        db.execute(sql`
          SELECT
            u.id as "userId",
            COALESCE(s.store_name, u.name) as "storeName",
            u.name as "ownerName",
            u.email as "ownerEmail",
            s.business_type as "businessType",
            s.currency,
            COALESCE(rev.revenue, 0) as revenue,
            COALESCE(rev.sales_count, 0) as "salesCount",
            COALESCE(prod.product_count, 0) as "productCount",
            u.is_banned as "isBanned"
          FROM users u
          LEFT JOIN settings s ON s.user_id = u.id
          LEFT JOIN (
            SELECT user_id, SUM(total) as revenue, COUNT(*) as sales_count FROM sales GROUP BY user_id
          ) rev ON rev.user_id = u.id
          LEFT JOIN (
            SELECT user_id, COUNT(*) as product_count FROM products GROUP BY user_id
          ) prod ON prod.user_id = u.id
          WHERE u.id = ${userId}
          LIMIT 1
        `),
        db.execute(
          sql`SELECT id, name, price, category, stock FROM products WHERE user_id = ${userId} ORDER BY name LIMIT 100`
        ),
        db.execute(
          sql`SELECT id, total, payment_method as "paymentMethod", created_at as "createdAt", COALESCE(jsonb_array_length(items::jsonb), 0) as "itemCount" FROM sales WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 50`
        ),
        db.execute(
          sql`SELECT id, description, amount, created_at as "createdAt" FROM expenses WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 50`
        ),
        db.execute(
          sql`SELECT COUNT(*) as count FROM ai_memories WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = ${userId} LIMIT 1)`
        ),
      ]);

    const storeRow = storeResult.rows[0] as any;
    if (!storeRow) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    res.json({
      store: {
        userId: Number(storeRow.userId),
        storeName: storeRow.storeName || "Unknown",
        ownerName: storeRow.ownerName || "",
        ownerEmail: storeRow.ownerEmail || "",
        businessType: storeRow.businessType || null,
        currency: storeRow.currency || null,
        revenue: Number(storeRow.revenue),
        salesCount: Number(storeRow.salesCount),
        productCount: Number(storeRow.productCount),
        isBanned: storeRow.isBanned ?? false,
      },
      products: productsResult.rows.map((p: any) => ({
        id: Number(p.id),
        name: p.name,
        price: p.price != null ? Number(p.price) : null,
        category: p.category || null,
        stock: p.stock != null ? Number(p.stock) : null,
      })),
      sales: salesResult.rows.map((s: any) => ({
        id: Number(s.id),
        total: s.total != null ? Number(s.total) : null,
        paymentMethod: s.paymentMethod || null,
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt || null,
        itemCount: Number(s.itemCount),
      })),
      expenses: expensesResult.rows.map((e: any) => ({
        id: Number(e.id),
        description: e.description || null,
        amount: e.amount != null ? Number(e.amount) : null,
        createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt || null,
      })),
      aiMemoryCount: Number((aiResult.rows[0] as any)?.count ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "Store detail error");
    res.status(500).json({ error: "Failed to load store detail" });
  }
});

router.get("/admin/ai-usage", requireAuth, async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        u.id as "userId",
        u.tenant_id as "tenantId",
        COALESCE(s.store_name, u.name) as "storeName",
        COALESCE(mem.count, 0) as "memoryCount",
        mem.last_activity as "lastActivity"
      FROM users u
      LEFT JOIN settings s ON s.user_id = u.id
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) as count, MAX(created_at) as last_activity
        FROM ai_memories
        GROUP BY tenant_id
      ) mem ON mem.tenant_id = u.tenant_id
      ORDER BY mem.count DESC NULLS LAST
    `);

    res.json(
      result.rows.map((row: any) => ({
        userId: Number(row.userId),
        tenantId: row.tenantId || null,
        storeName: row.storeName || "Unknown",
        memoryCount: Number(row.memoryCount),
        lastActivity:
          row.lastActivity instanceof Date
            ? row.lastActivity.toISOString()
            : row.lastActivity || null,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "AI usage error");
    res.status(500).json({ error: "Failed to load AI usage" });
  }
});

export default router;
