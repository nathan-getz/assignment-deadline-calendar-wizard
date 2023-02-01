var app = Application.currentApplication()
app.includeStandardAdditions = true


// takes the file path of a CSV file and return an array generated from the file
function readCSVToArray(filePath) {
	let lines = app.read(Path(filePath), { usingDelimiter: "\r\n" })
	
	// slice(1) to exclude format specifications in the first line
	let array = lines.slice(1).map(function (line) {
		return line.split(",").map(function (cell) { return cell.trim() });
	});
	return array;
};

function convert24HourTo12Hour(timeString) {
	var t = timeString.split(":").map(Number);
	var AmOrPm = t[0] >= 12 ? " PM" : " AM";
	t[0] = (t[0] % 12) || 12;
	return t[0] + ":" + t[1] + AmOrPm;
}

var alarms = "BEGIN:VALARM\n" +
"ACTION:DISPLAY\n" +
"DESCRIPTION:Reminder\n" +
"TRIGGER:-PT15H\n" +
"END:VALARM\n" +
"BEGIN:VALARM\n" +
"ACTION:DISPLAY\n" +
"DESCRIPTION:Reminder\n" +
"TRIGGER:PT9H\n" +
"END:VALARM\n";

// create an iCal VEVENT block and return it as a string
function createEventData(name, date, time="", url="", uid=name.split(/[\s:]+/).join("_")) {
	let event = "BEGIN:VEVENT\n" +
	"UID:" + uid + "\n" +
	"DTSTART;VALUE=DATE:" + date.split("-").join("") + "\n" +
	"SEQUENCE:0\n" +
	"STATUS:CONFIRMED\n" +
	"SUMMARY:" + name + "\n" +
	((url != "") ? "URL;VALUE=URI:" + url + "\n" : "") +
	((time != "") ? "DESCRIPTION:Due at " + convert24HourTo12Hour(time) + "\n" : "") +
	alarms +
	"END:VEVENT\n";
	
	return event;
}

// take an array of VEVENT blocks, insert them into a VCALENDAR block, and return the VCALENDAR block
function createCalData(eventsArray) {
	var calData = "BEGIN:VCALENDAR\n" +
	"CALSCALE:GREGORIAN\n" + 
	"PRODID:-//Apple Inc.//macOS 13.0.1//EN\n" +
	"VERSION:2.0\n";
	for (let i = 0; i < eventsArray.length; calData += eventsArray[i++]); 
	calData += "END:VCALENDAR";
	
	return calData;
}

function writeToFile(text, file, extension, overwriteExistingContent) {
    try {
 
        // Convert the file to a string
        var fileString = file.toString() + extension
 
        // Open the file for writing
        var openedFile = app.openForAccess(Path(fileString), { writePermission: true })
 
        // Clear the file if content should be overwritten
        if (overwriteExistingContent) {
            app.setEof(openedFile, { to: 0 })
        }
 
        // Write the new content to the file
        app.write(text, { to: openedFile, startingAt: app.getEof(openedFile) })
 
        // Close the file
        app.closeAccess(openedFile)
 
        // Return a boolean indicating that writing was successful
        return true
    }
    catch(error) {
 
        try {
            // Close the file
            app.closeAccess(file)
        }
        catch(error) {
            // Report the error is closing failed
            console.log(`Couldn't close file: ${error}`)
        }
 
        // Return a boolean indicating that writing was successful
        return false
    }
}

function getFilename (str) {return str.substring(str.lastIndexOf('/')+1).replace(".csv", "")};


function generateCalFile() {
	// Get file path from user
	var inFilePath = app.chooseFile({
    	withPrompt: "Please select your CSV file:",
		ofType: ["csv"]
	}).toString()

	var outFilePath = app.chooseFileName({
		defaultName: getFilename(inFilePath),
		defaultLocation: inFilePath,
    	withPrompt: "Save calendar file as:",
		ofType: ["ics"],
	
	}).toString()

	// Read file into a 2D array
	var data = readCSVToArray(inFilePath)

	var events = data.map(function (line) {
		return createEventData(name=(line[0] + ": " + line[1]), date=line[2], time=line[3], url=line[4]);
	})

	if (writeToFile(createCalData(events), outFilePath, ".ics", true)) {
		app.displayAlert("Success! File was saved at \"" + outFilePath + ".ics\"", {
			message: "You can now import it into your calendar app.",
			buttons: ["OK"],
			defaultButton: "OK"
		})
	}
}

function newCSVTemplate() {
	let outFilePath = app.chooseFileName({
		defaultName: "Assignment Deadlines",
    	withPrompt: "Save template as:",
		ofType: ["csv"],
	
	}).toString()
	if (writeToFile("Course,Assignment,Date (YYYY-DD-MM),Time in 24Hour Format (HH:MM),Assignment URL", outFilePath, ".csv", true)) {
		app.displayAlert("Success! File was saved at \"" + outFilePath + ".csv\"", {
			message: "Open it in a file editor to add events",
			buttons: ["OK"],
			defaultButton: "OK"
		})
	}
}

var quit = false

while(!quit) {
	let choice = app.displayDialog("Assignment Deadline Calendar Wizard", {
		buttons: ["Generate calendar events from CSV file", "New CSV template", "Quit"],
		defaultButton: "Generate calendar events from CSV file"
	})
	
	switch(choice["buttonReturned"]) {
  		case "Generate calendar events from CSV file":
    		generateCalFile()
    		break;
			
  		case "New CSV template":
    		newCSVTemplate();
    		break;
			
		case "Quit":
			quit = true;
			break;
			
  		default:
		
	}
}