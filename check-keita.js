const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hdiykdodruimphunpwjf.supabase.co';
const supabaseKey = 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
  const { data, error } = await supabase.from('products').select('*, store:shops(*), images:product_images(*)');
  if (error) {
    console.error('Error fetching products:', error);
  } else {
    console.log(`Found ${data.length} products total`);
    const noImages = data.filter(p => !p.images || p.images.length === 0);
    console.log(`${noImages.length} products have NO images`);
    noImages.forEach(p => console.log(` - ${p.name} (Shop: ${p.store?.name})`));

    const weirdImages = data.filter(p => p.images && p.images.some(img => !img.image_url.startsWith('http')));
    console.log(`${weirdImages.length} products have WEIRD image URLs`);
    weirdImages.forEach(p => p.images.forEach(img => {
      if (!img.image_url.startsWith('http')) console.log(` - ${p.name} URL: ${img.image_url}`);
    }));
  }
}

checkAll();
