import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env.local')

// Manually parse .env.local because dotenv is not installed
function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found at', envPath)
    process.exit(1)
  }
  
  const content = fs.readFileSync(envPath, 'utf8')
  const env = {}
  
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      const key = match[1]
      let value = match[2] || ''
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
      env[key] = value
      process.env[key] = value
    }
  })
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('Current Env:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
  console.error('❌ Missing Supabase environment variables in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address: node scratch/make_admin.mjs your-email@example.com')
  process.exit(1)
}

async function makeAdmin() {
  console.log(`⏳ Promoting ${email} to admin...`)
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('email', email)
    .select()

  if (error) {
    console.error('❌ Error updating profile:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error(`❌ No profile found with email: ${email}. Ensure the user has signed up first.`)
    process.exit(1)
  }

  console.log(`✅ Success! ${email} is now an admin.`)
  console.log('You may need to sign out and sign back in for the changes to take effect in your session.')
}

makeAdmin()
