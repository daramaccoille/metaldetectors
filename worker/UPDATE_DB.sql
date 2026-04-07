-- Run this SQL to create the new table for storing metal prices
CREATE TABLE IF NOT EXISTS metal_readings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    metal text NOT NULL,
    price numeric NOT NULL,
    currency text DEFAULT 'USD',
    created_at timestamp DEFAULT now()
);
