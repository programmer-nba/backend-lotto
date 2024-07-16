const router = require("express").Router()
const Client = require("../../controllers/user/user_controller")

router.post("/clients", Client.createClient)
router.put("/clients/:id", Client.updateClient)
router.get("/clients", Client.getClients)
router.get("/clients/:id", Client.getClient)
router.delete("/clients/:id", Client.deleteClient)

module.exports = router
