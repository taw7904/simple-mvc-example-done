// require mongoose, a popular MongoDB library for nodejs
// it stays connected across all of the files in this project
const mongoose = require('mongoose');

// variable to hold our Dog Model
let DogModel = {};

// Dog Schema to define our data structure, functions/methods, constraints
const DogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

  breed: {
    type: String,
    required: true,
    trim: true,
  },

  age: {
    type: Number,
    min: 0,
    required: true,
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },

});

// static findByName function
DogSchema.statics.findByName = (name, callback) => {
  const search = {
    name,
  };

  return DogModel.findOne(search, callback);
};

// Create dog model based on schema
DogModel = mongoose.model('Dog', DogSchema);

// export our public properties
module.exports.DogModel = DogModel;
module.exports.DogSchema = DogSchema;
