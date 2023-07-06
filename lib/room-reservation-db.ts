import { Schema, model, connect } from "mongoose";

let db = null;

type RoomReservation = {
  room: string;
  date: string;
  name: string;
};

const Reservationschema = new Schema(
  { room: String, date: Date, name: String },
  { timestamps: true }
);

const ReservationModel = model("Reservation", Reservationschema, "RoomReservation");

export const init = async () => {
  if(!db) {
    db = await connect(process.env["CosmosDbConnectionString"]);
  }
};

export const addItem = async (doc: RoomReservation) => {
  const reservation = new ReservationModel();
  reservation.room = doc.room;
  reservation.date = new Date(doc.date);
  reservation.name = doc.name;

  return await reservation.save();
};

export const findItemById = async (id) => {
  return await ReservationModel.findById(id);
};

export const findAllItems = async () => {
  return await ReservationModel.find({});
};

export const findItemsByRoom = async (room) => {
  return await ReservationModel.find().where("room").equals(room);
}

export const findByName = async (name) => {
  return await ReservationModel.find().where("name").equals(name);
};

export const findAllByDate = async () => {
  return await ReservationModel.
    find({ 
      date: { 
        $gte: Date.now(), 
        $lte: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      } 
    }).
    sort({ date: 1 });
};

export const findByDate = async (date) => {
  return await ReservationModel.
    find({date: new Date(date)});
};

export const deleteItemById = async (id) => {
  return await ReservationModel.findByIdAndDelete(id);
};