import { Hono } from "hono";
const router = new Hono();
import * as ctrl from "../controllers/marketController.js";
import { resolveExpiredMarkets } from "../cron/marketResolver.js";

router.post('/vote', async (c) => {
  let statusCode = 200;
  const req = {
    body: await c.req.json().catch(()=>({})),
    params: c.req.param(),
    query: c.req.query(),
    headers: c.req.header(),
  };
  const res = {
    status: (code) => { statusCode = code; return res; },
    json: (data) => c.json(data, statusCode)
  };
  return await ctrl.vote(req, res);
});
router.post('/resolve', async (c) => {
  let statusCode = 200;
  const req = {
    body: await c.req.json().catch(()=>({})),
    params: c.req.param(),
    query: c.req.query(),
    headers: c.req.header(),
  };
  const res = {
    status: (code) => { statusCode = code; return res; },
    json: (data) => c.json(data, statusCode)
  };
  return await ctrl.resolveMarket(req, res);
});
router.post('/create', async (c) => {
  let statusCode = 200;
  const req = {
    body: await c.req.json().catch(()=>({})),
    params: c.req.param(),
    query: c.req.query(),
    headers: c.req.header(),
  };
  const res = {
    status: (code) => { statusCode = code; return res; },
    json: (data) => c.json(data, statusCode)
  };
  return await ctrl.createMarket(req, res);
});
router.get('/activity', async (c) => {
  let statusCode = 200;
  const req = {
    body: {},
    params: c.req.param(),
    query: c.req.query(),
    headers: c.req.header(),
  };
  const res = {
    status: (code) => { statusCode = code; return res; },
    json: (data) => c.json(data, statusCode)
  };
  return await ctrl.getActivityFeed(req, res);
});
router.get('/debug-expired', async (c) => {
  const now = new Date().toISOString();
  const { supabase } = await import('../utils/supabase.js');
  const { data: expiredMarkets, error } = await supabase
    .from('markets')
    .select('market_id, question, description, end_date, status')
    .eq('status', 'Active')
    .lt('end_date', now);
  return c.json({ expiredMarkets, error }, 200);
});

router.get('/force-resolve-local', async (c) => {
  await resolveExpiredMarkets();
  return c.json({ success: true, message: "Forced resolution triggered locally" }, 200);
});

router.get('/check-one', async (c) => {
  const { supabase } = await import('../utils/supabase.js');
  const { data } = await supabase.from('markets').select('market_id, status, winning_outcome').limit(3);
  return c.json({ data }, 200);
});

export default router;
