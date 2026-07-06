exports.applyAsCaptain = async (req, res) => {
  const { userId, vehicleModel, licensePlate, vehicleType } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO drivers (user_id, license_number, status) VALUES (?, ?, ?)',
      [userId, licensePlate, 'pending_verification']
    );
    const driverId = result.insertId;
    await db.execute(
      'INSERT INTO vehicles (driver_id, make, model, license_plate, type) VALUES (?, ?, ?, ?, ?)',
      [driverId, 'Unknown', vehicleModel, licensePlate, vehicleType]
    );
    res.status(201).json({ success: true, message: "Application submitted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
