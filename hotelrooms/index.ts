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

    if (req.method === "GET") {
      response = await useGetMethod(req.query?.id, req.query?.f, req.query?.q);
    } else if (req.method === "POST") {
      response = await usePostMethod(req.body?.document);
    } else if (req.method === "DELETE") {
      response = await useDeleteMethod(req.body?.id);
    } else {
      throw Error(`${req.method} not allowed`);
    }

    context.res = {
      body: response,
    };

    context.res.headers = {'Access-Control-Allow-Origin': '*'};
  } catch (err) {
    context.log(`*** Error throw: ${JSON.stringify(err)}`);

    context.res = {
      status: 500,
      body: err,
    };
  }
};

// GET /api/hotelrooms?id=123&f=room&q=sofa
async function useGetMethod(id?: string, findBy?: string, value?: string) {
  let result = null;

  if (id) {
    result = db.findItemById(id);
  } else if (findBy) {
    switch (findBy) {
      case "room":
        result = await db.findItemsByRoom(value);
        break;
      case "name":
        result = await db.findByName(value);
        break;
      case "date":
        result = await db.findAllByDate();
        break;
      case "exact_date":
        result = await db.findByDate(value);
        break;
      default:
        result = await db.findAllItems();
    }
  } else {
    result = await db.findAllItems();
  }

  return {
    documentResponse: result,
  };
}

// POST {"document":{"room":"sofa", "date":"2021-01-01", "name":"Jesper"}}
async function usePostMethod(document: { room: string; date: string; name: string; }) {
  let result = null;

  if (document) {
    result = await db.addItem(document);
  } else {
    throw Error("No document found");
  }

  return {
    documentResponse: result,
  };
}

// DELETE {"id":"123"}
async function useDeleteMethod(id: string) {
  let result = null;

  if (id) {
    result = await db.deleteItemById(id);
  } else {
    throw Error("No id found");
  }

  return {
    documentResponse: result,
  };
}

export default httpTrigger;
