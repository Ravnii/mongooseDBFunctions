import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as db from "../lib/room-reservation-db";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    let response = null;

    // create 1 db connection for all functions
    await db.init();

    switch (req.method) {
      case "GET":
        if (req?.query.id) {
          response = {
            documentResponse: await db.findItemById(req.query.id),
          };
        } else {
          // allows empty query to return all items
          // '{"dbQuery":{"room":"sofa"}}'
          const dbQuery = req?.body?.dbQuery ?? {};
          response = {
            documentResponse: await db.findItems(dbQuery),
          };
        }
        break;
      case "POST":
        //'{"document":{"room":"sofa", "date":"2021-01-01", "name":"Jesper"}}'
        if (req?.body?.document) {
          const insertOneResponse = await db.addItem(req?.body?.document);
          response = {
            documentResponse: insertOneResponse,
          };
        } else {
          throw Error("No document found");
        }
        break;
      case "DELETE":
        if (req?.query?.id) {
          response = {
            documentResponse: await db.deleteItemById(req?.body?.id),
          };
        } else {
          throw Error("No id found");
        }
        break;
      default:
        throw Error(`${req.method} not allowed`);
    }

    context.res = {
      body: response,
    };
  } catch (err) {
    context.log(`*** Error throw: ${JSON.stringify(err)}`);

    context.res = {
      status: 500,
      body: err,
    };
  }
};

export default httpTrigger;
