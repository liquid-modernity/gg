        window.addEventListener('hashchange', function () {
          applySurfaceContract();
          syncLaunchPathState();
        });

        bindBootStateListeners();
        observeStartupLongTasks();
        syncNetworkState();
        syncDisplayModeState();
        syncLaunchPathState();

        if (maybeRedirectStandaloneLaunch()) return;

        applySurfaceContract();
        setTheme(readPreferredTheme(), true);
        setLocale(readPreferredLocale(), true);
        initDockVisibility();
        initDetailOutline();
        initPwaClient();
        markShellReady();
        markFirstInteractionReady();
        markHydrationDeferred();
        ggIdle(function () {
          initListingGrowth().catch(function () {
            setListingGrowthState('error');
          }).then(function () {
            markHydrationComplete();
            refreshPwaDiagnostics();
          });
        }, 1200);
      }(window.GG));
