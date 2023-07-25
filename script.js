document.addEventListener('DOMContentLoaded', () => {
  const addProductForm = document.getElementById('addProductForm');
  const productNameInput = document.getElementById('productNameInput');
  const priceInput = document.getElementById('priceInput');
  const categorySelect = document.getElementById('categorySelect');
  const productList = document.getElementById('productList');

  let updatingProductId = null; // Variable to store the ID of the product being updated

  addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const productName = productNameInput.value;
    const price = priceInput.value;
    const category = categorySelect.value;

    const product = {
      productName,
      price,
      category,
    };

    if (updatingProductId) {
      // Update existing product
      updateProduct(updatingProductId, product);
    } else {
      // Add new product
      addProduct(product);
    }

    // Clear the form inputs
    productNameInput.value = '';
    priceInput.value = '';
    categorySelect.value = '';
    updatingProductId = null; // Reset updatingProductId
  });

  function displayProducts() {
    // Clear the product list
    productList.innerHTML = '';

    // Retrieve products from MySQL database
    fetch('/products')
      .then((response) => response.json())
      .then((products) => {
        // Store products in local storage
        localStorage.setItem('products', JSON.stringify(products));

        // Display products
        products.forEach((product) => {
          const productItem = createProductItem(product);
          productList.appendChild(productItem);
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function createProductItem(product) {
    const productItem = document.createElement('div');
    productItem.id = `product-${product.id}`; // Set an ID for each product item
    productItem.innerHTML = `
      <p><strong>Name:</strong> ${product.productName}</p>
      <p><strong>Price:</strong> $${product.price}</p>
      <p><strong>Category:</strong> ${product.category}</p>
      <button data-action="update">Update</button>
      <button data-action="delete">Delete</button>
    `;

    const updateButton = productItem.querySelector(`#product-${product.id} button[data-action="update"]`);
    updateButton.addEventListener('click', () => showUpdateForm(product));

    const deleteButton = productItem.querySelector(`#product-${product.id} button[data-action="delete"]`);
    deleteButton.addEventListener('click', () => deleteProduct(product.id));

    return productItem;
  }

  function addProduct(product) {
    // Save to local storage
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));

    // Save to MySQL database
    fetch('/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
      .then((response) => response.json())
      .then((data) => {
        // Refresh the product list
        displayProducts();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function showUpdateForm(product) {
    // Set the form inputs to the product details
    productNameInput.value = product.productName;
    priceInput.value = product.price;
    categorySelect.value = product.category;

    updatingProductId = product.id; // Set the updatingProductId to the ID of the product being updated
  }

  function updateProduct(productId, product) {
    // Update product in local storage
    let products = JSON.parse(localStorage.getItem('products')) || [];
    const updatedProducts = products.map((p) => (p.id === productId ? product : p));
    localStorage.setItem('products', JSON.stringify(updatedProducts));

    // Update product in MySQL database
    fetch(`/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
      .then((response) => response.json())
      .then((data) => {
        displayProducts();
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // Clear the form inputs
    productNameInput.value = '';
    priceInput.value = '';
    categorySelect.value = '';
  }

  function deleteProduct(productId) {
    // Send a DELETE request to the server
    fetch(`/products/${productId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          // Delete the product from local storage
          let products = JSON.parse(localStorage.getItem('products')) || [];
          products = products.filter((product) => product.id !== productId);
          localStorage.setItem('products', JSON.stringify(products));

          // Remove the deleted product from the DOM
          const productElement = document.getElementById(`product-${productId}`);
          productElement.remove();
        }
      })
      .catch((error) => {
        console.error('Error deleting product:', error);
      });
  }

  // Initial display of products
  displayProducts();
});
