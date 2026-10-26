import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SESSION = 'MockSession1234';

// Stands in for trust-check.js: renders a button that "completes" the check.
const FAKE_WIDGET = `
(function () {
  var widgets = {};
  var n = 0;
  window.Polyguard = window.Polyguard || {};
  window.Polyguard.TrustCheck = {
    render: function (container, opts) {
      var el = typeof container === 'string' ? document.querySelector(container) : container;
      var id = 'w' + (++n);
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Mock Trust Check';
      button.addEventListener('click', function () {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'pg-trust-check-response';
        input.value = '${SESSION}';
        el.appendChild(input);
        opts.callback && opts.callback('${SESSION}');
      });
      el.appendChild(button);
      widgets[id] = { el: el, button: button };
      return id;
    },
    reset: function (id) {
      var w = widgets[id];
      if (!w) return;
      w.el.querySelectorAll('input[name="pg-trust-check-response"]').forEach(function (i) { i.remove(); });
    },
    remove: function (id) {
      var w = widgets[id];
      if (w) { w.button.remove(); delete widgets[id]; }
    },
    getResponse: function () { return ''; },
    ready: function (fn) { fn(); },
  };
  var onload = new URL(document.currentScript.src).searchParams.get('onload');
  if (onload && typeof window[onload] === 'function') window[onload]();
})();
`;

const VERIFIED = {
  verified: true,
  hostname_matched: true,
  expected_hostname: ['localhost'],
  siteverify: { success: true, hostname: 'localhost', score: 'PASS', 'error-codes': [] },
};

async function mockWidget(page: Page) {
  await page.route(/trust-check\.js/, (route) =>
    route.fulfill({ contentType: 'application/javascript', body: FAKE_WIDGET }),
  );
}

test('hero shows the siteverify result after the Trust Check callback', async ({ page }) => {
  await mockWidget(page);
  let posted: string | null = null;
  await page.route('**/api/submit', async (route) => {
    posted = route.request().postData();
    await route.fulfill({ json: VERIFIED });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    "The only way to be sure an agent didn't fill in your form.",
  );

  const hero = page.locator('#demo');
  const container = hero.locator('.pg-trust-check');
  await expect(container).toHaveCount(1);
  await expect(hero.getByTestId('submit-result')).toHaveCount(0);
  await expect(hero.getByTestId('submit-placeholder')).toHaveCount(1);

  await container.getByRole('button', { name: 'Mock Trust Check' }).click();
  await expect(hero.getByTestId('submit-outcome')).toContainText('Verified');
  await expect(hero.getByTestId('submit-result')).toContainText('"score": "PASS"');
  expect(posted).toContain(SESSION);

  // The widget keeps its verified state until the visitor asks for another check.
  await expect(container.locator('input[name="pg-trust-check-response"]')).toHaveCount(1);
  await hero.getByRole('button', { name: 'Run another check' }).click();
  await expect(hero.getByTestId('submit-result')).toHaveCount(0);
  await expect(container.locator('input[name="pg-trust-check-response"]')).toHaveCount(0);
});

test('one page: nav anchors, sections and the agent instructions', async ({ page, request }) => {
  await mockWidget(page);
  await page.goto('/');
  for (const id of ['how', 'examples', 'migrate', 'claim']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
    await expect(page.locator(`header a[href="#${id}"]`)).toHaveCount(1);
  }
  await expect(
    page.getByRole('button', { name: 'Copy setup prompt for your agent' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'https://postcaptcha.com/llms.txt' }),
  ).toHaveAttribute('href', '/llms.txt');
  await expect(page.locator('footer a[href="https://trust.polyguard.ai"]')).toHaveText('Security');
  const res = await request.get('/llms.txt');
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('/v2/siteverify');
});

test('old page paths redirect to the landing page sections', async ({ request }) => {
  for (const [path, target] of [
    ['/demo', '/#demo'],
    ['/claim', '/#claim'],
    ['/migrate/recaptcha', '/#migrate'],
    ['/migrate/turnstile', '/#migrate'],
  ]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(307);
    expect(res.headers()['location'], path).toBe(target);
  }
});

test('claim file is served as JSON', async ({ request }) => {
  const res = await request.get('/.well-known/polyguard.json');
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.site_verification).toHaveProperty(['postcaptcha.com']);
});

