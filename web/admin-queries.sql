-- ACTIVE SUBSCRIBERS COUNT
SELECT COUNT(*) FROM subscribers WHERE active = true;

-- TOTAL SUBSCRIBERS COUNT
SELECT COUNT(*) FROM subscribers;

-- RECENT SUBSCRIBERS
SELECT email, created_at, active 
FROM subscribers 
ORDER BY created_at DESC 
LIMIT 10;

-- RECENT DIGESTS
SELECT date, content_html 
FROM digests 
ORDER BY date DESC 
LIMIT 5;
