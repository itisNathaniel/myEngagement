const express = require('express')
const fs = require('fs');
const fileUpload = require('express-fileupload');
const csvtojsonV2 = require("csvtojson/v2");
const URL = require('url');
const date = require('date-and-time');

const app = express()
const port = 3000;

// Global Arrays
let attendanceArray;
let AllAbsentArray;
let uninformedAbsentArray;
let informedAbsentArray;
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
let authAbsentCount;
let libraryMostCommonDomain;
let name;
let oldestItemDate;
let mostCommonTimeMissed;
let mostCommonModuleMissed;
let getMostCommonDayOfWeekMissed;

app.use(fileUpload());
app.get('/',function(req,res) {
    res.render('pages/index');
});

let loopcount = 0;

async function getStudentName(name, callback)
{
    var studentName = name.split(" Name: ").pop();
    return studentName;
}

async function getMostCommonTime(array, callback)
{
    let times = [];
    
    for (var i = 0, len = array.length; i < len; i++)    
    {   
        let thisDateTime = (array[i])[3];
        var thisTime = await thisDateTime.split("- ").pop();
        times.push(await thisTime);
    }

    let counts = times.reduce((a, c) => {
        a[c] = (a[c] || 0) + 1;
        return a;
      }, {});
      let maxCount = await Math.max(...Object.values(counts));
      let mostFrequent = Object.keys(counts).filter(k => counts[k] === maxCount);

      let returnSession = await mostFrequent + " (" + await maxCount + " sessions)";
      
    return await returnSession;
}

async function getMostCommonDayOfWeek(array, callback)
{
    let dates = [];
    
    for (var i = 0, len = array.length; i < len; i++)    
    {   
        let thisDateTime = (array[i])[3];
        var thisDay = await (thisDateTime.split(" - ").shift());
        var thisDate = await date.parse(thisDay, 'DD/MM/YYYY');
        var dayOfWeek = await date.format(thisDate, 'dddd');
        dates.push(await dayOfWeek);
    }

    let counts = dates.reduce((a, c) => {
        a[c] = (a[c] || 0) + 1;
        return a;
      }, {});
      let maxCount = Math.max(...Object.values(counts));
      let mostFrequent = Object.keys(counts).filter(k => counts[k] === maxCount);

      let returnSession = mostFrequent + " (" + maxCount + " sessions)";
      
    return await returnSession;
} 

async function getMostCommonMissedModule(array, callback)
{
    let modules = [];
    
    for (var i = 0, len = array.length; i < len; i++)    
    {   
        let thisSession = (array[i])[1];
        var thisModuleName = thisSession.split(" - ").shift();
        modules.push(thisModuleName);
    }

    let counts = modules.reduce((a, c) => {
        a[c] = (a[c] || 0) + 1;
        return a;
      }, {});
      let maxCount = await Math.max(...Object.values(counts));
      let mostFrequent = Object.keys(counts).filter(k => counts[k] === maxCount);
      
      let returnSession = await mostFrequent + " (" + await maxCount + " sessions)";

    return await returnSession;
}

async function wipeData(callback)
{
        // clear arrays
        attendanceArray = [];
        absentArray = [];
        uninformedAbsentArray = [];
        informedAbsentArray = []
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
        authAbsentCount = 0;
        oldestItemDate = null;
        mostCommonTimeMissed = null;
        mostCommonModuleMissed= null;
        getMostCommonDayOfWeekMissed= null;
        return;
}


async function getMostCommonDomain(array, callback)
{
    let bareDomains = [];
    
    for (var i = 0, len = array.length; i < len; i++)    
    {   
        let thisUrl = await (array[i])[2];
        let endString = await URL.parse(thisUrl).hostname;
        bareDomains.push(await endString);
    }

    let counts = bareDomains.reduce((a, c) => {
        a[c] = (a[c] || 0) + 1;
        return a;
      }, {});
      let maxCount = await Math.max(...Object.values(counts));
      let mostFrequent = await Object.keys(counts).filter(k => counts[k] === maxCount);
      
    return mostFrequent;
    
}

