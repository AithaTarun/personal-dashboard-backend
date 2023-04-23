const FilesDetails = require('../models/filesUpload');

let fs = require('fs');
let path = require('path')

const zlib = require('zlib');

const jwt = require('jsonwebtoken');

exports.uploadFiles = async (request, response, next)=>
{
    const token = request.token;

    const decodedToken = jwt.decode(token);

    const destination = '../storage/' + decodedToken.userId;

    const originalFileName = request.file.originalname;

    const compressedFileName = originalFileName + '.gz';

    const countResult = await FilesDetails.countDocuments
    (
        {
            $and:
                [
                    {
                        userID:
                            {
                                $eq: decodedToken.userId
                            }
                    },
                    {
                        files:
                            {
                                $elemMatch:
                                    {
                                        fileName: originalFileName

                                    }
                            }
                    }
                ]
        }
    );

    if (countResult === 1)
    {
        return response.status(409).send
        (
            {
                message : 'File already exists in your storage'
            }
        )
    }

    try
    {
        // Creating storage folder if not exists
        if (!fs.existsSync(path.join(__dirname, destination)))
        {
            fs.mkdirSync(path.join(__dirname, destination));
        }

        // Compressing the file
       await zlib.gzip
       (
           request.file.buffer,
           {level: zlib.Z_BEST_COMPRESSION},
           (error, result)=>
           {
               if (error)
               {
                   console.log(error);

                   return response.status(409).send
                   (
                       {
                           message : 'Error while compressing the file'
                       }
                   )
               }

               // No error while compressing

               // Storing the compressed file

               fs.writeFile
               (
                   path.join(__dirname, destination + '/' + compressedFileName),
                   result,
                   {},
                   async (err)=>
                   {
                       if (err)
                       {
                           console.log(err);

                           return response.status(409).send
                           (
                               {
                                   message : 'Error while storing the compressed file'
                               }
                           )
                       }

                       // No error while storing the file

                       // Storing file details in database
                       const databaseResult = await FilesDetails.updateOne
                       (
                           {
                               userID: decodedToken.userId
                           },
                           {
                               $addToSet:
                                   {
                                       files:
                                           {
                                               fileName: originalFileName,
                                               originalFileSize: request.file.size,
                                               compressedFileSize: Buffer.byteLength(result),
                                               fileType: request.file.mimetype
                                           }
                                   }
                           },
                           {
                               upsert : true,
                               new : true
                           }
                       );

                       return response.status(201).send
                       (
                           {
                               message : 'Uploaded successfully'
                           }
                       );
                   }
               )
           }
       );
    }
    catch (error)
    {
        console.log(error);

        return response.status(409).send
        (
            {
                message : error.message
            }
        );
    }
}

exports.getFilesDetails = async (request, response, next)=>
{
    try
    {
        const token = request.token;

        const decodedToken = jwt.decode(token);
        const result = await FilesDetails.findOne
        (
            {
                userID:
                    {
                        $eq: decodedToken.userId
                    }
            }
        );

       if (!result)
       {
           return response.status(200).send
           (
               {
                   message: 'Fetched files details successfully',
                   data: []
               }
           )
       }

        return response.status(200).send
        (
            {
                message: 'Fetched files details successfully',
                data: result.files
            }
        )
    }
    catch (error)
    {
        console.log(error);

        return response.status(409).send
        (
            {
                message : "Error while fetching files details"
            }
        );
    }
}

exports.getFile = async (request, response, next) =>
{
    const token = request.token;

    const decodedToken = jwt.decode(token);

    const destination = '../storage/' + decodedToken.userId;

    const originalFileName = request.params.fileName;

    const compressedFileName = originalFileName + '.gz';

    const countResult = await FilesDetails.countDocuments
    (
        {
            $and:
                [
                    {
                        userID:
                            {
                                $eq: decodedToken.userId
                            }
                    },
                    {
                        files:
                            {
                                $elemMatch:
                                    {
                                        fileName: originalFileName

                                    }
                            }
                    }
                ]
        }
    );

    if (countResult === 0)
    {
        return response.status(409).send
        (
            {
                message : 'File not found'
            }
        )
    }

    try
    {
        fs.readFile
        (
            path.join(__dirname, destination + '/' + compressedFileName),
            async (error, data)=>
            {
                if (error)
                {
                    console.log(error);

                    return response.status(409).send
                    (
                        {
                            message : 'Error while reading the file'
                        }
                    )
                }

                // No error reading the file

                // Decompressing the file
                await zlib.unzip
                (
                    data,
                    (error, data)=>
                    {
                        if (error)
                        {
                            console.log(error);

                            return response.status(409).send
                            (
                                {
                                    message : 'Error while decompressing the file'
                                }
                            )
                        }

                        // No error while decompressing the file

                        // Sending file through response

                        return response.status(200).send
                        (
                            {
                                'fileBuffer' : data
                            }
                        )
                    }
                )
            }

        )
    }
    catch (error)
    {
        console.log(error);

        return response.status(500).send
        (
            {
                message : error.message
            }
        );
    }
}

exports.deleteFile = async (request, response, next) =>
{
    const token = request.token;

    const decodedToken = jwt.decode(token);

    const destination = '../storage/' + decodedToken.userId;

    const originalFileName = request.params.fileName;

    const compressedFileName = originalFileName + '.gz';

    const countResult = await FilesDetails.countDocuments
    (
        {
            $and:
                [
                    {
                        userID:
                            {
                                $eq: decodedToken.userId
                            }
                    },
                    {
                        files:
                            {
                                $elemMatch:
                                    {
                                        fileName: originalFileName

                                    }
                            }
                    }
                ]
        }
    );

    if (countResult === 0)
    {
        return response.status(409).send
        (
            {
                message : 'File not found'
            }
        )
    }

    // File found, now remove from storage na database

    try
    {
        fs.unlink
        (
            path.join(__dirname, destination + '/' + compressedFileName),
            async (error)=>
            {
                if (error)
                {
                    console.log(error);

                    return response.status(409).send
                    (
                        {
                            message : 'Error while deleting file from storage'
                        }
                    )
                }

                // Removed file from storage, remove from database

                const result = await FilesDetails.updateOne
                (
                    {
                        userID:
                            {
                                $eq: decodedToken.userId
                            }
                    },
                    {
                        $pull:
                            {
                                files :
                                    {
                                        fileName : originalFileName
                                    }
                            }
                    }
                );

                if (result.nModified === 0)
                {
                    return response.status(409).send
                    (
                        {
                            message : 'Error while removing file entry from database'
                        }
                    )
                }

                // Removed file successfully, send updated files details
                this.getFilesDetails(request, response, next);
            }
        )
    }
    catch (error)
    {
        console.log(error);

        return response.status(500).send
        (
            {
                message : error.message
            }
        );
    }
}
