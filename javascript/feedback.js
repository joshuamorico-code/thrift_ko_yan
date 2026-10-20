/* Thrif't Ko Yan feedback: 1-5 star rating + comment, posted on the page.

   WHERE POSTS GO
   By default, feedback is saved in this visitor's browser (localStorage) and
   shown on the page right away. A plain website has no database, so other
   visitors can't see it yet.

   TO COLLECT FEEDBACK FROM EVERYONE
   Put a form-endpoint URL in ENDPOINT below (for example a free Formspree
   or Getform URL). Each post is then also sent there, and you receive it by
   email or in that service's dashboard. */
(function () {
  'use strict';

  var ENDPOINT = ''; // e.g. 'https://formspree.io/f/yourFormId'

  var STORAGE_KEY = 'tky_feedback_v1';
  var MAX_STORED = 50;
  var PREVIEW_COUNT = 4;
  var MIN_COMMENT = 3;
  var COOLDOWN_MS = 8000;
  var LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };

  var form = document.getElementById('feedback-form');
  if (!form) return;

  var ui = {
    status: document.getElementById('feedback-status'),
    ratingText: document.getElementById('rating-text'),
    counter: document.getElementById('comment-count'),
    submit: document.getElementById('feedback-submit'),
    average: document.getElementById('fb-average'),
    averageStars: document.getElementById('fb-average-stars'),
    total: document.getElementById('fb-total'),
    bars: document.getElementById('fb-bars'),
    list: document.getElementById('fb-list'),
    empty: document.getElementById('fb-empty'),
    more: document.getElementById('fb-more'),
    summary: document.getElementById('fb-summary')
  };

  var entries = load();
  var showAll = false;
  var lastPost = 0;

  /* ---------------- storage ---------------- */
  function load() {
    try {
      var raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw
        .map(function (r) {
          return {
            id: String(r.id || ''),
            rating: Math.round(Number(r.rating)),
            name: String(r.name || 'Anonymous').slice(0, 40),
            comment: String(r.comment || '').slice(0, 500),
            ts: Number(r.ts) || Date.now()
          };
        })
        .filter(function (r) {
          return r.rating >= 1 && r.rating <= 5 && r.comment;
        })
        .slice(0, MAX_STORED);
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return true;
    } catch (e) {
      return false; // private mode or storage full: the post still shows this session
    }
  }

  /* ---------------- helpers ---------------- */
  function stars(n) {
    return '\u2605'.repeat(n) + '\u2606'.repeat(5 - n);
  }

  function formatDate(ts) {
    try {
      return new Date(ts).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  function setStatus(message, kind) {
    ui.status.textContent = message || '';
    ui.status.className = 'feedback-status' + (kind ? ' is-' + kind : '');
  }

  function updateCounter() {
    ui.counter.textContent = form.elements.comment.value.length + '/500';
  }

  /* ---------------- rendering ---------------- */
  function renderSummary() {
    var total = entries.length;
    var counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    var sum = 0;
    entries.forEach(function (e) {
      counts[e.rating]++;
      sum += e.rating;
    });
    var avg = total ? sum / total : 0;

    ui.summary.hidden = total === 0;
    ui.average.textContent = total ? avg.toFixed(1) : '0.0';
    ui.averageStars.style.setProperty('--pct', (avg / 5) * 100 + '%');
    ui.total.textContent = total + (total === 1 ? ' review' : ' reviews');

    ui.bars.innerHTML = '';
    for (var r = 5; r >= 1; r--) {
      var li = document.createElement('li');
      li.className = 'fb-bar';
      var label = document.createElement('span');
      label.textContent = r;
      var track = document.createElement('span');
      track.className = 'fb-bar-track';
      var fill = document.createElement('span');
      fill.className = 'fb-bar-fill';
      fill.style.width = total ? (counts[r] / total) * 100 + '%' : '0%';
      track.appendChild(fill);
      var count = document.createElement('b');
      count.textContent = counts[r];
      li.appendChild(label);
      li.appendChild(track);
      li.appendChild(count);
      li.setAttribute('aria-label', r + ' stars: ' + counts[r]);
      ui.bars.appendChild(li);
    }
  }

  function renderList() {
    ui.list.innerHTML = '';
    ui.empty.hidden = entries.length > 0;

    var visible = showAll ? entries : entries.slice(0, PREVIEW_COUNT);
    visible.forEach(function (e) {
      var item = document.createElement('li');
      item.className = 'fb-item';

      var head = document.createElement('div');
      head.className = 'fb-item-head';

      var name = document.createElement('span');
      name.className = 'fb-item-name';
      name.textContent = e.name;

      var rating = document.createElement('span');
      rating.className = 'fb-item-stars';
      rating.setAttribute('role', 'img');
      rating.setAttribute('aria-label', e.rating + ' out of 5 stars');
      rating.textContent = stars(e.rating);

      var date = document.createElement('span');
      date.className = 'fb-item-date';
      date.textContent = formatDate(e.ts);

      head.appendChild(name);
      head.appendChild(rating);
      head.appendChild(date);

      var text = document.createElement('p');
      text.textContent = e.comment; // textContent: comments can never inject HTML

      item.appendChild(head);
      item.appendChild(text);
      ui.list.appendChild(item);
    });

    if (entries.length > PREVIEW_COUNT) {
      ui.more.hidden = false;
      ui.more.textContent = showAll
        ? 'Show fewer'
        : 'Show all ' + entries.length + ' reviews';
      ui.more.setAttribute('aria-expanded', String(showAll));
    } else {
      ui.more.hidden = true;
    }
  }

  function render() {
    renderSummary();
    renderList();
  }

  /* ---------------- sending to a server (optional) ---------------- */
  function sendToServer(entry) {
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        rating: entry.rating,
        name: entry.name,
        comment: entry.comment,
        page: window.location.href,
        submitted: new Date(entry.ts).toISOString()
      })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
    });
  }

  /* ---------------- events ---------------- */
  form.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'rating') {
      ui.ratingText.textContent = LABELS[e.target.value] || '';
      if (ui.status.classList.contains('is-error')) setStatus('');
    }
  });

  form.elements.comment.addEventListener('input', function () {
    updateCounter();
    if (ui.status.classList.contains('is-error')) setStatus('');
  });

  ui.more.addEventListener('click', function () {
    showAll = !showAll;
    renderList();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Honeypot: bots fill the hidden field. Pretend it worked and drop it.
    if (form.elements.website && form.elements.website.value) {
      form.reset();
      setStatus('Thank you for your feedback!', 'success');
      return;
    }

    var rating = parseInt(form.elements.rating.value, 10);
    var comment = form.elements.comment.value.replace(/\s+/g, ' ').trim();
    var name = form.elements.name.value.replace(/\s+/g, ' ').trim();

    if (!rating) {
      setStatus('Please choose a star rating from 1 to 5.', 'error');
      var firstStar = form.querySelector('input[name="rating"]');
      if (firstStar) firstStar.focus();
      return;
    }
    if (comment.length < MIN_COMMENT) {
      setStatus('Please write a short comment before posting.', 'error');
      form.elements.comment.focus();
      return;
    }
    if (Date.now() - lastPost < COOLDOWN_MS) {
      setStatus('Please wait a few seconds before posting again.', 'error');
      return;
    }

    var entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      rating: rating,
      name: (name || 'Anonymous').slice(0, 40),
      comment: comment.slice(0, 500),
      ts: Date.now()
    };

    lastPost = Date.now();
    entries.unshift(entry);
    entries = entries.slice(0, MAX_STORED);
    var saved = save();
    render();

    form.reset();
    ui.ratingText.textContent = '';
    updateCounter();

    var okMessage = saved
      ? 'Thank you! Your feedback is now posted.'
      : 'Thank you! Your feedback is posted for this visit.';

    if (!ENDPOINT) {
      setStatus(okMessage, 'success');
      return;
    }

    ui.submit.disabled = true;
    setStatus('Sending\u2026');
    sendToServer(entry)
      .then(function () {
        setStatus('Thank you! Your feedback was sent to the team and posted.', 'success');
      })
      .catch(function () {
        setStatus(
          'Your feedback is posted here, but we could not send it to the team. Please try again later.',
          'error'
        );
      })
      .then(function () {
        ui.submit.disabled = false;
      });
  });

  updateCounter();
  render();
})();
