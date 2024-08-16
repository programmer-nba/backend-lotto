const { LottoWholesale, LottoRetail } = require('../../models/Lotto/lotto_model')
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

exports.createLottosWholesale = async (req, res) => {
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
                price: price,
                year: year,
            }

            return newData
        })
        
        await LottoWholesale.insertMany(createdCodes)

        return res.status(200).json({
            message: "success",
            status: true,
            amount: createdCodes.length,
            conflict: conflictCount
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json(err.message)
    }
}

exports.getLottosWholesale = async (req, res) => {
    const { filter, search, sortBy, sortOrder, page, limit, shop } = req.query;
    try {
        // Initialize query object
        let query = {
            type: 'หวยชุด',
            status: 'selling',
            conflict: false,
            year: thisYear
        };

        // Apply filter
        if (filter) {
            switch (filter) {
                case 'isOrdering':
                    query.status = 'ordering';
                    break;
                case 'isSold':
                    query.status = 'sold';
                    break;
                case 'isConflict':
                    query.conflict = true;
                    break;
                default:
                    // If the filter is not recognized, return an error
                    return res.status(400).json({ message: 'Invalid filter parameter' });
            }
        }

        // Apply search (example: search by name)
        if (search) {
            query.code = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        if (shop) {
            query.shop = shop; // Case-insensitive search
        }

        //console.log(query)

        // Set default pagination and sorting options
        const currentPage = parseInt(page) || 1;
        const resultsPerPage = parseInt(limit) || 10;
        const sortField = sortBy || 'createdAt';
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination and sorting
        //const lottos = await LottoWholesale.find()
        const lottos = await LottoWholesale.find(query)
            .sort({ [sortField]: sortDirection })
            .skip((currentPage - 1) * resultsPerPage)
            .limit(resultsPerPage);

        // Count total results for pagination
        const totalResults = await LottoWholesale.countDocuments(query);

        const formatLottos = lottos.map(async(lotto) => {
            const shopName = await getShopName(lotto.shop)
            const result = {...lotto._doc}
            result.shop ={
                name: shopName,
                _id: lotto.shop
            }
            return result
        })

        const promisedLottos = await Promise.all(formatLottos)

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

exports.getLottoWholesale = async (req, res) => {
    const { id } = req.params;
    try {
        let lotto = await LottoWholesale.findById(id).select('-__v')
        if(!lotto) {
            return res.status(404).json({ message: 'not found lotto' })
        }

        const shopName = await getShopName(lotto.shop)

        let result = {...lotto._doc}
        result.shop ={
            name: shopName,
            _id: lotto.shop
        }
        //console.log(result)

        return res.status(200).json({
            message: 'success!',
            status: true,
            data: result,
        });
    }
    catch (err) {
        console.log(err)
        return res.status(500).json(err.message)
    }
}