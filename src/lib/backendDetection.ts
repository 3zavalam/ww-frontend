// Auto-detection of backend URL for mobile demos
// This allows the app to work from any network without changing Vercel config

export interface BackendInfo {
  url: string;
  available: boolean;
  responseTime?: number;
}

// Generate possible backend URLs based on current network  
const generatePossibleBackends = () => {
  const backends = [];
  const isHTTPS = window.location.protocol === 'https:';
  
  // Environment variable first (if set)
  if (import.meta.env.VITE_BACKEND_URL) {
    backends.push(import.meta.env.VITE_BACKEND_URL);
  }
  
  // If we're on HTTPS, only try HTTPS backends (tunnels)
  if (isHTTPS) {
    console.log('🔒 HTTPS site detected, only trying HTTPS backends (tunnels)');
    
    // Common tunnel services
    backends.push(
      // REPLACE WITH YOUR ngrok URL:
      'https://0dcfdc2b60fa.ngrok-free.app',
      
      // Common patterns  
      'https://winner-way.ngrok.io',
      'https://tennis-demo.ngrok.io',
      'https://mac-demo.tailscale-funnel.com',
    );
  } else {
    // HTTP site - can try local IPs
    console.log('🔓 HTTP site detected, trying local network IPs');
    
    backends.push(
      'http://192.168.1.118:5050',  // Your Mac's current IP
      'http://192.168.1.1:5050',    // Router IP
      'http://192.168.0.1:5050',    // Alternative router
      'http://10.0.0.1:5050',       // Another common range
      'http://172.20.10.2:5050',    // iPhone hotspot client
      'http://192.168.43.2:5050',   // Android hotspot client
      'http://localhost:5050',
      'http://127.0.0.1:5050',
    );
  }
  
  return [...new Set(backends)]; // Remove duplicates
};

const POSSIBLE_BACKENDS = generatePossibleBackends();

/**
 * Test if a backend URL is available
 */
async function testBackend(url: string): Promise<BackendInfo> {
  const startTime = Date.now();
  
  try {
    console.log(`🧪 Testing backend: ${url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'ngrok-skip-browser-warning': 'true'  // Skip ngrok browser warning
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Backend available: ${url} (${Date.now() - startTime}ms)`);
      return {
        url,
        available: true,
        responseTime: Date.now() - startTime
      };
    }
    
    console.log(`❌ Backend failed: ${url} (status: ${response.status})`);
    return { url, available: false };
    
  } catch (error) {
    console.log(`❌ Backend error: ${url} (${error})`);
    return { url, available: false };
  }
}

/**
 * Find the best available backend
 */
export async function detectBackend(): Promise<BackendInfo | null> {
  console.log('🔍 Detecting backend servers...');
  const isHTTPS = window.location.protocol === 'https:';
  
  // Test all possible backends in parallel
  const tests = POSSIBLE_BACKENDS.map(url => testBackend(url));
  const results = await Promise.all(tests);
  
  // Find available backends
  const available = results.filter(result => result.available);
  
  if (available.length === 0) {
    if (isHTTPS) {
      console.warn('❌ No HTTPS backend servers found. You need ngrok or similar tunnel.');
      console.warn('💡 Run: ngrok http 5050 and update VITE_BACKEND_URL');
    } else {
      console.warn('❌ No backend servers found');
    }
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
  console.log('🔍 Starting backend URL detection...');
  
  // Auto-detect first (skip env variable for now as it may be wrong)
  const detected = await detectBackend();
  if (detected) {
    console.log(`🎯 Using detected backend: ${detected.url}`);
    return detected.url;
  }
  
  // Try environment variable as fallback
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl) {
    console.log(`🔧 Trying environment backend: ${envUrl}`);
    const test = await testBackend(envUrl);
    if (test.available) {
      return envUrl;
    }
    console.warn(`⚠️  Configured backend ${envUrl} not available`);
  }
  
  // Final fallback to localhost
  console.warn('🔧 Falling back to localhost (development mode)');
  return 'http://localhost:5050';
}