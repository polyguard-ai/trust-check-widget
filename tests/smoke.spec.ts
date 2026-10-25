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
