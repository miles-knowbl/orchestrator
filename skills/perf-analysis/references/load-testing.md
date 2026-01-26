# Load Testing

Tools and techniques for performance testing under load.

## Load Test Types

| Type | Purpose | Pattern | Duration |
|------|---------|---------|----------|
| **Smoke** | Verify basics work | Minimal load | 1-2 min |
| **Load** | Normal production load | Expected users | 10-30 min |
| **Stress** | Find breaking point | Ramp until failure | Until failure |
| **Spike** | Handle traffic bursts | Sudden spike, then normal | 5-10 min |
| **Soak/Endurance** | Find memory leaks | Moderate sustained load | 2-24 hours |

## k6 Load Testing

### Installation

```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Docker
docker run -i grafana/k6 run - <script.js
```

### Basic Test

```javascript
// basic-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,           // 10 virtual users
  duration: '30s',   // Run for 30 seconds
};

export default function () {
  const res = http.get('http://localhost:3000/api/users');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);  // Wait 1 second between iterations
}
```

### Staged Load Test

```javascript
// staged-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/users');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

### Stress Test

```javascript
// stress-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Below normal load
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },   // Normal load
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },   // Around breaking point
    { duration: '5m', target: 300 },
    { duration: '2m', target: 400 },   // Beyond breaking point
    { duration: '5m', target: 400 },
    { duration: '10m', target: 0 },    // Recovery
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/api/users');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

### Spike Test

```javascript
// spike-test.js
export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Normal load
    { duration: '10s', target: 500 },  // Spike!
    { duration: '3m', target: 500 },   // Stay at spike
    { duration: '10s', target: 50 },   // Scale down
    { duration: '3m', target: 50 },    // Recovery
    { duration: '1m', target: 0 },
  ],
};
```

### Soak Test

```javascript
// soak-test.js
export const options = {
  stages: [
    { duration: '5m', target: 100 },   // Ramp up
    { duration: '4h', target: 100 },   // Sustained load for 4 hours
    { duration: '5m', target: 0 },     // Ramp down
  ],
};
```

### Realistic Scenario

```javascript
// realistic-test.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const BASE_URL = 'http://localhost:3000';

export const options = {
  scenarios: {
    browse: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      exec: 'browseProducts',
    },
    purchase: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 },
      ],
      exec: 'purchaseFlow',
    },
  },
  thresholds: {
    'http_req_duration{scenario:browse}': ['p(95)<300'],
    'http_req_duration{scenario:purchase}': ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export function browseProducts() {
  group('Browse Products', () => {
    const res = http.get(`${BASE_URL}/api/products`);
    check(res, { 'products loaded': (r) => r.status === 200 });
    
    sleep(randomItem([1, 2, 3]));
    
    const products = res.json();
    if (products.length > 0) {
      const product = randomItem(products);
      const detailRes = http.get(`${BASE_URL}/api/products/${product.id}`);
      check(detailRes, { 'product detail loaded': (r) => r.status === 200 });
    }
  });
  
  sleep(randomItem([2, 3, 4, 5]));
}

export function purchaseFlow() {
  group('Purchase Flow', () => {
    // Login
    const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    }), { headers: { 'Content-Type': 'application/json' } });
    
    check(loginRes, { 'logged in': (r) => r.status === 200 });
    
    const token = loginRes.json('token');
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    sleep(1);
    
    // Add to cart
    const cartRes = http.post(`${BASE_URL}/api/cart`, JSON.stringify({
      productId: 'prod_1',
      quantity: 1,
    }), { headers: authHeaders });
    
    check(cartRes, { 'added to cart': (r) => r.status === 200 });
    
    sleep(2);
    
    // Checkout
    const checkoutRes = http.post(`${BASE_URL}/api/checkout`, JSON.stringify({
      paymentMethod: 'card',
    }), { headers: authHeaders });
    
    check(checkoutRes, { 'checkout completed': (r) => r.status === 200 });
  });
  
  sleep(randomItem([5, 10, 15]));
}
```

### Running k6

```bash
# Run test
k6 run test.js

# With more output
k6 run --out json=results.json test.js

# Cloud execution
k6 cloud test.js

# With environment variables
k6 run -e BASE_URL=https://staging.example.com test.js
```

## Artillery

### Installation

```bash
npm install -g artillery
```

### Basic Test

