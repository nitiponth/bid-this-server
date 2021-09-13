import { User } from "./models/User";

export const resolvers = {
  Query: {
    hello: () => "hello",
    getUsers: async (parent, args, ctx, info) => {
      if (!args.username) {
        const users = await User.find();
        return users;
      } else {
        const username = args.username;
        const regex = new RegExp(username, "i");
        const user = await User.find({ username: { $regex: regex } });
        if (!user) {
          throw new Error("User not found");
        }
        return user;
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
  },
  Mutation: {
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
      } = {
        ...args,
      };

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
      });
      await user.save();
      return user;
    },
  },
};
