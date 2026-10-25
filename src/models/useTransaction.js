import mongoose from "mongoose";

export default () => {
  return mongoose.connection.transaction.bind(mongoose.connection);
}