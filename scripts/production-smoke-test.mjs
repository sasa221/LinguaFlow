const base = (process.argv[2] || 'https://lingua-flow-opal.vercel.app').replace(/\/$/, '');

const tests = [
  ['GET', '/api/health', null],
  ['POST', '/api/chat', {
    language: 'English',
    nativeLanguage: 'Egyptian Arabic',
    level: 'A1',
    scenario: { partnerRole: 'Friendly Local', setting: 'First meeting', role: 'Learner' },
    messages: [],
    userMessage: 'fine and yoy'
  }],
  ['POST', '/api/placement/evaluate', {
    language: 'English',
    nativeLanguage: 'Egyptian Arabic',
    answers: [{ question: 'Introduce yourself', answer: 'My name is Mohamed.' }]
  }]
];

let failed = 0;
for (const [method, path, body] of tests) {
  const res = await fetch(base + path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  console.log(`${method} ${path} -> ${res.status}`);
  console.log(text.slice(0, 500));
  if (!res.ok) failed++;
}
process.exitCode = failed ? 1 : 0;
