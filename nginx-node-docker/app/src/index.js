//Receive CSV as API parameter as follow

payload : { output : 'stream', parse: true, allow: 'multipart/form-data'}
//Validate imported CSV file as follow:

validate: {
importedCsv: Joi.any()
                    .meta({swaggerType: 'file'})
                    .required()
                    .allow('')
                    .description('CSV file')

          }
//To Upload and save CSV on server inside a directory "root/XXX".

csvFileName = ""+moment().utc().format('XXXX-XX-XX')+".csv";
          csvFilePath = Path.resolve(".") + "/XXX/" + csvFileName ;
          var file = fs.createWriteStream(csvFilePath);
          file.on('error', function (err) {
             console.log(err.message);
          });
          payload.importedCsv.pipe(file);
          payload.importedCsv.on('end', function (err) {
              if(err){
                cb(ERROR);
              }else{
                cb(null);
              }
          });
//To Read and process CSV data

var obj = csv();
obj.from.path(csvFilePath).to.array(function (data) {            
async.forEach(data, function (item, callback){

    console.log(item[1]); 
}, function(err) {    
      cb(null);
   });
});
//To save imported CSV file on AWS s3 server.

fs.readFile(csvFilePath, function (error, fileBuffer) {
            var accessKeyId = XXXXXX;
            var secretAccessKeyId = XXXXXX;
            AWS.config.update({accessKeyId: accessKeyId, secretAccessKey: secretAccessKeyId});
            var s3bucket = new AWS.S3();
            var params = {
                Bucket: XXXXXXX,
                Key: 'XXX' + '/' + csvFileName,
                Body: fileBuffer,
                ACL: 'public-read',
                ContentType: payload.importedCsv.hapi.headers['content-type']
            };

            s3bucket.putObject(params, function (err, data) {
                if (err) {
                  // cb(ERROR);
                }else{
                  // cb(null);
                }
            });
});
