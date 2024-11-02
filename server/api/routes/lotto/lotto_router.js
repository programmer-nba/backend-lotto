const router = require("express").Router()
const LottoWholesale = require("../../controllers/lotto/lotto_controller")
const verifyToken = require("../../middleware/verifyToken")

router.post("/lottos-wholesale", verifyToken, LottoWholesale.createLottosWholesale)
router.put("/lottos-wholesale/:id", verifyToken, LottoWholesale.updateLottoWholesale)
router.delete("/lottos-wholesale/:shop", verifyToken, LottoWholesale.deleteLottoWholesale)
router.get("/lottos-wholesale", LottoWholesale.getLottosWholesale)
router.get("/lottos-wholesale/:id", verifyToken, LottoWholesale.getLottoWholesale)
router.get("/lottos-wholesale/me/:user_id", verifyToken, LottoWholesale.getMyLottosWholesale)

module.exports = router
