const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', (req, res) => {

  // Finds all categories along with their associated products
  Category.findAll({
    attributes: ['id', 'category_name'],
    include: [{
      model: Product,
      attributes: ['product_name']
    }]
  })

    // Sends back data retrieved from database
    .then(dbData => res.json(dbData))

    // Catches any errors
    .catch(err => {
      console.err(err);
      res.status(500).json(err);
    })
});

router.get('/:id', (req, res) => {

  // Gets a single category by id along with its associated Products
  Category.findOne({
    attributes: ['id', 'category_name'],
    where: { id: req.params.id },
    include: [{
      model: Product,
      attributes: ['product_name']
    }]
  })

    // Checks to see if any data was retrieved given the requested parameters. Returns a 404 error if nothing was found, otherwise returns the requested data.
    .then(dbData => {
      if (!dbData) {
        res.status(404).json({ message: 'No category with specified id found. ' });
        return;
      }
      res.json(dbData);
    })

    //Catches any errors
    .catch(err => {
      console.err(err);
      res.status(500).json(err);
    })
});

router.post('/', (req, res) => {
  // Creates a new category
  Category.create(
    { category_name: req.body.category_name }
  )

    // Returns data retrieved from database
    .then(dbData => res.json(dbData))

    // Catches any errors
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
  Category.update(
    { category_name: req.body.category_name },
    { where: { id: req.params.id } }
  )

    // Checks to see if any data was retrieved given the requested parameters. Returns a 404 error if nothing was found, otherwise updates the requested data
    .then(dbData => {
      if (!dbData) {
        res.status(404).json({ message: 'No category with specified id found.' });
        return;
      }
      res.json(dbData);
    })

    // Catches any errors
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // Delete a category by its `id` value
  Category.destroy({
    where: { id: req.params.id }
  })

    // Checks to see if any data was retrieved given the requested parameters. Returns a 404 error if nothing was found, otherwise deletes the requested data
    .then(dbData => {
      if (!dbData) {
        res.status(404).json({ message: 'No category with specified id found.' });
        return;
      }
      res.json(dbData);
    })

    // Catches any errors
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
