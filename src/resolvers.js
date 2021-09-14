import mongoose from "mongoose";
import { User } from "./models/User";
import { Product } from "./models/Product";
import { GraphQLScalarType, Kind } from "graphql";

export const resolvers = {
  Query: {
    hello: () => "hello",
    //User Query
    getUsers: async (parent, args, ctx, info) => {
      if (!args.username) {
        const users = await User.find();
        console.log(users);
        return users;
      } else {
        const username = args.username;
        const regex = new RegExp(username, "i");
        const users = await User.find({ username: { $regex: regex } });
        if (!users) {
          throw new Error("User not found.");
        }
        return users;
      }
    },
    getOneUser: async (parent, args, ctx, info) => {
      if (!args.username) {
        throw new Error("Syntax Error!");
      } else {
        const username = args.username;
        const regex = new RegExp(username, "i");
        const user = await User.findOne({ username: { $regex: regex } });
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      }
    },

    //Product Query
    getProducts: async (parent, args, ctx, info) => {
      const { title } = args;
      if (title) {
        const products = await Product.find();
        return products;
      }

      const regex = new RegExp(title, "i");
      const products = await Product.find({ title: { $regex: regex } });
      if (!products) {
        throw new Error("Product not found.");
      }
      return products;
    },
    getOneProduct: async (parent, args, ctx, info) => {
      const { title } = args;
      const regex = new RegExp(title, "i");
      const product = await Product.findOne({ title: { $regex: regex } });
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    },
  },
  Mutation: {
    //User Mutation
    createUser: async (parent, args, ctx, info) => {
      const {
        email,
        first,
        last,
        password,
        username,
        phone,
        address,
        province,
        postcode,
      } = args;

      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        throw new Error("This email is already used.");
      }

      const usernameRegex = new RegExp(username, "i");
      const usernameExists = await User.findOne({
        username: { $regex: usernameRegex },
      });
      if (usernameExists) {
        throw new Error("This username is already used.");
      }

      const user = new User({
        name: {
          first: first,
          last: last,
        },
        email: email.toLowerCase(),
        password: password,
        username: username,
        phone: phone,
        address: {
          home: address,
          province: province,
          postcode: postcode,
        },
        status: "GUEST",
        role: "USER",
      });
      await user.save();
      return user;
    },
    updateUser: async (parent, args, ctx, info) => {
      const { id, first, last, username, phone, address, province, postcode } =
        args;

      const ValidId = mongoose.isValidObjectId(id);

      if (!ValidId) {
        throw new Error("ObjectId is invalid.");
      }

      const user = await User.findById(id).exec();
      if (user === null) {
        throw new Error("User not found.");
      }

      if (typeof first === "string") {
        user.name.first = first;
      }

      if (typeof last === "string") {
        user.name.last = last;
      }

      if (typeof username === "string") {
        const regex = new RegExp(username, "i");
        const usernameTaken = await User.findOne({
          username: { $regex: regex },
        });
        if (usernameTaken) {
          throw new Error("This username has already been used.");
        }

        user.username = username;
      }

      if (typeof phone === "string") {
        if (isNaN(phone)) {
          throw new Error("Phone number must be entered in numbers only.");
        }
        if (phone.length !== 10) {
          throw new Error("Phone number must be 10 digits.");
        }
        user.phone = phone;
      }

      if (typeof address === "string") {
        user.address.home = address;
      }
      if (typeof province === "string") {
        user.address.province = province;
      }
      if (typeof postcode === "string") {
        if (isNaN(postcode)) {
          throw new Error("Postcode must be entered in numbers only.");
        }
        if (postcode.length !== 5) {
          throw new Error("Postcode must be 5 digits.");
        }
        user.address.postcode = postcode;
      }

      await user.save();

      return user;
    },

    //Product Mutation
    createProduct: async (parent, args, ctx, info) => {
      const { creatorId, title, desc, initialPrice, start, status } = args;

      const ValidId = mongoose.isValidObjectId(creatorId);

      if (!ValidId) {
        throw new Error("ObjectId is invalid.");
      }

      const userExists = await User.findById(creatorId);
      if (!userExists) {
        throw new Error("User not found.");
      }

      const product = new Product({
        title: title,
        desc: desc,
        price: {
          initial: initialPrice,
        },
        seller: creatorId,
        start: start,
        status: status,
      });
      await product.save();

      // userExists.products.push(product.id);
      // await userExists.save();

      return product;
    },
  },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return new Date(value);
    },
  }),
  User: {
    products: async (parent, args, ctx, info) => {
      return await Product.find({ seller: parent.id });
    },
  },
  Product: {
    seller: async (parent, args, ctx, info) => {
      return await User.findOne({ id: parent.id });
    },
  },
};
