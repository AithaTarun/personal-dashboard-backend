const mongoose = require('mongoose');
const {now} = require("moment");

const uniqueValidator = require('mongoose-unique-validator');

const fileSchema = new mongoose.Schema
(
    {
        userID:
            {
                type : mongoose.Schema.ObjectId,
                ref : 'User',
                required : true,
                unique : true
            },

        files:
            {
                type:
                    [
                        {
                            fileName :
                                {
                                    type : String,
                                    required : true
                                },
                            originalFileSize :
                                {
                                    type : Number,
                                    required : true,
                                },
                            compressedFileSize :
                                {
                                    type : Number,
                                    required : true,
                                },
                            fileType :
                                {
                                  type: String,
                                  required: true
                                },
                            createdAt :
                                {
                                    type: Number,
                                    default: now()
                                }
                        }
                    ],
                default: []
            }
    }
);

fileSchema.plugin(uniqueValidator);

module.exports = mongoose.model
(
    'FilesDetails',
    fileSchema
);
