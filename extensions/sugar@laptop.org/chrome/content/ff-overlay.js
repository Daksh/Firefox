sugar.setup = function() {
  Console.log("In setup");

  var dlMgr = Components.classes["@mozilla.org/download-manager;1  "]
                        .createInstance(Components.interfaces.nsIDownloadManager);
                        
  dlMgr.addListener(sugar);
};

sugar.onDownloadStateChange = function(aState, aDownload) {
  if (aDownload.state == DOWNLOAD_DOWNLOADING) {
    alert("Download starting.");
  }
  
  if (aDownload.state == DOWNLOAD_FINISHED) {
    alert("Download complete.");
  }
};

Console.log("in ff-overlay.js");
sugar.setup();
