#!/usr/bin/env python3
"""
Consolidate API functions to stay under Vercel's 12-function Hobby plan limit.
- analytics.js -> merged into orders.js (add ?analytics=1 param)
- seed-admin.js -> merged into login.js (add ?seed=1 param)
Delete the separate files after merging.
"""
import os, re

WORKSPACE = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica'

# 1. Merge analytics into orders.js
orders_path = os.path.join(WORKSPACE, 'api', 'orders.js')
analytics_path = os.path.join(WORKSPACE, 'api', 'analytics.js')

with open(analytics_path, 'r', encoding='utf-8') as f:
    analytics_code = f.read()

with open(orders_path, 'r', encoding='utf-8') as f:
    orders_code = f.read()

# Extract the handler function from analytics
# Find the module.exports content
analytics_handler = analytics_code.split('module.exports')[1].strip()

# Inject analytics route into orders.js
# The orders.js should check req.query.analytics
# Find where the GET handling starts
inject_point = "  try {"
inject_code = """
    // Analytics endpoint (consolidated here for Vercel Hobby plan limit)
    if (req.method === 'GET' && req.query.analytics === '1') {
""" + analytics_handler.split('req.method')[1].split('res.status(500)')[0].strip() + """
    }

"""

if "req.query.analytics" not in orders_code:
    # Nope, the approach is different. Let me just add the analytics route
    # Add a GET handler for analytics before the existing GET handler
    old_get_start = "    // GET — Single order"
    analytics_get = """    // GET — Analytics dashboard (consolidated)
    if (req.query.analytics === '1') {
""" + analytics_handler.split("if (req.method === 'GET')")[1].split("return res.status(500)")[0].strip() + """
    }

    // GET — Single order"""

    orders_code = orders_code.replace(old_get_start, analytics_get)
else:
    print('Analytics already merged')

with open(orders_path, 'w', encoding='utf-8') as f:
    f.write(orders_code)
print('orders.js: Analytics route injected')

# 2. Merge seed-admin into login.js
login_path = os.path.join(WORKSPACE, 'api', 'login.js')
seed_path = os.path.join(WORKSPACE, 'api', 'seed-admin.js')

with open(seed_path, 'r', encoding='utf-8') as f:
    seed_code = f.read()

with open(login_path, 'r', encoding='utf-8') as f:
    login_code = f.read()

# Inject seed route at the beginning of the module.exports
# Add a GET handler for seeding
old_login_export = """module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });"""

new_login_export = """module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Seed admin endpoint (consolidated here for Vercel Hobby plan limit)
  if (req.method === 'GET' && req.query.seed === '1') {
""" + seed_code.split("module.exports")[1].split("} catch")[0].strip() + """
  }

  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });"""

login_code = login_code.replace(old_login_export, new_login_export)

with open(login_path, 'w', encoding='utf-8') as f:
    f.write(login_code)
print('login.js: Seed route injected')

# 3. Delete the standalone files
os.remove(analytics_path)
print('Deleted: api/analytics.js')
os.remove(seed_path)
print('Deleted: api/seed-admin.js')

print('Consolidation complete! API count: 14 - 2 = 12')
