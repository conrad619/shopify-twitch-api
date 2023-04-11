import "@shopify/shopify-api/adapters/node";
import {LATEST_API_VERSION} from "@shopify/shopify-api";
import {shopifyApp} from "@shopify/shopify-app-express";
import {restResources} from "@shopify/shopify-api/rest/admin/2023-01";
import express from "express";

import * as dotenv from "dotenv"
dotenv.config()

const PORT = process.env.PORT || 8080;
const shopify = shopifyApp({
	api: {
		apiKey: process.env.SHOPIFY_API_KEY,
		apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
		scopes: ["read_products"],
		hostScheme: "http",
		hostName: `${process.env.HOSTNAME}:${PORT}`,
		apiVersion: LATEST_API_VERSION,
		// restResources,
	},
	auth: {
		path: "/api/auth",
		callbackPath: "/api/auth/callback",
	},
})

const app = express();

app.listen(PORT, () => {
	console.log(`Connected successfully to Shopify API at ${PORT}`);
});

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
	shopify.config.auth.callbackPath,
	shopify.auth.callback(),
	shopify.redirectToShopifyOrAppRoot(),
);

app.use(express.json())
app.use(shopify.cspHeaders());
app.use("/*", shopify.ensureInstalledOnShop(), async (req, res) => {
	res.send("hello, world");
})
