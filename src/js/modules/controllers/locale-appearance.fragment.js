        var THEME_STORAGE_KEY = 'gg:theme';

        function normalizeLocale(value) {
          var locale = String(value || '').toLowerCase();
          if (locale.indexOf('id') === 0 || locale.indexOf('in') === 0) return 'id';
          return 'en';
        }

        function normalizeTheme(value) {
          var theme = String(value || '').toLowerCase();
          if (theme === 'light' || theme === 'dark') return theme;
          return 'system';
        }

        function isDockHiddenByScroll() {
          return state.dockState === 'hidden-by-scroll' || readBodyState('data-gg-dock-state', '') === 'hidden-by-scroll';
        }

        function getCopy(key) {
          var parts = String(key || '').split('.');
          var current = COPY[state.locale] || COPY.en;
          var fallback = COPY.en;
          var i;

          for (i = 0; i < parts.length; i += 1) {
            current = current && current[parts[i]];
            fallback = fallback && fallback[parts[i]];
          }

          return current || fallback || key;
        }

        function formatCopy(key, replacements) {
          var text = String(getCopy(key) || '');
          var token;

          for (token in replacements) {
            if (!Object.prototype.hasOwnProperty.call(replacements, token)) continue;
            text = text.split('{' + token + '}').join(replacements[token]);
          }

          return text;
        }

        function parseIsoDateParts(value) {
          var match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);

          if (!match) return null;
          return {
            year: parseInt(match[1], 10),
            month: parseInt(match[2], 10),
            day: parseInt(match[3], 10)
          };
        }

        function formatEditorialDate(value, fallback) {
          var parts = parseIsoDateParts(value);
          var months;

          if (!parts) return String(fallback || '');

          if (state.locale === 'id') {
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return parts.day + ' ' + months[parts.month - 1] + ' ' + parts.year;
          }

          months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months[parts.month - 1] + ' ' + parts.day + ', ' + parts.year;
        }

        function readPreferredLocale() {
          var stored = '';
          try {
            stored = window.localStorage ? window.localStorage.getItem('gg:lang') : '';
          } catch (error) {
            stored = '';
          }

          if (stored === 'en' || stored === 'id') return stored;
          return normalizeLocale(document.documentElement.getAttribute('lang') || 'en');
        }

        function readPreferredTheme() {
          var stored = '';
          try {
            stored = window.localStorage ? window.localStorage.getItem(THEME_STORAGE_KEY) : '';
          } catch (error) {
            stored = '';
          }
          return normalizeTheme(stored);
        }

        function applyCopy(scope) {
          var root = scope || document;
          var textNodes = root.querySelectorAll('[data-gg-copy]');
          var placeholderNodes = root.querySelectorAll('[data-gg-copy-placeholder]');
          var titleNodes = root.querySelectorAll('[data-gg-copy-title]');
          var ariaNodes = root.querySelectorAll('[data-gg-copy-aria-label]');
          var i;

          for (i = 0; i < textNodes.length; i += 1) {
            textNodes[i].textContent = getCopy(textNodes[i].getAttribute('data-gg-copy'));
          }

          for (i = 0; i < placeholderNodes.length; i += 1) {
            placeholderNodes[i].setAttribute('placeholder', getCopy(placeholderNodes[i].getAttribute('data-gg-copy-placeholder')));
          }

          for (i = 0; i < titleNodes.length; i += 1) {
            titleNodes[i].setAttribute('title', getCopy(titleNodes[i].getAttribute('data-gg-copy-title')));
          }

          for (i = 0; i < ariaNodes.length; i += 1) {
            ariaNodes[i].setAttribute('aria-label', getCopy(ariaNodes[i].getAttribute('data-gg-copy-aria-label')));
          }
        }

        function syncLanguageButtons() {
          var i;
          var node;
          var active;

          for (i = 0; i < ui.langButtons.length; i += 1) {
            node = ui.langButtons[i];
            active = node.getAttribute('data-gg-lang-option') === state.locale;
            node.setAttribute('data-gg-active', active ? 'true' : 'false');
            node.setAttribute('aria-pressed', active ? 'true' : 'false');
          }
        }

        function syncThemeButtons() {
          var i;
          var node;
          var active;

          for (i = 0; i < ui.themeButtons.length; i += 1) {
            node = ui.themeButtons[i];
            active = node.getAttribute('data-gg-theme-option') === state.theme;
            node.setAttribute('data-gg-active', active ? 'true' : 'false');
            node.setAttribute('aria-pressed', active ? 'true' : 'false');
          }
        }

        function setLocale(locale, skipPersist) {
          state.locale = normalizeLocale(locale);
          if (ui.shell) ui.shell.setAttribute('data-gg-lang', state.locale);
          document.documentElement.setAttribute('lang', state.locale);

          if (!skipPersist) {
            try {
              if (window.localStorage) window.localStorage.setItem('gg:lang', state.locale);
            } catch (error) {
              /* ignore storage failures */
            }
          }

          GG.copy.locale = state.locale;
          applyCopy(document);
          syncLanguageButtons();
          syncLoadMoreCopy();
          syncDetailCommentCopy();
          syncArticleMetaDates();
          syncSearchEmptyState();
          syncError404State();
          renderDetailOutline();
          hydratePreviewForLocale();

          if (state.panelActive === 'command' && state.discoveryIndex) {
            renderDiscovery(getCommandValue(), {
              open: false
            });
          }
        }

        function setTheme(theme, skipPersist) {
          state.theme = normalizeTheme(theme);

          if (state.theme === 'light' || state.theme === 'dark') {
            document.documentElement.setAttribute('data-gg-theme', state.theme);
          } else {
            document.documentElement.removeAttribute('data-gg-theme');
          }

          if (!skipPersist) {
            try {
              if (window.localStorage) window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
            } catch (error) {
              /* ignore storage failures */
            }
          }

          syncThemeButtons();
        }

        function safeUrl(value) {
