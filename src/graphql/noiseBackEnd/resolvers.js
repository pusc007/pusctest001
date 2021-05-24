const { Admin, User, Site, Opentime } = require("@src/mongoose/Noise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "93643860-b464-11eb-8529-0242ac130003";

const createToken = ({ id, email, name }) =>
  jwt.sign({ id, email, name }, SECRET, {
    expiresIn: "1d",
  });
const checkToken = async (token) => {
  if (token) {
    try {
      const me = await jwt.verify(token, SECRET);
      const admin = await Admin.findOne({ _id: me.id });
      if (!admin) throw new Error(JSON.stringify({ type: "noAccount", text: "帳號不存在，請重新登入" }));
    } catch (e) {
      const message = e.message;
      if (message === "invalid token" || message === "invalid signature" || message === "jwt malformed") {
        throw new Error(JSON.stringify({ type: "invalidToken", text: "認證有問題，請重新登入" }));
      } else if (message === "jwt expired") {
        throw new Error(JSON.stringify({ type: "expiredToken", text: "認證已過期，請重新登入" }));
      } else {
        throw new Error(JSON.stringify({ type: "errorToken", text: "認證有錯誤，請重新登入" }));
      }
    }
  } else {
    throw new Error(JSON.stringify({ type: "noToken", text: "無認證，請重新登入" }));
  }
};
module.exports = {
  Query: {
    users: async (root, {}, context) => {
      //檢查令牌
      await checkToken(context.token);
      return await User.find();
    },
    user: async (root, { id }, context) => {
      //檢查令牌
      await checkToken(context.token);
      return await User.findById(id);
    },
    searchUser: async (root, { casenum, carnum }, context) => {
      //檢查令牌
      await checkToken(context.token);

      //查詢
      const user = await User.findOne({ casenum, carnum });
      if (!user) throw new Error(JSON.stringify({ type: "noData", text: "無資料" }));
      return user;
    },
    searchUsers: async (root, { startDate, endDate, state }, context) => {
      //檢查令牌
      await checkToken(context.token);

      //條件查詢
      endDate += 86400000;
      if (state === "reserv") {
        return await User.find({ redate: { $gte: startDate, $lt: endDate } });
      } else if (state === "extend") {
        return await User.find({ exdate: { $gte: startDate, $lt: endDate } });
      } else if (state === "created") {
        return await User.find({ created: { $gte: startDate, $lt: endDate } });
      } else if (state === "updated") {
        return await User.find({ updated: { $gte: startDate, $lt: endDate } });
      } else if (state === "all") {
        return await User.find();
      }
    },

    searchSites: async (root, { city }, context) => {
      //檢查令牌
      await checkToken(context.token);

      //查詢檢測站點
      const sites = await Site.find({ city });
      if (!sites) throw new Error(JSON.stringify({ type: "noData", text: "無資料" }));
      return sites;
    },
    citys: async (root, {}, context) => {
      //檢查令牌
      await checkToken(context.token);

      //取得可檢驗縣市
      return await Site.distinct("city");
    },
    searchOpentime: async (root, { city, site, date }, context) => {
      //檢查令牌
      await checkToken(context.token);

      //查詢開放時間
      const opentime = await Opentime.findOne({ city, site, date });
      if (!opentime) throw new Error(JSON.stringify({ type: "noData", text: "無資料" }));
      return opentime;
    },
    searchOpentimes: async (root, { city, site, startDate, endDate }, context) => {
      //檢查令牌
      await checkToken(context.token);

      //查詢開放時間
      endDate += 86400000;
      return await Opentime.find({ city, site, date: { $gte: startDate, $lt: endDate } });
    },
  },
  Mutation: {
    passwordEncrypt: async (root, { password }, context) => {
      //密碼加密
      const SALT_ROUNDS = 2;
      return await bcrypt.hash(password, SALT_ROUNDS);
    },
    login: async (root, { account, password }, context) => {
      //檢查帳號是否存在
      const admin = await Admin.findOne({ account: account });
      if (!admin) throw new Error(JSON.stringify({ type: "accountError", text: "帳號不存在" }));

      //比對密碼
      const passwordIsValid = await bcrypt.compare(password, admin.password);
      if (!passwordIsValid) throw new Error(JSON.stringify({ type: "passwordError", text: "密碼錯誤" }));

      //建立token
      const token = await createToken({ id: admin._id, email: admin.account, name: admin.name });
      return { token };
    },
    createUser: async (root, { input }, context) => {
      //檢查令牌
      await checkToken(context.token);

      //檢查公文號重複
      const existedCasenum = await User.exists({ casenum: input.casenum });
      if (existedCasenum) throw new Error(JSON.stringify({ type: "existedCasenum", text: "公文號已存在" }));

      //建立使用者
      const user = new User(input);
      //const user = await User.create(input);
      return await user.save();
    },
    importUsers: async (root, { input }, context) => {
      //檢查令牌
      await checkToken(context.token);

      //建立使用者群
      const list = input.map((el) => {
        return {
          updateOne: {
            filter: { casenum: el.casenum },
            update: { $set: el },
            upsert: true,
          },
        };
      });
      await User.bulkWrite(list);

      //取得建立使用者群
      return await User.find({ casenum: input.map((el) => el.casenum) });
    },
    editUser: async (root, { id, input }, context) => {
      //檢查令牌
      await checkToken(context.token);

      const user = await User.findById(id);

      //檢查公文號重複
      if (user.casenum !== input.casenum) {
        const existedCasenum = await User.exists({ casenum: input.casenum });
        if (existedCasenum) throw new Error(JSON.stringify({ type: "existedCasenum", text: "公文號已存在" }));
      }

      //編輯使用者
      for (let key in input) {
        user[key] = input[key];
      }
      return await user.save();
    },
    deleteUser: async (root, { id }, context) => {
      //檢查令牌
      await checkToken(context.token);

      //刪除使用者
      await User.deleteOne({ _id: id });
    },

    createSite: async (root, { input }, context) => {
      //檢查令牌
      await checkToken(context.token);

      //檢查開放時間重複
      const existedSite = await Site.exists({ city: input.city, sitename: input.sitename });
      if (existedSite) throw new Error(JSON.stringify({ type: "existedSite", text: "檢測站點已存在" }));

      //建立檢測站點
      const site = new Site(input);
      return await site.save();
    },
    deleteSite: async (root, { id }, context) => {
      //檢查令牌
      await checkToken(context.token);

      //刪除檢測站點
      await Site.deleteOne({ _id: id });
    },

    createOpentime: async (root, { input }, context) => {
      //檢查令牌
      await checkToken(context.token);

      //檢查開放時間重複
      const existedOpentime = await Opentime.exists({ city: input.city, site: input.site, date: input.date });
      if (existedOpentime) throw new Error(JSON.stringify({ type: "existedOpentime", text: "開放時間已存在" }));

      //建立開放時間
      const opentime = new Opentime(input);
      return await opentime.save();
    },
  },
};
