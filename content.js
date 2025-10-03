(function() {
  function getText(sel) {
    const el = document.querySelector(sel);
    return el ? el.innerText.trim() : '';
  }

  // Business name in Knowledge Panel
  const name = getText('div[role="heading"] span') || getText('h1') || '';

  // Website
  let website = '';
  const siteEl = Array.from(document.querySelectorAll('a'))
    .find(a => a.href.startsWith('http') && (a.innerText || '').toLowerCase().includes('website'));
  if (siteEl) website = siteEl.href;

  // Phones
  let phone1 = '', phone2 = '';
  const phones = Array.from(document.querySelectorAll('a[href^="tel:"]')).map(a => a.innerText.trim()).filter(p => p);
  if (phones[0]) phone1 = phones[0];
  if (phones[1]) phone2 = phones[1];

  // Email (rare in Knowledge Panel)
  let email = '';
  const mailEl = document.querySelector('a[href^="mailto:"]');
  if (mailEl) email = mailEl.href.replace('mailto:', '');

  return { name, website, phone1, phone2, email, status: name ? 'Done' : 'Failed' };
})();
