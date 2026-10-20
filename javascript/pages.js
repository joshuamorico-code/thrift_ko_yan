/* Thrif't Ko Yan: behaviour for the inner pages.
   <body data-page="list|hanger|login|register"> picks what runs.

   NOTE: there is no server yet. Gems and your Hanger are saved in this
   browser (localStorage), so they only appear on this device. Login and
   sign-up are validated here but not connected to a real account system. */
(function () {
  'use strict';

  var LISTINGS_KEY = 'tky_listings_v1';
  var HANGER_KEY = 'tky_hanger_v1';
  var MAX_LISTINGS = 30;
  var CONDITIONS = ['Brand New', 'Like New', 'Good \u2014 Used', 'Fair \u2014 Well Used'];

  function $(id) {
    return document.getElementById(id);
  }

  /* ---------- storage ---------- */
  function readRaw(key) {
    try {
      var v = JSON.parse(window.localStorage.getItem(key) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }
  function writeRaw(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }
  function readListings() {
    return readRaw(LISTINGS_KEY)
      .map(function (g) {
        var photo = String(g.photo || '');
        return {
          id: String(g.id || ''),
          name: String(g.name || '').slice(0, 60),
          price: Number(g.price) || 0,
          condition: CONDITIONS.indexOf(g.condition) !== -1 ? g.condition : CONDITIONS[2],
          description: String(g.description || '').slice(0, 500),
          photo: /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(photo) ? photo : '',
          ts: Number(g.ts) || 0
        };
      })
      .filter(function (g) {
        return g.id && g.name && g.price > 0;
      });
  }
  function readHanger() {
    return readRaw(HANGER_KEY).map(String);
  }

  /* ---------- small helpers ---------- */
  function peso(n) {
    var whole = Math.round(n * 100) % 100 === 0;
    return '\u20b1' + Number(n).toLocaleString('en-PH', {
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2
    });
  }
  function setStatus(node, message, kind) {
    if (!node) return;
    node.textContent = message || '';
    node.className = 'form-status' + (kind ? ' is-' + kind : '');
  }
  function make(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function photoBlock(container, g) {
    if (g.photo) {
      var img = document.createElement('img');
      img.src = g.photo;
      img.alt = g.name;
      container.appendChild(img);
    } else {
      container.appendChild(make('span', '', 'TK'));
    }
  }

  /* Shrink a chosen photo so it fits in browser storage. */
  function shrinkPhoto(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        var img = new Image();
        img.onerror = reject;
        img.onload = function () {
          var max = 640;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* =========================================================
     LIST IT
     ========================================================= */
  function initList() {
    var form = $('list-form');
    var status = $('list-status');
    var photoInput = $('photo-input');
    var preview = $('photo-preview');
    var uploadText = $('upload-text');
    var grid = $('gem-grid');
    var empty = $('gem-empty');
    var photoData = '';
    var lastPost = 0;

    photoInput.addEventListener('change', function () {
      var file = photoInput.files && photoInput.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) {
        photoInput.value = '';
        setStatus(status, 'Please choose an image file (JPG, PNG or WebP).', 'error');
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        photoInput.value = '';
        setStatus(status, 'That photo is too large. Please pick one under 12 MB.', 'error');
        return;
      }
      shrinkPhoto(file)
        .then(function (data) {
          photoData = data;
          preview.src = data;
          preview.hidden = false;
          uploadText.textContent = 'Tap to change photo';
          setStatus(status, '');
        })
        .catch(function () {
          photoInput.value = '';
          setStatus(status, 'We could not read that photo. Please try another one.', 'error');
        });
    });

    function render() {
      var gems = readListings().sort(function (a, b) {
        return b.ts - a.ts;
      });
      var hanger = readHanger();
      grid.innerHTML = '';
      empty.hidden = gems.length > 0;

      gems.forEach(function (g) {
        var inHanger = hanger.indexOf(g.id) !== -1;
        var li = make('li', 'gem-card');

        var photo = make('div', 'gem-photo');
        photoBlock(photo, g);

        var body = make('div', 'gem-body');
        body.appendChild(make('h3', 'gem-name', g.name));
        body.appendChild(make('span', 'gem-price', peso(g.price)));
        body.appendChild(make('span', 'pill', g.condition));
        if (g.description) body.appendChild(make('p', 'gem-desc', g.description));

        var actions = make('div', 'gem-actions');
        var add = make(
          'button',
          'button ' + (inHanger ? 'button-secondary' : 'button-primary'),
          inHanger ? 'In your Hanger \u2713' : 'Add to Hanger'
        );
        add.type = 'button';
        add.addEventListener('click', function () {
          var list = readHanger();
          var i = list.indexOf(g.id);
          if (i === -1) list.push(g.id);
          else list.splice(i, 1);
          writeRaw(HANGER_KEY, list);
          render();
        });
        var del = make('button', 'link-button', 'Delete');
        del.type = 'button';
        del.setAttribute('aria-label', 'Delete listing ' + g.name);
        del.addEventListener('click', function () {
          if (!window.confirm('Delete "' + g.name + '"?')) return;
          writeRaw(
            LISTINGS_KEY,
            readListings().filter(function (x) {
              return x.id !== g.id;
            })
          );
          writeRaw(
            HANGER_KEY,
            readHanger().filter(function (x) {
              return x !== g.id;
            })
          );
          render();
        });
        actions.appendChild(add);
        actions.appendChild(del);
        body.appendChild(actions);

        li.appendChild(photo);
        li.appendChild(body);
        grid.appendChild(li);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.replace(/\s+/g, ' ').trim();
      var price = parseFloat(form.elements.price.value);
      var condition = form.elements.condition.value;
      var description = form.elements.description.value.trim();

      if (name.length < 2) {
        setStatus(status, 'Please give your Gem a name.', 'error');
        form.elements.name.focus();
        return;
      }
      if (!(price > 0) || price > 1000000) {
        setStatus(status, 'Please enter a price greater than 0.', 'error');
        form.elements.price.focus();
        return;
      }
      if (CONDITIONS.indexOf(condition) === -1) {
        setStatus(status, 'Please select the condition of your Gem.', 'error');
        form.elements.condition.focus();
        return;
      }
      if (Date.now() - lastPost < 3000) {
        setStatus(status, 'One moment, your last Gem is still being saved.', 'error');
        return;
      }

      var gem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name: name.slice(0, 60),
        price: Math.round(price * 100) / 100,
        condition: condition,
        description: description.slice(0, 500),
        photo: photoData,
        ts: Date.now()
      };
      var all = readListings();
      all.unshift(gem);
      all = all.slice(0, MAX_LISTINGS);

      if (!writeRaw(LISTINGS_KEY, all)) {
        setStatus(
          status,
          'Your browser has no room left to save this Gem. Try a smaller photo or delete an old listing.',
          'error'
        );
        return;
      }
      lastPost = Date.now();
      form.reset();
      photoData = '';
      preview.hidden = true;
      preview.removeAttribute('src');
      uploadText.textContent = 'Tap to choose a photo';
      setStatus(status, 'Your Gem is discovered! It now shows under "Browse Gems".', 'success');
      render();
    });

    render();
  }

  /* =========================================================
     HANGER
     ========================================================= */
  function initHanger() {
    var itemsEl = $('hanger-items');
    var emptyEl = $('hanger-empty');
    var subtotalEl = $('subtotal');
    var buyBtn = $('buy-up');
    var noteEl = $('buy-note');
    var statusEl = $('buy-status');

    function render() {
      var ids = readHanger();
      var gems = readListings();
      var picked = ids
        .map(function (id) {
          return gems.filter(function (g) {
            return g.id === id;
          })[0];
        })
        .filter(Boolean);

      // forget hanger entries whose listing no longer exists
      if (picked.length !== ids.length) {
        writeRaw(
          HANGER_KEY,
          picked.map(function (g) {
            return g.id;
          })
        );
      }

      itemsEl.innerHTML = '';
      emptyEl.hidden = picked.length > 0;
      var total = 0;

      picked.forEach(function (g) {
        total += g.price;
        var li = make('li', 'hanger-item');
        var thumb = make('div', 'hanger-thumb');
        photoBlock(thumb, g);

        var info = make('div');
        info.appendChild(make('h3', '', g.name));
        info.appendChild(make('span', 'pill', g.condition));
        info.appendChild(make('span', 'gem-price', peso(g.price)));

        var rm = make('button', 'link-button', 'Remove');
        rm.type = 'button';
        rm.setAttribute('aria-label', 'Remove ' + g.name + ' from your Hanger');
        rm.addEventListener('click', function () {
          writeRaw(
            HANGER_KEY,
            readHanger().filter(function (x) {
              return x !== g.id;
            })
          );
          setStatus(statusEl, '');
          render();
        });

        li.appendChild(thumb);
        li.appendChild(info);
        li.appendChild(rm);
        itemsEl.appendChild(li);
      });

      subtotalEl.textContent = peso(total);
      buyBtn.disabled = picked.length === 0;
      noteEl.hidden = picked.length > 0;
    }

    buyBtn.addEventListener('click', function () {
      setStatus(
        statusEl,
        'Buy-up is coming soon. Your Gems will stay in your Hanger until then.',
        'success'
      );
    });

    render();
  }

  /* =========================================================
     LOGIN + REGISTRATION (not connected to a server yet)
     ========================================================= */
  function initLogin() {
    var form = $('login-form');
    var status = $('login-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var user = form.elements.username.value.trim();
      if (!user || !form.elements.pass.value) {
        setStatus(status, 'Please enter your username and password.', 'error');
        return;
      }
      setStatus(
        status,
        'Login is not connected to an account system yet, so nothing was sent. Check back soon!',
        'success'
      );
      form.elements.pass.value = '';
    });
  }

  function initRegister() {
    var form = $('register-form');
    var status = $('register-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var p1 = form.elements.pass1.value;
      var p2 = form.elements.pass2.value;
      if (form.elements.fullname.value.trim().length < 2) {
        setStatus(status, 'Please enter your full name.', 'error');
        form.elements.fullname.focus();
        return;
      }
      if (p1.length < 8) {
        setStatus(status, 'Your password needs at least 8 characters.', 'error');
        form.elements.pass1.focus();
        return;
      }
      if (p1 !== p2) {
        setStatus(status, 'The two passwords do not match.', 'error');
        form.elements.pass2.focus();
        return;
      }
      setStatus(
        status,
        'Sign-up is not connected to an account system yet, so nothing was saved. Check back soon!',
        'success'
      );
      form.elements.pass1.value = '';
      form.elements.pass2.value = '';
    });
  }

  var page = document.body.getAttribute('data-page');
  if (page === 'list') initList();
  else if (page === 'hanger') initHanger();
  else if (page === 'login') initLogin();
  else if (page === 'register') initRegister();
})();
