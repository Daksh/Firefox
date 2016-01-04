var sugar_dlwindow = {
  onLoad: function() {    
    // Open the database
    
    this.dbFile = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
    this.dbFile.append("sugar.sqlite");
    
    // Get access to the storage service and open the database
    
    this.storageService = Components.classes["@mozilla.org/storage/service;1"]
                        .getService(Components.interfaces.mozIStorageService);
    
    var dbConn = this.storageService.openDatabase(this.dbFile);
    
    var loglist = document.getElementById("loglist");

    var statement = dbConn.createStatement("SELECT * FROM items");   // Get all items in table
    try {
      while (statement.executeStep()) {
        var row = document.createElement('listitem');
        
        // Add the cells to the row
        
        var cell = document.createElement('listcell');
        var sourceStr = statement.getString(0);
        row.setAttribute("tooltiptext", sourceStr);
        sourceStr = sourceStr.slice(sourceStr.lastIndexOf("/")+1, sourceStr.length);
        cell.setAttribute("label", sourceStr);   // Source
        row.appendChild(cell);
        
        cell = document.createElement('listcell');
        cell.setAttribute("label", (statement.getInt64(1) / 1024).toFixed(1) + "KB");    // Size
        cell.setAttribute("style", "text-align:right");
        row.appendChild(cell);
        
        var theDate = new Date(statement.getInt64(2) / 1000);        // Start time
        cell = document.createElement('listcell');
        var dateStr = theDate.toLocaleString();
        cell.setAttribute("label", dateStr);
        row.appendChild(cell);
        
        theDate = new Date(statement.getInt64(3));            // End time
        cell = document.createElement('listcell');
        dateStr = theDate.toLocaleString();
        cell.setAttribute("label", dateStr);
        row.appendChild(cell);
        
        var speed = statement.getDouble(4) / 1024.0;
        cell = document.createElement('listcell');
        cell.setAttribute("label", speed.toFixed(1) + "KB/sec");
        cell.setAttribute("style", "text-align:right");
        row.appendChild(cell);
        
        var status = statement.getInt32(5);
        var style = "color:black";
        cell = document.createElement('listcell');

        var statusStr;
        
        switch(status) {
          case 0:
            statusStr = "Downloading";
            break;
          case 1:
            statusStr = "Complete";
            style = "color:green";
            break;
          case 2:
            statusStr = "Failed";
            style = "color:red";
            break;
          case 3:
            statusStr = "Canceled";
            style = "color:purple";
            break;
          case 4:
            statusStr = "Paused";
            style = "color:blue";
            break;
          case 5:
            statusStr = "Queued";
            style = "color:teal";
            break;
          case 6:
            statusStr = "Blocked";
            style = "color:white background-color:red";
            break;
          case 7:
            statusStr = "Scanning";
            style = "color:silver";
            break;
          default:
            statusStr = "Unknown";
            break;
        }
        cell.setAttribute("label", statusStr);
        cell.setAttribute("style", style);
        row.appendChild(cell);
        
        loglist.appendChild(row);
      }
    } finally {
      statement.reset();
      dbConn = null;
    }
  }
  
};

window.addEventListener("load", function(e) { sugar_dlwindow.onLoad(e); }, false);
