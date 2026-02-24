const adminServices = require('../services/adminServices')
const tryAndCatch = require('../utils/tryAndCatch')

class AdminController {

     createAdmin = tryAndCatch(async (req, res) => {

    const payload = req.body;

    const response = await adminServices.createAdmin(payload);
    
    return res.status(200).json(response);
  });
}

module.exports = new AdminController();