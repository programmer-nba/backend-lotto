const router = require("express").Router()
const Client = require("../../controllers/user/user_controller")
const verifyToken = require("../../middleware/verifyToken")

router.post("/clients", Client.createClient)
router.put("/clients/:id", verifyToken, Client.updateClient)
router.get("/clients", verifyToken, Client.getClients)
router.get("/clients/:id", verifyToken, Client.getClient)
router.delete("/clients/:id", verifyToken, Client.deleteClient)

router.post("/:owner/address", verifyToken, Client.createClientAddress)
router.put("/:owner/address", verifyToken, Client.updateClientAddress)
router.get("/:owner/address", verifyToken, Client.getClientAddresses)
router.delete("/address/:id", verifyToken, Client.deleteClientAddress)

module.exports = router
