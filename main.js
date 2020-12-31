function songSubmit(e)
{
	var songFile = document.getElementById("songFile").files
	var mode = document.getElementById("modeSelect").value
	var redBrightness = mode == "channel" ? document.getElementById("redMulti").value : document.getElementById("brightnessMulti").value
	var greenBrightness = mode == "channel" ? document.getElementById("greenMulti").value : document.getElementById("brightnessMulti").value
	var blueBrightness = mode == "channel" ? document.getElementById("blueMulti").value : document.getElementById("brightnessMulti").value
	var colorData = document.getElementById("colorData").value
	
	if(songFile.length <= 0)
	{
		alert("No file")
		return false
	}

	var reader = new FileReader()
	reader.readAsText(songFile[0]);
	reader.onload = function(f)
	{
		var json = null

		try {
			json = JSON.parse(f.target.result)
		} catch (error) {
			alert("Not a valid JSON file")
			return false;
		}
		
		if(json._events != null)
		{
			json._events.forEach((event, index) => {
				if(event._customData != null && event._customData._color != null && event._customData._color.length == 3)
				{
					if(mode == "color")
					{
						var target = event._customData._color
						parseColorData(colorData).forEach(c => {
							if(c.length != 2)
								return

							var arr = c[0]
							var multi = c[1]

							console.log(arr.join(",") + " vs " + target.join(","))

							if(arr.length == 3 && arr[0] == target[0] && arr[1] == target[1] && arr[2] == target[2])
							{
								console.log("Hit")
								json._events[index]._customData._color = target.map(x => x * multi)
							}
						})
					}else{
						json._events[index]._customData._color[0] *= redBrightness;
						json._events[index]._customData._color[1] *= greenBrightness;
						json._events[index]._customData._color[2] *= blueBrightness;
					}
				}
			});

			var filename = songFile[0].name
			var extidx = filename.lastIndexOf(".")
			var name = filename.substr(0, extidx)
			var ext = filename.substr(extidx, filename.length)

			exportToJsonFile(name + "_bright" + ext, json)
		}else{
			alert("Empty or invalid song file")
			return false
		}
	};

	return false;
}

function exportToJsonFile(filename, jsonData) {
	let dataStr = JSON.stringify(jsonData);
	let dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
	
	let linkElement = document.createElement("a");
	linkElement.setAttribute("href", dataUri);
	linkElement.setAttribute("download", filename);
	linkElement.click();
}

function parseColorData(data) {
	var x = []
	var lines = data.split("\n")
	lines.forEach(l => {
		var a = l.split(",")
		
		var hex = a[0].toUpperCase().split("#")
		hex = hex.length == 1 ? hex[0] : hex[1]

		var multi = parseFloat(a[1])
		
		x.push([colorHexToArray(hex), multi])
	});

	return x
}

function colorArrayToHex(arr) {
	var r = (arr[0] % 1).toString(16)
	var g = (arr[1] % 1).toString(16)
	var b = (arr[2] % 1).toString(16)
	r = r.length == 1 ? "0" + r : r
	g = g.length == 1 ? "0" + g : g
	b = b.length == 1 ? "0" + b : b

	return r + g + b
}

function colorHexToArray(hex) {
	if(hex.length != 6)
		return [1, 1, 1]

	var arr = hex.match(/.{2}/g)
	arr = arr.map(x => (parseInt(x, 16) / 255).toFixed(3))
	return arr
}

function toggleSettings() {
	var mode = document.getElementById("modeSelect").value
	var globalSettingsPanel = document.getElementById("globalSettings")
	var perChannelSettingsPanel = document.getElementById("perChannelSettings")
	var perColorSettingsPanel = document.getElementById("perColorSettings")

	globalSettingsPanel.style.display = mode == "simple" ? "block" : "none"
	perChannelSettingsPanel.style.display = mode == "channel" ? "block" : "none"
	perColorSettingsPanel.style.display = mode == "color" ? "block" : "none"
}

function setupForm() {
	toggleSettings()
}

function updateSliderHelp(e) {
	document.getElementById(e.id + "Helper").textContent = e.value + "x"
}

function updateColor(e) {
	var id = e.id.split("colorHex")[1]
	document.getElementById("colorPreview" + id).style.backgroundColor = "#" + e.value
	console.log(1)
}