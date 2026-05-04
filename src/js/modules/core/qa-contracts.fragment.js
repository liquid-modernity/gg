        var QA_MANUAL_MATRIX = [
          {
            viewport: 'mobile-portrait',
            intent: 'Primary touch surface.',
            checks: ['listing', 'landing', 'search', 'label', 'archive', 'post', 'detail outline tray', 'preview sheet', 'comments sheet', 'more sheet', '?m=1', 'language switcher', 'appearance switcher', 'drag dismiss']
          },
          {
            viewport: 'mobile-landscape',
            intent: 'Thumb reach plus constrained height.',
            checks: ['dock stability', 'discovery sheet', 'preview top sheet height', 'bottom sheet close affordance']
          },
          {
            viewport: 'tablet-portrait',
            intent: 'Calm reading plus touch control.',
            checks: ['panel motion', 'dock current state', 'olderPageUrl route', 'language persistence']
          },
          {
            viewport: 'tablet-landscape',
            intent: 'Touch-first but wider layout.',
            checks: ['surface contract', 'detail outline tray', 'preview sheet drag', 'comments sheet drag', 'discovery rows keyboard plus touch']
          },
          {
            viewport: 'desktop-narrow',
            intent: 'Keyboard competent.',
            checks: ['ESC close', 'focus return', 'Ctrl/Cmd+K', 'Tab trap in sheets']
          },
          {
            viewport: 'desktop-wide',
            intent: 'Auditability and route verification.',
            checks: ['live route matrix', 'panel controller snapshot', 'legacy bridge ledger', 'runtime smoke report']
          }
        ];

        var PRESS_SELECTOR = [
          '.gg-dock__item',
          '.gg-loadmore',
          '.gg-more-list__link',
          '.gg-more-footer__link',
          '.gg-langswitch__button',
          '.gg-appearance__button',
          '.gg-entry-row__title-trigger',
          '.gg-entry-row__action',
          '.gg-detail-toolbar__action',
          '.gg-detail-outline__peek',
          '.gg-detail-outline__item-button',
          '.gg-discovery-tab',
          DISCOVERY_RESULT_SELECTOR,
          '.gg-discovery-topic__apply',
          '.gg-discovery-topic__archive',
          '.gg-discovery-topic-group__toggle',
          '.gg-discovery-context__action',
          '.gg-discovery-context__archive',
          '.gg-preview__cta'
        ].join(', ');

        var ui = {
