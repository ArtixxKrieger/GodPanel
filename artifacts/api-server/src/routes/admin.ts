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
      newSignupsResult,
      newSignupsPrevWeekResult,
      bannedUsersResult,
      platformRevenueResult,
      revenueThisMonthResult,
      revenueLastMonthResult,
      activeSubscriptionsResult,
      freeUsersResult,
      pendingPaymentsResult,
      totalPosRevenueResult,
      totalPosSalesResult,
      activeStoresResult,
      recentSignupsResult,
      subscriptionBreakdownResult,
    ] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM users`),
      db.execute(sql`SELECT COUNT(*) as count FROM users WHERE created_at::timestamptz >= NOW() - INTERVAL '7 days'`),
      db.execute(sql`SELECT COUNT(*) as count FROM users WHERE created_at::timestamptz >= NOW() - INTERVAL '14 days' AND created_at::timestamptz < NOW() - INTERVAL '7 days'`),
      db.execute(sql`SELECT COUNT(*) as count FROM users WHERE is_banned = true`),
      db.execute(sql`SELECT COALESCE(SUM(amount), 0) as sum FROM subscription_payments WHERE status = 'paid'`),
      db.execute(sql`SELECT COALESCE(SUM(amount), 0) as sum FROM subscription_payments WHERE status = 'paid' AND paid_at::timestamptz >= DATE_TRUNC('month', NOW())`),
      db.execute(sql`SELECT COALESCE(SUM(amount), 0) as sum FROM subscription_payments WHERE status = 'paid' AND paid_at::timestamptz >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND paid_at::timestamptz < DATE_TRUNC('month', NOW())`),
      db.execute(sql`SELECT COUNT(*) as count FROM tenant_subscriptions WHERE plan != 'free' AND status = 'active'`),
      db.execute(sql`SELECT COUNT(*) as count FROM tenant_subscriptions WHERE plan = 'free'`),
      db.execute(sql`SELECT COUNT(*) as count FROM subscription_payments WHERE status = 'pending'`),
      db.execute(sql`SELECT COALESCE(SUM(CAST(total AS NUMERIC)), 0) as sum FROM sales`),
      db.execute(sql`SELECT COUNT(*) as count FROM sales`),
      db.execute(sql`SELECT COUNT(DISTINCT user_id) as count FROM sales WHERE created_at::timestamptz >= NOW() - INTERVAL '30 days'`),
      db.execute(sql`
        SELECT u.id, u.name, u.email, u.created_at,
               COALESCE(s.store_name, u.name) as "storeName",
               ts.plan
        FROM users u
        LEFT JOIN user_settings s ON s.user_id = u.id
        LEFT JOIN tenant_subscriptions ts ON ts.tenant_id = u.tenant_id
        ORDER BY u.created_at::timestamptz DESC
        LIMIT 5
      `),
      db.execute(sql`
        SELECT plan, COUNT(*) as count
        FROM tenant_subscriptions
        WHERE status = 'active'
        GROUP BY plan
      `),
    ]);

    const thisMonthRev = Number((revenueThisMonthResult.rows[0] as any)?.sum ?? 0);
    const lastMonthRev = Number((revenueLastMonthResult.rows[0] as any)?.sum ?? 0);
    const thisWeekSignups = Number((newSignupsResult.rows[0] as any)?.count ?? 0);
    const prevWeekSignups = Number((newSignupsPrevWeekResult.rows[0] as any)?.count ?? 0);

    res.json({
      totalUsers: Number((totalUsersResult.rows[0] as any)?.count ?? 0),
      newSignupsThisWeek: thisWeekSignups,
      newSignupsPrevWeek: prevWeekSignups,
      bannedUsers: Number((bannedUsersResult.rows[0] as any)?.count ?? 0),
      platformRevenue: Number((platformRevenueResult.rows[0] as any)?.sum ?? 0),
      revenueThisMonth: thisMonthRev,
      revenueLastMonth: lastMonthRev,
      activeSubscriptions: Number((activeSubscriptionsResult.rows[0] as any)?.count ?? 0),
      freeUsers: Number((freeUsersResult.rows[0] as any)?.count ?? 0),
      pendingPayments: Number((pendingPaymentsResult.rows[0] as any)?.count ?? 0),
      totalPosRevenue: Number((totalPosRevenueResult.rows[0] as any)?.sum ?? 0),
      totalPosSales: Number((totalPosSalesResult.rows[0] as any)?.count ?? 0),
      activeStores: Number((activeStoresResult.rows[0] as any)?.count ?? 0),
      recentSignups: (recentSignupsResult.rows as any[]).map(r => ({
        id: r.id,
        name: r.name || "",
        email: r.email || "",
        storeName: r.storeName || "",
        plan: r.plan || "free",
        createdAt: r.created_at || null,
      })),
      subscriptionBreakdown: (subscriptionBreakdownResult.rows as any[]).map(r => ({
        plan: r.plan,
        count: Number(r.count),
      })),
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
        ts.plan,
        COALESCE(rev.total, 0) as "revenueTotal",
        (SELECT MAX(sa.created_at::timestamptz) FROM sales sa WHERE sa.user_id = u.id) as "lastActive"
      FROM users u
      LEFT JOIN user_settings s ON s.user_id = u.id
      LEFT JOIN tenant_subscriptions ts ON ts.tenant_id = u.tenant_id
      LEFT JOIN (
        SELECT user_id, SUM(CAST(total AS NUMERIC)) as total FROM sales GROUP BY user_id
      ) rev ON rev.user_id = u.id
      WHERE ${whereClause}
      ORDER BY u.created_at::timestamptz DESC
    `);

    res.json(result.rows);
  } catch (err) {
    req.log.error({ err }, "Users error");
    res.status(500).json({ error: "Failed to load users" });
  }
});

