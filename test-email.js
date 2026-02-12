import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mwbkntnrvurifwmgyfea.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13YmtudHJ2dXJpZndtZ3lmZWEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTY0MjQwMCwiZXhwIjoyMDUxMjE4NDAwfQ.abcdefghijklmnopqrstuvwxyz1234567890'
)

async function testEmail() {
  console.log('📧 Sending test email...')
  
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: 'biraj@gharunepal.com',
      subject: '🧪 TEST EMAIL - घरन नेपाल',
      body: 'नमस्ते बिराज जी,\n\nयो TEST EMAIL हो!\n\nधन्यवाद,\nघरन नेपाल टोली'
    }
  })

  if (error) {
    console.error('❌ Error:', error)
  } else {
    console.log('✅ Success:', data)
  }
}

testEmail()