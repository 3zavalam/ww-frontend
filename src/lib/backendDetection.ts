// Auto-detection of backend URL for mobile demos
// This allows the app to work from any network without changing Vercel config

export interface BackendInfo {
  url: string;
  available: boolean;
  responseTime?: number;
}

const POSSIBLE_BACKENDS = [
  // Environment variable (production/configured)
  import.meta.env.VITE_BACKEND_URL,
  
  // Common local IPs for mobile hotspot/home networks
  'http://192.168.1.100:5050',  // Common home router range
  'http://192.168.0.100:5050',  // Alternative home range  
  'http://192.168.43.1:5050',   // Android hotspot default
  'http://172.20.10.1:5050',    // iPhone hotspot default
  
  // Localhost (for development)
  'http://localhost:5050',
  'http://127.0.0.1:5050',
].filter(Boolean); // Remove undefined values

/**
 * Test if a backend URL is available
 */
async function testBackend(url: string): Promise<BackendInfo> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      return {
        url,
        available: true,
        responseTime: Date.now() - startTime
      };
    }
    
    return { url, available: false };
    
  } catch (error) {
    return { url, available: false };
  }
}

/**
 * Find the best available backend
 */
export async function detectBackend(): Promise<BackendInfo | null> {
  console.log('🔍 Detecting backend servers...');
  
  // Test all possible backends in parallel
  const tests = POSSIBLE_BACKENDS.map(url => testBackend(url));
  const results = await Promise.all(tests);
  
  // Find available backends
  const available = results.filter(result => result.available);
  
  if (available.length === 0) {
    console.warn('❌ No backend servers found');
    return null;
  }
  
  // Sort by response time (fastest first)
  available.sort((a, b) => (a.responseTime || 999999) - (b.responseTime || 999999));
  
  const best = available[0];
  console.log(`✅ Backend detected: ${best.url} (${best.responseTime}ms)`);
  
  return best;
}

/**
 * Get backend URL with auto-detection fallback
 */
export async function getBackendUrl(): Promise<string> {
  // Try environment variable first
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl) {
    const test = await testBackend(envUrl);
    if (test.available) {
      return envUrl;
    }
    console.warn(`⚠️  Configured backend ${envUrl} not available, trying auto-detection...`);
  }
  
  // Auto-detect if env variable doesn't work
  const detected = await detectBackend();
  if (detected) {
    return detected.url;
  }
  
  // Fallback to localhost
  console.warn('🔧 Falling back to localhost');
  return 'http://localhost:5050';
}