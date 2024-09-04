const router = require("express").Router()
const RowLottoWholesale = require("../../controllers/lotto/lottorow_controller")

router.post("/rowlottos-wholesale", RowLottoWholesale.createRowLottoWholesale)
router.put("/rowlottos-wholesale/:id", RowLottoWholesale.updateRowLottoWholesale)
router.delete("/rowlottos-wholesale/:shop", RowLottoWholesale.deleteRowLottoWholesale)
router.get("/rowlottos-wholesale", RowLottoWholesale.getRowLottosWholesale)
router.get("/rowlottos-wholesale/:id", RowLottoWholesale.getRowLottoWholesale)

module.exports = router
