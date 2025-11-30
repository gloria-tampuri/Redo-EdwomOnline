import Unit, { UnitDocument } from '@/models/Unit';
import dbConnect from '@/lib/mongodb';

export async function getAllUnits() {
  await dbConnect();
  return await Unit.find().sort({ createdAt: -1 });
}

export async function getUnitById(id: string) {
  await dbConnect();
  return await Unit.findById(id);
}

export async function createUnit(data: Partial<UnitDocument>) {
  await dbConnect();
  const unit = new Unit(data);
  return await unit.save();
}

export async function updateUnit(id: string, data: Partial<UnitDocument>) {
  await dbConnect();
  return await Unit.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteUnit(id: string) {
  await dbConnect();
  return await Unit.findByIdAndDelete(id);
}
