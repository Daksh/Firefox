// OLPC Firefox customizations.
// most of the gtk theming should be 'magic': eg, see mozilla bug #353785.

// match dpi of Browse activity
// xxx: can't find where this is set?
pref("layout.css.dpi", 134);

// don't show the initial EULA acceptance screen.
// (see debian bug #491536)
pref("browser.EULA.override", true);

// don't try to use Firefox's automatic update mechanism
// (also in /usr/lib/xulrunner-1.9/defaults/pref/all-redhat.js)
pref("app.update.enabled", false);
pref("app.update.auto", false);
pref("app.update.autoInstallEnabled", false);
user_pref("app.update.enabled", false);

// other prefs from all-redhat.js
pref("intl.locale.matchOS", true);
pref("browser.display.use_system_colors", true);

// don't check to see if we're the default browser.
pref("browser.shell.checkDefaultBrowser", false);
user_pref("pref.general.disable_button.default_browser", false);

// limit cache
pref("browser.cache.disk.capacity", 10000); // 10M disk cache
user_pref("browser.cache.disk.capacity", 10000);
pref("browser.cache.memory.capacity", 5000); // 5M memory cache
pref("config.trim_on_minimize", true); // use as little ram as possible when bg

// our own homepage.
pref("browser.startup.homepage", "file:///usr/share/library-common/index.html");
// avoid showing the "this is the first time you've seen firefox" window
pref("browser.startup.homepage_override.mstone", "ignore");

// hide nag about missing plugins
pref("plugins.hide_infobar_for_missing_plugin", true);

// don't show download manager window; our sugar integration extension
// will handle this via the journal.
pref("browser.download.manager.showWhenStarting", false);

// from /usr/share/hulahop/prefs.js: ------------------------------------

// Disable links prefetch
pref("network.prefetch-next", false);

// Disable onload popups
pref("dom.disable_open_during_load", true);

// Disable usless security warnings
pref("security.warn_entering_secure", false);
pref("security.warn_entering_secure.show_once", true);
pref("security.warn_leaving_secure", false);
pref("security.warn_leaving_secure.show_once", false);
pref("security.warn_submit_insecure", false);
pref("security.warn_submit_insecure.show_once", false);
pref("security.warn_viewing_mixed", true);
pref("security.warn_viewing_mixed.show_once", false);
pref("security.warn_entering_weak", true);
pref("security.warn_entering_weak.show_once", false);

// Set some style properties to not follow our dark gtk theme
pref("ui.-moz-field", "#FFFFFF");
pref("ui.-moz-fieldtext", "#000000");
pref("ui.-moz-dialog", "#C0C0C0");
pref("ui.buttonface", "#D3D3DD");
pref("ui.buttontext", "#000000");

// Fonts
pref("font.size.unit", "pt");

pref("font.default.ar", "sans-serif");
pref("font.size.variable.ar", 12);
pref("font.size.fixed.ar", 9);

pref("font.default.el", "serif");
pref("font.size.variable.el", 12);
pref("font.size.fixed.el", 9);

pref("font.default.he", "sans-serif");
pref("font.size.variable.he", 12);
pref("font.size.fixed.he", 9);

pref("font.default.ja", "sans-serif");
pref("font.size.variable.ja", 12);
pref("font.size.fixed.ja", 12);

pref("font.default.ko", "sans-serif");
pref("font.size.variable.ko", 12);
pref("font.size.fixed.ko", 12);

pref("font.default.th", "serif");
pref("font.size.variable.th", 12);
pref("font.size.fixed.th", 9);

pref("font.default.tr", "serif");
pref("font.size.variable.tr", 12);
pref("font.size.fixed.tr", 9);

pref("font.default.x-baltic", "serif");
pref("font.size.variable.x-baltic", 12);
pref("font.size.fixed.x-baltic", 9);

pref("font.default.x-central-euro", "serif");
pref("font.size.variable.x-central-euro", 12);
pref("font.size.fixed.x-central-euro", 9);

pref("font.default.x-cyrillic", "serif");
pref("font.size.variable.x-cyrillic", 12);
pref("font.size.fixed.x-cyrillic", 9);

pref("font.default.x-unicode", "serif");
pref("font.size.variable.x-unicode", 12);
pref("font.size.fixed.x-unicode", 9);

pref("font.default.x-western", "serif");
pref("font.size.variable.x-western", 12);
pref("font.size.fixed.x-western", 9);

pref("font.default.zh-CN", "sans-serif");
pref("font.size.variable.zh-CN", 12);
pref("font.size.fixed.zh-CN", 12);

pref("font.default.zh-TW", "sans-serif");
pref("font.size.variable.zh-TW", 12);
pref("font.size.fixed.zh-TW", 12);

pref("font.default.zh-HK", "sans-serif");
pref("font.size.variable.zh-HK", 12);
pref("font.size.fixed.zh-HK", 12);

//// Enable error pages (xulrunner is missing this pref)
//pref("browser.xul.error_pages.enabled", true);

// Set this to not show messages about loaded guns when about:config 
pref("general.warnOnAboutConfig", false);

// Set the maximum history entries to 50
pref("browser.sessionhistory.max_entries", 50);

// Add vendor useragent string
pref("general.useragent.vendor", "OLPC");
pref("general.useragent.vendorSub", "Firefox-6");
pref("general.useragent.vendorComment", "XO");

// -----------------------------------------
// FOR DEBUGGING.
// see http://developer.mozilla.org/en/docs/Setting_up_extension_development_environment
pref("javascript.options.showInConsole", true);
pref("nglayout.debug.disable_xul_cache", true);
pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.strict", true);
pref("extensions.logging.enabled", true);