router.get("/admin/users/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const [profileResult, subscriptionsResult, salesSummaryResult, expensesSummaryResult] = await Promise.all([
      db.execute(sql`
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
          s.currency,
          ts.plan,
          ts.status as "subscriptionStatus",
          COALESCE(rev.total, 0) as "revenueTotal",
          COALESCE(rev.sales_count, 0) as "salesCount",
          COALESCE(prod.product_count, 0) as "productCount",
          COALESCE(ai.count, 0) as "aiMemoryCount"
        FROM users u
        LEFT JOIN user_settings s ON s.user_id = u.id
        LEFT JOIN tenant_subscriptions ts ON ts.tenant_id = u.tenant_id
        LEFT JOIN (
          SELECT user_id, SUM(CAST(total AS NUMERIC)) as total, COUNT(*) as sales_count FROM sales GROUP BY user_id
        ) rev ON rev.user_id = u.id
        LEFT JOIN (
          SELECT user_id, COUNT(*) as product_count FROM products GROUP BY user_id
        ) prod ON prod.user_id = u.id
        LEFT JOIN (
          SELECT tenant_id, COUNT(*) as count FROM ai_memories GROUP BY tenant_id
        ) ai ON ai.tenant_id = u.tenant_id
        WHERE u.id = ${userId}
        LIMIT 1
      `),
      db.execute(sql`
        SELECT
          sp.id,
          sp.amount,
          sp.status,
          sp.plan,
          sp.created_at as "createdAt",
          sp.paid_at as "paidAt"
        FROM subscription_payments sp
        JOIN users u ON u.tenant_id = sp.tenant_id
        WHERE u.id = ${userId}
        ORDER BY sp.created_at::timestamptz DESC
        LIMIT 20
      `),
      db.execute(sql`
        SELECT
          DATE_TRUNC('month', created_at::timestamptz) as month,
          COUNT(*) as sales,
          SUM(CAST(total AS NUMERIC)) as revenue
        FROM sales
        WHERE user_id = ${userId}
        GROUP BY 1
        ORDER BY 1 DESC
        LIMIT 6
      `),
      db.execute(sql`
        SELECT COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as total
        FROM expenses
        WHERE user_id = ${userId}
      `),
    ]);

    const profile = profileResult.rows[0] as any;
    if (!profile) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      user: {
        id: profile.id,
        name: profile.name || "",
        email: profile.email || "",
        role: profile.role || "user",
        tenantId: profile.tenantId || null,
        isBanned: profile.isBanned ?? false,
        createdAt: profile.createdAt || null,
        storeName: profile.storeName || null,
        businessType: profile.businessType || null,
        currency: profile.currency || null,
        plan: profile.plan || "free",
        subscriptionStatus: profile.subscriptionStatus || null,
        revenueTotal: Number(profile.revenueTotal),
        salesCount: Number(profile.salesCount),
        productCount: Number(profile.productCount),
        aiMemoryCount: Number(profile.aiMemoryCount),
        totalExpenses: Number((expensesSummaryResult.rows[0] as any)?.total ?? 0),
      },
      subscriptionHistory: (subscriptionsResult.rows as any[]).map(r => ({
        id: r.id,
        amount: Number(r.amount),
        status: r.status,
        plan: r.plan,
        createdAt: r.createdAt || null,
        paidAt: r.paidAt || null,
      })),
      monthlySales: (salesSummaryResult.rows as any[]).map(r => ({
        month: r.month instanceof Date ? r.month.toISOString().slice(0, 7) : String(r.month).slice(0, 7),
        sales: Number(r.sales),
        revenue: Number(r.revenue),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "User detail error");
    res.status(500).json({ error: "Failed to load user detail" });
  }
});

