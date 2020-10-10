// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

// get the Cat model
const Cat = models.Cat.CatModel;
// get the Dog model
const Dog = models.Dog.DogModel;

// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};
// default fake dog data
const defaultDogData = {
  name: 'unknown',
  breed: 'unknown',
  age: 0,
};

// object for us to keep track of the last Cat we made and dynamically update it sometimes
let lastAdded = new Cat(defaultData);
// keep track of dog to update age when searched
let dogToUpdate = new Dog(defaultDogData);
let lastAddedDog = new Dog(defaultData);

// handle requests to the main page
const hostIndex = (req, res) => {
  // res.render takes a name of a page to render
  // second paramater of JSOn can be used as variables with #{varName}
  // will show the lastAdded object, whether it was cat or dog
  res.render('index', {
    currentName: lastAdded.name,
    currentDogName: lastAddedDog.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

// find all cats on request
const readAllCats = (req, res, callback) => {
  Cat.find(callback).lean();
};

// find all dogs on request
const readAllDogs = (req, res, callback) => {
  Dog.find(callback).lean();
};

// function to find a specific cat on request.
// Express functions always receive the request and the response.
const readCat = (req, res) => {
  const name1 = req.query.name;

  // get objects back from database
  const callback = (err, doc) => {
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }
    // return success
    return res.json(doc);
  };

  // call static function findByName
  Cat.findByName(name1, callback);
};

// find specific dog on request
const readDog = (req, res) => {
  const dogName = req.query.name;
  const callback = (err, doc) => {
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }
    // return success
    return res.json(doc);
  };

  // call the static function
  Dog.findByName(dogName, callback);
};

// handle page1 requests
const hostPage1 = (req, res) => {
  // function to call when we get objects back from the database.
  // With Mongoose's find functions, you will get an err and doc(s) back
  const callback = (err, docs) => {
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }
    // return success
    return res.render('page1', { cats: docs });
  };

  readAllCats(req, res, callback);
};

// handle page2 requests
const hostPage2 = (req, res) => {
  res.render('page2');
};

// handle page3 requests
const hostPage3 = (req, res) => {
  res.render('page3');
};

// handle page4 requests
const hostPage4 = (req, res) => {
  // function to call when we get objects back from the database.
  // With Mongoose's find functions, you will get an err and doc(s) back
  const callback = (err, docs) => {
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }
    // return success
    return res.render('page4', { dogs: docs });
  };

  readAllDogs(req, res, callback);
};

// function to handle get request to send the cat name
const getName = (req, res) => {
  res.json({ name: lastAdded.name });
};

// function to handle get request to send the dog name
const getDogName = (req, res) => {
  res.json({ name: lastAddedDog.name });
};

// function to handle a request to set the name
const setName = (req, res) => {
  // check if the required fields exist
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    // if not respond with a 400 error
    return res.status(400).json({ error: 'firstname,lastname and beds are all required' });
  }

  // if required fields are good, then set name
  const name = `${req.body.firstname} ${req.body.lastname}`;

  // dummy JSON to insert into database
  const catData = {
    name,
    bedsOwned: req.body.beds,
  };

  // create a new object of CatModel with the object to save
  const newCat = new Cat(catData);

  // create new save promise for the database
  const savePromise = newCat.save();

  savePromise.then(() => {
    // set the lastAdded cat to our newest cat object.
    // This way we can update it dynamically
    lastAdded = newCat;
    // return success
    res.json({ name: lastAdded.name, beds: lastAdded.bedsOwned });
  });

  // if error, return it
  savePromise.catch((err) => res.status(500).json({ err }));

  return res;
};

const setDogName = (req, res) => {
  // check if the required fields exist
  if (!req.body.name || !req.body.breed || !req.body.age) {
    // if not respond with a 400 error
    return res.status(400).json({ error: 'name, breed, and age are all required' });
  }

  // dummy JSON to insert into database
  const dogData = {
    name: req.body.name,
    breed: req.body.breed,
    age: req.body.age,
  };

  // create a new object of DogModel with the object to save
  const newDog = new Dog(dogData);
  const savePromise = newDog.save();

  savePromise.then(() => {
    lastAddedDog = newDog;
    res.json({ name: lastAddedDog.name, breed: lastAddedDog.breed, age: lastAddedDog.age });
  });

  // if error, return it
  savePromise.catch((err) => res.status(500).json({ err }));
  return res;
};

// function to handle requests search for a name and return the object
const searchName = (req, res) => {
  // check if there is a query parameter for name
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  // call static findByName function
  return Cat.findByName(req.query.name, (err, doc) => {
    // errs, handle them
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    // if no matches, let them know
    if (!doc) {
      return res.json({ error: 'No cats found' });
    }

    // if a match, send the match back
    return res.json({ name: doc.name, beds: doc.bedsOwned });
  });
};

const searchDogName = (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  // Call our Dog's static findByName function
  return Dog.findByName(req.query.name, (err, doc) => {
    // errs, handle them
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    // if no matches, let them know
    if (!doc) {
      return res.json({ error: 'No dogs found' });
    }

    // increase age of the searched dog
    dogToUpdate = doc;
    dogToUpdate.age++;

    const savePromise = doc.save();
    savePromise.then(() => res.json({
      name: dogToUpdate.name, breed: dogToUpdate.breed, age: dogToUpdate.age,
    }));

    // if save error, just return an error for now
    savePromise.catch((err2) => res.status(500).json({ err2 }));
    return savePromise;
  });
};

// function to handle a request to update the last added object
const updateLast = (req, res) => {
  // Your model is JSON, so just change a value in it.
  lastAdded.bedsOwned++;

  // change all properites you want and save
  const savePromise = lastAdded.save();

  // send back the name as a success for now
  savePromise.then(() => res.json({ name: lastAdded.name, beds: lastAdded.bedsOwned }));

  // if save error, just return an error for now
  savePromise.catch((err) => res.status(500).json({ err }));
};

// function to handle a request to any non-real resources (404)
const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  readCat,
  getName,
  setName,
  updateLast,
  searchName,
  readDog,
  getDogName,
  setDogName,
  searchDogName,
  notFound,
};
