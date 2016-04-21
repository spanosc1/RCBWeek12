
var mysql = require('mysql');


function getByZipAndDistance(zip, distanceInMiles, callback) {
   var myLat = 0;
   var myLong = 0;
   var res = [];
    
    var con = mysql.createConnection({
     host     : 'localhost', //for now, this will always be localhost
     user     : 'root',  // this will be whatever user you use to connect to mysql
     password : '13748abc',  // this is the password for the 'user' above
     database : 'doctors'  // this is a database which you have on your install of mysql
   });
   
   con.connect(function (err) {
       if (err) {
           console.log(err);
       }
       console.log('connected');
   });

   con.query("SELECT * FROM zips where zip='" + zip + "'", function (err, rows) {
       if (err) {
           return callback(err);
       }
       
       if (rows.length == 0) {
           var err = new Error();
           err.message = "No zip code data found for '" + zip + "'";            
           return callback(err);
       }
       console.log(rows[0]);

       //lat and long of center
       myLat = rows[0].latitude;
       myLong = rows[0].longitude;

       //get all doctors
       var distMod = 3956.5;
       //SELECT doc_id, first_name, m_name, last_name, suffix, address_line1, address_line2, city, state, zip_code, lat, lng, phone, geo_address, ACOS(SIN(RADIANS( `lat`)) * SIN(RADIANS(40.2327)) + COS(RADIANS( `lat`)) * COS(RADIANS(40.2327)) * COS(RADIANS( `lng`) - RADIANS(-74.0314))) * 6380 AS ` distance` FROM ` doc` WHERE ACOS(SIN(RADIANS( `lat`)) * SIN(RADIANS(40.2327)) + COS(RADIANS( `lat`)) * COS(RADIANS(40.2327)) * COS(RADIANS( `lng`) - RADIANS(-74.0314))) * 6380 < 10 ORDER BY ` distance`
       var docQuery = "SELECT doctor_id, first_name, m_name, last_name, suffix, address_line1, address_line2, city, state, zip_code, lat, lng, phone, geo_address, ";
       docQuery += "ACOS(SIN(RADIANS( `lat`)) * SIN(RADIANS(" + myLat + ")) + COS(RADIANS( `lat`)) * COS(RADIANS(" + myLat + ")) * COS(RADIANS( `lng`) - RADIANS(" + myLong + "))) * " + distMod + " AS `distance` FROM `doctors` ";
       docQuery += "WHERE ACOS(SIN(RADIANS( `lat`)) * SIN(RADIANS(" + myLat + ")) + COS(RADIANS( `lat`)) * COS(RADIANS(" + myLat + ")) * COS(RADIANS( `lng`) - RADIANS(" + myLong + "))) * " + distMod + " < " + distanceInMiles + " ORDER BY `distance`";

       con.query(docQuery, function (err, rows) {
           if (err) {
               //console.log("error");
               //console.log(err);
               return callback(err);
           }
           //console.log(rows.length);
           return callback(null, rows);
           con.end(function (err) {
           });
       });

    });

}

var myZip = process.argv[2];
var miles = process.argv[3];

getByZipAndDistance(myZip, miles, function (err, result) {
   if (err) {
       console.log(err);
   }
   else {
       console.log(result);
   }
});