const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {

  // Finds all tags with the corresponding data, as well as its associated Product data
  Tag.findAll({
    attributes: ['id', 'tag_name'],
    include: {
      model: Product,
      attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
      through: ProductTag,
      as: 'products'
    }
  })

    // Sends back data retrieved from database
    .then(dbData => res.json(dbData))

    //Catches any errors
    .catch(err => {
      console.err(err);
      res.status(500).json(err);
    })
});

router.get('/:id', (req, res) => {

  // Finds a single tag with the corresponding data, as well as its associated Product data
  Tag.findOne({
    attributes: ['id', 'tag_name'],
    where: {
      id: req.params.id
    },
    include: {
      model: Product,
      attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
      through: ProductTag,
      as: 'products'
    }
  })

    // Checks to see if any data was retrieved given the requested parameters. Returns a 404 error if nothing was found, otherwise returns the requested data
    .then(dbData => {
      if (!dbData) {
        res.status(404).json({ message: 'No tag with specified id found. ' });
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
  // Creates a new tag with the provided id and tag_name
  Tag.create({
    id: req.body.id,
    tag_name: req.body.tag_name
  })
    .then(dbData => res.json(dbData))
    .catch(err => {
      console.err(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(
    {tag_name: req.body.tag_name},
    {where: {id: req.params.id}}
  )
    .then(dbData => {
      if (!dbData) {
        res.status(404).json({ message: 'No tag with specified id found.' });
        return;
      }
      res.json(dbData);
    })
    .catch(err => {
      console.err(err);
      res.status(500).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  Tag.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(dbData => {
    if (!dbData) {
      res.status(404).json({ message: 'No tag with specified id found.' });
      return;
    }
    res.json(dbData);
  })
  .catch(err => {
    console.err(err);
    res.status(500).json(err);
  });
});

module.exports = router;
