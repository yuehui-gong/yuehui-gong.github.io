(function () {
  'use strict';

  let readerCount = 0;
  const icons = {
    previous: 'M10 3 5 8l5 5',
    next: 'm6 3 5 5-5 5',
    minus: 'M3 8h10',
    plus: 'M3 8h10M8 3v10',
    grid: 'M2 2h4v4H2zM10 2h4v4h-4zM2 10h4v4H2zM10 10h4v4h-4z',
    expand: 'M6 2H2v4m8-4h4v4M2 10v4h4m8-4v4h-4',
    close: 'm3 3 10 10M13 3 3 13'
  };

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function setIcon(button, name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    path.setAttribute('d', icons[name]);
    path.setAttribute('stroke-width', '1.25');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    button.replaceChildren(svg);
  }

  function iconButton(className, label, icon) {
    const button = node('button', 'comic-reader-button ' + className);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    setIcon(button, icon);
    return button;
  }

  // Split the display at the spine; the original artwork remains intact.
  function physicalPages(sources) {
    return sources.flatMap(function (source, index) {
      const page = Object.assign({}, source, {sourceIndex: index});
      if (source.kind === 'spread' || source.width > source.height) {
        return ['left', 'right'].map(function (slice) {
          return Object.assign({}, page, {slice: slice});
        });
      }
      return [page];
    });
  }

  window.createComicReader = function (element, options) {
    if (!element || !(element instanceof Element)) throw new TypeError('A comic reader element is required.');
    options = options || {};
    if (!Array.isArray(options.pages) || options.pages.length < 2) throw new TypeError('The comic needs a cover and pages.');
    if (element.comicReader) element.comicReader.destroy();

    const sources = options.pages;
    const pages = physicalPages(sources);
    const pagination = sources.map(function (source, i) {
      const first = pages.findIndex(function (page) { return page.sourceIndex === i; }) + 1;
      const count = pages.filter(function (page) { return page.sourceIndex === i; }).length;
      return (count > 1 ? first + '–' + (first + count - 1) : String(first)) + ' / ' + pages.length;
    });
    const spread = sources.find(function (page) { return page.kind === 'spread' || page.width > page.height; });
    const pageRatio = spread ? spread.width / spread.height / 2 : sources[0].width / sources[0].height;
    const spreadRatio = pageRatio * 2;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const root = node('section', 'comic-reader');
    root.id = 'comic-reader-' + (++readerCount);
    root.tabIndex = 0;
    root.setAttribute('aria-label', (options.title || 'Comic') + ' book');
    root.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight Home End Escape');
    root.dataset.bookPosition = 'front';
    root.dataset.flipState = 'read';

    const stage = node('div', 'comic-reader-stage');
    const viewport = node('div', 'comic-reader-viewport');
    const bookSpace = node('div', 'comic-reader-book-space');
    const book = node('div', 'comic-reader-book');
    book.id = root.id + '-book';
    const leaves = pages.map(function (page) {
      const leaf = node('div', 'comic-reader-page');
      const art = node('div', 'comic-reader-page-art');
      const image = node('img', 'comic-reader-image');
      leaf.dataset.kind = page.kind || 'page';
      leaf.dataset.density = 'soft';
      if (page.slice) leaf.dataset.slice = page.slice;
      image.src = page.src;
      image.alt = (page.alt || page.label || 'Comic page') + (page.slice ? ', ' + page.slice + ' page' : '');
      image.draggable = false;
      image.decoding = 'async';
      image.addEventListener('error', function () {
        if (page.sourceIndex === index && !destroyed) showError('This page could not load. Please try again.');
      });
      art.appendChild(image);
      leaf.appendChild(art);
      book.appendChild(leaf);
      return leaf;
    });

    const controls = node('div', 'comic-reader-controls');
    const previous = iconButton('comic-reader-previous', 'Previous spread', 'previous');
    const next = iconButton('comic-reader-next', 'Next spread', 'next');
    const expand = iconButton('comic-reader-expand', 'Full screen', 'expand');
    expand.setAttribute('aria-expanded', 'false');
    controls.append(previous, next);
    const toolbar = node('div', 'comic-reader-toolbar');
    toolbar.setAttribute('role', 'group');
    toolbar.setAttribute('aria-label', 'Book controls');
    const progress = node('input', 'comic-reader-progress');
    progress.type = 'range';
    progress.min = '0';
    progress.max = String(sources.length - 1);
    progress.step = '1';
    progress.value = '0';
    progress.setAttribute('aria-label', 'Reading progress');
    progress.setAttribute('aria-controls', book.id);
    const toolbarRow = node('div', 'comic-reader-toolbar-row');
    const counter = node('span', 'comic-reader-counter', pagination[0]);
    const zoomGroup = node('div', 'comic-reader-zoom');
    const zoomOut = iconButton('comic-reader-zoom-out', 'Zoom out', 'minus');
    const zoomIn = iconButton('comic-reader-zoom-in', 'Zoom in', 'plus');
    const zoomRange = node('input', 'comic-reader-zoom-range');
    zoomRange.type = 'range';
    zoomRange.min = '1';
    zoomRange.max = '2.5';
    zoomRange.step = '.05';
    zoomRange.value = '1';
    zoomRange.setAttribute('aria-label', 'Book zoom');
    zoomRange.setAttribute('aria-valuetext', '100%');
    zoomGroup.append(zoomOut, zoomRange, zoomIn);
    const thumbnails = iconButton('comic-reader-thumbnails', 'Show thumbnails', 'grid');
    const thumbnailPanel = node('div', 'comic-reader-thumbnail-panel');
    thumbnailPanel.id = root.id + '-thumbnails';
    thumbnailPanel.hidden = true;
    thumbnails.setAttribute('aria-expanded', 'false');
    thumbnails.setAttribute('aria-controls', thumbnailPanel.id);
    const thumbnailButtons = sources.map(function (source, i) {
      const button = node('button', 'comic-reader-thumbnail');
      const image = node('img');
      button.type = 'button';
      button.setAttribute('aria-label', (source.label || 'Spread') + ', pages ' + pagination[i]);
      image.src = source.src;
      image.alt = '';
      image.loading = 'lazy';
      image.draggable = false;
      button.append(image, node('span', 'comic-reader-thumbnail-label', pagination[i]));
      button.addEventListener('click', function () {
        goTo(i, false);
        toggleThumbnails(false);
        thumbnails.focus();
      });
      thumbnailPanel.appendChild(button);
      return button;
    });
    const toolbarTools = node('div', 'comic-reader-toolbar-tools');
    toolbarTools.append(thumbnails, expand);
    toolbarRow.append(counter, zoomGroup, toolbarTools);
    toolbar.append(progress, toolbarRow);
    const loading = node('div', 'comic-reader-loading', 'Loading book…');
    const error = node('div', 'comic-reader-error');
    const errorText = node('p');
    const retry = node('button', 'comic-reader-retry', 'Try again');
    retry.type = 'button';
    error.append(errorText, retry);
    error.hidden = true;
    const status = node('div', 'comic-reader-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    bookSpace.appendChild(book);
    viewport.appendChild(bookSpace);
    stage.append(viewport, controls, loading, error);
    root.append(stage, toolbar, thumbnailPanel, status);
    element.replaceChildren(root);

    let flip = null;
    let destroyed = false;
    let expanded = false;
    let nativeFullscreen = false;
    let index = 0;
    let savedFocus = null;
    let savedOverflow = '';
    let zoom = 1;
    let fitPending = false;
    let centerPending = false;
    let resizeFrame = 0;
    let stateFrame = 0;
    let layoutSize = '';
    const imageCache = new Map();
    const pendingImages = new Set();

    function showError(message) {
      loading.hidden = true;
      root.setAttribute('aria-busy', 'false');
      errorText.textContent = message;
      error.hidden = false;
    }

    function loadImage(source) {
      if (imageCache.has(source.src)) return imageCache.get(source.src);
      const promise = new Promise(function (resolve, reject) {
        const image = new Image();
        let timer;
        function finish(failure) {
          clearTimeout(timer);
          image.onload = image.onerror = null;
          pendingImages.delete(cancel);
          if (failure) reject(failure); else resolve(image);
        }
        function cancel() { finish(new Error('Image loading cancelled')); }
        pendingImages.add(cancel);
        image.onload = function () { finish(); };
        image.onerror = function () { finish(new Error('Image could not load')); };
        timer = setTimeout(function () { finish(new Error('Image loading timed out')); }, 25000);
        image.src = source.src;
      });
      imageCache.set(source.src, promise);
      promise.catch(function () { imageCache.delete(source.src); });
      return promise;
    }

    function fitBook() {
      if (destroyed) return;
      if (flip && (flip.getState() === 'flipping' || flip.getState() === 'user_fold')) {
        fitPending = true;
        return;
      }
      fitPending = false;
      const style = getComputedStyle(stage);
      const horizontal = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const vertical = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const availableWidth = Math.max(80, stage.clientWidth - horizontal);
      const toolbarHeight = toolbar.offsetHeight || 64;
      const panelHeight = thumbnailPanel.hidden ? 0 : (thumbnailPanel.offsetHeight || 126);
      const rootStyle = getComputedStyle(root);
      const outerPadding = expanded ? parseFloat(rootStyle.paddingTop) + parseFloat(rootStyle.paddingBottom) : 0;
      const rootTop = expanded ? 0 : Math.max(0, root.getBoundingClientRect().top);
      const stageHeight = Math.max(expanded ? 160 : 360, window.innerHeight - rootTop - toolbarHeight - panelHeight - outerPadding - (expanded ? 0 : 24));
      const availableHeight = Math.max(100, stageHeight - vertical);
      const width = Math.floor(Math.min(availableWidth, availableHeight * spreadRatio) * zoom);
      const height = Math.round(width / spreadRatio);
      const spaceWidth = zoom > 1 ? Math.max(availableWidth, width + 48) : availableWidth;
      const spaceHeight = zoom > 1 ? Math.max(availableHeight, height + 48) : availableHeight;
      const size = [width, height, availableWidth, availableHeight, expanded, thumbnailPanel.hidden].join(':');
      if (size === layoutSize) return;
      layoutSize = size;
      root.classList.toggle('is-zoomed', zoom > 1);
      book.style.width = width + 'px';
      book.style.height = height + 'px';
      stage.style.height = stageHeight + 'px';
      viewport.style.width = availableWidth + 'px';
      viewport.style.height = availableHeight + 'px';
      bookSpace.style.width = spaceWidth + 'px';
      bookSpace.style.height = spaceHeight + 'px';
      if (flip) flip.update();
      if (centerPending || zoom === 1) {
        viewport.scrollLeft = Math.max(0, (spaceWidth - availableWidth) / 2);
        viewport.scrollTop = Math.max(0, (spaceHeight - availableHeight) / 2);
        centerPending = false;
      }
    }

    function scheduleFit() {
      if (resizeFrame || destroyed) return;
      resizeFrame = requestAnimationFrame(function () { resizeFrame = 0; fitBook(); });
    }

    function updateBook() {
      if (!flip || destroyed) return;
      const physical = flip.getCurrentPageIndex();
      index = pages[physical].sourceIndex;
      const state = flip.getState();
      const busy = state === 'flipping' || state === 'user_fold';
      root.dataset.flipState = state;
      // Keep the cover stationary while it is being dragged so pointer geometry stays stable.
      if (state !== 'user_fold') {
        root.dataset.bookPosition = busy ? 'open' : physical === 0 ? 'front' : physical === pages.length - 1 ? 'back' : 'open';
      }
      previous.disabled = busy || index === 0;
      next.disabled = busy || index === sources.length - 1;
      progress.disabled = busy;
      progress.value = String(index);
      progress.setAttribute('aria-valuetext', 'Pages ' + pagination[index]);
      progress.style.setProperty('--progress', (index / (sources.length - 1) * 100) + '%');
      counter.textContent = pagination[index];
      zoomOut.disabled = busy || zoom <= 1;
      zoomIn.disabled = busy || zoom >= 2.5;
      zoomRange.disabled = thumbnails.disabled = busy;
      expand.disabled = busy;
      thumbnailButtons.forEach(function (button, i) {
        button.disabled = busy;
        if (i === index) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
      const visible = physical === 0 || physical === pages.length - 1 ? [physical] : [physical, physical + 1];
      leaves.forEach(function (leaf, i) { leaf.setAttribute('aria-hidden', String(!visible.includes(i))); });
      status.textContent = (sources[index].label || 'Spread') + ', pages ' + pagination[index];
      if (!busy && fitPending) fitBook();
      [index, index - 1, index + 1].filter(function (i) { return i >= 0 && i < sources.length; }).forEach(function (i) {
        loadImage(sources[i]).then(function () {
          if (!destroyed && i === index) error.hidden = true;
        }).catch(function () {
          if (!destroyed && i === index) showError('This page could not load. Please try again.');
        });
      });
    }

    function stateChanged(event) {
      root.dataset.flipState = event.data;
      if (event.data === 'flipping') root.dataset.bookPosition = 'open';
      if (!stateFrame) stateFrame = requestAnimationFrame(function () { stateFrame = 0; updateBook(); });
    }

    function setZoom(value) {
      if (destroyed || !flip || flip.getState() === 'flipping' || flip.getState() === 'user_fold') return false;
      const number = Number(value);
      if (!Number.isFinite(number)) return false;
      zoom = Math.round(Math.max(1, Math.min(2.5, number)) * 100) / 100;
      zoomRange.value = String(zoom);
      zoomRange.setAttribute('aria-valuetext', Math.round(zoom * 100) + '%');
      centerPending = true;
      fitBook();
      updateBook();
      return true;
    }

    function toggleThumbnails(active) {
      if (destroyed || (flip && (flip.getState() === 'flipping' || flip.getState() === 'user_fold'))) return;
      const open = active === undefined ? thumbnailPanel.hidden : active;
      thumbnailPanel.hidden = !open;
      thumbnails.setAttribute('aria-expanded', String(open));
      thumbnails.setAttribute('aria-label', open ? 'Hide thumbnails' : 'Show thumbnails');
      fitBook();
    }

    function goTo(target, animate) {
      if (destroyed || !flip || !Number.isInteger(target) || target < 0 || target >= sources.length || target === index) return false;
      if (flip.getState() === 'flipping' || flip.getState() === 'user_fold') return false;
      const physical = pages.findIndex(function (page) { return page.sourceIndex === target; });
      if (motion.matches || animate === false) flip.turnToPage(physical);
      else flip.flip(physical, 'bottom');
      return true;
    }

    function setExpanded(active) {
      if (destroyed || expanded === active) return;
      expanded = active;
      if (active) {
        savedFocus = document.activeElement;
        savedOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        root.classList.add('is-expanded');
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        expand.focus();
        if (root.requestFullscreen) root.requestFullscreen().catch(function () {});
      } else {
        root.classList.remove('is-expanded');
        root.removeAttribute('role');
        root.removeAttribute('aria-modal');
        document.body.style.overflow = savedOverflow;
        if (document.fullscreenElement === root && document.exitFullscreen) document.exitFullscreen().catch(function () {});
        if (savedFocus && savedFocus.isConnected) savedFocus.focus();
      }
      expand.setAttribute('aria-expanded', String(active));
      expand.setAttribute('aria-label', active ? 'Exit full screen' : 'Full screen');
      setIcon(expand, active ? 'close' : 'expand');
      layoutSize = '';
      centerPending = true;
      fitBook();
    }

    function fullscreenChanged() {
      if (document.fullscreenElement === root) {
        nativeFullscreen = true;
        if (!expanded && document.exitFullscreen) document.exitFullscreen().catch(function () {});
      } else if (nativeFullscreen) {
        nativeFullscreen = false;
        setExpanded(false);
      }
      scheduleFit();
    }

    function keyDown(event) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.target.isContentEditable) return;
      if (event.key === 'Escape' && expanded) { event.preventDefault(); setExpanded(false); return; }
      if (event.key === 'Tab' && expanded) {
        const focusable = [previous, next, retry, progress, zoomOut, zoomRange, zoomIn, thumbnails, expand, ...thumbnailButtons].filter(function (control) { return !control.disabled && !control.closest('[hidden]'); });
        if (!focusable.length) { event.preventDefault(); root.focus({preventScroll: true}); return; }
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        return;
      }
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
      const target = {ArrowLeft: index - 1, PageUp: index - 1, ArrowRight: index + 1, PageDown: index + 1, Home: 0, End: sources.length - 1}[event.key];
      if (target !== undefined) { event.preventDefault(); goTo(target); }
    }

    function motionChanged() {
      if (flip) {
        flip.getSettings().flippingTime = motion.matches ? 1 : 850;
        flip.getSettings().showPageCorners = !motion.matches;
      }
    }

    async function boot() {
      loading.hidden = false;
      error.hidden = true;
      root.setAttribute('aria-busy', 'true');
      previous.disabled = next.disabled = true;
      progress.disabled = zoomRange.disabled = zoomOut.disabled = zoomIn.disabled = thumbnails.disabled = true;
      try {
        await loadImage(sources[0]);
        if (destroyed) return false;
        if (!window.St || !window.St.PageFlip) throw new Error('Page turn engine is unavailable');
        fitBook();
        flip = new window.St.PageFlip(book, {
          width: 400, height: Math.round(400 / pageRatio),
          size: 'stretch', minWidth: 80, maxWidth: 1600, minHeight: 100, maxHeight: 2600,
          autoSize: false, usePortrait: false, showCover: true,
          drawShadow: true, maxShadowOpacity: .48, flippingTime: motion.matches ? 1 : 850,
          showPageCorners: !motion.matches, useMouseEvents: true,
          mobileScrollSupport: true, swipeDistance: 30, clickEventForward: false,
          disableFlipByClick: false, startZIndex: 1
        });
        flip.on('flip', updateBook);
        flip.on('changeState', stateChanged);
        flip.loadFromHTML(leaves);
        // Soft comic covers can curl, while showCover still keeps them as single leaves.
        flip.getPage(0).setDensity('soft');
        flip.getPage(pages.length - 1).setDensity('soft');
        loading.hidden = true;
        root.setAttribute('aria-busy', 'false');
        updateBook();
        return true;
      } catch (failure) {
        if (!destroyed) showError('The book could not load. Please try again.');
        return false;
      }
    }

    async function retryLoad() {
      if (destroyed) return;
      imageCache.delete(sources[index].src);
      if (!flip) { await boot(); return; }
      loading.hidden = false;
      error.hidden = true;
      try {
        await loadImage(sources[index]);
        if (destroyed) return;
        leaves.forEach(function (leaf, i) { if (pages[i].sourceIndex === index) leaf.querySelector('img').src = sources[index].src; });
        loading.hidden = true;
        flip.update();
      } catch (failure) {
        if (!destroyed) showError('This page could not load. Please try again.');
      }
    }

    previous.addEventListener('click', function () { goTo(index - 1); });
    next.addEventListener('click', function () { goTo(index + 1); });
    expand.addEventListener('click', function () { setExpanded(!expanded); });
    progress.addEventListener('input', function () { goTo(Number(progress.value), false); });
    zoomOut.addEventListener('click', function () { setZoom(zoom - .25); });
    zoomIn.addEventListener('click', function () { setZoom(zoom + .25); });
    zoomRange.addEventListener('input', function () { setZoom(zoomRange.value); });
    thumbnails.addEventListener('click', function () { toggleThumbnails(); });
    retry.addEventListener('click', retryLoad);
    root.addEventListener('keydown', keyDown);
    stage.addEventListener('pointerdown', function (event) {
      if (!event.target.closest('button')) root.focus({preventScroll: true});
    });
    window.addEventListener('resize', scheduleFit);
    document.addEventListener('fullscreenchange', fullscreenChanged);
    motion.addEventListener('change', motionChanged);
    const observer = new ResizeObserver(scheduleFit);
    observer.observe(stage);

    const api = {
      ready: boot(),
      next: function () { return goTo(index + 1); },
      previous: function () { return goTo(index - 1); },
      goTo: goTo,
      getIndex: function () { return index; },
      getPageCount: function () { return sources.length; },
      expand: function () { setExpanded(true); },
      setZoom: setZoom,
      getZoom: function () { return zoom; },
      destroy: function () {
        if (destroyed) return;
        setExpanded(false);
        destroyed = true;
        observer.disconnect();
        cancelAnimationFrame(resizeFrame);
        cancelAnimationFrame(stateFrame);
        pendingImages.forEach(function (cancel) { cancel(); });
        window.removeEventListener('resize', scheduleFit);
        document.removeEventListener('fullscreenchange', fullscreenChanged);
        motion.removeEventListener('change', motionChanged);
        if (flip) flip.destroy();
        root.remove();
        if (element.comicReader === api) delete element.comicReader;
      }
    };
    element.comicReader = api;
    return api;
  };
}());
