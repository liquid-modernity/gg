(function () {
      try {
        var theme = window.localStorage && window.localStorage.getItem('gg:theme');
        if (theme !== 'dark') {
          theme = 'light';
          if (window.localStorage) window.localStorage.setItem('gg:theme', theme);
        }
        document.documentElement.setAttribute('data-gg-theme', theme);
      } catch (error) {}
    }());
