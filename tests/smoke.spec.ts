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

async function mockWidget(page: Page) {
  await page.route(/trust-check\.js/, (route) =>
    route.fulfill({ contentType: 'application/javascript', body: FAKE_WIDGET }),
  );
}

test('landing page demo form submits after the Trust Check callback', async ({ page }) => {
  await mockWidget(page);
  let posted: string | null = null;
  await page.route('**/api/submit', async (route) => {
    posted = route.request().postData();
    await route.fulfill({
      json: {
        verified: true,
        hostname_matched: true,
        expected_hostname: ['localhost'],
        siteverify: { success: true, hostname: 'localhost', score: 'PASS', 'error-codes': [] },
      },
    });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    "The only modern way to be sure an agent didn't fill in your form.",
  );

  const form = page.locator('form#demo');
  const container = form.locator('.pg-trust-check');
  await expect(container).toHaveCount(1);

  const send = form.getByRole('button', { name: 'Send' });
  await expect(send).toBeDisabled();

  await form.getByLabel('Your name').fill('Sam Rivera');
  await form.getByLabel('Message').fill('Hello from a person');
  await container.getByRole('button', { name: 'Mock Trust Check' }).click();
  await expect(send).toBeEnabled();

  await send.click();
  await expect(form.getByTestId('submit-outcome')).toContainText('Verified');
  await expect(form.getByTestId('submit-result')).toContainText('"score": "PASS"');
  expect(posted).toContain('pg-trust-check-response');
  expect(posted).toContain(SESSION);

  // The response verifies once, so Send is disabled again.
  await expect(send).toBeDisabled();
});

for (const path of ['/demo', '/migrate/recaptcha', '/migrate/turnstile', '/claim']) {
  test(`${path} renders`, async ({ page }) => {
    await mockWidget(page);
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
}

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
