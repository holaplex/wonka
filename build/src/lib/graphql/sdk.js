"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSdk = exports.AddCreatorDocument = exports.Order_By = exports.Creators_Update_Column = exports.Creators_Select_Column = exports.Creators_Constraint = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
/** unique or primary key constraints on table "creators" */
var Creators_Constraint;
(function (Creators_Constraint) {
    /** unique or primary key constraint */
    Creators_Constraint["CreatorsNameKey"] = "creators_name_key";
    /** unique or primary key constraint */
    Creators_Constraint["CreatorsPkey"] = "creators_pkey";
})(Creators_Constraint = exports.Creators_Constraint || (exports.Creators_Constraint = {}));
/** select columns of table "creators" */
var Creators_Select_Column;
(function (Creators_Select_Column) {
    /** column name */
    Creators_Select_Column["AesEncryptedKeypair"] = "aes_encrypted_keypair";
    /** column name */
    Creators_Select_Column["CreatedAt"] = "created_at";
    /** column name */
    Creators_Select_Column["Id"] = "id";
    /** column name */
    Creators_Select_Column["Name"] = "name";
    /** column name */
    Creators_Select_Column["UpdatedAt"] = "updated_at";
})(Creators_Select_Column = exports.Creators_Select_Column || (exports.Creators_Select_Column = {}));
/** update columns of table "creators" */
var Creators_Update_Column;
(function (Creators_Update_Column) {
    /** column name */
    Creators_Update_Column["AesEncryptedKeypair"] = "aes_encrypted_keypair";
    /** column name */
    Creators_Update_Column["CreatedAt"] = "created_at";
    /** column name */
    Creators_Update_Column["Id"] = "id";
    /** column name */
    Creators_Update_Column["Name"] = "name";
    /** column name */
    Creators_Update_Column["UpdatedAt"] = "updated_at";
})(Creators_Update_Column = exports.Creators_Update_Column || (exports.Creators_Update_Column = {}));
/** column ordering options */
var Order_By;
(function (Order_By) {
    /** in ascending order, nulls last */
    Order_By["Asc"] = "asc";
    /** in ascending order, nulls first */
    Order_By["AscNullsFirst"] = "asc_nulls_first";
    /** in ascending order, nulls last */
    Order_By["AscNullsLast"] = "asc_nulls_last";
    /** in descending order, nulls first */
    Order_By["Desc"] = "desc";
    /** in descending order, nulls first */
    Order_By["DescNullsFirst"] = "desc_nulls_first";
    /** in descending order, nulls last */
    Order_By["DescNullsLast"] = "desc_nulls_last";
})(Order_By = exports.Order_By || (exports.Order_By = {}));
exports.AddCreatorDocument = (0, graphql_tag_1.default) `
    mutation addCreator($creator: creators_insert_input!) {
  insert_creators_one(object: $creator) {
    id
    name
    created_at
    updated_at
  }
}
    `;
const defaultWrapper = (action, _operationName, _operationType) => action();
function getSdk(client, withWrapper = defaultWrapper) {
    return {
        addCreator(variables, requestHeaders) {
            return withWrapper((wrappedRequestHeaders) => client.request(exports.AddCreatorDocument, variables, { ...requestHeaders, ...wrappedRequestHeaders }), 'addCreator', 'mutation');
        }
    };
}
exports.getSdk = getSdk;
