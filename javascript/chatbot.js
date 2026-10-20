/* Thrif't Ko Yan assistant
   A self-contained chat widget: no libraries, no API key, no server.
   It answers questions using the knowledge base (KB) below.

   HOW TO USE ON EVERY PAGE
   1) <link rel="stylesheet" href="css/widgets.css" />   (in <head>)
   2) <script src="js/chatbot.js" defer></script>         (in <head>)
   The script builds the chat button and window by itself.

   HOW TO TEACH IT NEW ANSWERS
   Add an object to KB. `keys` are words or phrases people might type,
   `answer` is the reply, `links` are buttons that open a page, and `ask`
   are suggested follow-up questions. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. Links the bot can offer as buttons
     ------------------------------------------------------------------ */
  var L = {
    home: { label: 'Go to Home', href: 'index.html' },
    list: { label: 'Open List it', href: 'list.html' },
    hanger: { label: 'Open Hanger', href: 'Hanger.html' },
    login: { label: 'Go to Login', href: 'Login.html' },
    register: { label: 'Create an account', href: 'Registration.html' },
    feedback: { label: 'Leave feedback', href: 'index.html#feedback' },
    gems: { label: 'See Gems', href: 'index.html#gems' },
    arrivals: { label: 'See New Arrivals', href: 'index.html#new-arrivals' },
    about: { label: 'Our story', href: 'index.html#about' }
  };

  var STARTERS = [
    "What is Thrif't Ko Yan?",
    'How do I sell an item?',
    'What are Gems?',
    'Where do I leave feedback?'
  ];

  /* ------------------------------------------------------------------
     2. Knowledge base. Order matters: when two answers tie, the one
        listed first wins, so general chit-chat is kept at the bottom.
     ------------------------------------------------------------------ */
  var KB = [
    {
      id: 'hanger',
      keys: [
        'hanger', 'hang', 'cart', 'bag', 'basket', 'checkout', 'buy up',
        'buyup', 'tawad', 'haggle', 'negotiate', 'bargain'
      ],
      answer:
        "Hanger is where your picks go. Add Gems from the List it page and your Hanger shows them with a subtotal, a Tawad total, and the shipping fee, then lets you proceed to buy-up. It stays empty until you add a Gem.\n\nI don't have more details on how tawad works yet.",
      links: ['hanger', 'list']
    },
    {
      id: 'sell',
      keys: [
        'sell', 'sell an item', 'sell my', 'how to sell', 'list an item',
        'list item', 'list my', 'list it', 'list', 'post an item', 'post item',
        'upload', 'seller', 'declutter', 'photo', 'condition', 'brand new',
        'like new'
      ],
      answer:
        "You can sell on the List it page. Upload a photo of your Gem, name it, set your price, pick its condition (Brand New, Like New, Good \u2014 Used, or Fair \u2014 Well Used), add a description, then press Be Discovered.",
      links: ['list'],
      ask: ['What are Gems?', 'Do I need to log in?']
    },
    {
      id: 'browse',
      keys: [
        'browse', 'browse listings', 'shop', 'shopping', 'buy', 'buying',
        'find', 'finds', 'looking for', 'look for', 'search', 'explore',
        'clothes', 'outfit', 'dress', 'shirt', 'pants', 'jacket'
      ],
      answer:
        "To shop, head to the List it page, where the Gems live, and add the ones you like to your Hanger. On the home page, New Arrivals shows the newest finds and Gems highlights special pieces.\n\nIf those sections are empty right now, new items are on the way, so check back soon.",
      links: ['list', 'arrivals'],
      ask: ['What are Gems?', 'How do I sell an item?']
    },
    {
      id: 'gems',
      keys: [
        'gem', 'hidden gem', 'hidden treasure', 'treasure',
        'special find', 'second chance'
      ],
      answer:
        "Gems are the special finds on the home page: pieces that deserve a second chance. The section is marked Coming soon and there are no gems yet, so you could be the first to share one.",
      links: ['gems', 'list'],
      ask: ['How do I sell an item?']
    },
    {
      id: 'arrivals',
      keys: [
        'new arrivals', 'newest', 'latest', 'fresh finds', 'new items',
        'whats new', 'new stuff', 'just in', 'recent'
      ],
      answer:
        "New Arrivals on the home page shows the newest pre-loved pieces. If it's empty right now, new finds are on the way, so check back soon.",
      links: ['arrivals'],
      ask: ['How do I sell an item?', 'What are Gems?']
    },
    {
      id: 'login',
      keys: [
        'login', 'log in', 'sign in', 'signin', 'sign up', 'signup',
        'register', 'account', 'password', 'create account', 'profile'
      ],
      answer:
        'Use the Login link in the top menu to sign in. New here? You can create an account on the sign-up page.',
      links: ['login', 'register'],
      ask: ['What pages are on the site?']
    },
    {
      id: 'sustain',
      keys: [
        'sustainable', 'sustainability', 'environment', 'eco', 'planet',
        'recycle', 'reuse', 'waste', 'fast fashion', 'why thrift',
        'why buy', 'second hand', 'secondhand', 'preloved', 'pre loved',
        'impact'
      ],
      answer:
        "Buying second-hand gives good clothing another life. Pre-loved simply means previously owned and ready for a new home. Choosing pieces this way helps reduce waste and makes shopping more thoughtful, and it often costs less too.\n\nAs we like to say: buy second-hand, make a bigger impact.",
      links: ['about'],
      ask: ["What is Thrif't Ko Yan?"]
    },
    {
      id: 'policies',
      keys: [
        'how much is shipping', 'how much is delivery', 'shipping fee',
        'delivery fee', 'shipping cost',
        'shipping', 'delivery', 'deliver', 'ship', 'return', 'refund',
        'exchange', 'payment', 'pay', 'gcash', 'cod', 'meetup', 'meet up',
        'pickup', 'pick up', 'warranty', 'authentic', 'size',
        'sizing'
      ],
      answer:
        "Your Hanger shows a shipping fee line, but I don't have details about payment, delivery, or returns yet. Send a note through the feedback form so the team can see your question.",
      links: ['hanger', 'feedback']
    },
    {
      id: 'price',
      keys: [
        'price', 'cost', 'how much', 'how much is', 'how much are', 'how much does', 'cheap', 'affordable', 'budget',
        'expensive', 'discount', 'sale'
      ],
      answer:
        "Thrif't Ko Yan is all about style for less. Sellers set their own price in pesos when they list a Gem, and your Hanger adds your picks up as a subtotal.",
      links: ['list', 'hanger']
    },
    {
      id: 'contact',
      keys: [
        'contact', 'email', 'phone', 'reach you', 'reach us', 'owner',
        'admin', 'social media', 'facebook', 'instagram', 'customer service',
        'support'
      ],
      answer:
        "I don't have contact details listed. The easiest way to reach the team right now is the feedback form on the home page: leave a star rating and a comment.",
      links: ['feedback']
    },
    {
      id: 'feedback',
      keys: [
        'feedback', 'rate', 'rating', 'review', 'comment', 'suggestion',
        'suggest', 'complain', 'complaint', 'star'
      ],
      answer:
        "You can rate your experience from 1 to 5 stars and leave a comment in the feedback section near the bottom of the home page. We'd love to hear from you!",
      links: ['feedback']
    },
    {
      id: 'nav',
      keys: [
        'page', 'menu', 'navigate', 'navigation', 'sections', 'what pages',
        'site map', 'sitemap', 'home', 'home page', 'homepage'
      ],
      answer:
        "Here are the pages in the top menu:\n\u2022 Home: the main page\n\u2022 List it: list your Gems and browse them\n\u2022 Hanger: your picks and subtotal\n\u2022 Login: sign in or create an account",
      links: ['home', 'list', 'hanger', 'login']
    },
    {
      id: 'howto',
      keys: [
        'how does it work', 'how it works', 'how to use', 'getting started',
        'get started', 'steps', 'guide', 'tutorial'
      ],
      answer:
        "Here's the quick version: browse or list pre-loved pieces on the List it page, check New Arrivals and Gems on the home page for fresh and special finds, and use Login for your account.",
      links: ['list', 'login']
    },
    {
      id: 'identity',
      keys: [
        'who are you', 'are you a bot', 'are you ai', 'are you real',
        'are you human', 'what are you', 'your name', 'chatbot', 'bot',
        'assistant', 'robot'
      ],
      answer:
        "I'm the Thrif't Ko Yan assistant, a chatbot built into this website. I answer using the information on the site, so I may not know everything. I'm not a live person.",
      ask: ['What can you do?']
    },
    {
      id: 'about',
      keys: [
        "what is thrift ko yan", "about thrift ko yan", 'about', 'story', 'mission', 'goal', 'purpose', 'who made',
        'what do you sell', 'what is this site', 'what is this website'
      ],
      answer:
        "Thrif't Ko Yan is a place to discover affordable pre-loved clothing and unique finds. We make thrift shopping easier and more convenient, and we encourage reuse and more thoughtful shopping.\n\nOur tagline says it best: pre-loved, stylish, sustainable.",
      links: ['about'],
      ask: ['How do I sell an item?', 'Why buy second-hand?']
    },
    {
      id: 'help',
      keys: [
        'help', 'what can you do', 'what can i ask', 'how can you help',
        'commands'
      ],
      answer:
        "I can answer questions about Thrif't Ko Yan:\n\u2022 What the site is about\n\u2022 Shopping and selling\n\u2022 Gems and New Arrivals\n\u2022 Login and pages\n\u2022 Leaving feedback\n\nWhat would you like to know?",
      ask: STARTERS
    },
    {
      id: 'thanks',
      keys: ['thanks', 'thank you', 'thank', 'salamat', 'ty', 'appreciate'],
      answer: "You're welcome! Let me know if you need anything else."
    },
    {
      id: 'bye',
      keys: ['bye', 'goodbye', 'see you', 'paalam', 'ingat'],
      answer: 'Bye for now. Happy thrifting!'
    },
    {
      id: 'ack',
      keys: [
        'ok', 'okay', 'yes', 'yeah', 'sure', 'cool', 'nice', 'great',
        'awesome', 'got it'
      ],
      answer: "Great! Anything else you'd like to know about the site?",
      ask: STARTERS
    },
    {
      id: 'greeting',
      keys: [
        'hi', 'hello', 'hey', 'hola', 'kumusta', 'good morning',
        'good afternoon', 'good evening'
      ],
      answer:
        "Hi there! I'm the Thrif't Ko Yan assistant. Ask me anything about the site: shopping, selling, what Gems are, and more.",
      ask: STARTERS
    }
  ];

  var FALLBACK = {
    id: 'fallback',
    answer:
      "I'm not sure about that one yet. I can help with the site's pages, shopping, selling, Gems, login, and feedback. Try one of these:",
    ask: STARTERS
  };

  /* ------------------------------------------------------------------
     3. Matching: lower-case, strip punctuation, trim plurals and
        endings, then score every KB entry.
     ------------------------------------------------------------------ */
  function normalize(s) {
    return String(s)
      .toLowerCase()
      .replace(/['\u2019`]/g, '')
      .replace(/[^a-z0-9\u00c0-\u024f]+/g, ' ')
      .trim();
  }

  function stem(word) {
    var w = word;
    for (var i = 0; i < 2; i++) {
      var m = w.match(/^(.{3,}?)(ing|ed|s)$/);
      if (!m) break;
      w = m[1];
    }
    return w;
  }

  function tokenize(s) {
    var n = normalize(s);
    return n ? n.split(' ').map(stem) : [];
  }

  function distance(a, b) {
    var prev = [];
    var i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      var cur = [i];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      prev = cur;
    }
    return prev[b.length];
  }

  // Pre-compute stemmed versions of every key once.
  KB.forEach(function (entry) {
    entry.compiled = entry.keys.map(function (k) {
      var t = tokenize(k);
      return { tokens: t, phrase: ' ' + t.join(' ') + ' ' };
    });
  });

  function score(entry, tokens, padded) {
    var total = 0;
    entry.compiled.forEach(function (key) {
      if (key.tokens.length > 1) {
        if (padded.indexOf(key.phrase) !== -1) total += 2 * key.tokens.length;
        return;
      }
      var t = key.tokens[0];
      if (!t) return;
      if (tokens.indexOf(t) !== -1) {
        total += 2;
      } else if (t.length >= 5) {
        // forgive a single typo in longer words ("feedbak", "arrivels")
        for (var i = 0; i < tokens.length; i++) {
          var x = tokens[i];
          if (x.length >= 5 && Math.abs(x.length - t.length) <= 1 && distance(x, t) <= 1) {
            total += 2;
            break;
          }
        }
      }
    });
    return total;
  }

  function match(text) {
    var tokens = tokenize(text);
    var padded = ' ' + tokens.join(' ') + ' ';
    var best = null;
    var bestScore = 0;
    KB.forEach(function (entry) {
      var s = score(entry, tokens, padded);
      if (s > bestScore) {
        best = entry;
        bestScore = s;
      }
    });
    return bestScore >= 2 ? best : FALLBACK;
  }

  /* Expose the pure logic for automated tests (Node). Harmless in browsers. */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { match: match, KB: KB, STARTERS: STARTERS };
  }
  if (typeof document === 'undefined') return;
  if (window.__tkyChatReady) return;
  window.__tkyChatReady = true;

  /* ------------------------------------------------------------------
     4. The widget
     ------------------------------------------------------------------ */
  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ICON_CHAT =
    '<svg class="tky-icon-chat" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
    '<path d="M6 8.5A4.5 4.5 0 0 1 10.5 4h11A4.5 4.5 0 0 1 26 8.5v8a4.5 4.5 0 0 1-4.5 4.5H15l-5.6 4.6c-.7.6-1.9.1-1.9-.9V21A4.5 4.5 0 0 1 6 16.5z" fill="currentColor" opacity=".95"/>' +
    '<circle cx="12" cy="12.5" r="1.7" fill="#5d5d40"/><circle cx="16" cy="12.5" r="1.7" fill="#5d5d40"/><circle cx="20" cy="12.5" r="1.7" fill="#5d5d40"/>' +
    '</svg>';
  var ICON_CLOSE =
    '<svg class="tky-icon-close" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
    '<path d="M9 9l14 14M23 9L9 23" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
  var ICON_RESET =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_MIN =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_SEND =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l14-7-5 14-2.5-5.5z" fill="currentColor"/></svg>';

  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        node.setAttribute(k, attrs[k]);
      });
    }
    if (html) node.innerHTML = html; // only ever used with the trusted strings above
    return node;
  }

  function init() {
    var root = el('div', { 'class': 'tky-chat', id: 'tky-chat' });

    /* teaser bubble */
    var teaser = el('div', { 'class': 'tky-teaser', role: 'status' });
    teaser.hidden = true;
    var teaserText = el('span');
    teaserText.textContent = 'Questions? Ask me about the site \u2728';
    var teaserClose = el('button', { type: 'button', 'aria-label': 'Dismiss message' });
    teaserClose.textContent = '\u00d7';
    teaser.appendChild(teaserText);
    teaser.appendChild(teaserClose);

    /* panel */
    var panel = el('section', {
      'class': 'tky-panel',
      id: 'tky-panel',
      role: 'dialog',
      'aria-label': "Thrif't Ko Yan assistant",
      'aria-hidden': 'true'
    });

    var head = el('header', { 'class': 'tky-head' });
    var headAvatar = el('span', { 'class': 'tky-avatar', 'aria-hidden': 'true' });
    headAvatar.textContent = 'TK';
    var headCopy = el('div', { 'class': 'tky-head-copy' });
    var headTitle = el('span', { 'class': 'tky-head-title' });
    headTitle.textContent = "Thrif't Ko Yan";
    var headSub = el('span', { 'class': 'tky-head-sub' });
    headSub.appendChild(el('span', { 'class': 'tky-dot', 'aria-hidden': 'true' }));
    headSub.appendChild(document.createTextNode('Ask me anything about the site'));
    headCopy.appendChild(headTitle);
    headCopy.appendChild(headSub);
    var actions = el('div', { 'class': 'tky-head-actions' });
    var resetBtn = el('button', { 'class': 'tky-icon-btn', type: 'button', 'aria-label': 'Start a new chat', title: 'New chat' }, ICON_RESET);
    var minBtn = el('button', { 'class': 'tky-icon-btn', type: 'button', 'aria-label': 'Close chat', title: 'Close' }, ICON_MIN);
    actions.appendChild(resetBtn);
    actions.appendChild(minBtn);
    head.appendChild(headAvatar);
    head.appendChild(headCopy);
    head.appendChild(actions);

    var log = el('div', { 'class': 'tky-log', role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversation' });

    var form = el('form', { 'class': 'tky-form', autocomplete: 'off' });
    var input = el('input', {
      'class': 'tky-input',
      type: 'text',
      name: 'message',
      maxlength: '200',
      placeholder: 'Type your question\u2026',
      'aria-label': 'Your question'
    });
    var send = el('button', { 'class': 'tky-send', type: 'submit', 'aria-label': 'Send message' }, ICON_SEND);
    form.appendChild(input);
    form.appendChild(send);
    var foot = el('p', { 'class': 'tky-foot' });
    foot.textContent = "Answers come from this website's information.";

    panel.appendChild(head);
    panel.appendChild(log);
    panel.appendChild(form);
    panel.appendChild(foot);

    /* launcher */
    var launcher = el(
      'button',
      {
        'class': 'tky-launcher',
        type: 'button',
        'aria-label': 'Open chat assistant',
        'aria-expanded': 'false',
        'aria-controls': 'tky-panel'
      },
      ICON_CHAT + ICON_CLOSE
    );
    var badge = el('span', { 'class': 'tky-badge', 'aria-hidden': 'true' });
    badge.textContent = '\u2726';
    launcher.appendChild(badge);

    root.appendChild(teaser);
    root.appendChild(panel);
    root.appendChild(launcher);
    document.body.appendChild(root);

    /* ---------- behaviour ---------- */
    var busy = false;
    var teaserTimer = null;
    var teaserHideTimer = null;
    var opened = false;

    function store(key, val) {
      try {
        if (val === undefined) return window.sessionStorage.getItem(key);
        window.sessionStorage.setItem(key, val);
      } catch (e) {
        return null;
      }
    }

    function scrollDown() {
      log.scrollTop = log.scrollHeight;
    }

    function clearChips() {
      var old = log.querySelectorAll('.tky-chips');
      for (var i = 0; i < old.length; i++) old[i].remove();
    }

    function addMessage(role, text) {
      var row = el('div', { 'class': 'tky-msg tky-msg--' + role });
      if (role === 'bot') {
        var av = el('span', { 'class': 'tky-avatar', 'aria-hidden': 'true' });
        av.textContent = 'TK';
        row.appendChild(av);
      }
      var bubble = el('div', { 'class': 'tky-bubble' });
      bubble.textContent = text; // textContent: user text can never inject HTML
      row.appendChild(bubble);
      log.appendChild(row);
      scrollDown();
      return row;
    }

    function addChips(entry) {
      var links = (entry.links || []).map(function (k) { return L[k]; }).filter(Boolean);
      var asks = entry.ask || [];
      if (!links.length && !asks.length) return;
      var wrap = el('div', { 'class': 'tky-chips' });
      links.forEach(function (lk) {
        var a = el('a', { 'class': 'tky-chip tky-chip--link', href: lk.href });
        a.textContent = lk.label;
        wrap.appendChild(a);
      });
      asks.forEach(function (q) {
        var b = el('button', { 'class': 'tky-chip', type: 'button' });
        b.textContent = q;
        b.addEventListener('click', function () {
          ask(q);
        });
        wrap.appendChild(b);
      });
      log.appendChild(wrap);
      scrollDown();
    }

    function showTyping() {
      var row = el('div', { 'class': 'tky-msg tky-msg--bot', id: 'tky-typing' });
      var av = el('span', { 'class': 'tky-avatar', 'aria-hidden': 'true' });
      av.textContent = 'TK';
      var bubble = el('div', { 'class': 'tky-bubble tky-typing' }, '<i></i><i></i><i></i>');
      bubble.setAttribute('aria-label', 'Assistant is typing');
      row.appendChild(av);
      row.appendChild(bubble);
      log.appendChild(row);
      scrollDown();
    }

    function hideTyping() {
      var t = document.getElementById('tky-typing');
      if (t) t.remove();
    }

    function setBusy(state) {
      busy = state;
      input.disabled = state;
      send.disabled = state;
    }

    function botSay(entry, quick) {
      setBusy(true);
      clearChips();
      showTyping();
      var delay = quick || reduceMotion ? 120 : Math.min(450 + entry.answer.length * 5, 1100);
      window.setTimeout(function () {
        hideTyping();
        addMessage('bot', entry.answer);
        addChips(entry);
        setBusy(false);
        if (opened) input.focus();
      }, delay);
    }

    function ask(text) {
      var q = String(text).replace(/\s+/g, ' ').trim();
      if (!q || busy) return;
      clearChips();
      addMessage('user', q);
      botSay(match(q));
    }

    function welcome() {
      botSay(KB.filter(function (e) { return e.id === 'greeting'; })[0], true);
    }

    function resetChat() {
      log.innerHTML = '';
      setBusy(false);
      welcome();
    }

    function hideTeaser() {
      teaser.hidden = true;
      window.clearTimeout(teaserTimer);
      window.clearTimeout(teaserHideTimer);
    }

    function openChat() {
      opened = true;
      root.classList.add('is-open');
      launcher.setAttribute('aria-expanded', 'true');
      launcher.setAttribute('aria-label', 'Close chat assistant');
      panel.setAttribute('aria-hidden', 'false');
      hideTeaser();
      store('tkyTeaserSeen', '1');
      window.setTimeout(function () { input.focus(); }, 80);
    }

    function closeChat(returnFocus) {
      opened = false;
      root.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.setAttribute('aria-label', 'Open chat assistant');
      panel.setAttribute('aria-hidden', 'true');
      if (returnFocus) launcher.focus();
    }

    launcher.addEventListener('click', function () {
      if (opened) closeChat(false);
      else openChat();
    });
    minBtn.addEventListener('click', function () { closeChat(true); });
    resetBtn.addEventListener('click', resetChat);
    teaserClose.addEventListener('click', function () {
      hideTeaser();
      store('tkyTeaserSeen', '1');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && opened) closeChat(true);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = input.value;
      input.value = '';
      ask(value);
    });

    /* greet once, then invite the visitor after a few seconds */
    welcome();
    if (!store('tkyTeaserSeen')) {
      teaserTimer = window.setTimeout(function () {
        if (opened) return;
        teaser.hidden = false;
        teaserHideTimer = window.setTimeout(hideTeaser, 9000);
      }, 4500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
