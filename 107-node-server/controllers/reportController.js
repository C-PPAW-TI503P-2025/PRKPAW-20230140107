const { Presensi } = require("../models");
const { Op } = require('sequelize');
const { startOfDay, endOfDay, parseISO } = require('date-fns');

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    let options = { where: {}, include: [] };

    if (nama) {
      // filter by associated User.nama
      options.include.push({
        model: require('../models').User,
        as: 'user',
        where: { nama: { [Op.like]: `%${nama}%` } },
        required: true
      });
    } else {
      // always include user for name lookup
      options.include.push({ model: require('../models').User, as: 'user' });
    }

    // Add date range filtering
    if (tanggalMulai && tanggalSelesai) {
      try {
        const startDate = startOfDay(parseISO(tanggalMulai));
        const endDate = endOfDay(parseISO(tanggalSelesai));
        
        options.where.checkIn = {
          [Op.between]: [startDate, endDate]
        };
      } catch (error) {
        return res.status(400).json({
          message: "Format tanggal tidak valid. Gunakan format YYYY-MM-DD"
        });
      }
    }

    const records = await Presensi.findAll(options);

    res.json({
      reportDate: new Date().toLocaleDateString(),
      data: records,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil laporan", error: error.message });
  }
};

