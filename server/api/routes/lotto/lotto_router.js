const router = require("express").Router()
const LottoWholesale = require("../../controllers/lotto/lotto_controller")

router.post("/lottos-wholesale", LottoWholesale.createLottosWholesale)
router.get("/lottos-wholesale", LottoWholesale.getLottosWholesale)
router.get("/lottos-wholesale/:id", LottoWholesale.getLottoWholesale)

module.exports = router
