/* 
//@line 38 "/builds/tinderbox/Fx-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/browser/components/sessionstore/src/nsSessionStartup.js"
*/

/**
//@line 64 "/builds/tinderbox/Fx-Mozilla1.9-Release/Linux_2.6.18-53.1.13.el5_Depend/mozilla/browser/components/sessionstore/src/nsSessionStartup.js"
*/

/* :::::::: Constants and Helpers ::::::::::::::: */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const STATE_RUNNING_STR = "running";

function debug(aMsg) {
  aMsg = ("SessionStartup: " + aMsg).replace(/\S{80}/g, "$&\n");
  Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService)
                                     .logStringMessage(aMsg);
}

/* :::::::: The Service ::::::::::::::: */

function SessionStartup() {
}

SessionStartup.prototype = {

  // the state to restore at startup
  _iniString: null,
  _sessionType: Ci.nsISessionStartup.NO_SESSION,

/* ........ Global Event Handlers .............. */

  /**
   * Initialize the component
   */
  init: function sss_init() {
    this._prefBranch = Cc["@mozilla.org/preferences-service;1"].
                       getService(Ci.nsIPrefService).getBranch("browser.");

    // if the service is disabled, do not init 
    if (!this._prefBranch.getBoolPref("sessionstore.enabled"))
      return;

    // get file references
    var dirService = Cc["@mozilla.org/file/directory_service;1"].
                     getService(Ci.nsIProperties);
    this._sessionFile = dirService.get("ProfD", Ci.nsILocalFile);
    this._sessionFile.append("sessionstore.js");
    
    // only read the session file if config allows possibility of restoring
    var resumeFromCrash = this._prefBranch.getBoolPref("sessionstore.resume_from_crash");
    if ((resumeFromCrash || this._doResumeSession()) && this._sessionFile.exists()) {
      // get string containing session state
      this._iniString = this._readFile(this._sessionFile);
      if (this._iniString) {
        try {
          // parse the session state into JS objects
          var s = new Components.utils.Sandbox("about:blank");
          var initialState = Components.utils.evalInSandbox(this._iniString, s);

          // set bool detecting crash
          this._lastSessionCrashed =
            initialState.session && initialState.session.state &&
            initialState.session.state == STATE_RUNNING_STR;
        // invalid .INI file - nothing can be restored
        }
        catch (ex) { debug("The session file is invalid: " + ex); } 
      }
    }

    // prompt and check prefs
    if (this._iniString) {
      if (this._lastSessionCrashed && this._doRecoverSession())
        this._sessionType = Ci.nsISessionStartup.RECOVER_SESSION;
      else if (!this._lastSessionCrashed && this._doResumeSession())
        this._sessionType = Ci.nsISessionStartup.RESUME_SESSION;
      else
        this._iniString = null; // reset the state string
    }

    if (this._prefBranch.getBoolPref("sessionstore.resume_session_once")) {
      this._prefBranch.setBoolPref("sessionstore.resume_session_once", false);
    }
    
    if (this._sessionType != Ci.nsISessionStartup.NO_SESSION) {
      // wait for the first browser window to open
      var observerService = Cc["@mozilla.org/observer-service;1"].
                            getService(Ci.nsIObserverService);
      observerService.addObserver(this, "domwindowopened", true);
    }
  },

  /**
   * Handle notifications
   */
  observe: function sss_observe(aSubject, aTopic, aData) {
    var observerService = Cc["@mozilla.org/observer-service;1"].
                          getService(Ci.nsIObserverService);

    switch (aTopic) {
    case "app-startup": 
      observerService.addObserver(this, "final-ui-startup", true);
      break;
    case "final-ui-startup": 
      observerService.removeObserver(this, "final-ui-startup");
      this.init();
      break;
    case "domwindowopened":
      var window = aSubject;
      var self = this;
      window.addEventListener("load", function() {
        self._onWindowOpened(window);
        window.removeEventListener("load", arguments.callee, false);
      }, false);
      break;
    }
  },

  /**
   * Removes the default arguments from the first browser window
   * (and removes the "domwindowopened" observer afterwards).
   */
  _onWindowOpened: function sss_onWindowOpened(aWindow) {
    var wType = aWindow.document.documentElement.getAttribute("windowtype");
    if (wType != "navigator:browser")
      return;
    
    /**
     * Note: this relies on the fact that nsBrowserContentHandler will return
     * a different value the first time its getter is called after an update,
     * due to its needHomePageOverride() logic. We don't want to remove the
     * default arguments in the update case, since they include the "What's
     * New" page.
     *
     * Since we're garanteed to be at least the second caller of defaultArgs
     * (nsBrowserContentHandler calls it to determine which arguments to pass
     * at startup), we know that if the window's arguments don't match the
     * current defaultArguments, we're either in the update case, or we're
     * launching a non-default browser window, so we shouldn't remove the
     * window's arguments.
     */
    var defaultArgs = Cc["@mozilla.org/browser/clh;1"].
                      getService(Ci.nsIBrowserHandler).defaultArgs;
    if (aWindow.arguments && aWindow.arguments[0] &&
        aWindow.arguments[0] == defaultArgs)
      aWindow.arguments[0] = null;
    
    var observerService = Cc["@mozilla.org/observer-service;1"].
                          getService(Ci.nsIObserverService);
    observerService.removeObserver(this, "domwindowopened");
  },

/* ........ Public API ................*/

  /**
   * Get the session state as a string
   */
  get state() {
    return this._iniString;
  },

  /**
   * Determine whether there is a pending session restore.
   * @returns bool
   */
  doRestore: function sss_doRestore() {
    return this._sessionType != Ci.nsISessionStartup.NO_SESSION;
  },

  /**
   * Get the type of pending session store, if any.
   */
  get sessionType() {
    return this._sessionType;
  },

/* ........ Auxiliary Functions .............. */

  /**
   * Whether or not to resume session, if not recovering from a crash.
   * @returns bool
   */
  _doResumeSession: function sss_doResumeSession() {
    return this._prefBranch.getIntPref("startup.page") == 3 || 
      this._prefBranch.getBoolPref("sessionstore.resume_session_once");
  },

  /**
   * prompt user whether or not to restore the previous session,
   * if the browser crashed
   * @returns bool
   */
  _doRecoverSession: function sss_doRecoverSession() {
    // do not prompt or resume, post-crash
    if (!this._prefBranch.getBoolPref("sessionstore.resume_from_crash"))
      return false;

    // if the prompt fails, recover anyway
    var recover = true;

    // allow extensions to hook in a more elaborate restore prompt
    // XXXzeniko drop this when we're using our own dialog instead of a standard prompt
    var dialogURI = null;
    try {
      dialogURI = this._prefBranch.getCharPref("sessionstore.restore_prompt_uri");
    }
    catch (ex) { }
    
    try {
      if (dialogURI) { // extension provided dialog 
        var params = Cc["@mozilla.org/embedcomp/dialogparam;1"].
                     createInstance(Ci.nsIDialogParamBlock);
        // default to recovering
        params.SetInt(0, 0);
        Cc["@mozilla.org/embedcomp/window-watcher;1"].
        getService(Ci.nsIWindowWatcher).
        openWindow(null, dialogURI, "_blank", 
                   "chrome,modal,centerscreen,titlebar", params);
        recover = params.GetInt(0) == 0;
      }
      else { // basic prompt with no options
        // get app name from branding properties
        var brandStringBundle = this._getStringBundle("chrome://branding/locale/brand.properties");
        var brandShortName = brandStringBundle.GetStringFromName("brandShortName");

        // create prompt strings
        var ssStringBundle = this._getStringBundle("chrome://browser/locale/sessionstore.properties");
        var restoreTitle = ssStringBundle.formatStringFromName("restoredTitle", [brandShortName], 1);
        var restoreText = ssStringBundle.formatStringFromName("restoredMsg", [brandShortName], 1);
        var okTitle = ssStringBundle.GetStringFromName("okTitle");
        var cancelTitle = ssStringBundle.GetStringFromName("cancelTitle");

        var promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"].
                            getService(Ci.nsIPromptService);

        // set the buttons that will appear on the dialog
        var flags = promptService.BUTTON_TITLE_IS_STRING * promptService.BUTTON_POS_0 +
                    promptService.BUTTON_TITLE_IS_STRING * promptService.BUTTON_POS_1 +
                    promptService.BUTTON_POS_0_DEFAULT;
        
        var buttonChoice = promptService.confirmEx(null, restoreTitle, restoreText, 
                                          flags, okTitle, cancelTitle, null, 
                                          null, {});
        recover = (buttonChoice == 0);
      }
    }
    catch (ex) { dump(ex + "\n"); } // if the prompt fails, recover anyway
    return recover;
  },

  /**
   * Convenience method to get localized string bundles
   * @param aURI
   * @returns nsIStringBundle
   */
  _getStringBundle: function sss_getStringBundle(aURI) {
    var bundleService = Cc["@mozilla.org/intl/stringbundle;1"].
                        getService(Ci.nsIStringBundleService);
    var appLocale = Cc["@mozilla.org/intl/nslocaleservice;1"].
                    getService(Ci.nsILocaleService).getApplicationLocale();
    return bundleService.createBundle(aURI, appLocale);
  },

/* ........ Storage API .............. */

  /**
   * reads a file into a string
   * @param aFile
   *        nsIFile
   * @returns string
   */
  _readFile: function sss_readFile(aFile) {
    try {
      var stream = Cc["@mozilla.org/network/file-input-stream;1"].
                   createInstance(Ci.nsIFileInputStream);
      stream.init(aFile, 0x01, 0, 0);
      var cvstream = Cc["@mozilla.org/intl/converter-input-stream;1"].
                     createInstance(Ci.nsIConverterInputStream);
      cvstream.init(stream, "UTF-8", 1024, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
      
      var content = "";
      var data = {};
      while (cvstream.readString(4096, data)) {
        content += data.value;
      }
      cvstream.close();
      
      return content.replace(/\r\n?/g, "\n");
    }
    catch (ex) { } // inexisting file?
    
    return null;
  },

  /* ........ QueryInterface .............. */
  QueryInterface : XPCOMUtils.generateQI([Ci.nsIObserver,
                                          Ci.nsISupportsWeakReference,
                                          Ci.nsISessionStartup]),
  classDescription: "Browser Session Startup Service",
  classID:          Components.ID("{ec7a6c20-e081-11da-8ad9-0800200c9a66}"),
  contractID:       "@mozilla.org/browser/sessionstartup;1",

  // get this contractID registered for certain categories via XPCOMUtils
  _xpcom_categories: [
    // make ourselves a startup observer
    { category: "app-startup", service: true }
  ]

};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) {
  return XPCOMUtils.generateModule([SessionStartup]);
}

