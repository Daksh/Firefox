var sugar = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("sugar-strings");
    
    // add our custom style sheet for better sugar integration
    // see http://developer.mozilla.org/en/docs/Using_the_Stylesheet_Service
    var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                    .getService(Components.interfaces.nsIStyleSheetService);
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
    var uri = ios.newURI("chrome://sugar/content/sugar.css", null, null);
    if (!sss.sheetRegistered(uri, sss.AGENT_SHEET)) {
	sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
    }

    // add a download manager listener.
    this.dlMgr = Components.classes["@mozilla.org/download-manager;1"]
                           .getService(Components.interfaces.nsIDownloadManager);
              
    this.dlMgr.addListener(sugar);
    
    // Open the database, placing its file in the profile directory
    
    this.dbFile = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
    this.dbFile.append("sugar.sqlite");
    
    // Get access to the storage service and open the database
    
    this.storageService = Components.classes["@mozilla.org/storage/service;1"]
                        .getService(Components.interfaces.mozIStorageService);
    
    var dbConn = this.storageService.openDatabase(this.dbFile);
        
    // Now create the table; if it already exists, this fails, but we don't care!
    
    dbConn.executeSimpleSQL("CREATE TABLE items (source TEXT, size INTEGER, startTime INTEGER, endTime INTEGER, speed REAL, status INTEGER)");
    dbConn.close();
  },
  
  logTransferCompleted: function(aDownload) {
      var endTime = new Date();                     // Current time is the end time
      
      // Issue the REPLACE sqlite command to update the record.  We find a record for the same
      // source URI and start time, then update the end time, size, and speed entries in the
      // record.  By matching on both source URI and start time, we support logging multiple
      // downloads of the same file.
      
      var dbConn = this.storageService.openDatabase(this.dbFile);
      var statement = dbConn.createStatement("UPDATE items SET size=?1, endTime=?2, speed=?3, status=?4 WHERE source=?5 and startTime=?6");
      statement.bindInt64Parameter(0, aDownload.size);
      statement.bindInt64Parameter(1, endTime.getTime());
      statement.bindDoubleParameter(2, aDownload.speed);
      statement.bindInt32Parameter(3, aDownload.state);
      statement.bindStringParameter(4, aDownload.source.spec);
      statement.bindInt64Parameter(5, aDownload.startTime);
      statement.execute();
      statement.reset();
      dbConn.close();
  },
  
  onDownloadStateChange: function(aState, aDownload) {
    var statement;
    
    switch(aDownload.state) {
      case Components.interfaces.nsIDownloadManager.DOWNLOAD_DOWNLOADING:
      
        // Add a new row for the download being started; each row includes the source URI, size,
        // and start time.  The end time and download speed are both set to 0 at first, since we
        // don't know those yet.
        
        // status is the same status value that came from the download manager.
        
        var dbConn = this.storageService.openDatabase(this.dbFile);
        statement = dbConn.createStatement("REPLACE INTO items VALUES (?1, ?2, ?3, 0, 0.0, 0)");
  
        statement.bindStringParameter(0, aDownload.source.spec);
        statement.bindInt64Parameter(1, aDownload.size);
        statement.bindInt64Parameter(2, aDownload.startTime);
        statement.execute();
        statement.reset();
        dbConn.close();
        break;
        
      // Record the completion (whether failed or successful) of the download

      case Components.interfaces.nsIDownloadManager.DOWNLOAD_FINISHED:
      case Components.interfaces.nsIDownloadManager.DOWNLOAD_FAILED:
      case Components.interfaces.nsIDownloadManager.DOWNLOAD_CANCELED:
        this.logTransferCompleted(aDownload);
        break;
    }
  },

  // Handle choosing the Download Logger menu option
  
  onMenuItemCommand: function(e) {
    window.open("chrome://sugar/content/dlwindow.xul", "dllogwindow", "chrome, width=600, height=400, resizable=yes, centerscreen");    
  },


};

window.addEventListener("load", function(e) { sugar.onLoad(e); }, false);