```yaml
# basic-test.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"

scenarios:
  - name: "Get users"
    flow:
      - get:
          url: "/api/users"
          expect:
            - statusCode: 200
            - contentType: application/json
```

### Running Artillery

```bash
# Run test
artillery run test.yml

# With report
artillery run --output report.json test.yml
artillery report report.json
```

## Analyzing Results

### Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Response Time (p50)** | Median response time | <100ms |
| **Response Time (p95)** | 95th percentile | <500ms |
| **Response Time (p99)** | 99th percentile | <1s |
| **Throughput** | Requests per second | Depends |
| **Error Rate** | % of failed requests | <1% |
| **Concurrency** | Simultaneous users | Depends |

### k6 Output Analysis

```
          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: test.js
     output: -

  scenarios: (100.00%) 1 scenario, 100 max VUs, 10m30s max duration
           * default: Up to 100 looping VUs for 10m0s

running (10m00.0s), 000/100 VUs, 54321 complete iterations
default ✓ [======================================] 100 VUs  10m0s

     ✓ status is 200
     ✓ response time < 500ms

     checks.........................: 100.00% ✓ 108642     ✗ 0     
     data_received..................: 52 MB   87 kB/s
     data_sent......................: 6.5 MB  11 kB/s
     http_req_blocked...............: avg=1.2ms   min=0s      med=0s      max=120ms   p(95)=0s      p(99)=45ms   
     http_req_connecting............: avg=0.8ms   min=0s      med=0s      max=115ms   p(95)=0s      p(99)=42ms   
     http_req_duration..............: avg=45.2ms  min=5ms     med=35ms    max=850ms   p(95)=120ms   p(99)=250ms  
       { expected_response:true }...: avg=45.2ms  min=5ms     med=35ms    max=850ms   p(95)=120ms   p(99)=250ms  
     http_req_failed................: 0.00%   ✓ 0          ✗ 54321 
     http_req_receiving.............: avg=0.5ms   min=0s      med=0s      max=50ms    p(95)=1ms     p(99)=5ms    
     http_req_sending...............: avg=0.1ms   min=0s      med=0s      max=25ms    p(95)=0s      p(99)=1ms    
     http_req_tls_handshaking.......: avg=0s      min=0s      med=0s      max=0s      p(95)=0s      p(99)=0s     
     http_req_waiting...............: avg=44.6ms  min=5ms     med=34ms    max=845ms   p(95)=118ms   p(99)=248ms  
     http_reqs......................: 54321   90.535/s
     iteration_duration.............: avg=1.05s   min=1.01s   med=1.04s   max=1.85s   p(95)=1.12s   p(99)=1.25s  
     iterations.....................: 54321   90.535/s
     vus............................: 100     min=100      max=100 
     vus_max........................: 100     min=100      max=100 
```

### Report Template

```markdown
## Load Test Report

**Date:** 2024-01-15
**Environment:** Staging
**Duration:** 10 minutes
**Scenario:** Ramping to 100 users

### Results Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Throughput | 90 req/s | 100 req/s | ⚠️ Below target |
| p50 Response | 35ms | <100ms | ✅ Pass |
| p95 Response | 120ms | <500ms | ✅ Pass |
| p99 Response | 250ms | <1s | ✅ Pass |
| Error Rate | 0% | <1% | ✅ Pass |
| Max Concurrent | 100 | 100 | ✅ Pass |

### Observations

1. Response times remain stable up to 80 users
2. At 90+ users, p99 starts increasing
3. No errors observed
4. Database CPU reached 70% at peak

### Recommendations

1. Optimize slow database query (identified via APM)
2. Add caching for /api/products endpoint
3. Consider horizontal scaling at 80+ concurrent users

### Graphs

[Attach response time over time graph]
[Attach throughput over time graph]
[Attach error rate graph]
```

## CI/CD Integration

```yaml
# .github/workflows/load-test.yml
name: Load Test

on:
  schedule:
    - cron: '0 2 * * *'  # Nightly
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install k6
        run: |
          curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz
          sudo mv k6-v0.47.0-linux-amd64/k6 /usr/local/bin/
      
      - name: Run load test
        run: k6 run --out json=results.json tests/load/test.js
        env:
          K6_BASE_URL: ${{ secrets.STAGING_URL }}
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: k6-results
          path: results.json
      
      - name: Check thresholds
        run: |
          if grep -q '"thresholds":{".*":{"ok":false' results.json; then
            echo "Load test thresholds failed!"
            exit 1
          fi
```
