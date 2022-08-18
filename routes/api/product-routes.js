const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// Get all products
router.get('/', (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  // Finds all products with the corresponding data, as well as its associated Category and Tag data
  Product.findAll({
    attributes: ['id', 'product_name', 'price', 'stock'],
    include: [
      {
        model: Category,
        attributes: ['id', 'category_id']
      },
      {
        model: Tag,
        attributes: ['tag_name'],
        through: ProductTag,
        as: 'tags'
      }
    ]
  })

    // Sends back data retrieved from database
    .then(dbData => res.json(dbData))

    //Catches any errors
    .catch(err => {
      console.err(err);
      res.status(500).json(err);
    });
});

// Get one product
router.get('/:id', (req, res) => {

  // Finds a single product with the corresponding data, as well as its associated Category and Tag data
  Product.findOne({
    attributes: ['id', 'product_name', 'price', 'stock'],
    where: { id: req.params.id },
    include: [
      {
        model: Product,
        attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
      },
      {
        model: Tag,
        attributes: ['tag_name'],
        through: ProductTag,
        as: 'tags'
      }
    ]
  })

    // Checks to see if any data was retrieved given the requested parameters. Returns a 404 error if nothing was found, otherwise returns the requested data
    .then(dbData => res.json(dbData))

    // Catches any errors
    .catch(err => {
      console.err(err);
      res.status(500).json(err);
    })
});

// Create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */

  // Creates a product with the user input
  Product.create({
    product_name: req.body.product_name,
    price: req.body.price,
    stock: req.body.stock,
    category_id: req.body.category_id,
    tagIds: req.body.tag_ids
  })
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      } else {
        // if no product tags, just respond
        return res.status(200).json(product);
      }
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(
    {
      product_name: req.body.product_name,
      price: req.body.price,
      stock: req.body.stock,
      category_id: req.body.category_id,
      tag_ids: req.body.tag_ids
    },
    {
      where: {
        id: req.params.id,
      },
    })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  Product.destroy({
    where: {id: req.params.id}
  })
  .then(dbData => {
    if (!dbData) {
      res.status(404).json({message: 'No product with specified id found.'});
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