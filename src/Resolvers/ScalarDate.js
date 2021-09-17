import { GraphQLScalarType, Kind } from "graphql";

const ScalarDate = new GraphQLScalarType({
  name: "ScalarDate",
  description: "Date custom scalar type",
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return new Date(value).toLocaleString("en-US");
  },
});

export default ScalarDate;
