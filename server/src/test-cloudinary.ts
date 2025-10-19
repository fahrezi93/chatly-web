// Test Cloudinary Upload
// Run this file to test if Cloudinary is working correctly

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🔧 Testing Cloudinary Configuration...\n');

console.log('Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
console.log('');

// Test 1: Check credentials
console.log('Test 1: Checking Cloudinary credentials...');
cloudinary.api.ping()
  .then((result) => {
    console.log('✅ Cloudinary connection successful!');
    console.log('Status:', result.status);
    console.log('');
    
    // Test 2: List resources in chat-app-uploads folder
    console.log('Test 2: Listing resources in chat-app-uploads folder...');
    return cloudinary.api.resources({
      type: 'upload',
      prefix: 'chat-app-uploads',
      max_results: 10
    });
  })
  .then((result) => {
    console.log(`✅ Found ${result.resources.length} files in chat-app-uploads folder`);
    
    if (result.resources.length > 0) {
      console.log('\nRecent uploads:');
      result.resources.slice(0, 5).forEach((resource: any, index: number) => {
        console.log(`${index + 1}. ${resource.public_id}`);
        console.log(`   URL: ${resource.secure_url}`);
        console.log(`   Size: ${(resource.bytes / 1024).toFixed(2)} KB`);
        console.log(`   Created: ${resource.created_at}`);
        console.log('');
      });
    } else {
      console.log('ℹ️  No files uploaded yet. Upload some files to test!');
    }
    
    console.log('🎉 All tests passed! Cloudinary is working correctly!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start your server: npm run dev');
    console.log('2. Test file upload via API: POST /api/upload');
    console.log('3. Check files in Cloudinary dashboard: https://cloudinary.com/console');
  })
  .catch((error) => {
    console.error('❌ Error testing Cloudinary:');
    console.error('Message:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('1. Check if environment variables are set correctly in .env');
    console.error('2. Verify your Cloudinary credentials at https://cloudinary.com/console');
    console.error('3. Make sure your API key and secret are correct');
    process.exit(1);
  });
