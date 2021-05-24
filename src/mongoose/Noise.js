const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const AdminSchema = new Schema(
  { account: String, password: String, name: String },
  { timestamps: { createdAt: "created", updatedAt: "updated" } }
);
const Admin = Mongoose.model("admins", AdminSchema);

const UserSchema = new Schema(
  {
    casenum: String,
    carnum: String,
    username: String,
    idcard: String,
    address: String,
    redate: Date,
    exdate: Date,
    city: String,
    site: String,
    result: String,
  },
  { timestamps: { createdAt: "created", updatedAt: "updated" } }
);
const User = Mongoose.model("users", UserSchema);

const SiteSchema = new Schema(
  { city: String, sitename: String },
  { timestamps: { createdAt: "created", updatedAt: "updated" } }
);
const Site = Mongoose.model("sites", SiteSchema);

const OpentimeSchema = new Schema(
  { city: String, site: String, date: Date, maxcount: Number },
  { timestamps: { createdAt: "created", updatedAt: "updated" } }
);
const Opentime = Mongoose.model("opentimes", OpentimeSchema);

module.exports = { Admin, User, Site, Opentime };
