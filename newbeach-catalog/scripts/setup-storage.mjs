import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStorage() {
  console.log('Checking storage buckets...')
  
  const { data: buckets, error: getError } = await supabase.storage.listBuckets()
  
  if (getError) {
    console.error('Error listing buckets:', getError.message)
    return
  }

  const bucketName = 'newbeach-assets'
  const exists = buckets.find(b => b.name === bucketName)

  if (!exists) {
    console.log(`Creating bucket: ${bucketName}...`)
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    })

    if (createError) {
      console.error('Error creating bucket (likely RLS):', createError.message)
      console.log('TIP: Create the bucket manually in the Supabase Dashboard named "newbeach-assets" and set it to PUBLIC.')
    } else {
      console.log('Bucket created successfully!')
    }
  } else {
    console.log(`Bucket ${bucketName} already exists.`)
  }
}

setupStorage()
