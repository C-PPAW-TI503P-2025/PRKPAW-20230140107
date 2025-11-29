 	// 1. Ganti sumber data dari array ke model Sequelize
 	const { Presensi, User } = require("../models");
 	const { format } = require("date-fns-tz");
 	const timeZone = "Asia/Jakarta";
 	
 	exports.CheckIn = async (req, res) => {
 	  // 2. Gunakan try...catch untuk error handling
 	  try {
		const { id: userId } = req.user;
 	    const waktuSekarang = new Date();
		const { latitude, longitude } = req.body;
 	
 	    // 3. Ubah cara mencari data menggunakan 'findOne' dari Sequelize
 	    const existingRecord = await Presensi.findOne({
 	      where: { userId: userId, checkOut: null },
 	    });
 	
	    if (existingRecord) {
	      return res
	        .status(400)
	        .json({ message: "Anda sudah melakukan check-in hari ini." });
	    }

	    // Validasi latitude dan longitude
	    if (latitude === undefined || longitude === undefined) {
	      return res.status(400).json({
	        message: "Latitude dan longitude harus disediakan dalam request body"
	      });
	    }
	
		// 4. Create record without storing nama; use user relation for name
		const newRecord = await Presensi.create({
			userId: userId,
			checkIn: waktuSekarang,
			latitude: latitude,
			longitude: longitude
		});
		const user = await User.findByPk(userId);
		const formattedData = {
				userId: newRecord.userId,
				nama: user ? user.nama : null,
				checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
				checkOut: null,
				latitude: newRecord.latitude,
				longitude: newRecord.longitude
		};		const userName = user ? user.nama : 'Pengguna';
		res.status(201).json({
			message: `Halo ${userName}, check-in Anda berhasil pada pukul ${format(
				waktuSekarang,
				"HH:mm:ss",
				{ timeZone }
			)} WIB`,
			data: formattedData,
		});
 	  } catch (error) {
 	    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
 	  }
 	};
 	
 	exports.CheckOut = async (req, res) => {
 	  // Gunakan try...catch
 	  try {
		const { id: userId } = req.user;
		const waktuSekarang = new Date();

		// Cari data di database
		const recordToUpdate = await Presensi.findOne({
			where: { userId: userId, checkOut: null },
		});
 	
 	    if (!recordToUpdate) {
 	      return res.status(404).json({
 	        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
 	      });
 	    }
 	
 	    // 5. Update dan simpan perubahan ke database
 	    recordToUpdate.checkOut = waktuSekarang;
 	    await recordToUpdate.save();
 	
		// Attach user name from User table
		const user = await User.findByPk(recordToUpdate.userId);
		const formattedData = {
			userId: recordToUpdate.userId,
			nama: user ? user.nama : null,
			checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
			checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
			latitude: recordToUpdate.latitude,
			longitude: recordToUpdate.longitude
		};
 	
		const userName = user ? user.nama : 'Pengguna';
		res.json({
			message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${format(
				waktuSekarang,
				"HH:mm:ss",
				{ timeZone }
			)} WIB`,
			data: formattedData,
		});
 	  } catch (error) {
 	    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
 	  }
 	};

	exports.deletePresensi = async (req, res) => {
	try {
	 		// allow deletion by owner or by admin role
	 		const { id: userId, role } = req.user;
		const presensiId = req.params.id;
		const recordToDelete = await Presensi.findByPk(presensiId);

		if (!recordToDelete) {
			return res
				.status(404)
				.json({ message: "Catatan presensi tidak ditemukan." });
		}

 		// If requester is not owner and not admin, deny
 		if (recordToDelete.userId !== userId && role !== 'admin') {
			return res
				.status(403)
				.json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
		}

		await recordToDelete.destroy();
		res.status(204).send();
	} catch (error) {
		res
			.status(500)
			.json({ message: "Terjadi kesalahan pada server", error: error.message });
	}
};

const { validationResult } = require('express-validator');

exports.updatePresensi = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: "Validasi gagal",
      errors: errors.array() 
    });
  }

	try {
		const presensiId = req.params.id;
		const { checkIn, checkOut } = req.body;
		if (checkIn === undefined && checkOut === undefined) {
			return res.status(400).json({
				message:
					"Request body tidak berisi data yang valid untuk diupdate (checkIn atau checkOut).",
			});
		}
    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }

	recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
	recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

