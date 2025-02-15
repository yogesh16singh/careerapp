import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10, // Virtual users
  duration: '10s', // Test duration
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

export default function () {
  let res = http.get('http://localhost:8000/test');
  check(res, {
    'is status 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
