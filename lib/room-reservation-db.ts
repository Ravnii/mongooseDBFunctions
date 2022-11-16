import { Schema, model, connect } from "mongoose";

let db=null;

type RoomReservation = {
  room: string;
  date: string;
  name: string;
};

const Reservationschema = new Schema(
  { room: String, date: String, name: String },
  { timestamps: true }
);

const ReservationModel = model("Reservation", Reservationschema, "RoomReservation");

export const init = async () => {
  if(!db) {
    db = await connect(process.env["CosmosDbConnectionString"]);
  }
};

export const addItem = async (doc: RoomReservation) => {
  const modelToInsert = new ReservationModel();
  modelToInsert.room = doc.room;
  modelToInsert.date = doc.date;
  modelToInsert.name = doc.name;

  return await modelToInsert.save();
};

export const findItemById = async (id) => {
  return await ReservationModel.findById(id);
};

export const findItems = async (query) => {
  return await ReservationModel.find(query);
};

export const deleteItemById = async (id) => {
  return await ReservationModel.findByIdAndDelete(id);
};