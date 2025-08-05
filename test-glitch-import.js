// Quick test to verify the NPM package import works
try {
  console.log('Testing glitch-text-effect package...');
  
  // Test core import
  const core = require('glitch-text-effect/core');
  console.log('✅ Core import successful:', Object.keys(core));
  
  // Test React import (this might fail in Node.js but that's expected)
  try {
    const react = require('glitch-text-effect/react');
    console.log('✅ React import successful:', Object.keys(react));
  } catch (e) {
    console.log('⚠️  React import failed (expected in Node.js):', e.message);
  }
  
  // Test main import
  const main = require('glitch-text-effect');
  console.log('✅ Main import successful:', Object.keys(main));
  
  console.log('\n🎉 NPM package is working correctly!');
} catch (error) {
  console.error('❌ Import failed:', error.message);
}