router.post("/admin/users/:userId/ban", requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    await db.execute(sql`UPDATE users SET is_banned = true WHERE id = ${userId}`);
    res.json({ success: true, message: "User banned successfully" });
  } catch (err) {
    req.log.error({ err }, "Ban user error");
    res.status(500).json({ error: "Failed to ban user" });
  }
});

router.post("/admin/users/:userId/unban", requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
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
        DATE(created_at::timestamptz) as date,
        COALESCE(SUM(CAST(total AS NUMERIC)), 0) as revenue,
        COUNT(*) as sales
      FROM sales
      WHERE created_at::timestamptz >= NOW() - INTERVAL ${sql.raw(`'${interval}'`)}
      GROUP BY DATE(created_at::timestamptz)
      ORDER BY DATE(created_at::timestamptz) ASC
    `);

    const totalResult = await db.execute(sql`
      SELECT
        COALESCE(SUM(CAST(total AS NUMERIC)), 0) as "totalRevenue",
        COUNT(*) as "totalSales",
        CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(CAST(total AS NUMERIC)), 0) / COUNT(*) ELSE 0 END as "averageOrderValue"
      FROM sales
      WHERE created_at::timestamptz >= NOW() - INTERVAL ${sql.raw(`'${interval}'`)}
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
        COALESCE(SUM(CAST(sa.total AS NUMERIC)), 0) as revenue,
        COUNT(sa.id) as "salesCount",
        s.business_type as "businessType"
      FROM users u
      LEFT JOIN sales sa ON sa.user_id = u.id
      LEFT JOIN user_settings s ON s.user_id = u.id
      GROUP BY u.id, s.store_name, u.name, s.business_type
      ORDER BY revenue DESC
      LIMIT 10
    `);

    res.json(
      result.rows.map((row: any) => ({
        userId: row.userId,
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

router.get("/admin/subscriptions", requireAuth, async (req, res) => {
  try {
    const { status, search } = req.query as { status?: string; search?: string };

    let whereClause = sql`1=1`;
    if (status && status !== "all") {
      whereClause = sql`${whereClause} AND sp.status = ${status}`;
    }
    if (search) {
      whereClause = sql`${whereClause} AND (u.name ILIKE ${"%" + search + "%"} OR u.email ILIKE ${"%" + search + "%"})`;
    }

    const result = await db.execute(sql`
      SELECT
        sp.id,
        sp.tenant_id as "tenantId",
        sp.amount,
        sp.status,
        sp.plan,
        sp.created_at as "createdAt",
        sp.paid_at as "paidAt",
        u.id as "userId",
        u.name as "userName",
        u.email as "userEmail",
        COALESCE(s.store_name, u.name) as "storeName"
      FROM subscription_payments sp
      LEFT JOIN users u ON u.tenant_id = sp.tenant_id
      LEFT JOIN user_settings s ON s.user_id = u.id
      WHERE ${whereClause}
      ORDER BY sp.created_at::timestamptz DESC
    `);

    const totalsResult = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'paid') as paid_count,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) as total_collected,
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as total_pending
      FROM subscription_payments
    `);

    const t = totalsResult.rows[0] as any;

    res.json({
      payments: result.rows.map((row: any) => ({
        id: row.id,
        tenantId: row.tenantId || null,
        userId: row.userId || null,
        userName: row.userName || null,
        userEmail: row.userEmail || null,
        storeName: row.storeName || null,
        amount: Number(row.amount),
        status: row.status,
        plan: row.plan,
        createdAt: row.createdAt || null,
        paidAt: row.paidAt || null,
      })),
      summary: {
        paidCount: Number(t?.paid_count ?? 0),
        pendingCount: Number(t?.pending_count ?? 0),
        failedCount: Number(t?.failed_count ?? 0),
        totalCollected: Number(t?.total_collected ?? 0),
        totalPending: Number(t?.total_pending ?? 0),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Subscriptions error");
    res.status(500).json({ error: "Failed to load subscriptions" });
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
      LEFT JOIN user_settings s ON s.user_id = u.id
      LEFT JOIN (
        SELECT user_id, SUM(CAST(total AS NUMERIC)) as revenue, COUNT(*) as sales_count FROM sales GROUP BY user_id
      ) rev ON rev.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as product_count FROM products GROUP BY user_id
      ) prod ON prod.user_id = u.id
      ORDER BY revenue DESC
    `);

    res.json(
      result.rows.map((row: any) => ({
        userId: row.userId,
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
    const userId = req.params.userId;

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
          LEFT JOIN user_settings s ON s.user_id = u.id
          LEFT JOIN (
            SELECT user_id, SUM(CAST(total AS NUMERIC)) as revenue, COUNT(*) as sales_count FROM sales GROUP BY user_id
          ) rev ON rev.user_id = u.id
          LEFT JOIN (
            SELECT user_id, COUNT(*) as product_count FROM products GROUP BY user_id
          ) prod ON prod.user_id = u.id
          WHERE u.id = ${userId}
          LIMIT 1
        `),
        db.execute(
          sql`SELECT id, name, CAST(price AS NUMERIC) as price, category, stock FROM products WHERE user_id = ${userId} ORDER BY name LIMIT 100`
        ),
        db.execute(
          sql`SELECT id, CAST(total AS NUMERIC) as total, payment_method as "paymentMethod", created_at as "createdAt", COALESCE(jsonb_array_length(items::jsonb), 0) as "itemCount" FROM sales WHERE user_id = ${userId} ORDER BY created_at::timestamptz DESC LIMIT 50`
        ),
        db.execute(
          sql`SELECT id, description, CAST(amount AS NUMERIC) as amount, created_at as "createdAt" FROM expenses WHERE user_id = ${userId} ORDER BY created_at::timestamptz DESC LIMIT 50`
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
        userId: storeRow.userId,
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
        createdAt: s.createdAt || null,
        itemCount: Number(s.itemCount),
      })),
      expenses: expensesResult.rows.map((e: any) => ({
        id: Number(e.id),
        description: e.description || null,
        amount: e.amount != null ? Number(e.amount) : null,
        createdAt: e.createdAt || null,
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
      LEFT JOIN user_settings s ON s.user_id = u.id
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) as count, MAX(created_at::timestamptz) as last_activity
        FROM ai_memories
        GROUP BY tenant_id
      ) mem ON mem.tenant_id = u.tenant_id
      ORDER BY mem.count DESC NULLS LAST
    `);

    res.json(
      result.rows.map((row: any) => ({
        userId: row.userId,
        tenantId: row.tenantId || null,
        storeName: row.storeName || "Unknown",
        memoryCount: Number(row.memoryCount),
        lastActivity: row.lastActivity instanceof Date
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
