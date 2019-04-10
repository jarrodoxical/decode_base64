var textPlaceholder =
  "Type input here, or drag file here for base64 file conversion";
var filePlaceholder = "Drop file here to convert to Base64 string";

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/*function doGET(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            // The request is done; did it work?
            if (xhr.status == 200) {
                // ***Yes, use `xhr.responseText` here***
                callback(xhr.responseText);
            } else {
                // ***No, tell the callback the call failed***
                callback(null);
        }
    };
    xhr.open("GET", path);
    xhr.send();
  }
}

function handleFileData(fileData) {
    if (!fileData) {
        // Show error
        return;
    }
    // Use the file data
}*/

function doGET(path, callback) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        // The request is done; did it work?
        if (xhr.status == 200) {
          // Yes, use `xhr.responseText` to resolve the promise
          resolve(xhr.responseText);
        } else {
          // No, reject the promise
          reject(xhr);
        }
      }
    };
    xhr.open("GET", path); //"https://crossorigin.me/"+
    xhr.send();
  });
}

window.addEventListener("load", function() {
  var remoteInput = getParameterByName("remoteinput"); // "lorem"
  var input = getParameterByName("input"); // "lorem"
  var other = window.document.location.toString().split('?');//window.location.search.substr(1);
  if (!remoteInput && !input && other){
	var last = other[other.length - 1];  
	console.log("last",last);
	if (last){
		if (last.startsWith('http')){
			remoteInput = last
		} else {
			input = last
		}
	}
    /*var path = window.document.location.pathname;
    console.log("path",path);
    var res = path.split("/");
    console.log("res",res[res.length - 1]);*/
	//needs a server for path mgmt
	
  }
  console.log("All assets are loaded");
  //remoteInput?remoteInput:remoteInput="https://pastebin.com/raw/xYRJHjgX";
  console.log(remoteInput);
  /*doGET(remoteInput)
      .then(function(fileData) {
          console.log(fileData);
      })
      .catch(function(xhr) {
          console.log(xhr);
      });*/
  //+remoteInput,
  /**/
  if (remoteInput) {
    $("#user_input").text("loading remote resource...");
    $("#result").text("");
    $.ajax({
      url: "https://cors.io/?" + remoteInput,
      success: function(data, textStatus, jqXHR) {
        //console.log(data);
        console.log("ajax-cors-remoteurl successful grab");
        $("#user_input").text(data);
        processChange();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert("failure, please try again later or manually paste to decode");
      }
    });
  } else if (input) {
    $("#user_input").text(input);
    processChange();
  } else {
    processChange();
  }
  /*var url = "https://crossorigin.me/" + remoteInput;
      $.ajax({
        url: url,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
      }).done(function(doc) {
        //var div = document.createElement("div");
        //div.innerHTML = doc;
        console.log(doc);
      });*/
});
//?remoteinput=https://pastebin.com/raw/xYRJHjgX
// query string: ?foo=lorem&bar=&baz
//var foo = getParameterByName('foo'); // "lorem"

$("#user_input").attr("placeholder", textPlaceholder);

$("#user_input").keyup(function() {
  processChange();
});

$("#auto-linkify").change(function() {
  var preventFlag = false;
  var inputVal = $("#user_input").val();
  switch ($("#process").val()) {
    case "url_encode":
      newVal = encodeURIComponent(inputVal);
      break;
    case "url_decode":
      newVal = decodeURIComponent(inputVal);
      break;
    case "base64_encode":
      newVal = window.btoa(inputVal);
      preventFlag = true;
      break;
    case "base64_decode":
      newVal = window.atob(inputVal);
      break;
  }
  if (!preventFlag) processChange();
});

$("#process").change(function() {
  processChange();
});

$("#user_input").on("dragover", function(e) {
  currentText = $("#user_input").text();
  $("#user_input").css("background", "#eee");
  $("#user_input").attr("placeholder", filePlaceholder);
});

$("#user_input").on("dragleave", function(e) {
  $("#user_input").text(currentText);
  $("#user_input").css("background", "#fff");
  $("#user_input").attr("placeholder", textPlaceholder);
});

$("#user_input").on("drop", function(e) {
  e.preventDefault();
  e.stopPropagation();
  var file = e.originalEvent.dataTransfer.files[0];
  var r = new FileReader();
  r.onload = function(f) {
    var contents = f.target.result;
    $("#user_input").css("background", "#fff");
    $("#user_input").attr("placeholder", textPlaceholder);
    console.log("done");
    $("#result").text(contents);
  };
  r.readAsDataURL(file);
});

$("#switch").click(function() {
  let tempU = $("#user_input").val();
  let tempRT = $("#result_text").val();
  let tempR = $("#result").val();
  tempRT ? $("#user_input").text(tempRT) : $("#user_input").text(tempR);
  switch ($("#process").val()) {
    case "base64_encode":
      $("#process").val('base64_decode')
      break;
    case "base64_decode":
      $("#process").val('base64_encode')
      break;
  }
  processChange();
});

$("#decode_now").click(function() {
  processChange();
});

$("#copy_text").click(function() {
  $("#result_text")
    .show()
    .select();
  try {
    var success = document.execCommand("copy");
    if (!success) throw "shucks";
  } catch (e) {
    window.prompt(
      "Your browser doesn't support auto-copying, please copy the preselected text below:",
      $("#result").text()
    );
  }
  //$('#result_text').disableSelection();
  $("#result_text").select(false);
  var autoLink = $("#auto-linkify").is(":checked");
  autoLink
    ? $("#result_text")
        .show()
        .hide()
    : false;
});

function autolinkUrls(text) {
  // urls starting with www
  text = text.replace(
    /(^|[^'"\/])\b((?:www)\.[^\s^<]+)\b(-)?/g,
    "$1<a href='http://$2$3' target='_blank'>$2$3</a>"
  );

  // urls starting with http or https
  text = text.replace(
    /(^|[^'"\/])\b(https?:\/\/[^\s^<]+)\b(-)?/g,
    "$1<a href='$2$3' target='_blank'>$2$3</a>"
  );

  return text;
}

function processChange() {
  var newVal = "";
  var inputVal = $("#user_input").val();

  switch ($("#process").val()) {
    case "url_encode":
      newVal = encodeURIComponent(inputVal);
      break;
    case "url_decode":
      newVal = decodeURIComponent(inputVal);
      break;
    case "base64_encode":
      newVal = window.btoa(inputVal);
      $("#auto-linkify").prop("checked", false);
      break;
    case "base64_decode":
      newVal = window.atob(inputVal);
      break;
  }

  var autoLink = $("#auto-linkify").is(":checked");
  console.log("autoLink: ", autoLink);
  if (autoLink) {
    $("#result")
      .html(autolinkUrls(newVal).replace(/\n/g, "<br>"))
      .show();
    $("#result_text")
      .html(newVal)
      .hide();
  } else {
    $("#result_text")
      .html(newVal)
      .show();
    $("#result").hide();
  }
}