async function getSubset(array, callback)
{
    await wipeData();
    let val = await JSON.stringify(array[0]);
    let pos = await val.indexOf("Report: Student Timeline");
    if(await pos > -1)
    {
        for (var i = 0, len = array.length; i < len; i++)    {      
            loopcount++;
            let j = array[i];
            let item = Object.keys(j).map(function(_) { return j[_]; });

            if(item[0] == "Attendance")
            {
                attendanceArray.push(await item);
            }
            else if(item[0] == "Absent")
            {
                absentArray.push(await item);
                if(item[2] == "Authorised Absent")
                {
                    informedAbsentArray.push(await item);
                }
                else
                {
                    uninformedAbsentArray.push(await item);
                }
            }
            else if(item[0] == "Unexpected")
            {
                unexpectedArray.push(item);
            }
            else if(item[0] == "Scheduled Absence")
            {
                scheduledAbsentArray.push(item);
                authAbsentCount++;
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
                webpaArray.push(item);
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
                libraryMostCommonDomain = await getMostCommonDomain(libraryResourceArray);
                name = await getStudentName((unknownArray[0])[0]);
                mostCommonTimeMissed = await getMostCommonTime(uninformedAbsentArray);
                mostCommonModuleMissed = await getMostCommonMissedModule(uninformedAbsentArray);
                getMostCommonDayOfWeekMissed = await getMostCommonDayOfWeek(uninformedAbsentArray);

                Promise.all([getMostCommonDomain(libraryResourceArray), getStudentName((unknownArray[0])[0]), getMostCommonTime(uninformedAbsentArray), getMostCommonMissedModule(uninformedAbsentArray), getMostCommonDayOfWeek(uninformedAbsentArray) ]).
                then(()=>{
                    if(libraryMostCommonDomain != null)
                    {
                        let day = getMostCommonDayOfWeekMissed;
                        console.log(day);
                        return "success";
                    }
                    else {
                        console.log("Error, no domain");
                        return "error"; 
                    }
                    });
            }
        }
    }
    else
    {
        console.log("Error, failed");
        return "error"; 
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
        return res.render('pages/error');
      });

    const jsonArray=await csvtojsonV2().fromFile(path).then(
        (jsonObj)=>{
            getSubset(jsonObj).then(
                (jsonObj)=>{
                }).then(()=>{
                    if(!(jsonObj == "error"))
                    {
                    res.render('pages/results', {
                        sessionAttended: attendanceArray, // added
                        sessionAbsent: absentArray, // added
                        sessionUnexpected: unexpectedArray, // added
                        sessionInformedAbsent: informedAbsentArray,
                        sessionUninformedAbsent: uninformedAbsentArray,
                        sessionAuthAbsent: scheduledAbsentArray, // added
                        accessGeneral: accessArray, // added 
                        libraryAccess: libraryAccessArray, // added
                        accomodationAccess: accomodationAccessArray, // added
                        libraryResource: libraryResourceArray, // added
                        vleLogin: vleLoginArray, // added
                        wifiLogin: wifiArray, // added
                        panopto: vleRecordingArray, // added
                        webpa: webpaArray, // added
                        printingGeneral: printingArray, // added
                        printingScanner: printingScannerArray, // added
                        printingCopy: printingCopyArray, // added
                        ssoGeneral: ssoSignInArray, // added
                        ssoSEATS: ssoLoginSEATSArray, // added
                        ssoUnion: ssoUnionArray, // added
                        ssoHousing: ssoLoginHousingProvider, // added
                        universityApp: universityAppAccessArray, // added
                        induction: inductionArray, // added
                        unknown: unknownArray, // added
                        authAbsentCount: authAbsentCount,
                        libraryMostCommonDomain: libraryMostCommonDomain,
                        name: name,
                        mostCommonTimeMissed: mostCommonTimeMissed,
                        mostCommonModuleMissed: mostCommonModuleMissed,
                        getMostCommonDayOfWeekMissed: getMostCommonDayOfWeekMissed,
                    });
                }
                    else
                    {
                        return res.render('pages/error');
                    }
                }).then(()=>{ 
                    fs.unlinkSync(path);
                });
    })

});

app.set('view engine', 'ejs');
app.listen(port, () => console.log(`myEngagement listening on port ${port}!`))