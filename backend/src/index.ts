import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
}

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Webhook route: Clerk sends user.created events here
app.post('/clerk/webhook', async (req, res) => {
  const eventType = req.body.type;

  if (eventType === 'user.created') {
    const user = req.body.data;

    console.log('Received user.created event from Clerk:', JSON.stringify(user, null, 2));

    const { id, email_addresses, phone_numbers, first_name, last_name, created_at } = user;

    const email = email_addresses?.[0]?.email_address || null;
    const phone = phone_numbers?.[0]?.phone_number || null;

    const { error } = await supabase.from('users').insert([
      {
        id,
        email,
        phone,
        first_name,
        last_name,
        created_at,
        is_approved: false, // 👈 New field to control access
      },
    ]);

    if (error) {
      console.error('❌ Error inserting user into Supabase:', error);
      return res.status(500).json({ error: 'Failed to store user in Supabase' });
    }

    return res.status(200).json({ message: '✅ User stored in Supabase successfully' });
  }

  res.status(400).json({ message: '❌ Unsupported event type' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
