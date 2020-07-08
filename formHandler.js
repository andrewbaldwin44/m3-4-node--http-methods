const { stock, customers } = require('./data/promo.js');
let userInfo = undefined;

function isOutOfStock(orderObject, orderKey) {
  return orderObject[orderKey] === '0';
}

function isNewCustomer(...customerInfo) {
  return !customers.some(customer => {
    return Object.values(customer).some(info => {
      return customerInfo.includes(info);
    });
  });
}

function isInvalidCountry(country) {
  return country !== 'Canada';
}

function isMissingData(order, size) {
  if (order != "undefined") {
    if (order === "shirt" && size !== "undefined" || order != "shirt") return false;
    else return true;
  }
}

function addNewCustomer(customerInfo) {
  customers.push({
    givenName: customerInfo.givenName,
    surname: customerInfo.surname,
    email: customerInfo.email,
    address: customerInfo.address,
    city: customerInfo.city,
    province: customerInfo.province,
    postcode: customerInfo.postcode,
    country: customerInfo.country,
  });
}

function decrementStock(orderObject, orderKey) {
  orderObject[orderKey]--;
}

function getOrderData(order, size) {
  let orderObject = stock;
  let orderKey = order;
  if (order === "shirt") {
    orderObject = stock.shirt;
    orderKey = size;
  }

  return [orderObject, orderKey];
}

function validateForm(req, res) {
  const { order, size, givenName, surname,
    email, address, city, province,
    postcode, country } = req.body;

  userInfo = req.body;

  const [orderObject, orderKey] = getOrderData(order, size);

  let error = undefined;
  let description = undefined;

  if (isMissingData(order, size)) {
    error = "missing-data";
    description = "Some of the required information was not provided";
  }
  else if (isInvalidCountry(country)) {
    error = "undeliverable";
    description = "Customer didn't supply a Canadian shipping address";
  }
  else if (isOutOfStock(orderObject, orderKey)) {
    error = "unavailable";
    description = "Item out of stock";
  }
  else if (isNewCustomer(email, address)) {
    addNewCustomer(req.body);
    decrementStock(orderObject, orderKey);
  }
  else {
    error = "repeat-customer";
    description = "Customer had already purchased an item";
  }

  if (error) {
    res.json(
    {
      "status": "error",
      "error": error,
      "description": description
    });
  }
  else res.status(201).json({ "status": "success" });
}

const confirmOrder = (req, res) => {
  res.render('./pages/order-confirmed', { userData: userInfo })
};

module.exports = { validateForm, confirmOrder };
