# assignment-deadline-calendar-wizard

This JS script takes an input CSV file and outputs an ICS file.

# CSV Format
Fill out the [template file](Template.csv) according to each field (column) in its header. The header row doesn't need to be deleted, as the 1st record (row) is omitted when the file is processed. This means you should put the your 1st entry in the 2nd record.
Each record should be as follows:

`Course`,`Assignment`,`Date`,`Time`,`URL`

`Course` : The course code/name.

`Assignment` : The title of the assignment

`Date` : The date of the deadline in "YYYY-MM-DD" format.

`Time` : The time of the deadline in "HH:MM" format using 24-hour time.

`URL` (*optional*) : Link to the assignment.

The resulting calendar event will have a SUMMARY property (name) of "`Course`: `Assignment`". The event will be an all-day event and the time is stored in the DESCRIPTION property. If specified, `URL` will be stored in the URL property.
