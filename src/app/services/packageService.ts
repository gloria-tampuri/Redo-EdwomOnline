import Package, { PackageDocument } from '@/models/Package';
import dbConnect from '@/lib/mongodb';

export async function createPackage(data: Partial<PackageDocument>) {
  await dbConnect();
  const pkg = new Package(data);
  await pkg.save();
  return pkg;
}

export async function getPackages() {
  await dbConnect();
  return Package.find().sort({ createdAt: -1 });
}

export async function getPackageById(id: string) {
  await dbConnect();
  return Package.findById(id);
}

export async function updatePackage(id: string, data: Partial<PackageDocument>) {
  await dbConnect();
  return Package.findByIdAndUpdate(id, data, { new: true });
}

export async function deletePackage(id: string) {
  await dbConnect();
  return Package.findByIdAndDelete(id);
}
