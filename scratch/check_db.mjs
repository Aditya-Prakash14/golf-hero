import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: charities, error } = await supabase
    .from('charities')
    .select('*')
  
  if (error) {
    console.error('Error fetching charities:', error)
  } else {
    console.log('Charities found:', charities?.length)
    console.log(JSON.stringify(charities, null, 2))
  }
}

test()
