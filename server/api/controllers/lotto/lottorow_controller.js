const { LottoWholesale, LottoRetail } = require('../../models/Lotto/lotto_model')
const { RowLottoWholesale, RowLottoRetail } = require('../../models/Lotto/rowLotto_model')
const Shop = require("../../models/user/shop_model")
const dayjs = require('dayjs')
require("dayjs/locale/th")
const buddhistEra = require("dayjs/plugin/buddhistEra");
 
dayjs.extend(buddhistEra)
dayjs.locale("th")

const thisYear = dayjs(new Date()).format('BB')

const decode = (code) => {
    const arr = code.split('-')
    return arr
}

const getShopName = async (id) => {
    try {
        if (!id) {
            return ''
        }
        const shop = await Shop.findById(id)
        if (!shop) {
            return ''
        }
        return shop.name
    }
    catch(err) {
        return ''
    }
}

exports.createRowLottoWholesale = async (req, res) => {
    const { 
        codes,
        qty,
        shop,
        price
    } = req.body
    try {

        const duplicateLottos = await LottoWholesale.find({ code: { $in: codes } })
        const duplicateCodes = duplicateLottos.map(lotto => lotto.code)
        let conflictCount = 0

        const createdCodes = codes.map((code) => {
            const decoded = decode(code)
            const year = decoded[0]
            const period = decoded[1]
            const set = decoded[2]
            const numbers = decoded[3]
            const number = numbers.split('')
            let conflict = false

            if (duplicateCodes.includes(code)) {
                conflict = true
                conflictCount++
            }

            const newData = {
                code: code,
                period: period, // งวดที่
                set: set, // ชุดที่
                qty: qty, // จำนวนชุด
                number: number, // เลข 6 หลัก
                shop: shop, // ร้านค้า
                conflict: conflict,
                price: 0,
                year: year,
                type: 'หวยแถว'
            }

            return newData
        })
        
        const savedlottos = await LottoWholesale.insertMany(createdCodes)

        const lottos = savedlottos.map(lotto => lotto._id)

        const rowLotto = new RowLottoWholesale({
            lottos: lottos,
            period: lottos[0].period,
            year: lottos[0].year,
            type: "หวยแถว",
            market: "wholesale",
            qty: qty,
            length: lottos.length,
            shop: shop, // ร้านค้า
            status: 1,
            price: price
        })

        const savedRowLotto = await rowLotto.save()

        return res.status(200).json({
            message: "success",
            status: true,
            amount: createdCodes.length,
            conflict: conflictCount,
            data: savedRowLotto
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json(err.message)
    }
}

exports.updateRowLottoWholesale = async (req, res) => {
    const { 
        shop,
        price
    } = req.body
    const { id } = req.params
    try {

        let rowLotto = await RowLottoWholesale.findOne({ _id: id, shop: shop })
        if (!rowLotto) {
            return res.status(404).json({ message: 'not found row lotto' })
        }

        const updatedRowLotto = await RowLottoWholesale.findByIdAndUpdate(id, {
            $set: {
                price: price
            }
        }, { new: true })

        return res.status(200).json({
            message: "update success",
            status: true,
            data: updatedRowLotto
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json(err.message)
    }
}

exports.getRowLottosWholesale = async (req, res) => {
    const { filter, sortBy, sortOrder, page, limit, shop } = req.query;
    try {
        // Initialize query object
        let query = {
            status: 1,
            //year: thisYear
        };

        // Apply filter
        if (filter) {
            switch (filter) {
                case 'isOrdering':
                    query.status = 2;
                    break;
                case 'isSold':
                    query.status = 3;
                    break;
                default:
                    // If the filter is not recognized, return an error
                    return res.status(400).json({ message: 'Invalid filter parameter' });
            }
        }

        if (shop) {
            query.shop = shop; // Case-insensitive search
        }

        // Set default pagination and sorting options
        const currentPage = parseInt(page) || 1;
        const resultsPerPage = parseInt(limit) || 0;
        const sortField = sortBy || 'createdAt';
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination and sorting
        //const lottos = await LottoWholesale.find()
        const rowlottos = await RowLottoWholesale.find(query)
            .sort({ [sortField]: sortDirection })
            .skip((currentPage - 1) * resultsPerPage)
            .limit(resultsPerPage);

        // Count total results for pagination
        const totalResults = await RowLottoWholesale.countDocuments(query);

        const formatRowLottos = rowlottos.map(async(lotto) => {
            const shopName = await getShopName(lotto.shop)
            const _lottos = await LottoWholesale.find({ _id: { $in: lotto.lottos } }).select('-__v')
            const codes = _lottos.map(lotto => lotto.code)
            const numbers = _lottos.map(lotto => lotto.number.join(''))
            const result = {...lotto._doc}
            result.shop ={
                name: shopName,
                _id: lotto.shop
            }
            result._lottos = _lottos
            result.codes = codes
            result.numbers = numbers
            return result
        })

        const promisedLottos = await Promise.all(formatRowLottos)

        return res.status(200).json({
            message: 'success!',
            status: true,
            data: promisedLottos,
            pagination: {
                currentPage,
                resultsPerPage,
                totalResults,
                totalPages: Math.ceil(totalResults / resultsPerPage)
            }
        });
    }
    catch (err) {
        console.log(err)
        return res.status(500).json(err.message)
    }
}

exports.getRowLottoWholesale = async (req, res) => {
    const { id } = req.params;
    try {
        let lotto = await RowLottoWholesale.findById(id).select('-__v')
        if(!lotto) {
            return res.status(404).json({ message: 'not found lotto' })
        }

        const shopName = await getShopName(lotto.shop)
        lotto.shop = {
            name: shopName,
            _id: lotto.shop
        }

        return res.status(200).json({
            message: 'success!',
            status: true,
            data: lotto,
        });
    }
    catch (err) {
        console.log(err)
        return res.status(500).json(err.message)
    }
}

exports.deleteRowLottoWholesale = async (req, res) => {
    const { shop } = req.params
    const { id } = req.query
    try {
        let lotto = await RowLottoWholesale.findOne({ _id: id, shop: shop })
        if (!lotto) {
            return res.status(404).json({ message: 'not found lotto' })
        }
        
        await RowLottoWholesale.findByIdAndDelete(id)

        return res.status(200).json({
            message: "delete success",
            status: true
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json(err.message)
    }
}