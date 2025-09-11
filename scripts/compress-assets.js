#!/usr/bin/env node

// Simple asset compression script for production
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = path.join(__dirname, '../public');
const distDir = path.join(__dirname, '../dist');

console.log('🗜️  Compressing assets...');

// Compress images using imagemin if available
try {
  // Check if imagemin is available
  execSync('npx imagemin --version', { stdio: 'ignore' });
  
  console.log('📸 Compressing images...');
  
  // Compress costume images
  const costumeDir = path.join(publicDir, 'img/costumes');
  if (fs.existsSync(costumeDir)) {
    execSync(`npx imagemin "${costumeDir}/*.png" --out-dir="${distDir}/img/costumes" --plugin=pngquant`, { stdio: 'inherit' });
  }
  
  // Compress other images
  execSync(`npx imagemin "${publicDir}/img/*.jpg" --out-dir="${distDir}/img" --plugin=mozjpeg`, { stdio: 'inherit' });
  
  console.log('✅ Images compressed successfully');
} catch (error) {
  console.log('⚠️  Image compression skipped (imagemin not available)');
}

// Compress videos using ffmpeg if available
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
  
  console.log('🎥 Compressing videos...');
  
  const videos = ['hero.mp4', 'costumeWalk.mp4', 'pongCupsTrophy.mp4', 'twistedTailsFood.mp4'];
  
  videos.forEach(video => {
    const inputPath = path.join(publicDir, video);
    const outputPath = path.join(distDir, video);
    
    if (fs.existsSync(inputPath)) {
      try {
        execSync(`ffmpeg -i "${inputPath}" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 128k "${outputPath}"`, { stdio: 'inherit' });
        console.log(`✅ Compressed ${video}`);
      } catch (error) {
        console.log(`⚠️  Failed to compress ${video}, copying original`);
        fs.copyFileSync(inputPath, outputPath);
      }
    }
  });
  
  console.log('✅ Videos compressed successfully');
} catch (error) {
  console.log('⚠️  Video compression skipped (ffmpeg not available)');
}

console.log('🎉 Asset compression complete!');
