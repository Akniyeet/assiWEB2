const btn = document.getElementById('btn');
const statusEl = document.getElementById('status');
const userBox = document.getElementById('userBox');
const countryBox = document.getElementById('countryBox');
const newsBox = document.getElementById('newsBox');

function setStatus(text) { statusEl.textContent = text || ''; }
function clearAll() { userBox.innerHTML = ''; countryBox.innerHTML = ''; newsBox.innerHTML = ''; }
function spinnerHtml() { return `<span class="loader" aria-hidden="true"></span>`; }
function row(label, value) { return `<div class="row"><span class="label">${label}</span><span class="value">${value ?? 'N/A'}</span></div>`; }

function renderUser(user) {
  const avatar = user.picture ? `<img class="avatar" src="${user.picture}" alt="avatar" onerror="this.style.display='none'"/>` : '';
  userBox.innerHTML = `
    <div class="card">
      <div class="card-header">
        ${avatar}
        <div>
          <div class="title">${user.firstName} ${user.lastName}</div>
          <div class="muted">${user.gender}</div>
        </div>
      </div>
      <div class="grid">
        ${row('Age:', user.age)}
        ${row('Date of birth:', user.dob)}
        ${row('City:', user.city)}
        ${row('Country:', user.country)}
        ${row('Full address:', user.fullAddress)}
      </div>
    </div>
  `;
}

function renderCountry(country, rates) {
  const langs = Array.isArray(country.languages) ? country.languages.join(', ') : 'N/A';
  const flagImg = country.flag && country.flag !== 'N/A' ? `<img class="flag" src="${country.flag}" alt="flag" onerror="this.style.display='none'"/>` : '';
  const usd = (rates && typeof rates.usd === 'number') ? rates.usd.toFixed(2) : 'N/A';
  const kzt = (rates && typeof rates.kzt === 'number') ? rates.kzt.toFixed(2) : 'N/A';
  const base = rates && rates.base ? rates.base : country.currency || 'N/A';

  countryBox.innerHTML = `
    <div class="card">
      <div class="card-header">
        ${flagImg}
        <div>
          <div class="title">${country.name}</div>
          <div class="muted">Country info</div>
        </div>
      </div>
      <div class="grid">
        ${row('Capital:', country.capital)}
        ${row('Languages:', langs)}
        ${row('Currency:', country.currency)}
        ${row('Exchange rates:', base !== 'N/A' ? `1 ${base} = ${usd} USD, 1 ${base} = ${kzt} KZT` : 'N/A')}
      </div>
    </div>
  `;
}

function renderNews(news) {
  if (!news || news.length === 0) {
    newsBox.innerHTML = `<div class="card"><div class="title">News</div><div class="muted">No news found</div></div>`;
    return;
  }

  const cards = news.map(n => `
    <div class="news-card">
      ${n.image ? `<img class="news-img" src="${n.image}" alt="news" onerror="this.style.display='none'"/>` : ''}
      <div class="news-body">
        <div class="news-title">${n.title}</div>
        <div class="news-desc">${n.description || ''}</div>
        <a class="news-link" href="${n.url}" target="_blank" rel="noopener noreferrer">Open article</a>
      </div>
    </div>
  `).join('');

  newsBox.innerHTML = `
    <div class="card">
      <div class="title">News (up to 5)</div>
      <div class="news-list">${cards}</div>
    </div>
  `;
}

async function loadData() {
  if (!btn) return;
  btn.disabled = true;
  setStatus('Loading... ' + spinnerHtml());
  clearAll();

  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    if (!res.ok) {
      setStatus(data?.error || 'Error fetching data');
      return;
    }
    renderUser(data.user);
    renderCountry(data.country, data.rates);
    renderNews(data.news);
    setStatus('');
  } catch (err) {
    setStatus('Network error');
  } finally {
    btn.disabled = false;
  }
}

if (btn) btn.addEventListener('click', loadData);
