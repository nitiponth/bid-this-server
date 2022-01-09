require("dotenv").config();
import OmiseFn from "omise";

const omise = OmiseFn({
  publicKey: process.env.OMISE_PUBLIC_KEY,
  secretKey: process.env.OMISE_SECRET_KEY,
});

export const createToken = (name, number, expMonth, expYear, cvc) => {
  if (!number || !name || !expMonth || !expMonth | !cvc) return null;
  return new Promise((resolve, reject) => {
    omise.tokens.create(
      {
        card: {
          name,
          number,
          cvc,
          expiration_month: expMonth,
          expiration_year: expYear,
        },
      },
      function (err, res) {
        if (res) {
          resolve(res);
        } else {
          resolve(null);
        }
      }
    );
  });
};

export const retrieveCustomer = (id) => {
  if (!id) return null;
  return new Promise((resolve, reject) => {
    omise.customers.retrieve(id, function (err, res) {
      if (res) {
        resolve(res);
      } else {
        resolve(null);
      }
    });
  });
};

export const createCustomer = (email, desc, card) => {
  return new Promise((resolve, reject) => {
    omise.customers.create(
      {
        email,
        description: desc,
        card,
      },
      function (err, res) {
        if (res) {
          resolve(res);
        } else {
          console.log(err);
          resolve(null);
        }
      }
    );
  });
};

export const createCharge = (amount, customer) => {
  return new Promise((resolve, reject) => {
    omise.charges.create(
      {
        amount,
        currency: "thb",
        customer,
      },
      function (err, res) {
        if (res) {
          resolve(res);
        } else {
          console.log("createCharge: ", err);
          resolve(null);
        }
      }
    );
  });
};

export const createRecipient = (name, email, brand, number) => {
  const upperCaseName = name.toUpperCase();
  return new Promise((resolve, reject) => {
    omise.recipients.create(
      {
        name: name,
        email: email,
        type: "individual",
        bank_account: {
          brand: brand,
          number: number,
          name: upperCaseName,
        },
      },
      function (err, resp) {
        if (resp) {
          resolve(resp);
        } else {
          console.log("createRecipient Error: ", err);
          resolve(null);
        }
      }
    );
  });
};

export const retrieveRecipient = (id) => {
  return new Promise((resolve, reject) => {
    omise.recipients.retrieve(id, function (err, resp) {
      if (resp) {
        resolve(resp);
      } else {
        console.log("retrieveRecipient Error: ", err);
        resolve(null);
      }
    });
  });
};

export const createTransfer = (amount, recipient) => {
  return new Promise((resolve, reject) => {
    omise.transfers.create({ amount, recipient }, function (error, transfer) {
      if (transfer) {
        resolve(transfer);
      } else {
        console.log("createTransfer Error: ", err);
        resolve(null);
      }
    });
  });
};

export const retrieveTransaction = (id) => {
  return new Promise((resolve, reject) => {
    omise.transfers.retrieve(id, function (err, resp) {
      if (resp) {
        resolve(resp);
      } else {
        console.log("retrieveTransaction Error: ", err);
        resolve(null);
      }
    });
  });
};
