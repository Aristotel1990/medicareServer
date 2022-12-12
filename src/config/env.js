/* eslint-disable no-undef */
export const NODE_ENV = process.env.NODE_ENV || "dev";
export const NODE_APP_URI = process.env.NODE_APP_URI || "http://localhost:8080";
export const PORT = process.env.PORT || 8080;
export const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/rest";
export const MONGO_DB = process.env.MONGO_DB || "rest";
export const CORS_REGX = process.env.CORS_REGX || "localhost";
export const BODY_LIMIT = process.env.BODY_LIMIT || "100kb";
export const NODE_APP_NAME = process.env.NODE_APP_NAME || "local";
export const DB_NAME = NODE_ENV === "dev" ? "doctor" : process.env.DB_NAME;
export const DB_USER = NODE_ENV === "dev" ? "root" : process.env.DB_USER;
export const DB_PASS = NODE_ENV === "dev" ? "test1234" : process.env.DB_PASS;
export const DB_HOST = NODE_ENV === "dev" ? "localhost" : process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT || 3306;
export const DB_DIALECT = process.env.DB_DIALECT || "mysql";
export const JWT_SECRET =
  process.env.JWT_SECRET ||
  "Vy2ywT7KH0CrQvFKTxbauSP/VqgVmR3FK0qJ2dbLlqfOQcqnJ4hFI73OCHd/QEDME4DW+4PN2yf8IAkdXZoeeGsms2OOmFAdksgtCU1oc34b5GhczBTm1z2Ui+Ks4++k/QbzgleAzrPV2jWkseOwV/hRB/VVUoX03NFYBQtH0SpKsg4T9P4o4Nnq63D3RvN5W1ErflAQYaK2cAgJqXK5A7zE6GM8n+YkgGmPgaamkGnpBoq6ucOKdB9vwr3HO+45Uhsi5Ew6+E9GwNQlTyqpS+Ev0MmpiYKIe/3owYpm76HuOujiRj8uZEm4X1TWYFzJwEQKxBj0H5U7VjtiWMOU5Q==";
export const JWT_EXPIRE = process.env.JWT_EXPIRE || "24h";
export const JWT_EXPIRE_REF = process.env.JWT_EXPIRE_REF || "24h";
export const JWT_SECRET_REF =
  process.env.JWT_SECRET_REF ||
  "fsddfsdfsdgsgs/sdsdslae8wer544rewrweoiruweo8rw8erwe89reyr7ksgtCU1oc34b5GhczBTm1z2Ui+Ks4++k/QbzgleAzrPV2jWkseOwV/hRB/VVUoX03NFYBQtH0SpKsg4T9P4o4Nnq63D3RvN5W1ErflAQYaK2cAgJqXK5A7zE6GM8n+YkgGmPgaamkGnpBoq6ucOKdB9vwr3HO+45Uhsi5Ew6+E9GwNQlTyqpS+sjkdsadffas9329(/sakljdaslkdjaslhdhasoiudhashdohasod0-093-02398080932";
export const SENDGRID_API_KEY =
  "SG.6Tz-d7UaT-GZOKDJXGmHOQ.4T-9p-NXzgyO5WCO7NGal-u-VNSMue9AmTVlERe5OaQ";
