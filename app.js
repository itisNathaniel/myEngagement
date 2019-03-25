const express = require('express')
const fs = require('fs');
const app = express()
const fileUpload = require('express-fileupload');
const csvtojsonV2 = require("csvtojson/v2");
const port = 3000

// Global Arrays
let attendanceArray;
let absentArray;
let unexpectedArray;
let scheduledAbsentArray;
let accessArray;
let accomodationAccessArray;
let vleLoginArray;
let vleRecordingArray;
let webpaArray;
let wifiArray;
let printingArray;
let printingScannerArray;
let printingCopyArray;
let ssoSignInArray;
let ssoUnionArray;
let ssoLoginSEATSArray;
let ssoLoginHousingProvider;
let libraryAccessArray;
let universityAppAccessArray;
let libraryResourceArray;
let inductionArray;
let unknownArray;

app.use(fileUpload());
app.get('/',function(req,res) {
    res.render('pages/index');
});

let loopcount = 0;

async function getSubset(array, callback)
{
    // clear arrays
    attendanceArray = [];
    absentArray = [];
    unexpectedArray = [];
    scheduledAbsentArray = [];
    accessArray = [];
    libraryAccessArray = [];
    libraryResourceArray = [];
    vleLoginArray = [];
    vleRecordingArray = [];
    webpaArray = [];
    wifiArray = [];
    printingArray = [];
    printingScannerArray = [];
    printingCopyArray = [];
    ssoSignInArray = [];
    ssoLoginSEATSArray = [];
    ssoUnionArray = [];
    ssoLoginHousingProvider = [];
    universityAppAccessArray = [];
    accomodationAccessArray = [];
    inductionArray = [];
    unknownArray = [];

    for (var i = 0, len = array.length; i < len; i++)    {      
        loopcount++;
        let j = array[i];
        let item = Object.keys(j).map(function(_) { return j[_]; });

        if(item[0] == "Attendance")
        {
            attendanceArray.push(item);
        }
        else if(item[0] == "Absent")
        {
            absentArray.push(item);
        }
        else if(item[0] == "Unexpected")
        {
            unexpectedArray.push(item);
        }
        else if(item[0] == "Scheduled Absence")
        {
            scheduledAbsentArray.push(item);
        }
        else if(item[0] == "Access to Campus")
        {
            accessArray.push(item);
        }
        else if(item[2] == "https://hulluniunion.com/samlauth/module.php/saml/sp/metadata.php/hulluni")
        {
            ssoUnionArray.push(item);
        }
        else if(item[2] == "https://hullstudent.com/samlauth/module.php/saml/sp/metadata.php/hulluni")
        {
            ssoUnionArray.push(item);
        }
        else if(item[0] == "Generic VLE Logon")
        {
            vleLoginArray.push(item);
        }
        else if(item[1] == "PING_CANVAS Ping Federate Access")
        {
            vleLoginArray.push(item);
        }
        else if(item[2] == "https://uoh.cloud.panopto.eu/Panopto/Pages/Auth/Login.aspx")
        {
            vleRecordingArray.push(item);
        } 
        else if(item[2] == "https://webpa-prod.hull.ac.uk/entity")
        {
            vleLoginArray.push(item);
        }
        else if(item[1] == "LOGON_SEATS Ping Federate Access")
        {
            ssoLoginSEATSArray.push(item);
        }
        else if(item[2] == "https://hull.seats.cloud/")
        {
            ssoLoginSEATSArray.push(item);
        }
        else if(item[1] == "PING_SEATS Ping Federate Access")
        {
            ssoLoginSEATSArray.push(item);
        }
        else if(item[0] == "Wifi Eduroam Campus")
        {
            wifiArray.push(item);
        }
        else if(item[1] == "WIFI_EDUROAM_CAMPUS Shared WIFI Login")
        {
            wifiArray.push(item);
        }
        else if(item[0] == "Access to Library")
        {
            libraryAccessArray.push(item);
        }
        else if(item[0] == "Library Resource Logon")
        {
            libraryResourceArray.push(item);
        }
        else if(item[1] == "LOGON_LIB_ELECTRONIC_RESOURCE Ping Federate Access")
        {
            libraryResourceArray.push(item);
        }
        else if(item[1] == "PING_LIB_ELECTRONIC_RESOURCE Ping Federate Access")
        {
            libraryResourceArray.push(item);
        }
        else if(item[1] == "ACCESS_ACCOMMODATION")
        {
            accomodationAccessArray.push(item);
        }
        else if(item[2] == "https://hull.starrezhousing.com/StarRezPortal/")
        {
            ssoLoginHousingProvider.push(item);
        }
        else if(item[1] == "Access_Accomodation")
        {
            accomodationAccessArray.push(item);
        }
        else if(item[0] == "General Printing")
        {
            printingArray.push(item);
        }
        else if(item[0] == "Print Scan")
        {
            printingScannerArray.push(item);
        }
        else if(item[0] == "Print Copy")
        {
            printingCopyArray.push(item);
        }
        else if(item[0] == "University App Logon")
        {
            universityAppAccessArray.push(item);
        }
        else if(item[1] == "PING_I_HULL Ping Federate Access")
        {
            universityAppAccessArray.push(item);
        }
        else if(item[1] == "LOGON_I_HULL Ping Federate Access")
        {
            universityAppAccessArray.push(item);
        }
        else if(item[2] == "https://induction.hull.ac.uk/saml/metadata")
        {
            inductionArray.push(item);
        }
        else if(item[0] == "Unspecified Logon")
        {
            ssoSignInArray.push(item);
        }
        else 
        {
            unknownArray.push(await item);
        }  

        if(loopcount == array.length)
        {
            return;
        }
    }
}

app.post('/process', async function(req, res) {
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    // The name of the input field (i.e. "uploadedFile") is used to retrieve the uploaded file
    let uploadedFile = req.files.uploadedFile;
  
    let path = __dirname + '/tmp/data.csv';
    // Use the mv() method to place the file somewhere on your server
    uploadedFile.mv(path, function(err) {
      if (err)
        return res.status(500).send(err);
      });

    const jsonArray=await csvtojsonV2().fromFile(path).then(
        (jsonObj)=>{
            getSubset(jsonObj).then(
                (jsonObj)=>{
                    console.log(attendanceArray);
                }).then(()=>{
                    res.render('pages/results', {
                        sessionAttended: attendanceArray,
                        sessionAbsent: absentArray,
                        sessionUnexpected: unexpectedArray,
                        sessionAuthAbsent: scheduledAbsentArray,
                        accessGeneral: accessArray,
                        libraryAccess: libraryAccessArray,
                        accomodationAccess: accomodationAccessArray,
                        libraryResource: libraryResourceArray,
                        vleLogin: vleLoginArray,
                        wifiLogin: wifiArray,
                        printingGeneral: printingArray,
                        printingScanner: printingScannerArray,
                        printingCopy: printingCopyArray,
                        ssoGeneral: ssoSignInArray,
                        ssoSEATS: ssoLoginSEATSArray,
                        ssoHousing: ssoLoginHousingProvider,
                        universityApp: universityAppAccessArray,
                        induction: inductionArray,
                        unknown: unknownArray,
                    });
                })
    })

});

app.set('view engine', 'ejs');
app.listen(port, () => console.log(`Example app listening on port ${port}!`))