test('/api/submit rejects a missing response without calling siteverify', async ({ request }) => {
  const res = await request.post('/api/submit', { form: { name: 'x' } });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.verified).toBe(false);
  expect(body.siteverify['error-codes']).toEqual(['missing-input-response']);
});

test('agent and crawler files are served', async ({ request }) => {
  const llms = await request.get('/llms.txt');
  expect(llms.headers()['content-type']).toContain('text/plain');
  expect(llms.headers()['access-control-allow-origin']).toBe('*');
  expect(await llms.text()).toMatch(/^# postcaptcha/);

  const full = await request.get('/llms-full.txt');
  expect(full.status()).toBe(200);
  expect(full.headers()['access-control-allow-origin']).toBe('*');
  const fullText = await full.text();
  expect(fullText).toContain('## Example source');
  expect(fullText).toContain('def require_trust_check');
  expect(fullText.trimEnd()).toMatch(/## Optional\n[\s\S]*Claim instructions[^\n]*$/);

  const robots = await request.get('/robots.txt');
  const robotsText = await robots.text();
  expect(robotsText).toContain('User-Agent: GPTBot');
  expect(robotsText).toContain('Sitemap: https://postcaptcha.com/sitemap.xml');

  const sitemap = await request.get('/sitemap.xml');
  expect(await sitemap.text()).toContain('https://postcaptcha.com/llms-full.txt');
});

test('page has JSON-LD for the product and the FAQ', async ({ page }) => {
  await mockWidget(page);
  await page.goto('/');
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const types = JSON.parse(raw ?? '{}')['@graph'].map((n: { '@type': string }) => n['@type']);
  expect(types).toEqual(['Organization', 'WebSite', 'SoftwareApplication', 'FAQPage']);
  await expect(
    page.locator('link[rel="alternate"][href="https://postcaptcha.com/llms.txt"]'),
  ).toHaveCount(1);
});

test('shadcn registry items match the files in examples/', async ({ request }) => {
  const index = await request.get('/r/registry.json');
  expect(index.status()).toBe(200);
  expect(index.headers()['access-control-allow-origin']).toBe('*');
  const registry = await index.json();
  expect(registry.items.map((i: { name: string }) => i.name)).toEqual([
    'trust-check',
    'trust-check-verify',
  ]);

  const example = (file: string) => readFileSync(join(process.cwd(), 'examples', file), 'utf8');
  type File = { path: string; type: string; target?: string; content: string };

  const res = await request.get('/r/trust-check.json');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('application/json');
  const item = await res.json();
  expect(item.$schema).toBe('https://ui.shadcn.com/schema/registry-item.json');
  expect(item.name).toBe('trust-check');
  const files: File[] = item.files;
  expect(files.map((f) => [f.path, f.type])).toEqual([
    ['registry/components/trust-check/TrustCheck.tsx', 'registry:component'],
    ['registry/components/trust-check/usePolyguardTrustCheck.ts', 'registry:component'],
  ]);
  expect(files[0].content).toBe(example('react/TrustCheck.tsx'));
  expect(files[1].content).toBe(example('react/usePolyguardTrustCheck.ts'));

  const verify = await (await request.get('/r/trust-check-verify.json')).json();
  const [lib, route]: File[] = verify.files;
  expect(lib.path).toBe('registry/lib/trust-check.ts');
  expect(lib.content).toBe(example('nextjs/trust-check.ts'));
  expect(route.target).toBe('app/api/trust-check/verify/route.ts');
  expect(route.content).toBe(
    example('nextjs/route.ts').replace("from './trust-check'", "from '@/lib/trust-check'"),
  );

  expect((await request.get('/r/unknown.json')).status()).toBe(404);
});
