const router = require("express").Router()
const RowLottoWholesale = require("../../controllers/lotto/lottorow_controller")
const verifyToken = require("../../middleware/verifyToken")

router.post("/rowlottos-wholesale", verifyToken, RowLottoWholesale.createRowLottoWholesale)
router.put("/rowlottos-wholesale/:id", verifyToken, RowLottoWholesale.updateRowLottoWholesale)
router.delete("/rowlottos-wholesale/:shop", verifyToken, RowLottoWholesale.deleteRowLottoWholesale)
router.get("/rowlottos-wholesale", RowLottoWholesale.getRowLottosWholesale)
router.get("/rowlottos-wholesale/:id", verifyToken, RowLottoWholesale.getRowLottoWholesale)

module.exports = router
