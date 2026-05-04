(function () {
      try {
        var theme = window.localStorage && window.localStorage.getItem('gg:theme');
        if (theme === 'light' || theme === 'dark') {
          document.documentElement.setAttribute('data-gg-theme', theme);
        }
      } catch (error) {}
    }());
